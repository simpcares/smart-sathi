import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import type { GeofenceZone } from '../types';

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface GeofenceMapProps {
  zones: GeofenceZone[];
  selectedZone: GeofenceZone | null;
  isDrawMode: boolean;
  onCreateZone: (zoneData: Omit<GeofenceZone, 'id' | 'created_at' | 'created_by'>) => void;
  onSelectZone: (zone: GeofenceZone | null) => void;
  canModify: boolean;
}

// Component for handling map drawing events
const DrawingHandler: React.FC<{
  isDrawMode: boolean;
  onCreateZone: (zoneData: Omit<GeofenceZone, 'id' | 'created_at' | 'created_by'>) => void;
}> = ({ isDrawMode, onCreateZone }) => {
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useMapEvents({
    click: (e) => {
      if (!isDrawMode) return;
      
      const { lat, lng } = e.latlng;
      const newPoint: [number, number] = [lat, lng];
      
      if (!isDrawing) {
        setIsDrawing(true);
        setDrawingPoints([newPoint]);
      } else {
        setDrawingPoints(prev => [...prev, newPoint]);
      }
    },
    dblclick: () => {
      if (isDrawMode && isDrawing && drawingPoints.length >= 3) {
        // Complete the polygon
        const zoneData = {
          name: `Zone ${Date.now()}`,
          zone_type: 'safe' as const,
          coordinates: drawingPoints,
          description: 'New geofence zone',
          is_active: true
        };
        
        onCreateZone(zoneData);
        setDrawingPoints([]);
        setIsDrawing(false);
      }
    }
  });

  // Show drawing preview
  if (isDrawing && drawingPoints.length >= 2) {
    return (
      <Polygon
        positions={drawingPoints}
        pathOptions={{
          color: '#007bff',
          fillColor: '#007bff',
          fillOpacity: 0.3,
          weight: 2,
          dashArray: '5, 5'
        }}
      />
    );
  }

  return null;
};

const GeofenceMap: React.FC<GeofenceMapProps> = ({
  zones,
  selectedZone,
  isDrawMode,
  onCreateZone,
  onSelectZone,
  canModify
}) => {
  const mapRef = useRef<L.Map | null>(null);
  
  // Northeast India center coordinates
  const center: [number, number] = [26.2006, 92.9376];
  const zoom = 7;

  const getZoneColor = (zoneType: string) => {
    const colors = {
      'safe': '#28a745',
      'warning': '#ffc107',
      'restricted': '#fd7e14',
      'danger': '#dc3545',
      'military_restricted': '#6f42c1'
    };
    return colors[zoneType as keyof typeof colors] || '#6c757d';
  };

  const getZoneIcon = (zoneType: string) => {
    const icons = {
      'safe': 'fas fa-shield-alt',
      'warning': 'fas fa-exclamation-triangle',
      'restricted': 'fas fa-ban',
      'danger': 'fas fa-skull-crossbones',
      'military_restricted': 'fas fa-lock'
    };
    return icons[zoneType as keyof typeof icons] || 'fas fa-map-marker';
  };

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-map me-2"></i>
          Geofence Map
        </h5>
        <div className="d-flex gap-2">
          {isDrawMode && (
            <span className="badge bg-warning">
              <i className="fas fa-draw-polygon me-1"></i>
              Draw Mode
            </span>
          )}
          <span className="badge bg-info">{zones.length} Zones</span>
        </div>
      </div>
      
      <div className="card-body p-0" style={{ height: '600px' }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render existing zones */}
          {zones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: getZoneColor(zone.zone_type),
                fillColor: getZoneColor(zone.zone_type),
                fillOpacity: zone.is_active ? 0.3 : 0.1,
                weight: selectedZone?.id === zone.id ? 4 : 2,
                opacity: zone.is_active ? 1 : 0.5,
                dashArray: zone.is_active ? undefined : '10, 10'
              }}
              eventHandlers={{
                click: () => {
                  if (!isDrawMode) {
                    onSelectZone(selectedZone?.id === zone.id ? null : zone);
                  }
                },
              }}
            >
              <Popup>
                <div className="text-center">
                  <h6 className="mb-2">
                    <i className={`${getZoneIcon(zone.zone_type)} me-1`}></i>
                    {zone.name}
                  </h6>
                  
                  <div className="mb-2">
                    <span className={`badge`} style={{ backgroundColor: getZoneColor(zone.zone_type) }}>
                      {zone.zone_type.replace('_', ' ').toUpperCase()}
                    </span>
                    {!zone.is_active && (
                      <span className="badge bg-secondary ms-1">Inactive</span>
                    )}
                  </div>
                  
                  {zone.description && (
                    <p className="small text-muted mb-2">{zone.description}</p>
                  )}
                  
                  <div className="small text-muted">
                    <div>Created: {new Date(zone.created_at).toLocaleDateString()}</div>
                    <div>By: {zone.created_by}</div>
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}
          
          {/* Drawing handler */}
          <DrawingHandler isDrawMode={isDrawMode} onCreateZone={onCreateZone} />
        </MapContainer>
      </div>
      
      {/* Instructions */}
      <div className="card-footer">
        {isDrawMode ? (
          <div className="alert alert-warning mb-0">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Drawing Mode:</strong> Click to add points, double-click to complete the zone.
          </div>
        ) : selectedZone ? (
          <div className="alert alert-info mb-0">
            <i className="fas fa-map-marker-alt me-2"></i>
            <strong>Selected:</strong> {selectedZone.name} 
            <span className="ms-2 badge" style={{ backgroundColor: getZoneColor(selectedZone.zone_type) }}>
              {selectedZone.zone_type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        ) : (
          <div className="alert alert-secondary mb-0">
            <i className="fas fa-mouse-pointer me-2"></i>
            Click on zones to select them, or use draw mode to create new zones.
          </div>
        )}
      </div>
    </div>
  );
};

export default GeofenceMap;