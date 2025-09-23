export default function Sidebar() {
  return (
    <aside className="w-72 h-screen border-r bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Map Manager</h2>
        <p className="text-sm text-gray-600">Draw shapes and manage overlays</p>
      </div>

      {/* Search Controls */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Location Search</label>
        <div className="flex gap-2">
          <input
            id="sidebar-search"
            placeholder="Search for places..."
            className="flex-1 rounded-md border px-3 py-2 text-sm"
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
