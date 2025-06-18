import { useState, useEffect, useCallback } from 'react';
import { restaurantsApi } from '@/services/api/restaurants';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';

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

export function useGetRestaurants() {
  const { toast } = useToast();
  const { user, token } = useAuth();
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch restaurants function
  const fetchRestaurants = useCallback(async () => {
    if (!token) {
      
      setRestaurants([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      
      
      const response = await restaurantsApi.getRestaurants();
      
      
      let newRestaurants: Restaurant[] = [];
      
      // Handle the response based on its structure
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          newRestaurants = response;
        } else if (response && 'data' in response && Array.isArray(response.data)) {
          newRestaurants = response.data;
        } else if (response && 'restaurants' in response && Array.isArray(response.restaurants)) {
          newRestaurants = response.restaurants;
        } else {
          
          throw new Error('Invalid response format from restaurant API');
        }
      } else {
        
        throw new Error('Invalid response from restaurant API');
      }
      
      if (newRestaurants.length === 0) {
        
        toast({
          title: "No restaurants found",
          description: "The API returned an empty list of restaurants.",
          variant: "default"
        });
      }
      
      
      setRestaurants(newRestaurants);
    } catch (err) {
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching restaurants';
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      // Show error toast
      toast({
        title: "Error loading restaurants",
        description: errorMessage,
        variant: "destructive"
      });
      
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, token]);

  // Fetch restaurants when token changes
  useEffect(() => {
    if (!token) {
      setRestaurants([]);
      setError(null);
      return;
    }
    
    fetchRestaurants();
  }, [token, fetchRestaurants]);

  // Refresh function to force a new fetch
  const refreshRestaurants = useCallback(() => {
    
    fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    isLoading,
    error,
    refreshRestaurants
  };
}