import { useState, useEffect } from 'react';
import { dealsApi } from '@/services/api/deals';
import { useToast } from '@/hooks/use-toast';
import { Deal } from '@/services/api/deals';

interface UseGetDealsProps {
  restaurantId: number;
  activeOnly?: boolean;
  currentOnly?: boolean;
  limit?: number;
  offset?: number;
  dealTypeId?: number;
}

export function useGetDeals({
  restaurantId,
  activeOnly = false,
  currentOnly = false,
  limit = 10,
  offset = 0,
  dealTypeId
}: UseGetDealsProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchDeals = async () => {
    if (!restaurantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await dealsApi.getDeals({
        restaurant_id: restaurantId,
        active_only: activeOnly,
        current_only: currentOnly,
        limit,
        offset,
        deal_type_id: dealTypeId
      });

      if (response && response.data) {
        setDeals(response.data);
        setTotalItems(response.total || response.data.length);
      } else {
        throw new Error('Invalid response from deals API');
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching deals';
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: "Error loading deals",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [restaurantId, activeOnly, currentOnly, limit, offset, dealTypeId]);

  return {
    deals,
    totalItems,
    isLoading,
    error,
    refreshDeals: fetchDeals
  };
} 