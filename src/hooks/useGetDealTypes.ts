import { useState, useEffect, useCallback } from 'react';
import { dealsApi } from '@/services/api/deals';
import { useToast } from '@/components/ui/use-toast';

interface DealType {
  id: number;
  name: string;
  description: string;
  status: number;
  created_at: string;
  updated_at: string;
}

// Use this to prevent multiple hook instances from making duplicate API calls
let globalDealTypes: DealType[] = [];
let isLoadingGlobally = false;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useGetDealTypes() {
  const { toast } = useToast();
  const [dealTypes, setDealTypes] = useState<DealType[]>(globalDealTypes);
  const [isLoading, setIsLoading] = useState(isLoadingGlobally);
  const [error, setError] = useState<Error | null>(null);

  // Fetch deal types function
  const fetchDealTypes = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const shouldUseCache = !forceRefresh && 
                          globalDealTypes.length > 0 && 
                          (now - lastFetchTime) < CACHE_DURATION;
    
    // Use cached data if available and not expired
    if (shouldUseCache) {
      console.log('Using cached deal types data');
      setDealTypes(globalDealTypes);
      return;
    }
    
    // Prevent duplicate API calls if already loading
    if (isLoadingGlobally && !forceRefresh) {
      console.log('Already loading deal types, skipping duplicate request');
      return;
    }
    
    setIsLoading(true);
    isLoadingGlobally = true;
    setError(null);
    
    try {
      console.log('Fetching deal types...');
      const response = await dealsApi.getDealTypes();
      console.log('Deal Types API Response:', response);
      
      if (response && response.data) {
        globalDealTypes = response.data;
        lastFetchTime = now;
        setDealTypes(response.data);
      } else {
        throw new Error('Invalid response from deal types API');
      }
    } catch (err) {
      console.error("Error fetching deal types:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching deal types';
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      // Show error toast
      toast({
        title: "Error loading deal types",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Clear global cache on error
      globalDealTypes = [];
      lastFetchTime = 0;
    } finally {
      setIsLoading(false);
      isLoadingGlobally = false;
    }
  }, [toast]);

  // Initial fetch on mount
  useEffect(() => {
    fetchDealTypes();
  }, [fetchDealTypes]);

  // Refresh function to force a new fetch
  const refreshDealTypes = useCallback(() => {
    console.log('Forcing refresh of deal types data');
    fetchDealTypes(true);
  }, [fetchDealTypes]);

  return {
    dealTypes,
    isLoading,
    error,
    refreshDealTypes
  };
} 