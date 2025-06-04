import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/api/reports';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface UseEverydaySalesReportParams {
  restaurantId: string | number;
  selectedDate?: Date;
}

interface EverydaySalesData {
  created_date: string;
  num_items_sold: string;
  sales_price: string;
  restaurant_id: string;
  restaurant_name: string;
  group_clause: string;
}

interface RestaurantDailyData {
  [date: string]: EverydaySalesData;
}

interface ApiResponse {
  data: {
    [restaurantId: string]: RestaurantDailyData;
  };
}

export const useEverydaySalesReport = ({ restaurantId, selectedDate = new Date() }: UseEverydaySalesReportParams) => {
  // Get week dates based on selected date
  const getCurrentWeekDates = () => {
    const sunday = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const saturday = endOfWeek(selectedDate, { weekStartsOn: 0 });
    return { sunday, saturday };
  };

  const { sunday, saturday } = getCurrentWeekDates();
  
  // Use React Query for data fetching with proper caching
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['reports', 'everyday-sales', format(sunday, "yyyy-MM-dd"), format(saturday, "yyyy-MM-dd"), restaurantId],
    queryFn: async () => {
      try {
        console.log("Fetching everyday sales with params:", {
          start_date: format(sunday, "yyyy-MM-dd"),
          end_date: format(saturday, "yyyy-MM-dd"),
          restaurant_id: parseInt(restaurantId.toString()),
        });
        
        const response = await reportsApi.getEverydaySalesReport({
          start_date: format(sunday, "yyyy-MM-dd"),
          end_date: format(saturday, "yyyy-MM-dd"),
          restaurant_id: parseInt(restaurantId.toString())
        });

        console.log("Everyday sales API response:", response);
        
        // Handle direct response format
        if (response && response.data) {
          if (typeof response.data === 'object') {
            // Case 1: Data is directly in the response.data
            if (Object.keys(response.data).some(key => !isNaN(Number(key)))) {
              console.log("Using direct data format", response.data);
              return {
                data: response.data
              };
            }
            
            // Case 2: Data is nested in response.data.data
            if (response.data.data && typeof response.data.data === 'object') {
              console.log("Using nested data format", response.data.data);
              return {
                data: response.data.data
              };
            }
          }
        }
        
        // Return empty result if we can't recognize the structure
        console.warn('Unexpected response format from everyday sales API:', response);
        return {
          data: {}
        };
      } catch (error) {
        console.error("Error fetching report data:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000 // 5 minutes cache
  });

  // Format currency
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  return {
    data: data || { data: {} },
    isLoading,
    error,
    refetch,
    weekDates: {
      sunday,
      saturday
    },
    formatCurrency
  };
}; 