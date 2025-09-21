import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface ActivityItem {
  id: number;
  timestamp: string;
  user_type: string;
  username: string;
  action: string;
  category: string;
  description: string;
  status: string;
  severity?: string;
  badge_number?: string;
  station?: string;
}

const RecentActivity: React.FC = () => {
  const { showNotification } = useNotification();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadRecentActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/logs/recent-activity?hours_back=24&limit=20', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activity || []);
      } else {
        showNotification('Failed to load recent activity', 'danger');
      }
    } catch (error) {
      showNotification('Error loading recent activity', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentActivity();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRecentActivity, 30000);
    
    return () => clearInterval(interval);
  }, [loadRecentActivity]);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'alerts') return activity.category === 'alert' || activity.action.includes('alert');
    if (filter === 'users') return activity.category === 'user_management' || activity.action.includes('user');
    if (filter === 'zones') return activity.category === 'geofence' || activity.action.includes('zone');
    return true;
  });

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (action: string, category: string) => {
    if (action.includes('login')) return 'fas fa-sign-in-alt';
    if (action.includes('logout')) return 'fas fa-sign-out-alt';
    if (action.includes('user')) return 'fas fa-user';
    if (action.includes('zone') || category === 'geofence') return 'fas fa-map-marker-alt';
    if (action.includes('alert') || category === 'alert') return 'fas fa-exclamation-triangle';
    if (action.includes('emergency')) return 'fas fa-ambulance';
    return 'fas fa-info-circle';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': case 'error': return 'danger';
      case 'warning': return 'warning';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-history me-2"></i>
          Recent System Activity
        </h5>
        <div className="btn-group btn-group-sm">
          <button 
            className={`btn btn-outline-primary ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`btn btn-outline-warning ${filter === 'alerts' ? 'active' : ''}`}
            onClick={() => setFilter('alerts')}
          >
            Alerts
          </button>
          <button 
            className={`btn btn-outline-info ${filter === 'users' ? 'active' : ''}`}
            onClick={() => setFilter('users')}
          >
            Users
          </button>
          <button 
            className={`btn btn-outline-success ${filter === 'zones' ? 'active' : ''}`}
            onClick={() => setFilter('zones')}
          >
            Zones
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={loadRecentActivity}
            disabled={loading}
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="fas fa-clock fa-2x mb-2"></i>
            <p>No recent activity found</p>
          </div>
        ) : (
          <div className="timeline" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredActivities.map((activity, index) => (
              <div key={activity.id} className="timeline-item d-flex mb-3">
                <div className="timeline-marker me-3">
                  <div className={`rounded-circle bg-${getStatusColor(activity.status)} d-flex align-items-center justify-content-center`} 
                       style={{ width: '32px', height: '32px' }}>
                    <i className={`${getActivityIcon(activity.action, activity.category)} text-white`} 
                       style={{ fontSize: '0.8rem' }}></i>
                  </div>
                </div>
                <div className="timeline-content flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">
                        <span className={`badge bg-${activity.user_type === 'admin' ? 'primary' : 'success'} me-2`}>
                          {activity.user_type.toUpperCase()}
                        </span>
                        {activity.username}
                        {activity.badge_number && (
                          <small className="text-muted ms-2">#{activity.badge_number}</small>
                        )}
                      </h6>
                      <p className="mb-1 text-muted small">{activity.description}</p>
                      <div className="d-flex align-items-center">
                        <span className={`badge bg-${getStatusColor(activity.status)} me-2`}>
                          {activity.status}
                        </span>
                        <span className="badge bg-secondary me-2">
                          {activity.category.replace('_', ' ')}
                        </span>
                        {activity.severity && (
                          <span className={`badge bg-${getSeverityColor(activity.severity)}`}>
                            {activity.severity}
                          </span>
                        )}
                      </div>
                    </div>
                    <small className="text-muted text-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </small>
                  </div>
                  {activity.station && (
                    <small className="text-info">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {activity.station}
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
