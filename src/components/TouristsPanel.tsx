import React, { useState } from 'react';
import type { Tourist } from '../types';

interface TouristsPanelProps {
  tourists: Tourist[];
}

const TouristsPanel: React.FC<TouristsPanelProps> = ({ tourists }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'warning' | 'danger' | 'emergency'>('all');

  const filteredTourists = tourists.filter(tourist => {
    const matchesSearch = tourist.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tourist.phone_number.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || tourist.current_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'safe': 'success',
      'warning': 'warning',
      'danger': 'danger',
      'emergency': 'dark'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'safe': 'fas fa-check-circle',
      'warning': 'fas fa-exclamation-triangle',
      'danger': 'fas fa-exclamation-circle',
      'emergency': 'fas fa-ambulance'
    };
    return icons[status as keyof typeof icons] || 'fas fa-question-circle';
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

  const statusCounts = {
    safe: tourists.filter(t => t.current_status === 'safe').length,
    warning: tourists.filter(t => t.current_status === 'warning').length,
    danger: tourists.filter(t => t.current_status === 'danger').length,
    emergency: tourists.filter(t => t.current_status === 'emergency').length,
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-users me-2"></i>
          Tourists ({filteredTourists.length})
        </h5>
      </div>
      
      <div className="card-body p-0">
        {/* Search and Filter */}
        <div className="p-3 border-bottom">
          <div className="mb-3">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search by Tourist ID or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="btn-group btn-group-sm w-100" role="group">
            <button
              type="button"
              className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'safe' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setStatusFilter('safe')}
            >
              Safe ({statusCounts.safe})
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'warning' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setStatusFilter('warning')}
            >
              Warning ({statusCounts.warning})
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'danger' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setStatusFilter('danger')}
            >
              Risk ({statusCounts.danger + statusCounts.emergency})
            </button>
          </div>
        </div>

        {/* Tourists List */}
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {filteredTourists.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-search text-muted mb-2" style={{ fontSize: '2rem' }}></i>
              <p className="text-muted mb-0">
                {searchTerm || statusFilter !== 'all' ? 'No tourists match your filters' : 'No tourists found'}
              </p>
            </div>
          ) : (
            filteredTourists.map((tourist, index) => (
              <div
                key={tourist.id}
                className={`p-3 border-bottom ${tourist.current_status === 'emergency' || tourist.current_status === 'danger' ? 'bg-danger-subtle' : ''}`}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="flex-grow-1">
                    <h6 className="mb-1">
                      <i className="fas fa-id-card me-1"></i>
                      {tourist.id}
                    </h6>
                    <p className="text-muted small mb-1">
                      <i className="fas fa-phone me-1"></i>
                      {tourist.phone_number}
                    </p>
                  </div>
                  <span className={`badge bg-${getStatusColor(tourist.current_status)}`}>
                    <i className={`${getStatusIcon(tourist.current_status)} me-1`}></i>
                    {tourist.current_status.toUpperCase()}
                  </span>
                </div>
                
                <div className="row text-center">
                  <div className="col-6">
                    <small className="text-muted d-block">Safety Score</small>
                    <span className={`fw-bold ${tourist.safety_score < 50 ? 'text-danger' : tourist.safety_score < 70 ? 'text-warning' : 'text-success'}`}>
                      {tourist.safety_score}%
                    </span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Last Update</small>
                    <span className="small">{formatTimeAgo(tourist.last_updated)}</span>
                  </div>
                </div>
                
                {tourist.current_zone_type && (
                  <div className="mt-2">
                    <small className="text-muted">Current Zone:</small>
                    <span className={`ms-1 badge bg-${tourist.current_zone_type === 'safe' ? 'success' : tourist.current_zone_type === 'warning' ? 'warning' : 'danger'}`}>
                      {tourist.current_zone_type.toUpperCase()}
                    </span>
                  </div>
                )}
                
                {(tourist.current_status === 'emergency' || tourist.current_status === 'danger') && (
                  <div className="mt-2">
                    <button className="btn btn-outline-primary btn-sm w-100">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      View Location
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TouristsPanel;