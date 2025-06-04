import { useState, useEffect, useCallback, useRef } from 'react';
import { paymentMethodsService } from '@/services/api/items/paymentMethods';
import { useToast } from '@/components/ui/use-toast';

export interface PaymentMethod {
  id: number;
  method: string;
  description: string | null;
  status: number;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  restaurant_id: number | null;
}

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Use refs to track request state and prevent duplicate calls
  const isRequestInProgress = useRef(false);

  const fetchPaymentMethods = useCallback(async () => {
    // Prevent duplicate concurrent requests
    if (isRequestInProgress.current) return;
    
    try {
      isRequestInProgress.current = true;
      setIsLoading(true);
      
      const params: any = {
        page: currentPage,
        per_page: pageSize
      };
      
      const response = await paymentMethodsService.getPaymentMethods(params);
      
      setPaymentMethods(response.payment_methods || []);
      setTotal(response.total || response.payment_methods?.length || 0);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      isRequestInProgress.current = false;
    }
  }, [currentPage, pageSize, toast]);

  // Initial data fetch and pagination updates
  useEffect(() => {
    fetchPaymentMethods();
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    paymentMethods,
    currentPage,
    pageSize,
    total,
    isLoading,
    handlePageChange,
    handlePageSizeChange,
    fetchPaymentMethods
  };
}; 