import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import type { DashboardStats, Tourist, Alert } from '../types';
import DashboardHeader from '../components/DashboardHeader';
import StatsCards from '../components/StatsCards';
import AlertsPanel from '../components/AlertsPanel';
import TouristsPanel from '../components/TouristsPanel';
import MapPanel from '../components/MapPanel';
import QuickActions from '../components/QuickActions';
import UserManagement from '../components/UserManagement';
import SystemStatus from '../components/SystemStatus';
import RecentActivity from '../components/RecentActivity';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { onTouristLocationUpdate, onAnomalyAlert, onZoneViolationAlert } = useWebSocket();
  const { showNotification } = useNotification();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [statsResponse, touristsResponse, alertsResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getTourists(),
        apiService.getAlerts()
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (touristsResponse.success && touristsResponse.data) {
        setTourists(touristsResponse.data);
      }

      if (alertsResponse.success && alertsResponse.data) {
        setAlerts(alertsResponse.data);
      }
    } catch (error: any) {
      showNotification(error.message || 'Failed to load dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Load initial data and setup auto-refresh
  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [loadDashboardData]);

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
    };

    const handleZoneViolationAlert = (newAlert: Alert) => {
      setAlerts(prev => [newAlert, ...prev]);
    };

    onTouristLocationUpdate(handleTouristUpdate);
    onAnomalyAlert(handleAnomalyAlert);
    onZoneViolationAlert(handleZoneViolationAlert);

    return () => {
      // Cleanup would require off functions from WebSocket context
    };
  }, [onTouristLocationUpdate, onAnomalyAlert, onZoneViolationAlert]);

  const handleAlertResolve = async (alertId: string) => {
    try {
      const response = await apiService.resolveAlert(alertId);
      if (response.success) {
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId ? { ...alert, status: 'resolved' } : alert
          )
        );
        showNotification('Alert resolved successfully', 'success');
      } else {
        showNotification(response.error || 'Failed to resolve alert', 'danger');
      }
    } catch (error: any) {
      showNotification(error.message || 'Network error occurred', 'danger');
    }
  };

  const handleAlertAcknowledge = async (alertId: string) => {
    try {
      const response = await apiService.acknowledgeAlert(alertId);
      if (response.success) {
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
          )
        );
        showNotification('Alert acknowledged', 'info');
      } else {
        showNotification(response.error || 'Failed to acknowledge alert', 'danger');
      }
    } catch (error: any) {
      showNotification(error.message || 'Network error occurred', 'danger');
    }
  };

  if (loading && !stats) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading Dashboard...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-dark">
      <DashboardHeader user={user} onRefresh={loadDashboardData} loading={loading} />
      
      <div className="container-fluid px-4 py-3">
        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-12">
            <StatsCards stats={stats} />
          </div>
        </div>

        {/* Main Content */}
        <div className="row">
          {/* Left Column - Alerts */}
          <div className="col-lg-4 mb-4">
            <AlertsPanel
              alerts={alerts}
              onResolve={handleAlertResolve}
              onAcknowledge={handleAlertAcknowledge}
            />
          </div>

          {/* Center Column - Map */}
          <div className="col-lg-5 mb-4">
            <MapPanel tourists={tourists} alerts={alerts} />
          </div>

          {/* Right Column - Tourists */}
          <div className="col-lg-3 mb-4">
            <TouristsPanel tourists={tourists} />
          </div>
        </div>

        {/* Additional Admin Sections */}
        <div className="row">
          {/* Quick Actions */}
          <div className="col-lg-4 mb-4">
            <QuickActions onRefresh={loadDashboardData} />
          </div>

          {/* User Management */}
          <div className="col-lg-4 mb-4">
            <UserManagement onRefresh={loadDashboardData} />
          </div>

          {/* System Status */}
          <div className="col-lg-4 mb-4">
            <SystemStatus onRefresh={loadDashboardData} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="row">
          <div className="col-12 mb-4">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;