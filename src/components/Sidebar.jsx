export default function Sidebar() {
  // Wire up Photon search and lat/lng controls imperatively after first render
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      try {
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
            const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
            let lastIdx = 0;
            for (const m of text.matchAll(re)) {
              const start = m.index;
              const end = start + m[0].length;
              if (start > lastIdx)
                frag.appendChild(document.createTextNode(text.slice(lastIdx, start)));
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

        async function searchPhoton(q, immediate = false) {
          const query = (q || '').trim();
          if (!query || query.length < 3) {
            hideSuggest();
            return;
          }
          if (!immediate && query === lastQuery) {
            return;
          }

          if (currentAbort) {
            try {
              currentAbort.abort();
            } catch (_) { }
          }
          currentAbort = new AbortController();

          const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=7`;
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
            // Ignore abort errors; hide on other failures
            if (err?.name !== 'AbortError') hideSuggest();
            return;
          } finally {
            currentAbort = null;
          }

          const features = Array.isArray(data?.features) ? data.features : [];
          if (features.length === 0) {
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
          for (const f of features) {
            const coords = f?.geometry?.coordinates; // [lng, lat]
            if (!Array.isArray(coords) || coords.length < 2) continue;
            const lat = coords[1];
            const lng = coords[0];
            const item = document.createElement('button');
            item.type = 'button';
            item.setAttribute('data-suggest-item', '');
            item.className =
              'w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 focus:outline-none';
            const props = f?.properties || {};

            const top = document.createElement('div');
            top.className = 'text-sm font-medium text-gray-900';
            top.appendChild(highlightMatch(props?.name || props?.street || 'Unnamed', query));

            const metaParts = [];
            if (props?.street && props?.name) metaParts.push(props.street);
            if (props?.district) metaParts.push(props.district);
            if (props?.state) metaParts.push(props.state);
            if (props?.postcode) metaParts.push(props.postcode);
            if (props?.country) metaParts.push(props.country);
            const bottom = document.createElement('div');
            bottom.className = 'text-xs text-gray-500';
            bottom.textContent = metaParts.join(', ');

            item.appendChild(top);
            if (bottom.textContent) item.appendChild(bottom);

            item.onclick = () => {
              latInput.value = String(lat);
              lngInput.value = String(lng);
              if (window.__solarMapFlyTo__) window.__solarMapFlyTo__(lat, lng, 18);
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
          let t;
          return (q) => {
            clearTimeout(t);
            t = setTimeout(() => searchPhoton(q, false), 400);
          };
        })();

        input?.addEventListener('input', (e) => debounced(e.target.value));
        goBtn?.addEventListener('click', () => searchPhoton(input?.value || '', true));
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
            if (window.__solarMapFlyTo__) window.__solarMapFlyTo__(lat, lng, 18);
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
          <button id="mode-place" className="px-3 py-1.5 text-sm bg-blue-600 text-white">Place</button>
          <button id="mode-latlng" className="px-3 py-1.5 text-sm bg-white text-gray-700">Lat/Lng</button>
        </div>

        {/* Place mode */}
        <div id="sidebar-mode-place" className="space-y-2">
          <label className="block text-sm text-gray-600">Search by place name or address</label>
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
          <label className="block text-sm text-gray-600">Enter latitude and longitude</label>
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
            const widthM = document.getElementById('width-m-input')?.value || '';
            const heightM = document.getElementById('height-m-input')?.value || '';
            if (typeof window !== 'undefined' && window.__solarMapAddOverlayAtCenter__) {
              window.__solarMapAddOverlayAtCenter__(rows, cols, widthM, heightM);
            }
          }}
        >
          Add Grid Overlay
        </button>
      </div>
    </aside>
  );
}
