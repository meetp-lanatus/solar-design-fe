import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { OverlayGeo } from "./OverlayGeo";
import { OverlaysManager } from "./OverlaysManager";
import SearchControl from "./SearchControl";
import { MapBehavior } from "./MapBehavior";

export default function SolarMap() {
  // (No longer generating random inner rects; grid panels are computed in OverlayGeo)

  const [overlays, setOverlays] = useState(() => {
    try {
      const raw = localStorage.getItem("geoOverlays");
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

  const addOverlay = (mapCenter, rows = 4, cols = 5) => {
    setOverlays((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        position: mapCenter || [20.5937, 78.9629],
        // random meters so size is stable across zoom levels
        widthMeters: Math.round((8 + Math.random() * 14) * 10) / 10, // 8–22 m
        heightMeters: Math.round((6 + Math.random() * 12) * 10) / 10, // 6–18 m
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
      localStorage.setItem("geoOverlays", JSON.stringify(overlays));
    } catch (_) {}
  }, [overlays]);

  // Map dragging lock moved to MapBehavior

  return (
    <MapContainer
      center={[23.028935055012365, 72.53000103301345]}
      zoom={18}
      maxZoom={21}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        subdomains={["mt0", "mt1", "mt2", "mt3"]}
        attribution='Imagery © <a href="https://maps.google.com/">Google</a>'
        maxZoom={21}
      />

      <SearchControl />

      <OverlaysManager
        overlays={overlays}
        updateOverlay={updateOverlay}
        addOverlay={addOverlay}
        removeOverlay={removeOverlay}
        selected={selected}
        setSelected={setSelected}
      />

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
