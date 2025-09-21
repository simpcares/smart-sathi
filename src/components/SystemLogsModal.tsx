import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface SystemLogsModalProps {
  show: boolean;
  onHide: () => void;
}

interface LogEntry {
  id: number;
  timestamp: string;
  username: string;
  action: string;
  description: string;
  category: string;
  status: string;
  badge_number?: string;
  extra_data?: any;
}

interface LogStatistics {
  total_logs: { total: number; admin: number; police: number };
  recent_activity_24h: { total: number; admin: number; police: number };
  system_overview: { total_admin_users: number; total_police_users: number; unique_stations: number };
  categories: { admin: Record<string, number>; police: Record<string, number> };
}

const SystemLogsModal: React.FC<SystemLogsModalProps> = ({ show, onHide }) => {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'admin' | 'police'>('admin');
  const [adminLogs, setAdminLogs] = useState<LogEntry[]>([]);
  const [policeLogs, setPoliceLogs] = useState<LogEntry[]>([]);
  const [statistics, setStatistics] = useState<LogStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState('all');
  const [exportFormat, setExportFormat] = useState('csv');

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/admin/logs/statistics', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadAdminLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs/admin?per_page=20', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading admin logs:', error);
    }
  };

  const loadPoliceLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs/police?per_page=20', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPoliceLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading police logs:', error);
    }
  };

  const loadAllLogs = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStatistics(),
        loadAdminLogs(),
        loadPoliceLogs()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      loadAllLogs();
    }
  }, [show, loadAllLogs]);

  const handleExport = async () => {
    try {
      showNotification('Preparing export...', 'info');
      
      const response = await fetch(`/api/admin/logs/export?type=${exportType}&format=${exportFormat}`, {
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
        a.download = `system_logs_${exportType}_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('Logs exported successfully', 'success');
      } else {
        showNotification('Failed to export logs', 'danger');
      }
    } catch (error) {
      showNotification('Error exporting logs', 'danger');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success';
      case 'failed': case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-file-alt me-2"></i>
              System Logs
            </h5>
            <div className="d-flex align-items-center me-3">
              <label className="me-2">Export:</label>
              <select 
                className="form-select form-select-sm me-2" 
                style={{ width: 'auto' }}
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
              >
                <option value="all">All Logs</option>
                <option value="admin">Admin Only</option>
                <option value="police">Police Only</option>
              </select>
              <select 
                className="form-select form-select-sm me-2" 
                style={{ width: 'auto' }}
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <button className="btn btn-sm btn-outline-success me-2" onClick={handleExport}>
                <i className="fas fa-download"></i> Export
              </button>
              <button className="btn btn-sm btn-outline-primary" onClick={loadAllLogs}>
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            </div>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>

          <div className="modal-body">
            {/* Statistics Overview */}
            {statistics && (
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h5 className="text-primary">{statistics.total_logs.total}</h5>
                      <small>Total Logs</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h5 className="text-info">{statistics.total_logs.admin}</h5>
                      <small>Admin Activities</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h5 className="text-success">{statistics.total_logs.police}</h5>
                      <small>Police Activities</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h5 className="text-warning">{statistics.recent_activity_24h.total}</h5>
                      <small>Recent (24h)</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveTab('admin')}
                >
                  Admin Logs ({adminLogs.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'police' ? 'active' : ''}`}
                  onClick={() => setActiveTab('police')}
                >
                  Police Logs ({policeLogs.length})
                </button>
              </li>
            </ul>

            {/* Logs Table */}
            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-sm table-hover">
                  <thead className="table-dark sticky-top">
                    <tr>
                      <th>Time</th>
                      <th>User</th>
                      {activeTab === 'police' && <th>Badge</th>}
                      <th>Action</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === 'admin' ? adminLogs : policeLogs).map(log => (
                      <tr key={log.id}>
                        <td className="text-nowrap">
                          <small>{formatTimestamp(log.timestamp)}</small>
                        </td>
                        <td>
                          <strong>{log.username}</strong>
                        </td>
                        {activeTab === 'police' && (
                          <td>
                            <span className="badge bg-primary">{log.badge_number || 'N/A'}</span>
                          </td>
                        )}
                        <td>
                          <span className="badge bg-info">{log.action.replace('_', ' ')}</span>
                        </td>
                        <td>
                          <small>{log.description || 'N/A'}</small>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{log.category}</span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogsModal;
