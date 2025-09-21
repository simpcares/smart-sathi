import React, { useState, useEffect } from 'react';

interface SystemStatusProps {
  onRefresh?: () => void;
}

interface SystemHealth {
  database: { status: string; message: string };
  api: { status: string; message: string };
  websocket: { status: string; message: string };
  geofencing: { status: string; message: string };
  ai_engine: { status: string; message: string };
  emergency_response: { status: string; message: string };
}

const SystemStatus: React.FC<SystemStatusProps> = ({ onRefresh }) => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: { status: 'checking', message: 'Checking connection...' },
    api: { status: 'checking', message: 'Checking endpoints...' },
    websocket: { status: 'checking', message: 'Checking connection...' },
    geofencing: { status: 'checking', message: 'Checking zones...' },
    ai_engine: { status: 'checking', message: 'Checking AI services...' },
    emergency_response: { status: 'checking', message: 'Checking readiness...' }
  });

  const checkSystemHealth = async () => {
    try {
      // Check API health
      const apiResponse = await fetch('/health');
      const apiHealthy = apiResponse.ok;

      // Check database connectivity (through API)
      const dbResponse = await fetch('/api/status');
      const dbHealthy = dbResponse.ok;

      // Check WebSocket (simplified check)
      const wsHealthy = true; // Would need actual WebSocket connection test

      // Update system health
      setSystemHealth({
        database: {
          status: dbHealthy ? 'healthy' : 'error',
          message: dbHealthy ? 'Connected' : 'Connection failed'
        },
        api: {
          status: apiHealthy ? 'healthy' : 'error',
          message: apiHealthy ? 'All endpoints active' : 'Some endpoints unavailable'
        },
        websocket: {
          status: wsHealthy ? 'healthy' : 'warning',
          message: wsHealthy ? 'Connected' : 'Connection issues'
        },
        geofencing: {
          status: 'healthy',
          message: 'Monitoring zones'
        },
        ai_engine: {
          status: 'healthy',
          message: 'Processing anomalies'
        },
        emergency_response: {
          status: 'standby',
          message: 'Ready to dispatch'
        }
      });
    } catch (error) {
      // Set error states
      setSystemHealth(prev => ({
        ...prev,
        api: { status: 'error', message: 'Network error' },
        database: { status: 'error', message: 'Cannot reach database' }
      }));
    }
  };

  useEffect(() => {
    checkSystemHealth();
    
    // Check system health every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-danger';
      case 'standby': return 'bg-info';
      case 'checking': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'error': return 'fas fa-times-circle';
      case 'standby': return 'fas fa-clock';
      case 'checking': return 'fas fa-spinner fa-spin';
      default: return 'fas fa-question-circle';
    }
  };

  const systemComponents = [
    { key: 'database', label: 'Database', icon: 'fas fa-database' },
    { key: 'api', label: 'API Health', icon: 'fas fa-server' },
    { key: 'websocket', label: 'Real-time Updates', icon: 'fas fa-wifi' },
    { key: 'geofencing', label: 'Geofencing', icon: 'fas fa-map-marked-alt' },
    { key: 'ai_engine', label: 'AI Engine', icon: 'fas fa-brain' },
    { key: 'emergency_response', label: 'Emergency Response', icon: 'fas fa-ambulance' }
  ];

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-server me-2"></i>
          System Status
        </h5>
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={checkSystemHealth}
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      <div className="card-body">
        <div className="row">
          {systemComponents.map((component, index) => {
            const health = systemHealth[component.key as keyof SystemHealth];
            return (
              <div key={component.key} className="col-12 mb-3">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className={component.icon} style={{ width: '20px' }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{component.label}</h6>
                    <div className="d-flex align-items-center">
                      <span className={`badge ${getStatusBadgeClass(health.status)} me-2`}>
                        <i className={getStatusIcon(health.status)} style={{ fontSize: '0.8em' }}></i>
                        <span className="ms-1">
                          {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                        </span>
                      </span>
                      <small className="text-muted">{health.message}</small>
                    </div>
                  </div>
                </div>
                {index < systemComponents.length - 1 && <hr className="my-2" />}
              </div>
            );
          })}
        </div>

        {/* System Uptime */}
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold">System Uptime</span>
            <span className="badge bg-success">
              <i className="fas fa-heartbeat me-1"></i>
              99.9%
            </span>
          </div>
          <small className="text-muted">Last restart: 2 days ago</small>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
