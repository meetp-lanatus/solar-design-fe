import { useCallback, useEffect, useRef, useState } from 'react';

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isPlaceMode, setIsPlaceMode] = useState(true);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchCache = useRef(new Map());
  const abortController = useRef(null);
  const debounceTimer = useRef(null);

  const searchGoogle = useCallback(
    async (query, immediate = false) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery || trimmedQuery.length < 3) {
        setShowSuggestions(false);
        return;
      }

      if (isSearching && query === trimmedQuery) return;

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
        const response = await fetch(url, { signal: abortController.current.signal });

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
        setActiveIndex(-1);
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

  const debouncedSearch = useCallback(
    (query) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        const trimmed = query.trim();
        if (trimmed.length >= 3) {
          searchGoogle(trimmed, false);
        }
      }, 1000);
    },
    [searchGoogle]
  );

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length < 3) {
      setShowSuggestions(false);
      return;
    }

    debouncedSearch(value);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length >= 3) {
      searchGoogle(searchQuery.trim(), true);
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

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < searchResults.length) {
        handleResultSelect(searchResults[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleLatLngSubmit = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
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

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(
      regex,
      '<mark class="bg-yellow-200 text-slate-900 px-1 rounded-sm font-medium">$1</mark>'
    );
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
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <aside className="w-full h-screen border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-lg backdrop-blur-sm p-6 flex flex-col gap-8">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Map Manager</h2>
        <p className="text-sm text-slate-600">Search places and manage locations</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Choose Input Mode
          </label>
          <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden shadow-sm">
            <button
              onClick={() => setIsPlaceMode(true)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                isPlaceMode ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Place
            </button>
            <button
              onClick={() => setIsPlaceMode(false)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                !isPlaceMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Lat/Lng
            </button>
          </div>
        </div>

        {isPlaceMode ? (
          <div className="search-container space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Search by place name or address
            </label>
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={handleSearchInput}
                onKeyDown={handleKeyDown}
                placeholder="Search for places..."
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                type="search"
              />
              <button
                onClick={handleSearchSubmit}
                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
              >
                Go
              </button>
            </div>

            {showSuggestions && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-white shadow-lg max-h-56 overflow-auto">
                {isSearching ? (
                  <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    Loading…
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500 text-center">
                    No results found
                  </div>
                ) : (
                  searchResults.slice(0, 7).map((result, index) => {
                    const location = result.geometry?.location;
                    if (!location?.lat || !location?.lng) return null;

                    return (
                      <button
                        key={index}
                        onClick={() => handleResultSelect(result)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 focus:outline-none focus:bg-slate-50 transition-colors duration-200 ${
                          activeIndex === index ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="text-sm font-medium text-slate-800">
                          <span
                            dangerouslySetInnerHTML={{
                              __html: highlightMatch(result.formatted_address, searchQuery),
                            }}
                          />
                        </div>
                        {result.types && result.types.length > 0 && (
                          <div className="text-xs text-slate-500">{result.types.join(', ')}</div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Enter latitude and longitude
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                type="number"
                step="0.0001"
                placeholder="Latitude"
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              />
              <input
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                type="number"
                step="0.0001"
                placeholder="Longitude"
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              />
            </div>
            <button
              onClick={handleLatLngSubmit}
              className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
            >
              Fly To
            </button>
          </div>
        )}

        {selectedResult && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Current Location</h3>
            <div className="text-sm text-blue-700 mb-2">{selectedResult.formatted_address}</div>
            <div className="text-xs text-blue-600">
              <div>Latitude: {latInput}</div>
              <div>Longitude: {lngInput}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
