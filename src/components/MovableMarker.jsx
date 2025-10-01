import { useMemo, useRef } from 'react';
import { Marker } from 'react-leaflet';

export const MovableMarker = ({ position, onPositionChange }) => {
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

          // Dispatch marker movement event for sidebar
          const markerMoveEvent = new CustomEvent('markerMoved', {
            detail: {
              lat: newPos.lat,
              lng: newPos.lng,
            },
          });
          window.dispatchEvent(markerMoveEvent);

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

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
    />
  );
};
