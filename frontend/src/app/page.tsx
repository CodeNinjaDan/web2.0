"use client";

import Header from "./components/Header";
import FiltersPanel from "./components/FiltersPanel";
import CafeList from "./components/CafeList";
import MapView from "./components/MapView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { CafeFilters, Cafe } from "./lib/api";

// Create a client
const queryClient = new QueryClient();

export default function Home() {
  const [filters, setFilters] = useState<CafeFilters>({
    location: "",
    has_wifi: undefined,
    has_sockets: undefined,
    has_toilet: undefined,
    can_take_calls: undefined,
  });
  
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-0">
            {/* Left Panel - Filters */}
            <div className="border-r bg-background overflow-y-auto">
              <FiltersPanel filters={filters} onFiltersChange={setFilters} />
            </div>
            
            {/* Middle Panel - Cafe List */}
            <div className="border-r bg-background overflow-y-auto">
              <CafeList 
                filters={filters} 
                selectedCafe={selectedCafe}
                onSelectCafe={setSelectedCafe}
              />
            </div>
            
            {/* Right Panel - Map */}
            <div className="bg-background">
              <MapView 
                filters={filters}
                selectedCafe={selectedCafe}
                onSelectCafe={setSelectedCafe}
              />
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}
