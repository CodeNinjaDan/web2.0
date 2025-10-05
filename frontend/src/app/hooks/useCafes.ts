import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCafes,
  searchCafesByLocation,
  getRandomCafe,
  addCafe,
  filterCafes,
  type Cafe,
  type CafeFilters,
} from "../lib/api";
import { useMemo } from "react";

/**
 * Hook to fetch all cafes
 */
export const useAllCafes = () => {
  return useQuery({
    queryKey: ["cafes", "all"],
    queryFn: getAllCafes,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
  });
};

/**
 * Hook to search cafes by location
 */
export const useSearchCafes = (location: string) => {
  return useQuery({
    queryKey: ["cafes", "search", location],
    queryFn: () => searchCafesByLocation(location),
    enabled: location.length > 0, // Only run query if location is provided
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get a random cafe
 */
export const useRandomCafe = () => {
  return useQuery({
    queryKey: ["cafes", "random"],
    queryFn: getRandomCafe,
    staleTime: 0, // Always fetch fresh random cafe
  });
};

/**
 * Hook to add a new cafe (mutation)
 */
export const useAddCafe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCafe,
    onSuccess: () => {
      // Invalidate and refetch cafes after adding a new one
      queryClient.invalidateQueries({ queryKey: ["cafes"] });
    },
  });
};

/**
 * Main hook for cafes with filtering support
 * This hook fetches all cafes and applies client-side filters
 */
export const useCafesWithFilters = (filters: CafeFilters) => {
  // If location is provided and other filters are not set, use search endpoint
  const shouldUseSearch =
    filters.location &&
    filters.location.length > 0 &&
    !filters.has_wifi &&
    !filters.has_sockets &&
    !filters.has_toilet &&
    !filters.can_take_calls;

  // Fetch all cafes or search by location
  const allCafesQuery = useAllCafes();
  const searchQuery = useSearchCafes(filters.location || "");

  // Determine which query to use
  const activeQuery = shouldUseSearch ? searchQuery : allCafesQuery;

  // Apply client-side filters to the results
  const filteredCafes = useMemo(() => {
    if (!activeQuery.data) return [];

    // If we used search endpoint, still apply other filters
    if (shouldUseSearch) {
      return activeQuery.data;
    }

    // Apply all filters
    return filterCafes(activeQuery.data, filters);
  }, [activeQuery.data, filters, shouldUseSearch]);

  return {
    cafes: filteredCafes,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
  };
};
