// API Service Layer for Tourist Safety Monitoring System
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { APIResponse, LoginCredentials, User, Tourist, Alert, GeofenceZone, DashboardStats } from '../types';

// Use environment variable for API URL, fallback to production backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://tourist-backend-latest.onrender.com';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000, // Increased timeout for production
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = sessionStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Clear auth data and redirect to login
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('user_data');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<APIResponse<{ token: string; user: User }>> {
    try {
      // Use the unified API login endpoint
      const response: AxiosResponse = await this.client.post('/api/auth/login', {
        username: credentials.username,
        password: credentials.password,
        user_type: credentials.accessType || 'admin'
      });
      
      const data = response.data;
      if (data.token) {
        return {
          success: true,
          data: {
            token: data.token,
            user: {
              id: data.user_id,
              username: data.username || credentials.username,
              email: data.email || `${credentials.username}@${credentials.accessType || 'admin'}.local`,
              role: data.user_type || credentials.accessType || 'admin',
              permissions: {
                can_view_sensitive_data: true,
                can_modify_geofences: data.user_type === 'admin',
                can_manage_users: data.user_type === 'admin',
                can_access_system_logs: data.user_type === 'admin',
                can_modify_restricted_zones: data.user_type === 'admin'
              }
            }
          }
        };
      }
      
      return {
        success: false,
        error: data.error || 'Login failed'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
    }
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<APIResponse<DashboardStats>> {
    try {
      const response = await this.client.get('/api/dashboard/stats');
      
      // Handle both old and new response formats
      const data = response.data;
      
      if (data.success !== false) {
        const stats: DashboardStats = {
          total_tourists: data.total_tourists || 0,
          active_tourists: data.active_tourists || 0,
          active_alerts: data.critical_alerts || data.active_alerts || 0,
          critical_alerts: data.critical_alerts || 0,
          zones_count: data.active_zones || data.zones_count || 0,
          avg_safety_score: 85 // Default value since not in backend response
        };
        
        return {
          success: true,
          data: stats
        };
      }
      
      return {
        success: false,
        error: data.error || 'Failed to fetch dashboard stats'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch dashboard stats'
      };
    }
  }

  async getTourists(): Promise<APIResponse<Tourist[]>> {
    try {
      const response = await this.client.get('/api/dashboard/tourist-locations');
      
      if (response.data.success !== false) {
        const locations = response.data.locations || [];
        
        // Transform backend data to frontend format
        const tourists: Tourist[] = locations.map((location: any) => ({
          id: location.tourist_id,
          phone_number: location.phone_number || 'N/A',
          registration_timestamp: location.timestamp,
          emergency_contact_phone: 'N/A',
          location_history: [{
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: location.timestamp,
            accuracy: 10,
            zone_type: 'safe',
            safety_score: 85
          }],
          safety_score: 85,
          current_status: location.status || 'safe',
          current_zone_type: 'safe',
          last_updated: location.timestamp
        }));
        
        return {
          success: true,
          data: tourists
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Failed to fetch tourists'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch tourists'
      };
    }
  }

  async getAlerts(): Promise<APIResponse<Alert[]>> {
    try {
      const response = await this.client.get('/api/dashboard/alerts');
      
      if (response.data.success !== false) {
        const alertsData = response.data.alerts || [];
        
        // Transform backend data to frontend format
        const alerts: Alert[] = alertsData.map((alert: any) => ({
          id: alert.id.toString(),
          tourist_id: alert.tourist_id,
          alert_type: alert.type || alert.anomaly_type || 'general',
          severity: alert.severity || 'medium',
          message: alert.description || alert.message || 'Alert detected',
          created_at: alert.timestamp,
          status: alert.is_resolved ? 'resolved' : 'active',
          location: alert.location ? {
            latitude: alert.location.lat,
            longitude: alert.location.lng,
            timestamp: alert.timestamp,
            accuracy: 10
          } : undefined,
          additional_data: {}
        }));
        
        return {
          success: true,
          data: alerts
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Failed to fetch alerts'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch alerts'
      };
    }
  }

  // Alert management
  async resolveAlert(alertId: string): Promise<APIResponse> {
    try {
      const response = await this.client.post(`/api/alerts/${alertId}/resolve`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to resolve alert'
      };
    }
  }

  async acknowledgeAlert(alertId: string): Promise<APIResponse> {
    try {
      const response = await this.client.post(`/api/alerts/${alertId}/acknowledge`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to acknowledge alert'
      };
    }
  }

  // Geofence endpoints
  async getGeofenceZones(): Promise<APIResponse<GeofenceZone[]>> {
    try {
      const response = await this.client.get('/api/admin/geofence/zones');
      if (response.data.success) {
        return {
          success: true,
          data: response.data.zones || []
        };
      }
      return {
        success: false,
        error: response.data.error || 'Failed to fetch geofence zones'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch geofence zones'
      };
    }
  }

  async createGeofenceZone(zone: Omit<GeofenceZone, 'id' | 'created_at' | 'created_by'>): Promise<APIResponse<GeofenceZone>> {
    try {
      const response = await this.client.post('/api/admin/geofence/zones', zone);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create geofence zone'
      };
    }
  }

  async updateGeofenceZone(zoneId: string, zone: Partial<GeofenceZone>): Promise<APIResponse<GeofenceZone>> {
    try {
      const response = await this.client.put(`/api/geofence/zones/${zoneId}`, zone);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update geofence zone'
      };
    }
  }

  async deleteGeofenceZone(zoneId: string): Promise<APIResponse> {
    try {
      const response = await this.client.delete(`/api/geofence/zones/${zoneId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete geofence zone'
      };
    }
  }

  // Tourist registration
  async registerTourist(registrationData: {
    fullName: string;
    nationality: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    tripStartDate: string;
    tripEndDate: string;
    entryPoint: string;
    passportNumber?: string;
    aadhaarNumber?: string;
  }): Promise<APIResponse<{ digital_id: string }>> {
    try {
      const response = await this.client.post('/api/tourist-id/register', {
        full_name: registrationData.fullName,
        nationality: registrationData.nationality,
        emergency_contact_name: registrationData.emergencyContactName,
        emergency_contact_phone: registrationData.emergencyContactPhone,
        trip_start_date: registrationData.tripStartDate,
        trip_end_date: registrationData.tripEndDate,
        entry_point: registrationData.entryPoint,
        passport_number: registrationData.passportNumber,
        aadhaar_number: registrationData.aadhaarNumber
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to register tourist'
      };
    }
  }

  // Tourist tracking
  async getTouristLocation(touristId: string): Promise<APIResponse<Tourist>> {
    try {
      const response = await this.client.get(`/api/tourist/${touristId}/location`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch tourist location'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<APIResponse> {
    try {
      const response = await this.client.get('/health');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Health check failed'
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;
