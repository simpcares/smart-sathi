import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

interface DashboardHeaderProps {
  user: User | null;
  onRefresh: () => void;
  loading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onRefresh, loading }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <nav className="navbar navbar-dark bg-primary sticky-top">
      <div className="container-fluid">
        <div className="navbar-brand">
          <i className="fas fa-shield-alt me-2"></i>
          Tourist Safety Dashboard
        </div>
        
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-light btn-sm me-3"
            onClick={onRefresh}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt me-1 ${loading ? 'fa-spin' : ''}`}></i>
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

export default DashboardHeader;