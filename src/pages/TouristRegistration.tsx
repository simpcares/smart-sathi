import React, { useState } from 'react';
import { apiService } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const TouristRegistration: React.FC = () => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    fullName: '',
    nationality: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    tripStartDate: '',
    tripEndDate: '',
    entryPoint: '',
    idType: 'passport',
    passportNumber: '',
    aadhaarNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [touristId, setTouristId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.registerTourist({
        fullName: formData.fullName,
        nationality: formData.nationality,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        tripStartDate: formData.tripStartDate,
        tripEndDate: formData.tripEndDate,
        entryPoint: formData.entryPoint,
        passportNumber: formData.idType === 'passport' ? formData.passportNumber : undefined,
        aadhaarNumber: formData.idType === 'aadhaar' ? formData.aadhaarNumber : undefined
      });

      if (response.success && response.data) {
        setTouristId(response.data.digital_id);
        setRegistered(true);
        showNotification('Registration successful! Please save your Tourist ID.', 'success');
      } else {
        showNotification(response.error || 'Registration failed', 'danger');
      }
    } catch (error: any) {
      showNotification(error.message || 'Network error occurred', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      nationality: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      tripStartDate: '',
      tripEndDate: '',
      entryPoint: '',
      idType: 'passport',
      passportNumber: '',
      aadhaarNumber: ''
    });
    setRegistered(false);
    setTouristId('');
  };

  if (registered) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                  </div>
                  <h2 className="text-success mb-3">Registration Successful!</h2>
                  <p className="text-muted mb-4">
                    Your tourist registration has been completed successfully.
                  </p>
                  
                  <div className="alert alert-info mb-4">
                    <h5 className="alert-heading">
                      <i className="fas fa-id-card me-2"></i>Your Tourist ID
                    </h5>
                    <h3 className="text-primary font-monospace">{touristId}</h3>
                    <hr />
                    <p className="mb-0">
                      <strong>Important:</strong> Please save this ID and keep it with you during your travels.
                      You'll need it for emergency services and location tracking.
                    </p>
                  </div>

                  <div className="row text-start">
                    <div className="col-12">
                      <h6>Next Steps:</h6>
                      <ul className="list-unstyled">
                        <li><i className="fas fa-mobile-alt text-primary me-2"></i>Download our mobile app</li>
                        <li><i className="fas fa-map-marker-alt text-primary me-2"></i>Enable location services</li>
                        <li><i className="fas fa-bell text-primary me-2"></i>Keep your phone charged</li>
                        <li><i className="fas fa-phone text-primary me-2"></i>Share your Tourist ID with emergency contacts</li>
                      </ul>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => window.print()}
                    >
                      <i className="fas fa-print me-2"></i>Print Tourist ID
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                    >
                      <i className="fas fa-plus me-2"></i>Register Another Tourist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <i className="fas fa-user-plus text-primary" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h2 className="card-title text-primary mb-2">Tourist Registration</h2>
                  <p className="text-muted">Register for safety monitoring services</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit}>
                  {/* Personal Information */}
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">
                      <i className="fas fa-user me-2"></i>Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="nationality" className="form-label">
                      <i className="fas fa-flag me-2"></i>Nationality
                    </label>
                    <select
                      className="form-select form-select-lg"
                      id="nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select nationality</option>
                      <option value="Indian">Indian</option>
                      <option value="American">American</option>
                      <option value="British">British</option>
                      <option value="Canadian">Canadian</option>
                      <option value="Australian">Australian</option>
                      <option value="German">German</option>
                      <option value="French">French</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Emergency Contact */}
                  <div className="mb-3">
                    <label htmlFor="emergencyContactName" className="form-label">
                      <i className="fas fa-user-shield me-2"></i>Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="Contact person name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="emergencyContactPhone" className="form-label">
                      <i className="fas fa-phone me-2"></i>Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="+91 98765 43210"
                      pattern="[+]?[0-9\s-()]+"
                    />
                  </div>

                  {/* Trip Information */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="tripStartDate" className="form-label">
                        <i className="fas fa-calendar me-2"></i>Trip Start Date
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        id="tripStartDate"
                        name="tripStartDate"
                        value={formData.tripStartDate}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="tripEndDate" className="form-label">
                        <i className="fas fa-calendar-check me-2"></i>Trip End Date
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg"
                        id="tripEndDate"
                        name="tripEndDate"
                        value={formData.tripEndDate}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        min={formData.tripStartDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="entryPoint" className="form-label">
                      <i className="fas fa-map-marker-alt me-2"></i>Entry Point
                    </label>
                    <select
                      className="form-select form-select-lg"
                      id="entryPoint"
                      name="entryPoint"
                      value={formData.entryPoint}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select entry point</option>
                      <option value="Guwahati Airport">Guwahati Airport</option>
                      <option value="Jorhat Airport">Jorhat Airport</option>
                      <option value="Dibrugarh Airport">Dibrugarh Airport</option>
                      <option value="Silchar Airport">Silchar Airport</option>
                      <option value="New Jalpaiguri Railway Station">New Jalpaiguri Railway Station</option>
                      <option value="Guwahati Railway Station">Guwahati Railway Station</option>
                      <option value="Road Border - Assam">Road Border - Assam</option>
                      <option value="Road Border - Meghalaya">Road Border - Meghalaya</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* ID Information */}
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-id-card me-2"></i>Identification Document
                    </label>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="idType"
                            id="passport"
                            value="passport"
                            checked={formData.idType === 'passport'}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <label className="form-check-label" htmlFor="passport">
                            Passport
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="idType"
                            id="aadhaar"
                            value="aadhaar"
                            checked={formData.idType === 'aadhaar'}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <label className="form-check-label" htmlFor="aadhaar">
                            Aadhaar Card
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.idType === 'passport' && (
                    <div className="mb-3">
                      <label htmlFor="passportNumber" className="form-label">
                        <i className="fas fa-passport me-2"></i>Passport Number
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="passportNumber"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="A1234567"
                        pattern="[A-Z][0-9]{7}"
                      />
                    </div>
                  )}

                  {formData.idType === 'aadhaar' && (
                    <div className="mb-4">
                      <label htmlFor="aadhaarNumber" className="form-label">
                        <i className="fas fa-id-card me-2"></i>Aadhaar Number
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="aadhaarNumber"
                        name="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        placeholder="1234 5678 9012"
                        pattern="[0-9]{4}\s[0-9]{4}\s[0-9]{4}"
                      />
                      <div className="form-text">
                        Format: 1234 5678 9012
                      </div>
                    </div>
                  )}

                  {/* Privacy Notice */}
                  <div className="alert alert-info mb-4">
                    <h6 className="alert-heading">
                      <i className="fas fa-info-circle me-2"></i>Privacy & Safety
                    </h6>
                    <small>
                      Your location data will be used only for safety monitoring and emergency response.
                      We comply with all privacy regulations and data protection standards.
                    </small>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading || !formData.fullName || !formData.nationality || !formData.emergencyContactName || !formData.emergencyContactPhone || !formData.tripStartDate || !formData.tripEndDate || !formData.entryPoint || (formData.idType === 'passport' && !formData.passportNumber) || (formData.idType === 'aadhaar' && !formData.aadhaarNumber)}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Registering...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-check me-2"></i>Register for Safety Monitoring
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <small className="text-muted">
                    By registering, you agree to our safety monitoring terms and privacy policy.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristRegistration;