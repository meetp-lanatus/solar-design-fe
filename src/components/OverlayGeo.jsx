import L from 'leaflet';
import { useMemo, useRef } from 'react';
import { Marker, Polygon, Tooltip, useMap } from 'react-leaflet';

const createHandleIcon = (size = 10, color = '#ef4444') =>
  L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:1px solid #111;border-radius:2px;"></div>`,
    iconAnchor: [size / 2, size / 2],
  });

const createRotateIcon = () =>
  L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;background:orange;border:2px solid white;border-radius:50%"></div>`,
    iconAnchor: [8, 8],
  });

function metersPerDegree(lat) {
  const metersPerDegLat = 111320; // approx
  const metersPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);
  return { metersPerDegLat, metersPerDegLng };
}

function metersToLatLng(center, dxMeters, dyMeters) {
  const { metersPerDegLat, metersPerDegLng } = metersPerDegree(center[0]);
  const dLat = dyMeters / metersPerDegLat; // north is +dy
  const dLng = dxMeters / metersPerDegLng; // east is +dx
  return [center[0] + dLat, center[1] + dLng];
}

function latLngToMeters(center, latlng) {
  const { metersPerDegLat, metersPerDegLng } = metersPerDegree(center[0]);
  const dy = (latlng[0] - center[0]) * metersPerDegLat; // north meters
  const dx = (latlng[1] - center[1]) * metersPerDegLng; // east meters
  return { dx, dy };
}

function rotatePoint(dx, dy, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}

export const OverlayGeo = ({
  overlay,
  updateOverlay,
  removeOverlay,
  setSelected,
  selected,
}) => {
  const {
    id,
    position,
    widthMeters,
    heightMeters,
    rotate,
    panelRows = 4,
    panelCols = 5,
    shape = 'rect',
    sides = 6,
  } = overlay;
  const map = useMap();
  const rotatingRef = useRef(false);
  const startAngleRef = useRef(0);
  const startRotateRef = useRef(0);

  // Compute rectangle corners (clockwise) from center, size (meters) and rotation (deg)
  const corners = useMemo(() => {
    const halfW = widthMeters / 2;
    const halfH = heightMeters / 2;
    const localCorners = [
      { x: -halfW, y: -halfH },
      { x: halfW, y: -halfH },
      { x: halfW, y: halfH },
      { x: -halfW, y: halfH },
    ].map(({ x, y }) => rotatePoint(x, y, rotate));
    return localCorners.map(({ x, y }) => metersToLatLng(position, x, y));
  }, [position, widthMeters, heightMeters, rotate]);

  // Rotation handle placed above the top edge by fixed meters
  const rotateHandleLatLng = useMemo(() => {
    const offset =
      heightMeters / 2 +
      Math.max(2, Math.min(8, Math.max(widthMeters, heightMeters) * 0.15));
    const { x, y } = rotatePoint(0, -offset, rotate);
    return metersToLatLng(position, x, y);
  }, [position, heightMeters, widthMeters, rotate]);

  // Delete handle placed opposite the rotation handle at the same offset
  const deleteHandleLatLng = useMemo(() => {
    // Place slightly outside polygon with a small, consistent margin
    const offset =
      heightMeters / 2 +
      Math.max(1.5, Math.min(6, Math.max(widthMeters, heightMeters) * 0.1));
    const { x, y } = rotatePoint(0, offset, rotate);
    return metersToLatLng(position, x, y);
  }, [position, heightMeters, widthMeters, rotate]);

  if (!map) return null;

  return (
    <>
      <Polygon
        positions={corners}
        pathOptions={{
          color: selected === id ? '#22c55e' : '#111827',
          weight: 2,
          fillOpacity: 0.15,
        }}
        className="leaflet-glow-box"
        eventHandlers={{
          click: (e) => {
            e.originalEvent.stopPropagation();
            setSelected(id);
          },
          mousedown: (e) => {
            e.originalEvent.stopPropagation();
          },
        }}
      >
        <Tooltip>
          <div style={{ minWidth: 160 }}>
            <div>
              <strong>Overlay</strong> #{id}
            </div>
            <div>
              Center: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </div>
            <div>
              Size: {widthMeters.toFixed(2)} m × {heightMeters.toFixed(2)} m
            </div>
            <div>
              Perimeter: {(2 * (widthMeters + heightMeters)).toFixed(2)} m
            </div>
            <div>Area: {(widthMeters * heightMeters).toFixed(2)} m²</div>
          </div>
        </Tooltip>
      </Polygon>

      {/* Center drag handle (only when selected) */}
      {selected === id && (
        <Marker
          position={position}
          draggable
          icon={createHandleIcon(12, '#2563eb')}
          eventHandlers={{
            dragend: (e) => {
              const ll = e.target.getLatLng();
              updateOverlay(id, { position: [ll.lat, ll.lng] });
            },
            click: () => setSelected(id),
            mousedown: (e) => {
              e.originalEvent.stopPropagation();
            },
          }}
        />
      )}

      {/* Corner handles for resize (only when selected) */}
      {selected === id &&
        corners.map((latlng, idx) => (
          <Marker
            key={`corner-${id}-${idx}`}
            position={latlng}
            draggable
            icon={createHandleIcon(10, '#FFFFFF')}
            eventHandlers={{
              dragend: (e) => {
                const ll = e.target.getLatLng();
                const { dx, dy } = latLngToMeters(position, [ll.lat, ll.lng]);
                // convert dragged meters to local coords by un-rotating
                const unrot = rotatePoint(dx, dy, -rotate);
                const newHalfW = Math.max(1, Math.abs(unrot.x));
                const newHalfH = Math.max(1, Math.abs(unrot.y));
                updateOverlay(id, {
                  widthMeters: newHalfW * 2,
                  heightMeters: newHalfH * 2,
                });
              },
              click: () => setSelected(id),
              mousedown: (e) => {
                e.originalEvent.stopPropagation();
              },
            }}
          />
        ))}

      {/* Rotation handle */}
      {selected === id && (
        <Marker
          position={rotateHandleLatLng}
          draggable={false}
          icon={createRotateIcon()}
          eventHandlers={{
            mousedown: (e) => {
              const mapEl = map.getContainer();
              const rect = mapEl.getBoundingClientRect();
              const centerPt = map.latLngToContainerPoint(position);
              const centerX = rect.left + centerPt.x;
              const centerY = rect.top + centerPt.y;
              startAngleRef.current = Math.atan2(
                e.originalEvent.clientY - centerY,
                e.originalEvent.clientX - centerX
              );
              startRotateRef.current = rotate;
              rotatingRef.current = true;

              const moveHandler = (moveEvent) => {
                if (!rotatingRef.current) return;
                const angleRad = Math.atan2(
                  moveEvent.clientY - centerY,
                  moveEvent.clientX - centerX
                );
                const delta =
                  (angleRad - startAngleRef.current) * (180 / Math.PI);
                // Invert delta so clockwise mouse movement rotates clockwise visually
                let next = startRotateRef.current - delta;
                // normalize
                next = ((next % 360) + 360) % 360;
                updateOverlay(id, { rotate: next });
              };

              const upHandler = () => {
                rotatingRef.current = false;
                window.removeEventListener('mousemove', moveHandler);
                window.removeEventListener('mouseup', upHandler);
              };

              window.addEventListener('mousemove', moveHandler);
              window.addEventListener('mouseup', upHandler);
            },
            click: () => setSelected(id),
          }}
        />
      )}

      {/* Delete button */}
      {selected === id && (
        <Marker
          position={deleteHandleLatLng}
          icon={L.divIcon({
            className: '',
            html: `<button
              style="
                padding:6px 12px;
                background:rgba(243,244,246,0.95);
                color:#111827;
                border:1px solid #d1d5db;
                border-radius:9999px;
                box-shadow:0 1px 2px rgba(0,0,0,0.12);
                cursor:pointer;
                backdrop-filter:saturate(180%) blur(2px);
              "
              onmouseenter="this.style.background='rgba(229,231,235,0.98)';"
              onmouseleave="this.style.background='rgba(243,244,246,0.95)';"
            >Delete</button>`,
            iconAnchor: [0, 0],
          })}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.stopPropagation();
              removeOverlay(id);
            },
          }}
        />
      )}

      {/* Grid of inner rectangles (panels) - only for rectangular shape */}
      {shape !== 'polygon' &&
        (() => {
          const cellW = widthMeters / panelCols;
          const cellH = heightMeters / panelRows;
          const padX = Math.min(cellW * 0.1, 0.1);
          const padY = Math.min(cellH * 0.1, 0.1);
          const rects = [];
          for (let r = 0; r < panelRows; r++) {
            for (let c = 0; c < panelCols; c++) {
              const cxLocal = -widthMeters / 2 + cellW * (c + 0.5);
              const cyLocal = -heightMeters / 2 + cellH * (r + 0.5);
              const halfW = (cellW - padX * 2) / 2;
              const halfH = (cellH - padY * 2) / 2;
              const cornersLocal = [
                { x: -halfW, y: -halfH },
                { x: halfW, y: -halfH },
                { x: halfW, y: halfH },
                { x: -halfW, y: halfH },
              ].map(({ x, y }) =>
                rotatePoint(cxLocal + x, cyLocal + y, rotate)
              );
              const cornersLatLng = cornersLocal.map(({ x, y }) =>
                metersToLatLng(position, x, y)
              );
              rects.push(
                <Polygon
                  key={`panel-${id}-${r}-${c}`}
                  positions={cornersLatLng}
                  pathOptions={{
                    color: '#ffffff ',
                    weight: 1,
                    fillColor: '#4677C7',
                    fillOpacity: 1,
                  }}
                  eventHandlers={{
                    click: (e) => {
                      e.originalEvent.stopPropagation();
                      setSelected(id);
                    },
                  }}
                />
              );
            }
          }
          return rects;
        })()}
    </>
  );
};
