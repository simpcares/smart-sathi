import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EmergencyReset: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState<{
    username: string;
    password: string;
    email: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEmergencyReset = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/auth/admin/emergency-reset', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const text = await response.text();
        
        // Parse the HTML response to extract credentials
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const usernameElement = doc.querySelector('[data-username]');
        const passwordElement = doc.querySelector('[data-password]');
        const emailElement = doc.querySelector('[data-email]');
        
        if (usernameElement && passwordElement) {
          setResetData({
            username: usernameElement.textContent || '',
            password: passwordElement.textContent || '',
            email: emailElement?.textContent || ''
          });
        } else {
          setError('Failed to parse reset credentials');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Emergency reset failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  return (
    <div className="min-vh-100 bg-dark">
      {/* Header */}
      <nav className="navbar navbar-dark bg-danger">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Emergency Access Recovery
          </Link>
          <Link to="/login" className="btn btn-outline-light">
            <i className="fas fa-arrow-left me-1"></i>
            Back to Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-xl-6">
              <div className="card border-danger">
                <div className="card-body p-4">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h3 className="text-danger mb-2">Emergency Admin Reset</h3>
                    <p className="text-muted">
                      This is an emergency access recovery tool for system administrators.
                      Use only when normal access methods are unavailable.
                    </p>
                  </div>

                  {/* Warning */}
                  <div className="alert alert-warning" role="alert">
                    <h6 className="alert-heading">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Security Warning
                    </h6>
                    <p className="mb-0">
                      This action will reset the super admin password and log the activity.
                      Only use this feature if you have legitimate administrative access needs.
                    </p>
                  </div>

                  {/* Reset Button */}
                  {!resetData && !error && (
                    <div className="text-center mb-4">
                      <button
                        className="btn btn-danger btn-lg"
                        onClick={handleEmergencyReset}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Resetting Password...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-key me-2"></i>
                            Reset Super Admin Password
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <h6 className="alert-heading">
                        <i className="fas fa-times-circle me-2"></i>
                        Reset Failed
                      </h6>
                      <p className="mb-0">{error}</p>
                      <hr />
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          setError(null);
                          setResetData(null);
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Success Display */}
                  {resetData && (
                    <div className="alert alert-success" role="alert">
                      <h6 className="alert-heading">
                        <i className="fas fa-check-circle me-2"></i>
                        Password Reset Successful
                      </h6>
                      <p>New admin credentials have been generated:</p>
                      
                      <div className="bg-light p-3 rounded mb-3">
                        <div className="row">
                          <div className="col-sm-3"><strong>Username:</strong></div>
                          <div className="col-sm-7">
                            <code data-username>{resetData.username}</code>
                          </div>
                          <div className="col-sm-2">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => copyToClipboard(resetData.username)}
                              title="Copy to clipboard"
                            >
                              <i className="fas fa-copy"></i>
                            </button>
                          </div>
                        </div>
                        
                        <div className="row mt-2">
                          <div className="col-sm-3"><strong>Password:</strong></div>
                          <div className="col-sm-7">
                            <code data-password>{resetData.password}</code>
                          </div>
                          <div className="col-sm-2">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => copyToClipboard(resetData.password)}
                              title="Copy to clipboard"
                            >
                              <i className="fas fa-copy"></i>
                            </button>
                          </div>
                        </div>
                        
                        {resetData.email && (
                          <div className="row mt-2">
                            <div className="col-sm-3"><strong>Email:</strong></div>
                            <div className="col-sm-7">
                              <code data-email>{resetData.email}</code>
                            </div>
                            <div className="col-sm-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => copyToClipboard(resetData.email)}
                                title="Copy to clipboard"
                              >
                                <i className="fas fa-copy"></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="d-grid">
                        <Link to="/login" className="btn btn-success">
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Go to Login Page
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="mt-4">
                    <h6>Instructions:</h6>
                    <ol className="small text-muted">
                      <li>Click the reset button to generate new admin credentials</li>
                      <li>Copy the generated username and password</li>
                      <li>Use these credentials to log in as administrator</li>
                      <li>Change the password immediately after logging in</li>
                      <li>This action is logged for security auditing</li>
                    </ol>
                  </div>

                  {/* Footer */}
                  <div className="text-center mt-4">
                    <small className="text-muted">
                      <i className="fas fa-shield-alt me-1"></i>
                      Tourist Safety Monitoring System - Emergency Access
                    </small>
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

export default EmergencyReset;
