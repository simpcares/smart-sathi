import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface CreateUserModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

interface UserFormData {
  user_type: 'police' | 'admin';
  username: string;
  email: string;
  password: string;
  badge_number?: string;
  rank?: string;
  station?: string;
  phone?: string;
  role?: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ show, onHide, onSuccess }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    user_type: 'police',
    username: '',
    email: '',
    password: '',
    badge_number: '',
    rank: '',
    station: '',
    phone: '',
    role: 'system_admin'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userType = e.target.value as 'police' | 'admin';
    setFormData(prev => ({
      ...prev,
      user_type: userType
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = formData.user_type === 'police' 
        ? '/api/admin/users/police/create'
        : '/api/admin/users/admin/create';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(
          `${formData.user_type.charAt(0).toUpperCase() + formData.user_type.slice(1)} user created successfully`,
          'success'
        );
        
        // Reset form
        setFormData({
          user_type: 'police',
          username: '',
          email: '',
          password: '',
          badge_number: '',
          rank: '',
          station: '',
          phone: '',
          role: 'system_admin'
        });
        
        onSuccess();
      } else {
        showNotification(data.error || 'Failed to create user', 'danger');
      }
    } catch (error) {
      showNotification('Error creating user', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-user-plus me-2"></i>
              Create New User
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">User Type</label>
                <select 
                  className="form-select" 
                  name="user_type" 
                  value={formData.user_type}
                  onChange={handleUserTypeChange}
                  required
                >
                  <option value="police">Police Officer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="username" 
                  value={formData.username}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  name="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              {/* Police-specific fields */}
              {formData.user_type === 'police' && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Badge Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="badge_number" 
                      value={formData.badge_number}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Rank</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="rank" 
                      value={formData.rank}
                      onChange={handleInputChange}
                      placeholder="e.g., Constable, Inspector"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Station</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="station" 
                      value={formData.station}
                      onChange={handleInputChange}
                      placeholder="e.g., Guwahati Central"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>
                </>
              )}

              {/* Admin-specific fields */}
              {formData.user_type === 'admin' && (
                <div className="mb-3">
                  <label className="form-label">Admin Role</label>
                  <select 
                    className="form-select" 
                    name="role" 
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="system_admin">System Admin</option>
                    <option value="geofence_admin">Geofence Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
