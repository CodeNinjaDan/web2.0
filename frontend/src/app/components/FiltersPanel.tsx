"use client";

export default function FiltersPanel() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      <div className="space-y-4">
        {/* Search input */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            Search by Location
          </label>
          <input
            type="text"
            id="location"
            placeholder="Enter location..."
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </div>

        {/* Filter checkboxes */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Amenities</h3>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Wi-Fi</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Power Sockets</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Toilet</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Can Take Calls</span>
          </label>
        </div>
      </div>
    </div>
  );
}
