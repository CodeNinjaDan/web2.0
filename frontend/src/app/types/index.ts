// Shared TypeScript types for the application

export interface Cafe {
  id: number;
  name: string;
  map_url: string;
  img_url: string;
  location: string;
  has_sockets: boolean;
  has_toilet: boolean;
  has_wifi: boolean;
  can_take_calls: boolean;
  seats: string;
  coffee_price: string;
}

export interface CafeFilters {
  location?: string;
  has_wifi?: boolean;
  has_sockets?: boolean;
  has_toilet?: boolean;
  can_take_calls?: boolean;
}
