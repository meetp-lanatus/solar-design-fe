export default function Sidebar() {
  // Wire up Photon search and lat/lng controls imperatively after first render
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      try {
        // Marker management
        const STORAGE_KEY = 'solar_demo_markers';
        let markers = [];

        const saveMarkersToStorage = (markersToSave) => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(markersToSave));
          } catch (error) {
            console.error('Failed to save markers to localStorage:', error);
          }
        };

        const loadMarkersFromStorage = () => {
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
          } catch (error) {
            console.error('Failed to load markers from localStorage:', error);
            return [];
          }
        };

        const addMarker = (lat, lng) => {
          const newMarker = {
            id: Date.now(),
            lat,
            lng,
            timestamp: new Date().toISOString(),
          };

          // Only add to map, let map handle storage and sidebar sync
          if (window.__solarMapAddMarker__) {
            window.__solarMapAddMarker__(newMarker);
          }

          // Update local markers array for display
          markers.push(newMarker);
          updateMarkerDisplay();
        };

        const removeMarker = (id) => {
          // Only remove from map, let map handle storage
          if (window.__solarMapRemoveMarker__) {
            window.__solarMapRemoveMarker__(id);
          }

          // Update local array for display
          markers = markers.filter((marker) => marker.id !== id);
          updateMarkerDisplay();
        };

        const clearAllMarkers = () => {
          // Only clear from map, let map handle storage
          if (window.__solarMapClearMarkers__) {
            window.__solarMapClearMarkers__();
          }

          // Update local array for display
          markers = [];
          updateMarkerDisplay();
        };

        const updateMarkerDisplay = () => {
          const markerCount = document.getElementById('marker-count');
          const markerList = document.getElementById('marker-list');
          if (markerCount) {
            markerCount.textContent = markers.length;
          }
          if (markerList) {
            markerList.innerHTML = '';
            markers.forEach((marker, index) => {
              const item = document.createElement('div');
              item.className =
                'flex items-center justify-between p-2 bg-gray-50 rounded mb-1';
              item.innerHTML = `
                <div class="text-sm">
                  <div class="font-medium">Marker #${index + 1}</div>
                  <div class="text-xs text-gray-500">${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}</div>
                </div>
                <div class="flex gap-1">
                  <button onclick="window.__solarMapFlyToMarker__ && window.__solarMapFlyToMarker__(${marker.id})" 
                          class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">Go</button>
                  <button onclick="removeMarkerById(${marker.id})" 
                          class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">×</button>
                </div>
              `;
              markerList.appendChild(item);
            });
          }
        };

        // Make functions globally available
        window.removeMarkerById = removeMarker;
        window.addMarkerFromSearch = addMarker;
        window.clearAllMarkers = clearAllMarkers;
        window.updateMarkerDisplay = updateMarkerDisplay;
        window.syncMarkersFromMap = () => {
          // Sync markers from map state
          if (window.__solarMapGetMarkers__) {
            const mapMarkers = window.__solarMapGetMarkers__();
            markers = mapMarkers;
            saveMarkersToStorage(markers);
            updateMarkerDisplay();
          }
        };

        window.resetMarkers = () => {
          // Clear localStorage and reset everything
          try {
            localStorage.removeItem(STORAGE_KEY);
            markers = [];
            if (window.__solarMapClearMarkers__) {
              window.__solarMapClearMarkers__();
            }
            updateMarkerDisplay();
          } catch (error) {
            console.error('Failed to reset markers:', error);
          }
        };

        // Don't load markers here - let the map handle it
        // Just sync with map state after a short delay
        setTimeout(() => {
          if (window.__solarMapGetMarkers__) {
            markers = window.__solarMapGetMarkers__();
            updateMarkerDisplay();
          }
        }, 500);

        // Periodic sync to ensure sidebar stays in sync with map
        const syncInterval = setInterval(() => {
          if (window.__solarMapGetMarkers__) {
            const mapMarkers = window.__solarMapGetMarkers__();
            if (mapMarkers.length !== markers.length ||
              JSON.stringify(mapMarkers) !== JSON.stringify(markers)) {
              markers = mapMarkers;
              updateMarkerDisplay();
            }
          }
        }, 2000);

        // Cleanup interval on unmount
        window.addEventListener('beforeunload', () => {
          clearInterval(syncInterval);
        });
        const input = document.getElementById('sidebar-search');
        const goBtn = document.getElementById('sidebar-search-go');
        const suggestBox = document.getElementById('sidebar-suggestions');
        const latInput = document.getElementById('sidebar-lat');
        const lngInput = document.getElementById('sidebar-lng');
        const flyBtn = document.getElementById('sidebar-latlng-go');
        const modePlace = document.getElementById('mode-place');
        const modeLatLng = document.getElementById('mode-latlng');
        const modePlaceWrap = document.getElementById('sidebar-mode-place');
        const modeLatLngWrap = document.getElementById('sidebar-mode-latlng');

        const showSuggest = () => {
          suggestBox.classList.remove('hidden');
        };
        const hideSuggest = () => {
          suggestBox.classList.add('hidden');
          suggestBox.innerHTML = '';
        };

        let currentAbort = null;
        let lastQuery = '';
        let activeIndex = -1;
        let currentItems = [];
        let searchCache = new Map();
        let debounceTimer = null;
        let isSearching = false;
        let pendingQuery = '';

        function clearActive() {
          const nodes = suggestBox.querySelectorAll('[data-suggest-item]');
          nodes.forEach((n) => n.classList.remove('bg-blue-50'));
        }

        function setActive(index) {
          const nodes = suggestBox.querySelectorAll('[data-suggest-item]');
          clearActive();
          if (index >= 0 && index < nodes.length) {
            nodes[index].classList.add('bg-blue-50');
            nodes[index].scrollIntoView({ block: 'nearest' });
            activeIndex = index;
          } else {
            activeIndex = -1;
          }
        }

        function highlightMatch(text, query) {
          if (!text) return document.createTextNode('');
          const frag = document.createDocumentFragment();
          const q = (query || '').trim();
          if (!q) {
            frag.appendChild(document.createTextNode(text));
            return frag;
          }
          try {
            const re = new RegExp(
              q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              'ig'
            );
            let lastIdx = 0;
            for (const m of text.matchAll(re)) {
              const start = m.index;
              const end = start + m[0].length;
              if (start > lastIdx)
                frag.appendChild(
                  document.createTextNode(text.slice(lastIdx, start))
                );
              const mark = document.createElement('mark');
              mark.className = 'bg-yellow-200 text-gray-900 px-0.5 rounded';
              mark.textContent = text.slice(start, end);
              frag.appendChild(mark);
              lastIdx = end;
            }
            if (lastIdx < text.length)
              frag.appendChild(document.createTextNode(text.slice(lastIdx)));
            return frag;
          } catch {
            frag.appendChild(document.createTextNode(text));
            return frag;
          }
        }

        async function searchGoogle(q, immediate = false) {
          const query = (q || '').trim();

          // Enhanced validation
          if (!query || query.length < 3) {
            hideSuggest();
            return;
          }

          // Prevent duplicate requests
          if (isSearching && query === pendingQuery) {
            return;
          }

          // Check cache first
          if (searchCache.has(query)) {
            const cachedResults = searchCache.get(query);
            displayResults(cachedResults, query);
            return;
          }

          // Prevent same query requests
          if (!immediate && query === lastQuery) {
            return;
          }

          // Cancel previous request
          if (currentAbort) {
            try {
              currentAbort.abort();
            } catch (_) { }
          }

          // Set search state
          isSearching = true;
          pendingQuery = query;
          currentAbort = new AbortController();

          const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
          if (!apiKey) {
            hideSuggest();
            isSearching = false;
            return;
          }

          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&region=in`;
          suggestBox.innerHTML = '';
          const loading = document.createElement('div');
          loading.className = 'px-3 py-2 text-sm text-gray-500';
          loading.textContent = 'Loading…';
          suggestBox.appendChild(loading);
          showSuggest();

          let data = null;
          try {
            const res = await fetch(url, { signal: currentAbort.signal });
            if (!res.ok) {
              hideSuggest();
              return;
            }
            data = await res.json();
          } catch (err) {
            if (err?.name !== 'AbortError') hideSuggest();
            return;
          } finally {
            currentAbort = null;
            isSearching = false;
            pendingQuery = '';
          }

          const results = Array.isArray(data?.results) ? data.results : [];

          // Enhanced caching with TTL
          searchCache.set(query, {
            results,
            timestamp: Date.now(),
          });

          // Clean old cache entries (older than 1 hour)
          const oneHour = 60 * 60 * 1000;
          for (const [key, value] of searchCache.entries()) {
            if (Date.now() - value.timestamp > oneHour) {
              searchCache.delete(key);
            }
          }

          // Limit cache size
          if (searchCache.size > 20) {
            const firstKey = searchCache.keys().next().value;
            searchCache.delete(firstKey);
          }

          displayResults(results, query);
        }

        function displayResults(results, query) {
          // Handle cached results
          if (results && results.results) {
            results = results.results;
          }

          if (results.length === 0) {
            suggestBox.innerHTML = '';
            const empty = document.createElement('div');
            empty.className = 'px-3 py-2 text-sm text-gray-500';
            empty.textContent = 'No results';
            suggestBox.appendChild(empty);
            showSuggest();
            lastQuery = query;
            currentItems = [];
            activeIndex = -1;
            return;
          }

          suggestBox.innerHTML = '';
          currentItems = [];
          for (const result of results.slice(0, 7)) {
            const location = result.geometry?.location;
            if (!location?.lat || !location?.lng) continue;

            const lat = location.lat;
            const lng = location.lng;
            const item = document.createElement('button');
            item.type = 'button';
            item.setAttribute('data-suggest-item', '');
            item.className =
              'w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 focus:outline-none';

            const top = document.createElement('div');
            top.className = 'text-sm font-medium text-gray-900';
            top.appendChild(highlightMatch(result.formatted_address, query));

            const bottom = document.createElement('div');
            bottom.className = 'text-xs text-gray-500';
            bottom.textContent = result.types?.join(', ') || '';

            item.appendChild(top);
            if (bottom.textContent) item.appendChild(bottom);

            item.onclick = () => {
              latInput.value = String(lat);
              lngInput.value = String(lng);
              if (window.__solarMapFlyTo__)
                window.__solarMapFlyTo__(lat, lng, 18);
              addMarker(lat, lng);
              hideSuggest();
            };
            suggestBox.appendChild(item);
            currentItems.push({ element: item, lat, lng });
          }
          showSuggest();
          lastQuery = query;
          activeIndex = -1;
        }

        const debounced = (() => {
          return (q) => {
            if (debounceTimer) {
              clearTimeout(debounceTimer);
            }
            // Increased debounce time to reduce API calls
            debounceTimer = setTimeout(() => {
              // Only search if query is different and meaningful
              const trimmed = (q || '').trim();
              if (trimmed.length >= 3 && trimmed !== lastQuery) {
                searchGoogle(trimmed, false);
              }
            }, 1000);
          };
        })();

        input?.addEventListener('input', (e) => {
          const value = e.target.value;
          // Don't search for very short queries
          if (value.length < 3) {
            hideSuggest();
            return;
          }
          debounced(value);
        });

        goBtn?.addEventListener('click', () => {
          const query = input?.value || '';
          if (query.trim().length >= 3) {
            searchGoogle(query.trim(), true);
          }
        });
        input?.addEventListener('keydown', (e) => {
          const nodes = suggestBox.querySelectorAll('[data-suggest-item]');
          if (e.key === 'ArrowDown') {
            if (nodes.length === 0) return;
            e.preventDefault();
            setActive((activeIndex + 1) % nodes.length);
          } else if (e.key === 'ArrowUp') {
            if (nodes.length === 0) return;
            e.preventDefault();
            setActive((activeIndex - 1 + nodes.length) % nodes.length);
          } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && activeIndex < currentItems.length) {
              e.preventDefault();
              currentItems[activeIndex].element.click();
            }
          } else if (e.key === 'Escape') {
            hideSuggest();
          }
        });
        document.addEventListener('click', (e) => {
          const within = e.target === input || suggestBox.contains(e.target);
          if (!within) hideSuggest();
        });

        function setMode(placeMode) {
          if (placeMode) {
            modePlace.className = 'px-3 py-1.5 text-sm bg-blue-600 text-white';
            modeLatLng.className = 'px-3 py-1.5 text-sm bg-white text-gray-700';
            modePlaceWrap.classList.remove('hidden');
            modeLatLngWrap.classList.add('hidden');
            // focus search box on switch
            setTimeout(() => input?.focus(), 0);
          } else {
            modePlace.className = 'px-3 py-1.5 text-sm bg-white text-gray-700';
            modeLatLng.className = 'px-3 py-1.5 text-sm bg-blue-600 text-white';
            modePlaceWrap.classList.add('hidden');
            modeLatLngWrap.classList.remove('hidden');
            hideSuggest();
            setTimeout(() => latInput?.focus(), 0);
          }
        }
        modePlace?.addEventListener('click', () => setMode(true));
        modeLatLng?.addEventListener('click', () => setMode(false));

        flyBtn?.addEventListener('click', () => {
          const lat = parseFloat(latInput?.value);
          const lng = parseFloat(lngInput?.value);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            if (window.__solarMapFlyTo__)
              window.__solarMapFlyTo__(lat, lng, 18);
            addMarker(lat, lng);
          }
        });
      } catch (_) { }
    }, 0);
  }

  return (
    <aside className="w-72 h-screen border-r bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Map Manager</h2>
        <p className="text-sm text-gray-600">Draw shapes and manage overlays</p>
      </div>

      {/* Search Controls */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Choose Input Mode</label>
        <div className="inline-flex rounded-md border overflow-hidden">
          <button
            id="mode-place"
            className="px-3 py-1.5 text-sm bg-blue-600 text-white"
          >
            Place
          </button>
          <button
            id="mode-latlng"
            className="px-3 py-1.5 text-sm bg-white text-gray-700"
          >
            Lat/Lng
          </button>
        </div>

        {/* Place mode */}
        <div id="sidebar-mode-place" className="space-y-2">
          <label className="block text-sm text-gray-600">
            Search by place name or address
          </label>
          <div className="flex gap-2">
            <input
              id="sidebar-search"
              placeholder="Search for places..."
              className="flex-1 rounded-md border px-3 py-2 text-sm"
              type="search"
            />
            <button
              id="sidebar-search-go"
              className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
            >
              Go
            </button>
          </div>
          <div
            id="sidebar-suggestions"
            className="mt-1 rounded-md border bg-white shadow-sm max-h-56 overflow-auto hidden"
          />
        </div>

        {/* Lat/Lng mode */}
        <div id="sidebar-mode-latlng" className="space-y-2 hidden">
          <label className="block text-sm text-gray-600">
            Enter latitude and longitude
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="sidebar-lat"
              type="number"
              step="0.0001"
              placeholder="Latitude"
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input
              id="sidebar-lng"
              type="number"
              step="0.0001"
              placeholder="Longitude"
              className="rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <button
            id="sidebar-latlng-go"
            className="w-full px-3 py-2 rounded-md bg-green-600 text-white text-sm"
          >
            Fly To
          </button>
        </div>
      </div>

      {/* Marker Management */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Markers</div>
          <div className="flex gap-2">
            <span
              id="marker-count"
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
            >
              0
            </span>
            <button
              onClick={() => window.clearAllMarkers && window.clearAllMarkers()}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Clear All
            </button>
            <button
              onClick={() => window.syncMarkersFromMap && window.syncMarkersFromMap()}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              title="Sync with map"
            >
              🔄
            </button>
            <button
              onClick={() => window.resetMarkers && window.resetMarkers()}
              className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
              title="Reset all markers"
            >
              🔄
            </button>
          </div>
        </div>
        <div id="marker-list" className="max-h-40 overflow-y-auto space-y-1">
          {/* Markers will be dynamically added here */}
        </div>
        <div className="text-xs text-gray-500">
          Search for locations to add markers. Markers are draggable on the map.
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Grid Overlay</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">Rows</label>
            <input
              id="rows-input"
              defaultValue={4}
              type="number"
              min={1}
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Columns</label>
            <input
              id="cols-input"
              defaultValue={5}
              type="number"
              min={1}
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Panel width (m)</label>
            <input
              id="width-m-input"
              type="number"
              step={0.1}
              min={1}
              className="w-full rounded-md border px-2 py-1 text-sm"
              placeholder="auto"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Panel height (m)</label>
            <input
              id="height-m-input"
              type="number"
              step={0.1}
              min={1}
              className="w-full rounded-md border px-2 py-1 text-sm"
              placeholder="auto"
            />
          </div>
        </div>

        <button
          id="add-overlay-btn"
          className="w-full px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm shadow-sm"
          onClick={() => {
            const rows = document.getElementById('rows-input')?.value || 4;
            const cols = document.getElementById('cols-input')?.value || 5;
            const widthM =
              document.getElementById('width-m-input')?.value || '';
            const heightM =
              document.getElementById('height-m-input')?.value || '';
            if (
              typeof window !== 'undefined' &&
              window.__solarMapAddOverlayAtCenter__
            ) {
              window.__solarMapAddOverlayAtCenter__(
                rows,
                cols,
                widthM,
                heightM
              );
            }
          }}
        >
          Add Grid Overlay
        </button>
      </div>
    </aside>
  );
}
