import { useState, useEffect, useCallback } from 'react';
import { restaurantsApi } from '@/services/api/restaurants';
import { useToast } from '@/components/ui/use-toast';

interface Restaurant {
  id: number | string;
  name: string;
  // Other fields that might be needed
}

interface RestaurantResponse {
  data: Restaurant[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface RestaurantResponseWithRestaurants {
  restaurants: Restaurant[];
}

// Use this to prevent multiple hook instances from making duplicate API calls
let globalRestaurants: Restaurant[] = [];
let isLoadingGlobally = false;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useGetRestaurants() {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(globalRestaurants);
  const [isLoading, setIsLoading] = useState(isLoadingGlobally);
  const [error, setError] = useState<Error | null>(null);

  // Fetch restaurants function
  const fetchRestaurants = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const shouldUseCache = !forceRefresh && 
                          globalRestaurants.length > 0 && 
                          (now - lastFetchTime) < CACHE_DURATION;
    
    // Use cached data if available and not expired
    if (shouldUseCache) {
      console.log('Using cached restaurants data');
      setRestaurants(globalRestaurants);
      return;
    }
    
    // Prevent duplicate API calls if already loading
    if (isLoadingGlobally && !forceRefresh) {
      console.log('Already loading restaurants, skipping duplicate request');
      return;
    }
    
    setIsLoading(true);
    isLoadingGlobally = true;
    setError(null);
    
    try {
      console.log('Fetching restaurants...');
      const response = await restaurantsApi.getRestaurants();
      console.log('Restaurants API Response:', response);
      
      let newRestaurants: Restaurant[] = [];
      
      // Handle the response based on its structure
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          newRestaurants = response;
        } else if (response && 'data' in response && Array.isArray((response as RestaurantResponse).data)) {
          newRestaurants = (response as RestaurantResponse).data;
        } else if (response && 'restaurants' in response && Array.isArray((response as RestaurantResponseWithRestaurants).restaurants)) {
          newRestaurants = (response as RestaurantResponseWithRestaurants).restaurants;
        } else {
          console.error('Unexpected response format:', response);
          throw new Error('Invalid response format from restaurant API');
        }
      } else {
        console.error('Invalid response:', response);
        throw new Error('Invalid response from restaurant API');
      }
      
      if (newRestaurants.length === 0) {
        console.warn('No restaurants returned from API');
        toast({
          title: "No restaurants found",
          description: "The API returned an empty list of restaurants.",
          variant: "default"
        });
      }
      
      globalRestaurants = newRestaurants;
      lastFetchTime = now;
      setRestaurants(newRestaurants);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching restaurants';
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      // Show error toast
      toast({
        title: "Error loading restaurants",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Clear global cache on error
      globalRestaurants = [];
      lastFetchTime = 0;
    } finally {
      setIsLoading(false);
      isLoadingGlobally = false;
    }
  }, [toast]);

  // Initial fetch on mount
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Refresh function to force a new fetch
  const refreshRestaurants = useCallback(() => {
    console.log('Forcing refresh of restaurants data');
    fetchRestaurants(true);
  }, [fetchRestaurants]);

  return {
    restaurants,
    isLoading,
    error,
    refreshRestaurants
  };
}