import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

interface GeofenceHeaderProps {
  user: User | null;
  onRefresh: () => void;
  isDrawMode: boolean;
  onToggleDrawMode: () => void;
  canModify: boolean;
}

const GeofenceHeader: React.FC<GeofenceHeaderProps> = ({ 
  user, 
  onRefresh, 
  isDrawMode, 
  onToggleDrawMode, 
  canModify 
}) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <nav className="navbar navbar-dark bg-info sticky-top">
      <div className="container-fluid">
        <div className="navbar-brand">
          <i className="fas fa-map-marked-alt me-2"></i>
          Geofence Administration
        </div>
        
        <div className="d-flex align-items-center gap-3">
          {canModify && (
            <button
              className={`btn ${isDrawMode ? 'btn-warning' : 'btn-outline-light'}`}
              onClick={onToggleDrawMode}
            >
              <i className={`fas ${isDrawMode ? 'fa-times' : 'fa-draw-polygon'} me-1`}></i>
              {isDrawMode ? 'Exit Draw Mode' : 'Draw Zone'}
            </button>
          )}
          
          <button className="btn btn-outline-light" onClick={onRefresh}>
            <i className="fas fa-sync-alt me-1"></i>
            Refresh
          </button>
          
          <div className="dropdown">
            <button
              className="btn btn-outline-light dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="fas fa-user me-1"></i>
              {user?.username || 'User'}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item-text">
                  <small className="text-muted">Role: {user?.role}</small>
                </span>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item" href="/admin">
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Dashboard
                </a>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GeofenceHeader;