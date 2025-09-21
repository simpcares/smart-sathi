import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Tourist, Alert } from '../types';

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface TouristMapProps {
  tourists: Tourist[];
  alerts: Alert[];
  selectedTourist?: Tourist | null;
  onTouristSelect?: (tourist: Tourist) => void;
}

// Custom marker colors based on tourist status
const createCustomIcon = (status: string, hasAlert: boolean = false) => {
  let color = '#28a745'; // safe - green
  
  switch (status) {
    case 'warning':
      color = '#ffc107'; // yellow
      break;
    case 'danger':
      color = '#dc3545'; // red
      break;
    case 'emergency':
      color = '#721c24'; // dark red
      break;
  }

  const pulseClass = hasAlert ? 'marker-pulse' : '';
  
  return L.divIcon({
    html: `
      <div class="custom-marker ${pulseClass}" style="background-color: ${color};">
        <i class="fas ${status === 'emergency' ? 'fa-ambulance' : 'fa-user'}" style="color: white; font-size: 12px;"></i>
      </div>
    `,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const TouristMap: React.FC<TouristMapProps> = ({ 
  tourists, 
  alerts, 
  selectedTourist, 
  onTouristSelect 
}) => {
  const mapRef = useRef<L.Map | null>(null);

  // Northeast India center coordinates
  const center: [number, number] = [26.2006, 92.9376];
  const zoom = 7;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Get tourist alerts
  const getTouristAlerts = (touristId: string) => {
    return alerts.filter(alert => alert.tourist_id === touristId && alert.status === 'active');
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <style>{`
        .custom-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .marker-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 2px 4px rgba(0,0,0,0.3), 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          70% {
            box-shadow: 0 2px 4px rgba(0,0,0,0.3), 0 0 0 10px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 2px 4px rgba(0,0,0,0.3), 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }
        
        .leaflet-popup-content {
          margin: 8px 12px;
          line-height: 1.4;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
      `}</style>
      
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
        
        {tourists.map((tourist) => {
          if (!tourist.location_history || tourist.location_history.length === 0) {
            return null;
          }
          
          const lastLocation = tourist.location_history[tourist.location_history.length - 1];
          const touristAlerts = getTouristAlerts(tourist.id);
          const hasActiveAlert = touristAlerts.length > 0;
          
          return (
            <Marker
              key={tourist.id}
              position={[lastLocation.latitude, lastLocation.longitude]}
              icon={createCustomIcon(tourist.current_status, hasActiveAlert)}
              eventHandlers={{
                click: () => {
                  if (onTouristSelect) {
                    onTouristSelect(tourist);
                  }
                },
              }}
            >
              <Popup>
                <div className="text-center">
                  <h6 className="mb-2">
                    <i className="fas fa-id-card me-1"></i>
                    Tourist {tourist.id}
                  </h6>
                  
                  <div className="mb-2">
                    <span className={`badge bg-${
                      tourist.current_status === 'safe' ? 'success' :
                      tourist.current_status === 'warning' ? 'warning' :
                      tourist.current_status === 'danger' ? 'danger' : 'dark'
                    }`}>
                      {tourist.current_status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="small text-muted mb-2">
                    <div><strong>Phone:</strong> {tourist.phone_number}</div>
                    <div><strong>Safety Score:</strong> {tourist.safety_score}%</div>
                    <div><strong>Last Update:</strong> {formatTimeAgo(tourist.last_updated)}</div>
                    {tourist.current_zone_type && (
                      <div><strong>Zone:</strong> {tourist.current_zone_type}</div>
                    )}
                  </div>
                  
                  {hasActiveAlert && (
                    <div className="mt-2">
                      <small className="text-danger">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {touristAlerts.length} Active Alert{touristAlerts.length > 1 ? 's' : ''}
                      </small>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TouristMap;