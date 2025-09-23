// SearchControl.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

export default function SearchControl() {
  const map = useMap();
  const latRef = useRef();
  const lngRef = useRef();

  useEffect(() => {
    if (!map) return;

    // ✅ Add geocoder search box
    const geocoder = L.Control.geocoder({
      geocoder: L.Control.Geocoder.photon(),
      defaultMarkGeocode: false,
      placeholder: 'Search by place, address, or pincode…',
      collapsed: false,
    })
      .on('markgeocode', function (e) {
        const latlng = e.geocode.center;
        map.flyTo(latlng, 18);
        L.marker(latlng).addTo(map);
      })
      .addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map]);

  // ✅ Move map when entering Lat/Lng manually
  const handleLatLngSearch = () => {
    const lat = parseFloat(latRef.current.value);
    const lng = parseFloat(lngRef.current.value);

    if (!isNaN(lat) && !isNaN(lng)) {
      const latlng = L.latLng(lat, lng);
      map.flyTo(latlng, Math.max(map.getZoom(), 18), {
        animate: true,
        duration: 1.4,
        easeLinearity: 0.25,
      });
      L.marker(latlng).addTo(map);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'white',
        padding: '6px',
        borderRadius: '6px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        display: 'flex',
        gap: '6px',
      }}
    >
      <input
        ref={latRef}
        type="number"
        step="0.0001"
        placeholder="Latitude"
        style={{ padding: '4px' }}
      />
      <input
        ref={lngRef}
        type="number"
        step="0.0001"
        placeholder="Longitude"
        style={{ padding: '4px' }}
      />
      <button onClick={handleLatLngSearch} style={{ padding: '4px 8px' }}>
        Go
      </button>
    </div>
  );
}
