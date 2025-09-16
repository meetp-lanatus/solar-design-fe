import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Polygon,
  Rectangle,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import {
  angle1,
  angle10,
  angle11,
  angle2,
  angle3,
  angle4,
  angle5,
  angle6,
  angle7,
  angle8,
  angle9,
  angleR1,
  angleR2,
  angleR3,
  angleR4,
  angleR5,
} from "./data/data";

export default function SimpleShapeMap() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPanelId, setSelectedPanelId] = useState("");
  const [selectedIsFaulty, setSelectedIsFaulty] = useState(false);
  const [faultyMap, setFaultyMap] = useState(() => {
    try {
      const raw = localStorage.getItem("faultyPanels");
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("faultyPanels", JSON.stringify(faultyMap));
    } catch (e) {
      // ignore
    }
  }, [faultyMap]);
  // Outer site boundary
  const rectangleCoords = [
    [23.275413194363296, 72.68152273002208],
    [23.27537315572941, 72.68296782303916],
    [23.27363201448876, 72.68304733060828],
    [23.273677850912588, 72.68194152991222],
  ];

  const center = [23.274710359358494, 72.68202636777855];

  // Grid generator
  const generateGrid = (
    polygonCoords,
    cols,
    spacingLat = 0.000002,
    spacingLng = 0.000002
  ) => {
    const lats = polygonCoords.map((c) => c[0]);
    const lngs = polygonCoords.map((c) => c[1]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latStep = maxLat - minLat;
    const lngStep = (maxLng - minLng) / cols;

    return Array.from({ length: cols }, (_, c) => {
      const southWest = [
        minLat + spacingLat,
        minLng + c * lngStep + spacingLng,
      ];
      const northEast = [
        minLat + latStep - spacingLat,
        minLng + (c + 1) * lngStep - spacingLng,
      ];
      return {
        id: `C${c + 1}`,
        bounds: [southWest, northEast],
      };
    });
  };

  // Put all angles + column counts in one array
  const gridConfigs = [
    { coords: angle1, cols: 23 },
    { coords: angle2, cols: 23 },
    { coords: angle3, cols: 23 },
    { coords: angle4, cols: 23 },
    { coords: angle5, cols: 23 },
    { coords: angle6, cols: 23 },
    { coords: angle7, cols: 23 },
    { coords: angle8, cols: 23 },
    { coords: angle9, cols: 23 },
    { coords: angle10, cols: 23 },
    { coords: angle11, cols: 15 },
    { coords: angleR1, cols: 23 },
    { coords: angleR2, cols: 23 },
    { coords: angleR3, cols: 23 },
    { coords: angleR4, cols: 23 },
    { coords: angleR5, cols: 23 },
  ];

  // Generate all grids in one go
  const allPanels = useMemo(
    () => gridConfigs.map((g, i) => generateGrid(g.coords, g.cols)),
    []
  );

  const allPanelOptions = useMemo(() => {
    return allPanels.flatMap((grid, gIdx) =>
      grid.map((panel) => {
        const uniqueId = `${gIdx}-${panel.id}`;
        return { value: uniqueId, label: `Grid ${gIdx + 1} - ${panel.id}` };
      })
    );
  }, [allPanels]);

  const openCreateModal = () => {
    setSelectedPanelId(allPanelOptions[0]?.value || "");
    setSelectedIsFaulty(false);
    setIsModalOpen(true);
  };

  const openEditModal = (uniqueId) => {
    setSelectedPanelId(uniqueId);
    setSelectedIsFaulty(Boolean(faultyMap[uniqueId]));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPanelId) return;
    setFaultyMap((prev) => ({ ...prev, [selectedPanelId]: selectedIsFaulty }));
    setIsModalOpen(false);
  };

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <div style={{ position: "absolute", zIndex: 1000, top: 12, right: 12 }}>
        <button
          onClick={openCreateModal}
          style={{
            padding: "8px 12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Add / Edit Panel Status
        </button>
      </div>

      {isModalOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 8,
              minWidth: 320,
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Panel Status</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6 }}>
                  Select Panel
                </label>
                <select
                  value={selectedPanelId}
                  onChange={(e) => setSelectedPanelId(e.target.value)}
                  style={{ width: "100%", padding: 8 }}
                >
                  {allPanelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIsFaulty}
                    onChange={(e) => setSelectedIsFaulty(e.target.checked)}
                  />
                  Mark as faulty
                </label>
              </div>
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: "8px 12px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 12px",
                    background: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={19}
        style={{ height: "100vh", width: "100%" }}
        maxZoom={22}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          attribution="&copy; <a href='https://www.google.com/maps'>Google</a>"
          maxZoom={23}
        />

        {/* Outer Boundary */}
        <Polygon
          positions={rectangleCoords}
          pathOptions={{
            color: "blue",
            fillColor: "green",
            fillOpacity: 0.9,
          }}
        />

        {/* Render all grids */}
        {allPanels.map((grid, gIdx) =>
          grid.map((panel) => {
            const uniqueId = `${gIdx}-${panel.id}`;
            const isFaulty = Boolean(faultyMap[uniqueId]);
            return (
              <Rectangle
                key={`grid-${gIdx}-${panel.id}`}
                bounds={panel.bounds}
                pathOptions={{
                  color: isFaulty ? "#b91c1c" : "black",
                  weight: 0.5,
                  fillColor: isFaulty ? "#ef4444" : "#6d8ff1",
                  fillOpacity: 0.8,
                }}
                eventHandlers={{
                  click: () => openEditModal(uniqueId),
                }}
              >
                <Tooltip>
                  Grid {gIdx + 1} - {panel.id}
                </Tooltip>
              </Rectangle>
            );
          })
        )}
      </MapContainer>
    </div>
  );
}
