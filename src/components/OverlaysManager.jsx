import { useMap } from 'react-leaflet';
import L from 'leaflet';
export const OverlaysManager = ({ addOverlay }) => {
  const map = useMap();

  // Expose an imperative add-at-center for Sidebar to use
  // We attach a function on window so Sidebar can trigger it without prop drilling
  window.__solarMapAddOverlayAtCenter__ = (
    rows = 4,
    cols = 5,
    widthMeters,
    heightMeters
  ) => {
    const c = map.getCenter();
    const safeRows = Math.max(1, parseInt(rows, 10) || 4);
    const safeCols = Math.max(1, parseInt(cols, 10) || 5);
    const w =
      widthMeters === '' || widthMeters == null
        ? undefined
        : parseFloat(widthMeters);
    const h =
      heightMeters === '' || heightMeters == null
        ? undefined
        : parseFloat(heightMeters);

    addOverlay([c.lat, c.lng], safeRows, safeCols, w, h);

    // If a small overlay size is specified, auto-zoom so the shape is clearly visible
    try {
      const center = { lat: c.lat, lng: c.lng };
      const meters = Math.max(w || 0, h || 0);
      if (meters > 0) {
        // Compute pixels per meter at current zoom by comparing two points 1m apart east-west
        const lat = center.lat;
        const metersPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);
        const dLngFor1m = 1 / metersPerDegLng; // 1 meter east
        const p0 = map.latLngToContainerPoint(center);
        const p1 = map.latLngToContainerPoint({
          lat: center.lat,
          lng: center.lng + dLngFor1m,
        });
        const pxPerMeter = Math.max(
          0.0001,
          Math.hypot(p1.x - p0.x, p1.y - p0.y)
        );

        const targetPx = 160; // aim for ~160px for the longest side
        const currentPx = meters * pxPerMeter;
        const scale = targetPx / currentPx;
        if (scale > 1.05 || scale < 0.95) {
          const currentZoom = map.getZoom();
          const deltaZoom = Math.log2(Math.max(0.25, Math.min(4, scale)));
          const newZoom = Math.max(16, Math.min(21, currentZoom + deltaZoom));
          map.setZoomAround(center, newZoom);
        }
      }
    } catch (_) { }
  };

  // Expose a general fly-to helper for Sidebar search/latlng controls
  window.__solarMapFlyTo__ = (lat, lng, zoom = 18) => {
    try {
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const target = { lat, lng };
        const z = Math.max(zoom || 0, map.getZoom());
        map.flyTo(target, Math.min(21, z), {
          animate: true,
          duration: 1.2,
        });
        // Optional: drop a transient marker without managing state
        // Avoid stacking too many markers: reuse a single temp marker
        if (!window.__solarTempMarker__) {
          window.__solarTempMarker__ = L.marker(target).addTo(map);
        } else {
          window.__solarTempMarker__.setLatLng(target);
        }
      }
    } catch (_) { }
  };

  return (
    <>{/* Floating controls removed; Sidebar drives overlay creation */}</>
  );
};
