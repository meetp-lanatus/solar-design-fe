import { useMap } from "react-leaflet";
export const OverlaysManager = ({
  overlays,
  updateOverlay,
  addOverlay,
  removeOverlay,
  selected,
  setSelected,
}) => {
  const map = useMap();

  // "Add overlay at center" button uses map.getCenter()
  const onAdd = () => {
    const c = map.getCenter();
    const rows = parseInt(
      document.getElementById("rows-input")?.value || "4",
      10
    );
    const cols = parseInt(
      document.getElementById("cols-input")?.value || "5",
      10
    );
    addOverlay([c.lat, c.lng], Math.max(1, rows), Math.max(1, cols));
  };

  return (
    <>
      <div
        id="overlay-controls"
        style={{
          position: "absolute",
          top: 10,
          left: 100,
          zIndex: 2000,
          display: "flex",
          gap: 8,
          alignItems: "center",
          background: "rgba(255,255,255,0.9)",
          padding: 8,
          borderRadius: 8,
        }}
      >
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Rows
          <input
            id="rows-input"
            type="number"
            min={1}
            defaultValue={4}
            style={{ width: 64, padding: 4 }}
          />
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          Cols
          <input
            id="cols-input"
            type="number"
            min={1}
            defaultValue={5}
            style={{ width: 64, padding: 4 }}
          />
        </label>
        <button
          onClick={onAdd}
          style={{ padding: "8px 12px", borderRadius: 6 }}
        >
          Add Overlay
        </button>
      </div>
    </>
  );
};
