import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MapBehavior } from './MapBehavior';
import { OverlayGeo } from './OverlayGeo';
import { OverlaysManager } from './OverlaysManager';

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

  // persist overlays to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('geoOverlays', JSON.stringify(overlays));
    } catch (_) {}
  }, [overlays]);

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
    </MapContainer>
  );
}
