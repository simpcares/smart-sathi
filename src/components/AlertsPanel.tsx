import React, { useState } from 'react';
import type { Alert } from '../types';

interface AlertsPanelProps {
  alerts: Alert[];
  onResolve: (alertId: string) => void;
  onAcknowledge: (alertId: string) => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onResolve, onAcknowledge }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'critical'>('active');

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'active':
        return alert.status === 'active';
      case 'critical':
        return alert.severity === 'critical' || alert.severity === 'high';
      default:
        return true;
    }
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      'critical': 'danger',
      'high': 'warning',
      'medium': 'info',
      'low': 'success'
    };
    return colors[severity as keyof typeof colors] || 'secondary';
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      'critical': 'fas fa-exclamation-triangle',
      'high': 'fas fa-exclamation-circle',
      'medium': 'fas fa-info-circle',
      'low': 'fas fa-check-circle'
    };
    return icons[severity as keyof typeof icons] || 'fas fa-info-circle';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-bell me-2"></i>
          Alerts ({filteredAlerts.length})
        </h5>
        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            type="button"
            className={`btn ${filter === 'critical' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('critical')}
          >
            Critical
          </button>
        </div>
      </div>
      
      <div className="card-body p-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-check-circle text-success mb-2" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted mb-0">No alerts to display</p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => (
            <div
              key={alert.id}
              className={`p-3 border-bottom ${alert.status === 'active' ? 'bg-light-subtle' : ''}`}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <i className={`${getSeverityIcon(alert.severity)} text-${getSeverityColor(alert.severity)} me-2`}></i>
                    <span className={`badge bg-${getSeverityColor(alert.severity)} me-2`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <small className="text-muted">{formatTimeAgo(alert.created_at)}</small>
                  </div>
                  <h6 className="mb-1">{alert.alert_type}</h6>
                  <p className="text-muted small mb-2">{alert.message}</p>
                  <div className="text-muted small">
                    <i className="fas fa-user me-1"></i>
                    Tourist: {alert.tourist_id}
                  </div>
                </div>
              </div>
              
              {alert.status === 'active' && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    <i className="fas fa-eye me-1"></i>
                    Acknowledge
                  </button>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => onResolve(alert.id)}
                  >
                    <i className="fas fa-check me-1"></i>
                    Resolve
                  </button>
                </div>
              )}
              
              {alert.status === 'acknowledged' && (
                <div className="d-flex gap-2">
                  <span className="badge bg-warning">Acknowledged</span>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => onResolve(alert.id)}
                  >
                    <i className="fas fa-check me-1"></i>
                    Resolve
                  </button>
                </div>
              )}
              
              {alert.status === 'resolved' && (
                <span className="badge bg-success">Resolved</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;