import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears, addDays } from 'date-fns';
import axios from 'axios';

interface UseCategorySalesReportParams {
  restaurantId: string | number;
  selectedDate?: Date;
  periodType?: number;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const useCategorySalesReport = ({ 
  restaurantId, 
  selectedDate = new Date(), 
  periodType = 2 
}: UseCategorySalesReportParams) => {
  
  // Get date range based on selected date and period type
  const getDateRangeForPeriod = () => {
    switch (periodType) {
      case 1: // Day - Week containing the selected date
        return { 
          startDate: startOfWeek(selectedDate, { weekStartsOn: 0 }), // Selected date's week's Sunday
          endDate: endOfWeek(selectedDate, { weekStartsOn: 0 }) // Selected date's week's Saturday
        };
      case 2: // Week - Last 7 weeks from selected date
        const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const startDate = startOfWeek(subWeeks(selectedDate, 6), { weekStartsOn: 0 });
        return { 
          startDate,
          endDate: endOfWeek(currentWeekStart, { weekStartsOn: 0 })
        };
      case 3: // Month - Last 7 months from selected date
        const currentMonthStart = startOfMonth(selectedDate);
        const monthStartDate = startOfMonth(subMonths(selectedDate, 6));
        return { 
          startDate: monthStartDate,
          endDate: endOfMonth(currentMonthStart)
        };
      case 4: // Year - Last 7 years from selected date
        const currentYearStart = startOfYear(selectedDate);
        const yearStartDate = startOfYear(subYears(selectedDate, 6));
        return { 
          startDate: yearStartDate,
          endDate: endOfYear(currentYearStart)
        };
      default:
        const defaultSunday = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const defaultSaturday = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return { 
          startDate: defaultSunday,
          endDate: defaultSaturday 
        };
    }
  };

  const { startDate, endDate } = getDateRangeForPeriod();
  const sunday = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const saturday = endOfWeek(selectedDate, { weekStartsOn: 0 });
  
  // Use React Query for data fetching with proper caching
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['reports', 'category-sales', format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd"), restaurantId, periodType],
    queryFn: async () => {
      try {
        // Using the category-sales endpoint as specified
        const url = `${apiBaseUrl}/category-sales`;
        const params = {
          report_type: periodType,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          restaurant_id: parseInt(restaurantId.toString())
        };
        
        console.log('Category Sales API payload:', params);
        
        // Get the auth token from localStorage
        const adminData = localStorage.getItem('Admin');
        let token = '';
        if (adminData) {
          try {
            const admin = JSON.parse(adminData);
            if (admin && admin.token) {
              token = admin.token;
            }
          } catch (error) {
            console.error('Error parsing admin data:', error);
          }
        }
        
        // Make the API call
        const response = await axios.get(url, {
          params,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
          }
        });

        console.log('Category Sales API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Category Sales API error:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000, // 1 second cache to ensure fresh data
    gcTime: 0 // No garbage collection time to ensure fresh data
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
    data: data || {},
    isLoading,
    error,
    refetch,
    weekDates: {
      sunday,
      saturday
    },
    periodDates: {
      startDate,
      endDate
    },
    formatCurrency
  };
};
