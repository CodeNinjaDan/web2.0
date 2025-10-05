"use client";

import type { CafeFilters } from "../lib/api";

interface FiltersPanelProps {
  filters: CafeFilters;
  onFiltersChange: (filters: CafeFilters) => void;
}

export default function FiltersPanel({ filters, onFiltersChange }: FiltersPanelProps) {
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, location: e.target.value });
  };

  const handleCheckboxChange = (key: keyof Omit<CafeFilters, "location">) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({
        ...filters,
        [key]: e.target.checked ? true : undefined,
      });
    };
  };

  const clearFilters = () => {
    onFiltersChange({
      location: "",
      has_wifi: undefined,
      has_sockets: undefined,
      has_toilet: undefined,
      can_take_calls: undefined,
    });
  };

  const hasActiveFilters = 
    filters.location || 
    filters.has_wifi || 
    filters.has_sockets || 
    filters.has_toilet || 
    filters.can_take_calls;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Search input */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            Search by Location
          </label>
          <input
            type="text"
            id="location"
            value={filters.location || ""}
            onChange={handleLocationChange}
            placeholder="Enter location..."
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </div>

        {/* Filter checkboxes */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Amenities</h3>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded cursor-pointer"
              checked={filters.has_wifi === true}
              onChange={handleCheckboxChange("has_wifi")}
            />
            <span className="text-sm">Wi-Fi</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded cursor-pointer"
              checked={filters.has_sockets === true}
              onChange={handleCheckboxChange("has_sockets")}
            />
            <span className="text-sm">Power Sockets</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded cursor-pointer"
              checked={filters.has_toilet === true}
              onChange={handleCheckboxChange("has_toilet")}
            />
            <span className="text-sm">Toilet</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded cursor-pointer"
              checked={filters.can_take_calls === true}
              onChange={handleCheckboxChange("can_take_calls")}
            />
            <span className="text-sm">Can Take Calls</span>
          </label>
        </div>
      </div>
    </div>
  );
}
