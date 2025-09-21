// Tourist Safety Monitoring System - TypeScript Types

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: {
    can_view_sensitive_data: boolean;
    can_modify_geofences: boolean;
    can_manage_users: boolean;
    can_access_system_logs: boolean;
    can_modify_restricted_zones: boolean;
  };
}

export interface Tourist {
  id: string;
  phone_number: string;
  registration_timestamp: string;
  emergency_contact_phone: string;
  location_history: LocationData[];
  safety_score: number;
  current_status: 'safe' | 'warning' | 'danger' | 'emergency';
  current_zone_type?: string;
  last_updated: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  zone_type?: string;
  safety_score?: number;
}

export interface Alert {
  id: string;
  tourist_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  created_at: string;
  status: 'active' | 'acknowledged' | 'resolved';
  location?: LocationData;
  additional_data?: any;
}

export interface GeofenceZone {
  id: string;
  name: string;
  zone_type: 'safe' | 'warning' | 'restricted' | 'danger' | 'military_restricted';
  coordinates: Array<[number, number]>;
  description?: string;
  created_at: string;
  created_by: string;
  is_active: boolean;
}

export interface DashboardStats {
  total_tourists: number;
  active_tourists: number;
  active_alerts: number;
  critical_alerts: number;
  zones_count: number;
  avg_safety_score: number;
}

export interface WebSocketEvent {
  type: 'tourist_location_update' | 'anomaly_alert' | 'high_priority_violation' | 'zone_violation_alert' | 'zone_update' | 'user_management_update';
  data: any;
  timestamp: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expires_at: string;
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export type AlertType = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationMessage {
  id: string;
  type: AlertType;
  message: string;
  timestamp: string;
  duration?: number;
}