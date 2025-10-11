"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useCafesWithFilters } from "../hooks/useCafes";
import type { Cafe, CafeFilters } from "../lib/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React Leaflet
const icon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  filters: CafeFilters;
  selectedCafe: Cafe | null;
  onSelectCafe: (cafe: Cafe) => void;
}

// Component to handle map centering when a cafe is selected
function MapController({ selectedCafe }: { selectedCafe: Cafe | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedCafe) {
      // Extract coordinates from map_url
      const coords = extractCoordinates(selectedCafe.map_url);
      if (coords) {
        map.setView([coords.lat, coords.lng], 15);
      }
    }
  }, [selectedCafe, map]);

  return null;
}

// Helper function to extract coordinates from Google Maps URL
function extractCoordinates(mapUrl: string): { lat: number; lng: number } | null {
  try {
    // Try to extract from various Google Maps URL formats
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,  // @lat,lng format
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/,  // q=lat,lng format
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng format
    ];

    for (const pattern of patterns) {
      const match = mapUrl.match(pattern);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2]),
        };
      }
    }

    // Default fallback coordinates (London)
    return { lat: 51.5074, lng: -0.1278 };
  } catch (error) {
    return { lat: 51.5074, lng: -0.1278 };
  }
}

export default function MapView({ filters, selectedCafe, onSelectCafe }: MapViewProps) {
  const { cafes, isLoading, isError } = useCafesWithFilters(filters);
  const [mounted, setMounted] = useState(false);

  // Handle client-side only rendering for Leaflet
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cafes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <p className="text-red-500">Error loading map data</p>
      </div>
    );
  }

  // Calculate center position from cafes or use default
  const defaultCenter: [number, number] = [51.5074, -0.1278]; // London
  const center = cafes.length > 0 && cafes[0].map_url
    ? (() => {
        const coords = extractCoordinates(cafes[0].map_url);
        return coords ? [coords.lat, coords.lng] as [number, number] : defaultCenter;
      })()
    : defaultCenter;

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedCafe={selectedCafe} />

        {cafes.map((cafe) => {
          const coords = extractCoordinates(cafe.map_url);
          if (!coords) return null;

          return (
            <Marker
              key={cafe.id}
              position={[coords.lat, coords.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectCafe(cafe),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-semibold mb-1">{cafe.name}</h3>
                  <p className="text-muted-foreground text-xs mb-2">{cafe.location}</p>
                  <p className="font-semibold text-primary">{cafe.coffee_price}</p>
                  {cafe.img_url && (
                    <img
                      src={cafe.img_url}
                      alt={cafe.name}
                      className="w-full h-24 object-cover rounded mt-2"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {cafes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <p className="text-muted-foreground">No cafes to display on map</p>
          </div>
        </div>
      )}
    </div>
  );
}
