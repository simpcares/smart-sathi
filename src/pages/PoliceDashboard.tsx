import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import type { Tourist, Alert } from '../types';

const PoliceDashboard: React.FC = () => {
  const { user } = useAuth();
  const { onTouristLocationUpdate, onAnomalyAlert, onZoneViolationAlert } = useWebSocket();
  const { showNotification } = useNotification();
  
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);

  const loadPoliceData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [touristsResponse, alertsResponse] = await Promise.all([
        apiService.getTourists(),
        apiService.getAlerts()
      ]);

      if (touristsResponse.success && touristsResponse.data) {
        setTourists(touristsResponse.data);
      }

      if (alertsResponse.success && alertsResponse.data) {
        setAlerts(alertsResponse.data);
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to load police dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Load initial data
  useEffect(() => {
    loadPoliceData();
  }, [loadPoliceData]);

  // Setup WebSocket listeners
  useEffect(() => {
    if (!onTouristLocationUpdate || !onAnomalyAlert || !onZoneViolationAlert) return;

    const handleTouristUpdate = (updatedTourist: Tourist) => {
      setTourists(prev => 
        prev.map(tourist => 
          tourist.id === updatedTourist.id ? updatedTourist : tourist
        )
      );
    };

    const handleAnomalyAlert = (newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev]);
      if (newAlert.severity === 'high' || newAlert.severity === 'critical') {
        showNotification(
          `URGENT: ${newAlert.message}`,
          'danger',
          0 // Don't auto-dismiss
        );
      }
    };

    const handleZoneViolationAlert = (newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev]);
      showNotification(
        `Zone Violation: ${newAlert.message}`,
        'warning',
        8000
      );
    };

    onTouristLocationUpdate(handleTouristUpdate);
    onAnomalyAlert(handleAnomalyAlert);
    onZoneViolationAlert(handleZoneViolationAlert);

    return () => {
      // Cleanup would require off functions from WebSocket context
    };
  }, [onTouristLocationUpdate, onAnomalyAlert, onZoneViolationAlert, showNotification]);

  useEffect(() => {
    // Filter active alerts
    setActiveAlerts(alerts.filter(alert => 
      alert.status === 'active' && (alert.severity === 'high' || alert.severity === 'critical')
    ));
  }, [alerts]);

  const emergencyTourists = tourists.filter(tourist => 
    tourist.current_status === 'emergency' || tourist.current_status === 'danger'
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading Police Dashboard...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-dark">
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <div className="navbar-brand">
            <i className="fas fa-shield-alt me-2"></i>
            Police Emergency Dashboard
          </div>
          <div className="d-flex align-items-center text-white">
            <span className="me-3">
              <i className="fas fa-user me-1"></i>
              {user?.username}
            </span>
            <span className="badge bg-danger">
              {activeAlerts.length} Active Alerts
            </span>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-3">
        {/* Emergency Alerts */}
        {activeAlerts.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-danger">
                <div className="card-header bg-danger text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Emergency Alerts ({activeAlerts.length})
                  </h5>
                </div>
                <div className="card-body p-0">
                  {activeAlerts.map((alert, index) => (
                    <div key={alert.id} className={`p-3 ${index !== activeAlerts.length - 1 ? 'border-bottom' : ''}`}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="text-danger mb-1">
                            <i className={`fas ${alert.severity === 'critical' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'} me-2`}></i>
                            {alert.alert_type.toUpperCase()}
                          </h6>
                          <p className="mb-1">{alert.message}</p>
                          <small className="text-muted">
                            Tourist ID: {alert.tourist_id} | {new Date(alert.created_at).toLocaleString()}
                          </small>
                        </div>
                        <span className={`badge ${alert.severity === 'critical' ? 'bg-danger' : 'bg-warning'}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Tourists */}
        {emergencyTourists.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-warning">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="fas fa-ambulance me-2"></i>
                    Tourists Requiring Immediate Attention ({emergencyTourists.length})
                  </h5>
                </div>
                <div className="card-body p-0">
                  {emergencyTourists.map((tourist, index) => (
                    <div key={tourist.id} className={`p-3 ${index !== emergencyTourists.length - 1 ? 'border-bottom' : ''}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">Tourist ID: {tourist.id}</h6>
                          <p className="mb-1">
                            Phone: {tourist.phone_number} | 
                            Emergency Contact: {tourist.emergency_contact_phone}
                          </p>
                          <small className="text-muted">
                            Last Update: {new Date(tourist.last_updated).toLocaleString()}
                          </small>
                        </div>
                        <div className="text-end">
                          <span className={`badge ${tourist.current_status === 'emergency' ? 'bg-danger' : 'bg-warning'} mb-2`}>
                            {tourist.current_status.toUpperCase()}
                          </span>
                          <div>
                            <small className="text-muted">Safety Score:</small>
                            <span className={`ms-1 fw-bold ${tourist.safety_score < 50 ? 'text-danger' : tourist.safety_score < 70 ? 'text-warning' : 'text-success'}`}>
                              {tourist.safety_score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="row">
          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="text-primary">{tourists.length}</h2>
                <p className="text-muted mb-0">Total Tourists</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="text-danger">{emergencyTourists.length}</h2>
                <p className="text-muted mb-0">Emergency Status</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="text-warning">{activeAlerts.length}</h2>
                <p className="text-muted mb-0">Active Alerts</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card text-center">
              <div className="card-body">
                <h2 className="text-info">{tourists.filter(t => t.current_status === 'safe').length}</h2>
                <p className="text-muted mb-0">Safe Tourists</p>
              </div>
            </div>
          </div>
        </div>

        {/* No Emergency Message */}
        {activeAlerts.length === 0 && emergencyTourists.length === 0 && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="fas fa-check-circle text-success mb-3" style={{ fontSize: '3rem' }}></i>
                  <h4 className="text-success">All Clear</h4>
                  <p className="text-muted">
                    No emergency situations detected. All tourists are in safe zones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceDashboard;