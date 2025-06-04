import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import axios from 'axios';

interface UseCategorySalesReportParams {
  restaurantId: string | number;
  selectedDate?: Date;
  periodType?: number;
}

interface CategorySalesData {
  category_id: string;
  category_name: string;
  group_clause: string;
  total_sales: number;
  total_sold_quantity: number;
}

interface CategoryData {
  [date: string]: CategorySalesData;
}

interface ApiResponse {
  [categoryId: string]: CategoryData;
}
const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';
export const useCategorySalesReport = ({ 
  restaurantId, 
  selectedDate = new Date(), 
  periodType = 1 
}: UseCategorySalesReportParams) => {
  // Get date range based on selected date and period type
  const getDateRangeForPeriod = () => {
    switch (periodType) {
      case 0: // Day
        return { 
          startDate: selectedDate,
          endDate: selectedDate
        };
      case 1: // Week
        const sunday = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const saturday = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return { 
          startDate: sunday,
          endDate: saturday 
        };
      case 2: // Month
        return { 
          startDate: startOfMonth(selectedDate), 
          endDate: endOfMonth(selectedDate) 
        };
      case 3: // Year
        return { 
          startDate: startOfYear(selectedDate), 
          endDate: endOfYear(selectedDate) 
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
        // Using the exact URL provided
        const url = `${apiBaseUrl}/category-sales`;
        const params = {
          report_type: periodType + 1, // Converting to API's expected report_type
          date: format(selectedDate, "yyyy-MM-dd"),
          restaurant_id: parseInt(restaurantId.toString()),
          week_start_date: "Sunday"
        };
        
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

        return response.data;
      } catch (error) {
        console.error("Error fetching category sales data:", error);
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