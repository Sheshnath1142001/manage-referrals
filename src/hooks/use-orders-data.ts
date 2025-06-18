
import { useState, useEffect } from 'react';
import { ordersApi } from '@/services/api/orders';
import { useToast } from './use-toast';
import { useDebounce } from './use-debounce';

export const useOrdersData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.getOrders();
      // Handle different response formats
      if (Array.isArray(response)) {
        setOrders(response);
      } else if (response && Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (response && typeof response === 'object') {
        // Try to extract any array data from the response
        const possibleData = Object.values(response).find(val => Array.isArray(val));
        setOrders(possibleData ? possibleData : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      
      toast({
        title: "Error fetching orders",
        description: "There was a problem loading the orders data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    isLoading,
    refetchOrders: fetchOrders
  };
};
