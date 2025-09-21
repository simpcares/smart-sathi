import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { LoginCredentials } from '../types';

interface ExtendedLoginCredentials extends LoginCredentials {
  accessType: 'admin' | 'police';
}

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const [credentials, setCredentials] = useState<ExtendedLoginCredentials>({
    username: '',
    password: '',
    accessType: 'admin'
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login({
      username: credentials.username,
      password: credentials.password,
      accessType: credentials.accessType
    });
    
    if (!success) {
      setLoading(false);
    }
    // If successful, the auth context will handle navigation
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEMO_MODE === 'true';

  const fillDemoCredentials = (type: 'police' | 'admin') => {
    if (type === 'police') {
      setCredentials({
        username: 'testpolice',
        password: 'TestPolice@123',
        accessType: 'police'
      });
    } else {
      setCredentials({
        username: 'superadmin',
        password: isDevelopment ? '_V01cBBwNiMmLgQsGbIj_g' : '',
        accessType: 'admin'
      });
    }
  };

  return (
    <div className="min-vh-100 bg-dark">
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <i className="fas fa-shield-alt me-2"></i>
            Tourist Safety Monitor
          </Link>
          <div className="d-flex">
            <Link to="/tourist/register" className="btn btn-outline-light me-2">
              <i className="fas fa-user-plus me-1"></i>
              Register Tourist
            </Link>
            <span className="navbar-text">
              <i className="fas fa-sign-in-alt me-1"></i>
              Login
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="row">
                {/* Login Form */}
                <div className="col-md-6 mb-4">
                  <div className="card border-primary h-100">
                    <div className="card-body p-4">
                      {/* Header */}
                      <div className="text-center mb-4">
                        <div className="mb-3">
                          <i className="fas fa-shield-alt text-primary" style={{ fontSize: '4rem' }}></i>
                        </div>
                        <h3 className="text-primary mb-2">Tourist Safety Monitor</h3>
                        <p className="text-muted">Secure Access Portal</p>
                      </div>

                      {/* Login Form */}
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label htmlFor="username" className="form-label">
                            <i className="fas fa-user me-2"></i>Username
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Enter your username"
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            <i className="fas fa-lock me-2"></i>Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Enter your password"
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor="accessType" className="form-label">
                            <i className="fas fa-id-badge me-2"></i>Access Type
                          </label>
                          <select
                            className="form-select"
                            id="accessType"
                            name="accessType"
                            value={credentials.accessType}
                            onChange={handleChange}
                            disabled={loading}
                          >
                            <option value="admin">Administrator</option>
                            <option value="police">Police Officer</option>
                          </select>
                        </div>

                        <div className="d-grid mb-3">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading || !credentials.username || !credentials.password}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Signing In...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-sign-in-alt me-2"></i>Login
                              </>
                            )}
                          </button>
                        </div>
                      </form>

                      {/* Footer */}
                      <div className="text-center">
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          For tourist registration, no login required
                        </small>
                        <div className="mt-2">
                          <Link to="/tourist/register" className="btn btn-link btn-sm">
                            <i className="fas fa-user-plus me-1"></i>
                            Register as Tourist
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demo Credentials */}
                <div className="col-md-6">
                  <div className="card bg-warning text-dark h-100">
                    <div className="card-body p-4">
                      <h5 className="card-title">
                        <i className="fas fa-key me-2"></i>
                        Demo Credentials
                      </h5>

                      {/* Police Officer */}
                      <div className="mb-4">
                        <h6 className="text-dark">Police Officer</h6>
                        <div className="small mb-2">
                          <div><strong>Username:</strong> testpolice</div>
                          <div><strong>Password:</strong> TestPolice@123</div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm"
                          onClick={() => fillDemoCredentials('police')}
                          disabled={loading}
                        >
                          <i className="fas fa-copy me-1"></i>
                          Use Police Credentials
                        </button>
                      </div>

                      {/* Administrator */}
                      <div className="mb-4">
                        <h6 className="text-dark">Administrator</h6>
                        <div className="small mb-2">
                          <div><strong>Username:</strong> superadmin</div>
                          <div><strong>Password:</strong> {isDevelopment ? '_V01cBBwNiMmLgQsGbIj_g' : 'Contact system admin'}</div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-dark btn-sm"
                          onClick={() => fillDemoCredentials('admin')}
                          disabled={loading}
                        >
                          <i className="fas fa-copy me-1"></i>
                          Use Admin Credentials
                        </button>
                      </div>

                      {/* Emergency Reset Info */}
                      <div className="mt-4 pt-3 border-top border-dark">
                        <small className="text-dark">
                          <strong>Emergency Access:</strong><br />
                          If admin credentials are lost, visit{' '}
                          <Link 
                            to="/auth/admin/emergency-reset" 
                            className="text-dark fw-bold"
                            target="_blank"
                          >
                            /auth/admin/emergency-reset
                          </Link>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;