import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/api/reports';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface UseTopPerformersReportParams {
  restaurantId: string | number;
  selectedDate?: Date;
  userId?: string | number;
}

interface PerformerData {
  sale: string;
  total_orders: string;
  restaurant_id: string;
  restaurant_name: string;
  performers_id: string;
  performers_name: string;
  group_clause: string;
}

interface PerformerDailyData {
  [date: string]: PerformerData;
}

interface ApiResponse {
  data: {
    [performerId: string]: PerformerDailyData;
  };
  total: number;
}

export const useTopPerformersReport = ({ 
  restaurantId, 
  selectedDate = new Date(),
  userId = '0'
}: UseTopPerformersReportParams) => {
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
    queryKey: ['reports', 'top-performers', format(sunday, "yyyy-MM-dd"), format(saturday, "yyyy-MM-dd"), restaurantId, userId],
    queryFn: async () => {
      try {
        console.log("Fetching top performers with params:", {
          start_date: format(sunday, "yyyy-MM-dd"),
          end_date: format(saturday, "yyyy-MM-dd"),
          restaurant_id: parseInt(restaurantId.toString()),
          user_id: userId
        });
        
        const response = await reportsApi.getTopPerformersReport({
          report_type: 1,
          start_date: format(sunday, "yyyy-MM-dd"),
          end_date: format(saturday, "yyyy-MM-dd"),
          restaurant_id: parseInt(restaurantId.toString()),
          week_start_date: "Sunday",
          user_id: userId.toString()
        });

        console.log("Top performers API raw response:", response);
        
        // Direct structure like: { data: { "1053": { "2025-04-30": { ... } } } }
        if (response && response.data) {
          console.log("Response data structure:", {
            keys: Object.keys(response.data),
            isObject: typeof response.data === 'object',
            hasNestedData: response.data.data !== undefined,
            nestedDataType: response.data.data ? typeof response.data.data : 'undefined'
          });
          
          // Case 1: Data is nested under data.data
          if (response.data.data && typeof response.data.data === 'object') {
            console.log("Case 1: Using nested data.data", response.data.data);
            return {
              data: response.data.data || {},
              total: response.data.total || 0
            };
          }
          
          // Case 2: Data is directly at the top level in data
          if (Object.keys(response.data).some(key => !isNaN(Number(key)))) {
            console.log("Case 2: Using direct data", response.data);
            return {
              data: response.data,
              total: Object.keys(response.data).length
            };
          }
          
          // Case 3: Data might be in an unexpected format, try to extract
          console.log("Case 3: Attempting to extract data from unexpected format");
          const keys = Object.keys(response.data);
          for (const key of keys) {
            const value = response.data[key];
            if (typeof value === 'object' && value !== null) {
              console.log(`Found object at key ${key}, trying this as data`, value);
              return {
                data: value,
                total: Object.keys(value).length
              };
            }
          }
        }
        
        // Return an empty result if we can't recognize the structure
        console.warn('Unexpected response format from top performers API:', response);
        return {
          data: {},
          total: 0
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
    data: data || { data: {}, total: 0 },
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