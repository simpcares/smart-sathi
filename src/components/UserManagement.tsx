import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  last_login?: string;
  role?: string;
  badge_number?: string;
  rank?: string;
  station?: string;
}

interface UserManagementProps {
  onRefresh?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onRefresh }) => {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<{ admin: User[]; police: User[] }>({ admin: [], police: [] });
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/list', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers({
          admin: data.admin_users || [],
          police: data.police_users || []
        });
      } else {
        showNotification('Failed to load users', 'danger');
      }
    } catch (error) {
      showNotification('Error loading users', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleUserStatus = async (userType: 'admin' | 'police', userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userType}/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        showNotification('User status updated successfully', 'success');
        loadUsers(); // Refresh the list
        onRefresh?.();
      } else {
        const data = await response.json();
        showNotification(data.error || 'Failed to update user status', 'danger');
      }
    } catch (error) {
      showNotification('Error updating user status', 'danger');
    }
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const allUsers = [
    ...users.admin.map(u => ({ ...u, type: 'admin' as const })),
    ...users.police.map(u => ({ ...u, type: 'police' as const }))
  ];

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-users-cog me-2"></i>
          User Management
        </h5>
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={loadUsers}
          disabled={loading}
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      No users found
                    </td>
                  </tr>
                ) : (
                  allUsers.map(user => (
                    <tr key={`${user.type}-${user.id}`}>
                      <td>
                        <div>
                          <strong>{user.username}</strong>
                          <br />
                          <small className="text-muted">{user.email}</small>
                          {user.badge_number && (
                            <>
                              <br />
                              <small className="text-info">Badge: {user.badge_number}</small>
                            </>
                          )}
                          {user.station && (
                            <>
                              <br />
                              <small className="text-secondary">{user.station}</small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${user.type === 'admin' ? 'primary' : 'success'}`}>
                          {user.type}
                        </span>
                        {user.role && (
                          <>
                            <br />
                            <small className="text-muted">{user.role}</small>
                          </>
                        )}
                        {user.rank && (
                          <>
                            <br />
                            <small className="text-muted">{user.rank}</small>
                          </>
                        )}
                      </td>
                      <td>
                        <span className={`badge bg-${user.is_active ? 'success' : 'secondary'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <br />
                        <small className="text-muted">
                          Last: {formatLastLogin(user.last_login)}
                        </small>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm btn-outline-${user.is_active ? 'warning' : 'success'}`}
                          onClick={() => toggleUserStatus(user.type, user.id)}
                          disabled={user.role === 'super_admin' && user.is_active}
                          title={user.role === 'super_admin' && user.is_active ? 'Cannot deactivate super admin' : ''}
                        >
                          {user.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
