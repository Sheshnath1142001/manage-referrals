import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/api/reports';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears } from 'date-fns';

interface UseTopPerformersReportParams {
  restaurantId: string | number;
  selectedDate?: Date;
  userId?: string | number;
  periodType?: string;
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

// We can now use the main ReportParams interface since we added user_id to it

export const useTopPerformersReport = ({ 
  restaurantId, 
  selectedDate = new Date(),
  userId = '0',
  periodType = 'day'
}: UseTopPerformersReportParams) => {
  
  // Function to get date range based on period type
  const getDateRangeForPeriod = () => {
    const currentDate = selectedDate;
    
    switch (periodType) {
      case "day":
        // For day: get current week (Sunday to Saturday)
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return {
          start_date: format(weekStart, "yyyy-MM-dd"),
          end_date: format(weekEnd, "yyyy-MM-dd"),
          report_type: 1
        };
      
      case "week":
        // For week: get from 7 weeks ago to current week
        const sevenWeeksAgo = subWeeks(currentDate, 6);
        const currentWeekStart = startOfWeek(sevenWeeksAgo, { weekStartsOn: 0 });
        const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return {
          start_date: format(currentWeekStart, "yyyy-MM-dd"),
          end_date: format(currentWeekEnd, "yyyy-MM-dd"),
          report_type: 2
        };
      
      case "month":
        // For month: get from 6 months ago to current month
        const sixMonthsAgo = subMonths(currentDate, 6);
        const monthStart = startOfMonth(sixMonthsAgo);
        const monthEnd = endOfMonth(currentDate);
        return {
          start_date: format(monthStart, "yyyy-MM-dd"),
          end_date: format(monthEnd, "yyyy-MM-dd"),
          report_type: 3
        };
      
      case "year":
        // For year: get from 2019 to current year
        const yearStart = new Date(2019, 0, 1); // January 1, 2019
        const yearEnd = endOfYear(currentDate);
        return {
          start_date: format(yearStart, "yyyy-MM-dd"),
          end_date: format(yearEnd, "yyyy-MM-dd"),
          report_type: 4
        };
      
      default:
        const defaultStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const defaultEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return {
          start_date: format(defaultStart, "yyyy-MM-dd"),
          end_date: format(defaultEnd, "yyyy-MM-dd"),
          report_type: 1
        };
    }
  };

  const { start_date, end_date, report_type } = getDateRangeForPeriod();
  
  // Use React Query for data fetching with proper caching
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['reports', 'top-performers', start_date, end_date, restaurantId, userId, periodType],
    queryFn: async () => {
      try {
        console.log("Fetching top performers with params:", {
          start_date,
          end_date,
          restaurant_id: parseInt(restaurantId.toString()),
          user_id: userId,
          report_type,
          period_type: periodType
        });
        
        const params = {
          report_type,
          start_date,
          end_date,
          restaurant_id: parseInt(restaurantId.toString()),
          week_start_date: "Sunday",
          user_id: userId.toString()
        };
        
        const response = await reportsApi.getTopPerformersReport(params);

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
            
            return {
              data: response.data.data || {},
              total: response.data.total || 0
            };
          }
          
          // Case 2: Data is directly at the top level in data
          if (Object.keys(response.data).some(key => !isNaN(Number(key)))) {
            
            return {
              data: response.data,
              total: Object.keys(response.data).length
            };
          }
          
          // Case 3: Data might be in an unexpected format, try to extract
          
          const keys = Object.keys(response.data);
          for (const key of keys) {
            const value = response.data[key];
            if (typeof value === 'object' && value !== null) {
              
              return {
                data: value,
                total: Object.keys(value).length
              };
            }
          }
        }
        
        // Return an empty result if we can't recognize the structure
        
        return {
          data: {},
          total: 0
        };
      } catch (error) {
        
        throw error;
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0 // Remove caching to always fetch fresh data
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
      sunday: new Date(start_date),
      saturday: new Date(end_date)
    },
    formatCurrency
  };
};
