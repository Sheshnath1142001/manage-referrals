import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/api/reports';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface UseCashCardReportParams {
  restaurantId: string | number;
  selectedDate?: Date;
}

export const useCashCardReport = ({ restaurantId, selectedDate = new Date() }: UseCashCardReportParams) => {
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
    queryKey: ['reports', 'cash-card', format(sunday, "yyyy-MM-dd"), format(saturday, "yyyy-MM-dd"), restaurantId],
    queryFn: async () => {
      try {
        const response = await reportsApi.getSalesReport({
          report_type: 1,
          start_date: format(sunday, "yyyy-MM-dd"),
          end_date: format(saturday, "yyyy-MM-dd"),
          restaurant_id: parseInt(restaurantId.toString()),
          week_start_date: "Sunday"
        });

        if (response) {
          // Ensure we have a valid data structure
          return {
            data: response.data || {},
            total: response.total || 0,
            message: response.message
          };
        } else {
          // Handle case where response is null or undefined
          return {
            data: {},
            total: 0
          };
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000 // 5 minutes cache
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
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