# API Integration Documentation

## Overview
The API integration is complete with full TypeScript support, React Query caching, and filter functionality.

## Files Created

### 1. `.env.local`
Contains the API URL configuration:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. `src/app/lib/api.ts`
Core API functions using Axios:
- `getAllCafes()` - Fetches all cafes from `/all`
- `searchCafesByLocation(location)` - Searches cafes by location via `/search?loc=...`
- `getRandomCafe()` - Gets a random cafe from `/random`
- `addCafe(cafe)` - Adds a new cafe via POST to `/add`
- `filterCafes(cafes, filters)` - Client-side filtering helper

**Interfaces:**
- `Cafe` - Cafe object structure
- `CafeFilters` - Filter parameters

### 3. `src/app/hooks/useCafes.ts`
React Query hooks for data fetching:
- `useAllCafes()` - Fetches and caches all cafes
- `useSearchCafes(location)` - Searches cafes by location
- `useRandomCafe()` - Gets a random cafe
- `useAddCafe()` - Mutation hook for adding cafes
- `useCafesWithFilters(filters)` - Main hook with smart filtering

## Usage Examples

### Basic Usage - Fetch All Cafes
```tsx
import { useAllCafes } from '@/app/hooks/useCafes';

function CafeList() {
  const { data: cafes, isLoading, isError } = useAllCafes();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading cafes</div>;

  return (
    <div>
      {cafes?.map(cafe => (
        <div key={cafe.id}>{cafe.name}</div>
      ))}
    </div>
  );
}
```

### Advanced Usage - With Filters
```tsx
import { useCafesWithFilters } from '@/app/hooks/useCafes';
import { useState } from 'react';

function FilteredCafeList() {
  const [filters, setFilters] = useState({
    location: '',
    has_wifi: false,
    has_sockets: false,
  });

  const { cafes, isLoading, isError } = useCafesWithFilters(filters);

  return (
    <div>
      <input
        value={filters.location}
        onChange={(e) => setFilters({...filters, location: e.target.value})}
        placeholder="Search location..."
      />
      <label>
        <input
          type="checkbox"
          checked={filters.has_wifi}
          onChange={(e) => setFilters({...filters, has_wifi: e.target.checked})}
        />
        Wi-Fi
      </label>
      {isLoading && <div>Loading...</div>}
      {cafes.map(cafe => <div key={cafe.id}>{cafe.name}</div>)}
    </div>
  );
}
```

### Add a Cafe
```tsx
import { useAddCafe } from '@/app/hooks/useCafes';

function AddCafeForm() {
  const { mutate: addCafe, isPending } = useAddCafe();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCafe({
      name: 'My Cafe',
      location: 'Nairobi',
      map_url: 'https://maps.google.com/...',
      img_url: 'https://example.com/cafe.jpg',
      has_wifi: true,
      has_sockets: true,
      has_toilet: true,
      can_take_calls: false,
      seats: '20-30',
      coffee_price: '£2.50',
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Features

✅ **Automatic Caching** - React Query caches data for 5 minutes  
✅ **Smart Refetching** - Automatically refetches when data becomes stale  
✅ **Error Handling** - Built-in error states  
✅ **Loading States** - Built-in loading indicators  
✅ **TypeScript Support** - Full type safety  
✅ **Optimistic Updates** - Cache invalidation after mutations  
✅ **Flexible Filtering** - Client-side or server-side search  

## Data Flow

1. Component calls `useCafesWithFilters(filters)`
2. Hook determines whether to use `/all` or `/search` endpoint
3. React Query fetches data and caches it
4. Client-side filters are applied to results
5. Filtered cafes are returned to component
6. Component re-renders with new data

## Next Steps

To use this in your components:
1. Import the hook: `import { useCafesWithFilters } from '@/app/hooks/useCafes'`
2. Create filter state in your component
3. Pass filters to the hook
4. Render the returned cafes

The hooks are ready to be integrated into `FiltersPanel.tsx`, `CafeList.tsx`, and `MapView.tsx`!
