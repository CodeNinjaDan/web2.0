import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cafe interface matching backend structure
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

// Filter parameters interface
export interface CafeFilters {
  location?: string;
  has_wifi?: boolean;
  has_sockets?: boolean;
  has_toilet?: boolean;
  can_take_calls?: boolean;
}

/**
 * Fetch all cafes from the backend
 */
export const getAllCafes = async (): Promise<Cafe[]> => {
  const response = await apiClient.get<{ cafes: Cafe[] }>("/all");
  return response.data.cafes;
};

/**
 * Search cafes by location
 */
export const searchCafesByLocation = async (
  location: string
): Promise<Cafe[]> => {
  const response = await apiClient.get<{ cafes: Cafe[] }>("/search", {
    params: { loc: location },
  });
  return response.data.cafes;
};

/**
 * Get a random cafe
 */
export const getRandomCafe = async (): Promise<Cafe> => {
  const response = await apiClient.get<{ cafe: Cafe }>("/random");
  return response.data.cafe;
};

/**
 * Add a new cafe
 */
export const addCafe = async (cafe: Omit<Cafe, "id">): Promise<Cafe> => {
  const response = await apiClient.post<{ success: string; cafe: Cafe }>(
    "/add",
    cafe
  );
  return response.data.cafe;
};

/**
 * Filter cafes based on criteria (client-side filtering)
 * This applies filters to the cafe list after fetching
 */
export const filterCafes = (cafes: Cafe[], filters: CafeFilters): Cafe[] => {
  return cafes.filter((cafe) => {
    // Filter by location if specified
    if (
      filters.location &&
      !cafe.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    // Filter by amenities
    if (filters.has_wifi !== undefined && cafe.has_wifi !== filters.has_wifi) {
      return false;
    }

    if (
      filters.has_sockets !== undefined &&
      cafe.has_sockets !== filters.has_sockets
    ) {
      return false;
    }

    if (
      filters.has_toilet !== undefined &&
      cafe.has_toilet !== filters.has_toilet
    ) {
      return false;
    }

    if (
      filters.can_take_calls !== undefined &&
      cafe.can_take_calls !== filters.can_take_calls
    ) {
      return false;
    }

    return true;
  });
};
