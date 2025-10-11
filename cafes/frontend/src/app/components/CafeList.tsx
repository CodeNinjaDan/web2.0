"use client";

import { useCafesWithFilters } from "../hooks/useCafes";
import type { Cafe, CafeFilters } from "../lib/api";
import { Wifi, Plug, WashingMachine, Phone, Users, Coffee } from "lucide-react";

interface CafeListProps {
  filters: CafeFilters;
  selectedCafe: Cafe | null;
  onSelectCafe: (cafe: Cafe) => void;
}

export default function CafeList({ filters, selectedCafe, onSelectCafe }: CafeListProps) {
  const { cafes, isLoading, isError, error } = useCafesWithFilters(filters);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cafes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p className="font-semibold mb-2">Error loading cafes</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  if (cafes.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-center">
          <Coffee className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No cafes found matching your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Cafes ({cafes.length})
      </h2>
      <div className="space-y-4">
        {cafes.map((cafe) => (
          <div
            key={cafe.id}
            onClick={() => onSelectCafe(cafe)}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedCafe?.id === cafe.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50"
            }`}
          >
            {/* Cafe Image */}
            {cafe.img_url && (
              <img
                src={cafe.img_url}
                alt={cafe.name}
                className="w-full h-48 object-cover rounded-md mb-3"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}

            {/* Cafe Name and Location */}
            <h3 className="font-semibold text-lg mb-1">{cafe.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{cafe.location}</p>

            {/* Amenities Icons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {cafe.has_wifi && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                  <Wifi className="h-3 w-3" />
                  Wi-Fi
                </span>
              )}
              {cafe.has_sockets && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                  <Plug className="h-3 w-3" />
                  Sockets
                </span>
              )}
              {cafe.has_toilet && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                  <WashingMachine className="h-3 w-3" />
                  Toilet
                </span>
              )}
              {cafe.can_take_calls && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                  <Phone className="h-3 w-3" />
                  Calls OK
                </span>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                {cafe.seats} seats
              </span>
              <span className="font-semibold text-primary">
                {cafe.coffee_price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
