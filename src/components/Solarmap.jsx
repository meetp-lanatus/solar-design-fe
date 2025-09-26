import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MapBehavior } from './MapBehavior';
import { OverlayGeo } from './OverlayGeo';
import { OverlaysManager } from './OverlaysManager';
import MovableMarker from './MovableMarker';

export default function SolarMap() {
  // (No longer generating random inner rects; grid panels are computed in OverlayGeo)

  const [overlays, setOverlays] = useState(() => {
    try {
      const raw = localStorage.getItem('geoOverlays');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [];
  });
  const [selected, setSelected] = useState(null);
  const [markers, setMarkers] = useState(() => {
    try {
      const raw = localStorage.getItem('solar_demo_markers');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [];
  });

  const updateOverlay = (id, changes) => {
    setOverlays((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...changes } : o))
    );
  };

  const addOverlay = (
    mapCenter,
    rows = 4,
    cols = 5,
    widthMetersArg,
    heightMetersArg
  ) => {
    setOverlays((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        position: mapCenter || [20.5937, 78.9629],
        // Interpret inputs as per-panel meters; total overlay = panel * count
        widthMeters: (() => {
          const panelW = parseFloat(widthMetersArg);
          if (!isNaN(panelW) && panelW > 0) return panelW * (cols || 1);
          return Math.round((8 + Math.random() * 14) * 10) / 10; // fallback 8–22 m
        })(),
        heightMeters: (() => {
          const panelH = parseFloat(heightMetersArg);
          if (!isNaN(panelH) && panelH > 0) return panelH * (rows || 1);
          return Math.round((6 + Math.random() * 12) * 10) / 10; // fallback 6–18 m
        })(),
        rotate: 0,
        panelRows: rows,
        panelCols: cols,
      },
    ]);
  };

  const removeOverlay = (id) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    setSelected((s) => (s === id ? null : s));
  };

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

  const flyToMarker = (id) => {
    const marker = markers.find((m) => m.id === id);
    if (marker && window.__solarMapFlyTo__) {
      window.__solarMapFlyTo__(marker.lat, marker.lng, 18);
    }
  };

  // persist overlays to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('geoOverlays', JSON.stringify(overlays));
    } catch (_) {}
  }, [overlays]);

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
    window.__solarMapFlyToMarker__ = flyToMarker;
    window.__solarMapGetMarkers__ = () => markers;

    // Clean up any duplicate markers on initialization
    const cleanupDuplicates = () => {
      const uniqueMarkers = markers.reduce((acc, marker) => {
        const exists = acc.some((m) => m.id === marker.id);
        if (!exists) {
          acc.push(marker);
        }
        return acc;
      }, []);

      if (uniqueMarkers.length !== markers.length) {
        setMarkers(uniqueMarkers);
      }
    };

    // Run cleanup after a short delay to ensure all components are loaded
    setTimeout(cleanupDuplicates, 1000);

    return () => {
      delete window.__solarMapAddMarker__;
      delete window.__solarMapRemoveMarker__;
      delete window.__solarMapClearMarkers__;
      delete window.__solarMapFlyToMarker__;
      delete window.__solarMapGetMarkers__;
    };
  }, [markers]);

  // Map dragging lock moved to MapBehavior

  return (
    <MapContainer
      center={[23.028935055012365, 72.53000103301345]}
      zoom={18}
      maxZoom={21}
      className="h-screen w-full"
    >
      <TileLayer
        url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        attribution='Imagery © <a href="https://maps.google.com/">Google</a>'
        maxZoom={21}
      />

      <OverlaysManager addOverlay={addOverlay} />

      <MapBehavior selected={selected} setSelected={setSelected} />

      {/* Leaflet-native geometry/handles that persist by lat/lng and meters */}
      {overlays.map((ov) => (
        <OverlayGeo
          key={`geo-${ov.id}`}
          overlay={ov}
          updateOverlay={updateOverlay}
          removeOverlay={removeOverlay}
          selected={selected}
          setSelected={setSelected}
        />
      ))}

      {/* Draggable Markers */}
      {markers.map((marker, index) => (
        <MovableMarker
          key={marker.id}
          position={marker}
          onPositionChange={(newPosition) =>
            updateMarker(marker.id, newPosition)
          }
          onRemove={() => removeMarker(marker.id)}
          markerNumber={index + 1}
        />
      ))}
    </MapContainer>
  );
}
