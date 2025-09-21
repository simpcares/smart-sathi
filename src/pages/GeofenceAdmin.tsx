import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNotification } from '../contexts/NotificationContext';
import { apiService } from '../services/api';
import type { GeofenceZone } from '../types';
import GeofenceHeader from '../components/GeofenceHeader';
import GeofenceMap from '../components/GeofenceMap';
import ZonesList from '../components/ZonesList';

const GeofenceAdmin: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { onZoneUpdate } = useWebSocket();
  const { showNotification } = useNotification();
  
  const [zones, setZones] = useState<GeofenceZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<GeofenceZone | null>(null);
  const [isDrawMode, setIsDrawMode] = useState(false);

  const loadGeofenceZones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getGeofenceZones();
      
      if (response.success && response.data) {
        setZones(response.data);
      } else {
        showNotification(response.error || 'Failed to load geofence zones', 'danger');
      }
    } catch (error: any) {
      showNotification(error.message || 'Network error occurred', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Load initial data
  useEffect(() => {
    loadGeofenceZones();
  }, [loadGeofenceZones]);

  // Setup WebSocket listeners
  useEffect(() => {
    if (!onZoneUpdate) return;

    const handleZoneUpdate = (updatedZone: GeofenceZone) => {
      setZones(prev => 
        prev.map(zone => 
          zone.id === updatedZone.id ? updatedZone : zone
        ).filter((zone): zone is GeofenceZone => zone !== undefined)
      );
      showNotification(`Zone "${updatedZone.name}" has been updated`, 'info');
    };

    onZoneUpdate(handleZoneUpdate);

    return () => {
      // Cleanup would require off functions from WebSocket context
    };
  }, [onZoneUpdate, showNotification]);

  const handleCreateZone = async (zoneData: Omit<GeofenceZone, 'id' | 'created_at' | 'created_by'>) => {
    if (!hasPermission('can_modify_geofences')) {
      showNotification('You do not have permission to create geofence zones', 'danger');
      return;
    }

    try {
      const response = await apiService.createGeofenceZone(zoneData);
      
      if (response.success && response.data) {
        setZones(prev => [...prev, response.data as GeofenceZone]);
        showNotification(`Zone "${response.data.name}" created successfully`, 'success');
        setIsDrawMode(false);
      } else {
        showNotification(response.error || 'Failed to create zone', 'danger');
      }
    } catch (error: any) {
      showNotification(error.message || 'Network error occurred', 'danger');
    }
  };

  const handleUpdateZone = async (zoneId: string, updates: Partial<GeofenceZone>) => {
    if (!hasPermission('can_modify_geofences')) {
      showNotification('You do not have permission to modify geofence zones', 'danger');
      return;
    }

    try {
      const response = await apiService.updateGeofenceZone(zoneId, updates);
      
      if (response.success && response.data) {
        setZones(prev => 
          prev.map(zone => 
            zone.id === zoneId ? response.data as GeofenceZone : zone
          )
        );
        showNotification(`Zone updated successfully`, 'success');
      } else {
        showNotification(response.error || 'Failed to update zone', 'danger');
      }
    } catch (error: any) {
      showNotification(error.message || 'Network error occurred', 'danger');
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!hasPermission('can_modify_geofences')) {
      showNotification('You do not have permission to delete geofence zones', 'danger');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this zone? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiService.deleteGeofenceZone(zoneId);
      
      if (response.success) {
        setZones(prev => prev.filter(zone => zone.id !== zoneId));
        setSelectedZone(null);
        showNotification('Zone deleted successfully', 'success');
      } else {
        showNotification(response.error || 'Failed to delete zone', 'danger');
      }
    } catch (error: any) {
      showNotification(error.message || 'Network error occurred', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading Geofence Administration...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-dark">
      <GeofenceHeader 
        user={user}
        onRefresh={loadGeofenceZones}
        isDrawMode={isDrawMode}
        onToggleDrawMode={() => setIsDrawMode(!isDrawMode)}
        canModify={hasPermission('can_modify_geofences')}
      />
      
      <div className="container-fluid px-4 py-3">
        <div className="row">
          {/* Left Column - Zones List */}
          <div className="col-lg-4 mb-4">
            <ZonesList
              zones={zones}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
              onUpdateZone={handleUpdateZone}
              onDeleteZone={handleDeleteZone}
              canModify={hasPermission('can_modify_geofences')}
            />
          </div>

          {/* Right Column - Map */}
          <div className="col-lg-8 mb-4">
            <GeofenceMap
              zones={zones}
              selectedZone={selectedZone}
              isDrawMode={isDrawMode}
              onCreateZone={handleCreateZone}
              onSelectZone={setSelectedZone}
              canModify={hasPermission('can_modify_geofences')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeofenceAdmin;