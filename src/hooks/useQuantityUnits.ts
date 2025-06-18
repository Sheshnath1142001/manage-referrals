import { useState, useEffect, useCallback, useRef } from 'react';
import { quantityUnitsService } from '@/services/api/items/quantityUnits';
import { useToast } from '@/components/ui/use-toast';

export const useQuantityUnits = () => {
  const [quantityUnits, setQuantityUnits] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "Active" | "Inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Use ref to track request state and prevent duplicate calls
  const isRequestInProgress = useRef(false);

  const fetchQuantityUnits = useCallback(async () => {
    // Prevent duplicate concurrent requests
    if (isRequestInProgress.current) return;
    
    try {
      isRequestInProgress.current = true;
      setIsLoading(true);
      
      const params: any = {
        page: currentPage,
        per_page: pageSize,
        with_pre_defines: 1
      };
      
      // Add status parameter to API request if not "all"
      if (status !== "all") {
        params.status = status === "Active" ? 1 : 0;
      }
      
      // Add search parameter if provided - using 'unit' as the parameter name instead of 'search'
      if (search.trim()) {
        params.unit = search.trim();
      }
      
      const response = await quantityUnitsService.getQuantityUnits(params);
      
      // Safely handle the response structure
      const responseData = response.data || response;
      setQuantityUnits(responseData.quantity_units || []);
      setTotal(responseData.total || 0);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to load quantity units. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  }, [currentPage, pageSize, status, search, toast]);

  useEffect(() => {
    fetchQuantityUnits();
  }, [fetchQuantityUnits]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    quantityUnits,
    search,
    setSearch,
    status,
    setStatus,
    currentPage,
    pageSize,
    total,
    isLoading,
    handlePageChange,
    handlePageSizeChange,
    fetchQuantityUnits
  };
};
