import { useState, useEffect } from 'react';
import { cloudPrintersApi, CloudPrinter } from '@/services/api/cloudPrinters';
import { useToast } from '@/hooks/use-toast';

interface UseCloudPrintersProps {
  restaurantId: number;
  activeOnly?: boolean;
  page?: number;
  perPage?: number;
  printerName?: string;
}

export function useCloudPrinters({
  restaurantId,
  activeOnly = true,
  page = 1,
  perPage = 10,
  printerName = '',
}: UseCloudPrintersProps) {
  const [printers, setPrinters] = useState<CloudPrinter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchPrinters = async () => {
    if (!restaurantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        restaurant_id: restaurantId,
        page,
        per_page: perPage,
      };
      if (typeof activeOnly === 'boolean') {
        params.is_active = activeOnly ? 'true' : 'false';
      }
      if (printerName && printerName.trim() !== '') {
        params.name = printerName.trim();
      }
      const response = await cloudPrintersApi.getCloudPrinters(params);

      if (response && response.data) {
        setPrinters(response.data);
      } else {
        throw new Error('Invalid response from cloud printers API');
      }
    } catch (err) {
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching cloud printers';
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: "Error loading cloud printers",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, [restaurantId, activeOnly, page, perPage, printerName]);

  return {
    printers,
    isLoading,
    error,
    refreshPrinters: fetchPrinters
  };
} 