import { useState, useEffect } from 'react';
import { customerGroupsApi, CustomerGroup } from '@/services/api/customerGroups';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

interface UseCustomerGroupsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: number;
  autoFetch?: boolean;
}

export function useCustomerGroups(options: UseCustomerGroupsOptions = {}) {
  const { user } = useAuth();
  const {
    page = 1,
    limit = 999999,
    search,
    status = 1,
    autoFetch = true
  } = options;

  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCustomerGroups = async () => {
    if (!user?.restaurant_id) {
      
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      
      const response = await customerGroupsApi.getCustomerGroups(
        page,
        limit,
        search,
        status,
        user.restaurant_id
      );
      
      
      
      
      
      // Handle different response structures
      let customerGroupsData: CustomerGroup[] = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Expected structure: { success: true, data: { data: [...] } }
        customerGroupsData = response.data.data;
        
      } else if (response?.data && Array.isArray(response.data)) {
        // Alternative structure: { success: true, data: [...] }
        customerGroupsData = response.data;
        
      } else if (Array.isArray(response)) {
        // Direct array response: [...]
        customerGroupsData = response;
        
      } else {
        
        
        
        
      }
      
      
      setCustomerGroups(customerGroupsData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch customer groups');
      
      setError(error);
      setCustomerGroups([]);
      
      toast({
        title: "Error",
        description: "Failed to load customer groups",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && user?.restaurant_id) {
      fetchCustomerGroups();
    }
  }, [user?.restaurant_id, page, limit, search, status, autoFetch]);

  return {
    customerGroups,
    isLoading,
    error,
    refetch: fetchCustomerGroups
  };
} 