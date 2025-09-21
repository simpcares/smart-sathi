import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import CreateUserModal from './CreateUserModal';
import SystemLogsModal from './SystemLogsModal';

interface QuickActionsProps {
  onRefresh?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onRefresh }) => {
  const { showNotification } = useNotification();
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showSystemLogsModal, setShowSystemLogsModal] = useState(false);

  const handleCreatePoliceUser = () => {
    setShowCreateUserModal(true);
  };

  const handleCreateGeofence = () => {
    // Navigate to geofence admin page
    window.location.href = '/geofence-admin';
  };

  const handleViewSystemLogs = () => {
    setShowSystemLogsModal(true);
  };

  const handleExportData = async () => {
    try {
      showNotification('Preparing data export...', 'info');
      
      // Trigger export from backend
      const response = await fetch('/api/admin/logs/export?type=all&format=csv', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `system_data_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('Data exported successfully', 'success');
      } else {
        showNotification('Failed to export data', 'danger');
      }
    } catch (error) {
      showNotification('Error exporting data', 'danger');
    }
  };

  const handleEmergencyOverride = () => {
    const confirmed = window.confirm(
      'Are you sure you want to activate emergency override mode? This will trigger system-wide alerts.'
    );
    
    if (confirmed) {
      showNotification('Emergency override activated - All units notified', 'warning');
      // In a real system, this would trigger emergency protocols
    }
  };

  return (
    <>
      <div className="card h-100">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-bolt me-2"></i>
            Quick Actions
          </h5>
        </div>
        <div className="card-body">
          <div className="d-grid gap-2">
            <button 
              className="btn btn-outline-primary"
              onClick={handleCreatePoliceUser}
            >
              <i className="fas fa-user-plus me-2"></i>
              Create Police User
            </button>
            
            <button 
              className="btn btn-outline-success"
              onClick={handleCreateGeofence}
            >
              <i className="fas fa-map-marker-alt me-2"></i>
              Create Geofence
            </button>
            
            <button 
              className="btn btn-outline-warning"
              onClick={handleViewSystemLogs}
            >
              <i className="fas fa-file-alt me-2"></i>
              View System Logs
            </button>
            
            <button 
              className="btn btn-outline-info"
              onClick={handleExportData}
            >
              <i className="fas fa-download me-2"></i>
              Export Data
            </button>
            
            <button 
              className="btn btn-outline-danger"
              onClick={handleEmergencyOverride}
            >
              <i className="fas fa-exclamation-triangle me-2"></i>
              Emergency Override
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        show={showCreateUserModal}
        onHide={() => setShowCreateUserModal(false)}
        onSuccess={() => {
          setShowCreateUserModal(false);
          onRefresh?.();
        }}
      />

      <SystemLogsModal
        show={showSystemLogsModal}
        onHide={() => setShowSystemLogsModal(false)}
      />
    </>
  );
};

export default QuickActions;
