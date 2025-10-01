import { MyLocation as LocationIcon, Navigation as NavigationIcon } from '@mui/icons-material';
import { Box, Divider, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import LatLngInput from './LatLngInput';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import SelectedLocation from './SelectedLocation';

export default function Sidebar({ onAddressSelect, selectedAddress }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isPlaceMode, setIsPlaceMode] = useState(true);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');

  const searchCache = useRef(new Map());
  const abortController = useRef(null);

  const searchGoogle = useCallback(
    async (query) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery || trimmedQuery.length < 3) {
        setShowSuggestions(false);
        return;
      }

      if (isSearching) return;

      if (searchCache.current.has(trimmedQuery)) {
        const cached = searchCache.current.get(trimmedQuery);
        setSearchResults(cached.results);
        setShowSuggestions(true);
        return;
      }

      if (abortController.current) {
        abortController.current.abort();
      }

      setIsSearching(true);
      abortController.current = new AbortController();

      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) {
        setShowSuggestions(false);
        setIsSearching(false);
        return;
      }

      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmedQuery)}&key=${apiKey}&region=in`;
        const response = await fetch(url, {
          signal: abortController.current.signal,
        });

        if (!response.ok) {
          setShowSuggestions(false);
          return;
        }

        const data = await response.json();
        const results = Array.isArray(data?.results) ? data.results : [];

        searchCache.current.set(trimmedQuery, {
          results,
          timestamp: Date.now(),
        });

        setSearchResults(results);
        setShowSuggestions(true);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setShowSuggestions(false);
        }
      } finally {
        setIsSearching(false);
        abortController.current = null;
      }
    },
    [isSearching]
  );

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length < 3) {
      setShowSuggestions(false);
      setSearchResults([]);
      return;
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length >= 3) {
      searchGoogle(searchQuery.trim());
    }
  };

  const handleResultSelect = (result) => {
    const location = result.geometry?.location;
    if (location?.lat && location?.lng) {
      setSelectedResult(result);
      setLatInput(String(location.lat));
      setLngInput(String(location.lng));
      setSearchQuery(result.formatted_address);
      setShowSuggestions(false);

      // Call the parent component's address select handler
      if (onAddressSelect) {
        onAddressSelect({
          formatted_address: result.formatted_address,
          lat: location.lat,
          lng: location.lng,
          place_id: result.place_id,
        });
      }

      if (window.__solarMapFlyTo__) {
        window.__solarMapFlyTo__(location.lat, location.lng, 18);
      }

      if (window.__solarMapClearMarkers__) {
        window.__solarMapClearMarkers__();
      }

      if (window.__solarMapAddMarker__) {
        window.__solarMapAddMarker__({
          id: Date.now(),
          lat: location.lat,
          lng: location.lng,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const clearSelection = () => {
    setSelectedResult(null);
    setSearchQuery('');
    setLatInput('');
    setLngInput('');
    setShowSuggestions(false);
  };

  const handleLatLngSubmit = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const customAddress = {
        formatted_address: `Custom Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
        lat,
        lng,
        place_id: `custom_${Date.now()}`,
      };

      // Call the parent component's address select handler
      if (onAddressSelect) {
        onAddressSelect(customAddress);
      }

      if (window.__solarMapFlyTo__) {
        window.__solarMapFlyTo__(lat, lng, 18);
      }

      if (window.__solarMapClearMarkers__) {
        window.__solarMapClearMarkers__();
      }

      if (window.__solarMapAddMarker__) {
        window.__solarMapAddMarker__({
          id: Date.now(),
          lat,
          lng,
          timestamp: new Date().toISOString(),
        });
      }

      setSelectedResult({
        formatted_address: `Custom Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
        geometry: { location: { lat, lng } },
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedAddress) {
      setSelectedResult({
        formatted_address: selectedAddress.formatted_address,
        geometry: {
          location: { lat: selectedAddress.lat, lng: selectedAddress.lng },
        },
      });
      setSearchQuery(selectedAddress.formatted_address || selectedAddress.name || '');
      setLatInput(String(selectedAddress.lat));
      setLngInput(String(selectedAddress.lng));
    } else {
      setSelectedResult(null);
      setSearchQuery('');
      setLatInput('');
      setLngInput('');
    }
  }, [selectedAddress]);

  useEffect(() => {
    const handleMarkerMove = (event) => {
      if (event.detail && event.detail.lat && event.detail.lng) {
        const { lat, lng } = event.detail;
        setLatInput('');
        setLngInput('');

        if (onAddressSelect) {
          onAddressSelect({
            ...selectedAddress,
            lat,
            lng,
            markerMoved: true,
          });
        }
      }
    };

    window.addEventListener('markerMoved', handleMarkerMove);
    return () => window.removeEventListener('markerMoved', handleMarkerMove);
  }, [selectedAddress, onAddressSelect]);

  return (
    <Paper
      elevation={3}
      sx={{
        width: '400px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        p: 2.5,
        gap: 2.5,
      }}
    >
      <Box>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Map Manager
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1.5 }}>
            Choose Input Mode
          </Typography>
          <ToggleButtonGroup
            value={isPlaceMode}
            exclusive
            onChange={(_, newMode) => setIsPlaceMode(newMode)}
            size="small"
            fullWidth
            sx={{
              gap: 2,
              '& .MuiToggleButton-root': {
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                flex: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              },
            }}
          >
            <ToggleButton value={true}>
              <LocationIcon sx={{ mr: 1, fontSize: 18 }} />
              Place
            </ToggleButton>
            <ToggleButton value={false}>
              <NavigationIcon sx={{ mr: 1, fontSize: 18 }} />
              Lat/Lng
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Divider />
        {isPlaceMode ? (
          <Box
            className="search-container"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <SearchInput
              searchQuery={searchQuery}
              onSearchInput={handleSearchInput}
              onSearchSubmit={handleSearchSubmit}
              isSearching={isSearching}
            />
            <SearchResults
              showSuggestions={showSuggestions}
              isSearching={isSearching}
              searchResults={searchResults}
              searchQuery={searchQuery}
              onResultSelect={handleResultSelect}
            />
          </Box>
        ) : (
          <LatLngInput
            latInput={latInput}
            lngInput={lngInput}
            onLatChange={(e) => setLatInput(e.target.value)}
            onLngChange={(e) => setLngInput(e.target.value)}
            onSubmit={handleLatLngSubmit}
          />
        )}

        <SelectedLocation
          selectedResult={selectedResult}
          selectedAddress={selectedAddress}
          latInput={latInput}
          lngInput={lngInput}
          onClear={clearSelection}
        />
      </Box>
    </Paper>
  );
}
