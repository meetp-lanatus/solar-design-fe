import L from 'leaflet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Marker } from 'react-leaflet';

const customIcon = (markerNumber) =>
  L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="#ff4444" viewBox="0 0 24 24" 
          stroke="white" stroke-width="2" width="32" height="32">
          <path stroke-linecap="round" stroke-linejoin="round" 
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" 
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32], // bottom tip points to location
  });

export default function MovableMarker({ position, onPositionChange, onRemove, markerNumber }) {
  const [draggable, setDraggable] = useState(true);
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          if (onPositionChange) {
            onPositionChange({
              lat: newPos.lat,
              lng: newPos.lng,
            });
          }
          // Sync sidebar after position change
          setTimeout(() => {
            if (window.syncMarkersFromMap) {
              window.syncMarkersFromMap();
            }
          }, 100);
        }
      },
    }),
    [onPositionChange]
  );

  const toggleDraggable = useCallback(() => {
    setDraggable((d) => !d);
  }, []);

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove();
    }
    // Sync sidebar after removal
    setTimeout(() => {
      if (window.syncMarkersFromMap) {
        window.syncMarkersFromMap();
      }
    }, 100);
  }, [onRemove]);

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
      icon={customIcon(markerNumber)}
    >
      {/* <Popup minWidth={120}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Marker #{markerNumber}</div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
            Lat: {position.lat.toFixed(6)}
            <br />
            Lng: {position.lng.toFixed(6)}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
            <button
              onClick={toggleDraggable}
              style={{
                padding: '4px 8px',
                background: draggable ? '#ff4444' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              {draggable ? '🔒 Lock Position' : '🔓 Make Draggable'}
            </button>
            <button
              onClick={handleRemove}
              style={{
                padding: '4px 8px',
                background: '#ff6666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              🗑️ Remove Marker
            </button>
          </div>
        </div>
      </Popup> */}
    </Marker>
  );
}
