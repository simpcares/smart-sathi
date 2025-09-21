import React, { useState } from 'react';
import TouristMap from './TouristMap';
import type { Tourist, Alert } from '../types';

interface MapPanelProps {
  tourists: Tourist[];
  alerts: Alert[];
}

const MapPanel: React.FC<MapPanelProps> = ({ tourists, alerts }) => {
  const [selectedTourist, setSelectedTourist] = useState<Tourist | null>(null);
  const activeTourists = tourists.filter(t => t.current_status !== 'safe');
  const activeAlerts = alerts.filter(a => a.status === 'active');

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-map me-2"></i>
          Live Tourist Map
        </h5>
        <div className="d-flex gap-2">
          <span className="badge bg-primary">{tourists.length} Total</span>
          <span className="badge bg-warning">{activeTourists.length} At Risk</span>
          <span className="badge bg-danger">{activeAlerts.length} Alerts</span>
        </div>
      </div>
      
      <div className="card-body p-0" style={{ height: '500px' }}>
        {tourists.length > 0 ? (
          <TouristMap
            tourists={tourists}
            alerts={alerts}
            selectedTourist={selectedTourist}
            onTouristSelect={setSelectedTourist}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center">
              <i className="fas fa-map text-muted mb-3" style={{ fontSize: '3rem' }}></i>
              <h6 className="text-muted">No Tourist Data</h6>
              <p className="text-muted small mb-0">
                Tourist locations will appear here when available
              </p>
            </div>
          </div>
        )}
      </div>
      
      {selectedTourist && (
        <div className="card-footer">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted">Selected:</small>
              <strong className="ms-1">Tourist {selectedTourist.id}</strong>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setSelectedTourist(null)}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPanel;