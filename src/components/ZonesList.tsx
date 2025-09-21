import React, { useState } from 'react';
import type { GeofenceZone } from '../types';

interface ZonesListProps {
  zones: GeofenceZone[];
  selectedZone: GeofenceZone | null;
  onSelectZone: (zone: GeofenceZone | null) => void;
  onUpdateZone: (zoneId: string, updates: Partial<GeofenceZone>) => void;
  onDeleteZone: (zoneId: string) => void;
  canModify: boolean;
}

const ZonesList: React.FC<ZonesListProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  onUpdateZone,
  onDeleteZone,
  canModify
}) => {
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const getZoneColor = (zoneType: string) => {
    const colors = {
      'safe': 'success',
      'warning': 'warning',
      'restricted': 'orange',
      'danger': 'danger',
      'military_restricted': 'purple'
    };
    return colors[zoneType as keyof typeof colors] || 'secondary';
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

  const handleEditStart = (zone: GeofenceZone) => {
    setEditingZone(zone.id);
    setEditForm({ name: zone.name, description: zone.description || '' });
  };

  const handleEditSave = () => {
    if (editingZone) {
      onUpdateZone(editingZone, editForm);
      setEditingZone(null);
    }
  };

  const handleEditCancel = () => {
    setEditingZone(null);
    setEditForm({ name: '', description: '' });
  };

  const toggleZoneActive = (zone: GeofenceZone) => {
    onUpdateZone(zone.id, { is_active: !zone.is_active });
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-list me-2"></i>
          Geofence Zones ({zones.length})
        </h5>
      </div>
      
      <div className="card-body p-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {zones.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-map text-muted mb-2" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted mb-0">No geofence zones created yet</p>
            {canModify && (
              <small className="text-muted">Use the map to draw new zones</small>
            )}
          </div>
        ) : (
          zones.map((zone, index) => (
            <div
              key={zone.id}
              className={`p-3 border-bottom cursor-pointer ${selectedZone?.id === zone.id ? 'bg-light-subtle border-primary' : ''} ${!zone.is_active ? 'opacity-75' : ''}`}
              onClick={() => onSelectZone(selectedZone?.id === zone.id ? null : zone)}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  {editingZone === zone.id ? (
                    <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        className="form-control form-control-sm mb-2"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Zone name"
                      />
                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows={2}
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Zone description"
                      />
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={handleEditSave}
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleEditCancel}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex align-items-center mb-1">
                        <i className={`${getZoneIcon(zone.zone_type)} text-${getZoneColor(zone.zone_type)} me-2`}></i>
                        <h6 className="mb-0">{zone.name}</h6>
                        {!zone.is_active && (
                          <span className="badge bg-secondary ms-2">Inactive</span>
                        )}
                      </div>
                      <span className={`badge bg-${getZoneColor(zone.zone_type)} mb-2`}>
                        {zone.zone_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {zone.description && (
                        <p className="text-muted small mb-2">{zone.description}</p>
                      )}
                      <div className="text-muted small">
                        <div>Created: {new Date(zone.created_at).toLocaleDateString()}</div>
                        <div>By: {zone.created_by}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {canModify && editingZone !== zone.id && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <div className="btn-group btn-group-sm w-100" role="group">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleEditStart(zone)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className={`btn btn-outline-${zone.is_active ? 'warning' : 'success'}`}
                      onClick={() => toggleZoneActive(zone)}
                    >
                      <i className={`fas ${zone.is_active ? 'fa-pause' : 'fa-play'}`}></i>
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => onDeleteZone(zone.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ZonesList;