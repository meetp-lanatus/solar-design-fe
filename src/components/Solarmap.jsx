import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import MovableMarker from './MovableMarker';
import { OverlaysManager } from './OverlaysManager';

export default function SolarMap({ selectedAddress }) {
  const [userLocation, setUserLocation] = useState(null);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const [markers, setMarkers] = useState(() => {
    try {
      const raw = localStorage.getItem('solar_demo_markers');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [];
  });

  const addMarker = (marker) => {
    setMarkers((prev) => {
      // Check if marker with same ID already exists
      const exists = prev.some((m) => m.id === marker.id);
      if (exists) {
        return prev; // Don't add duplicate
      }
      return [...prev, marker];
    });
  };

  const updateMarker = (id, newPosition) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === id
          ? { ...marker, ...newPosition, timestamp: new Date().toISOString() }
          : marker
      )
    );
  };

  const removeMarker = (id) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== id));
  };

  const clearMarkers = () => {
    setMarkers([]);
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // persist markers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('solar_demo_markers', JSON.stringify(markers));
    } catch (_) {}
  }, [markers]);

  // Expose functions to global scope for sidebar integration
  useEffect(() => {
    window.__solarMapAddMarker__ = addMarker;
    window.__solarMapRemoveMarker__ = removeMarker;
    window.__solarMapClearMarkers__ = clearMarkers;
    window.__solarMapGetMarkers__ = () => markers;

    return () => {
      delete window.__solarMapAddMarker__;
      delete window.__solarMapRemoveMarker__;
      delete window.__solarMapClearMarkers__;
      delete window.__solarMapGetMarkers__;
    };
  }, [markers]);

  const getMapCenter = () => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }
    if (selectedAddress && selectedAddress.lat && selectedAddress.lng) {
      return [selectedAddress.lat, selectedAddress.lng];
    }
    return [23.028935055012365, 72.53000103301345];
  };

  return (
    <MapContainer
      center={getMapCenter()}
      zoom={18}
      maxZoom={21}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        attribution='Imagery © <a href="https://maps.google.com/">Google</a>'
        maxZoom={21}
      />

      <OverlaysManager />

      {/* Draggable Markers */}
      {markers.map((marker, index) => (
        <MovableMarker
          key={`marker-${marker.id}-${index}`}
          position={marker}
          onPositionChange={(newPosition) =>
            updateMarker(marker.id, newPosition)
          }
        />
      ))}
    </MapContainer>
  );
}
