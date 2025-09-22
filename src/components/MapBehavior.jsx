import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";

export const MapBehavior = ({ selected, setSelected }) => {
  const map = useMap();

  useEffect(() => {
    try {
      if (selected != null) map.dragging.disable();
      else map.dragging.enable();
    } catch (_) {}
  }, [selected, map]);

  useMapEvents({
    click(e) {
      const target = e.originalEvent?.target;
      const inInteractive = target?.closest?.(".leaflet-interactive");
      const inControls = target?.closest?.("#overlay-controls");
      if (!inInteractive && !inControls) setSelected(null);
    },
    dblclick(e) {
      const target = e.originalEvent?.target;
      const inInteractive = target?.closest?.(".leaflet-interactive");
      const inControls = target?.closest?.("#overlay-controls");
      if (!inInteractive && !inControls) setSelected(null);
    },
    mousedown(e) {
      const target = e.originalEvent?.target;
      const inInteractive = target?.closest?.(".leaflet-interactive");
      const inControls = target?.closest?.("#overlay-controls");
      if (!inInteractive && !inControls) setSelected(null);
    },
  });

  return null;
};
