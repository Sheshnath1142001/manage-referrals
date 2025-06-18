import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/api/reports';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { RefundData } from '@/types/reports';
import axios from 'axios';

interface UseRefundReportParams {
  restaurantId: string | number;
  selectedDate?: Date;
  periodType?: number;
}

interface RestaurantData {
  [date: string]: RefundData;
}
const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

interface ApiResponse {
  data: {
    [restaurantId: string]: {
      [date: string]: {
        restaurant_name: string;
        restaurant_id: string;
        sale: number;
        net_sale: number;
        total_orders: number;
        total_sold_items: number;
        total_refund_amount: number;
        total_refunded_items: number;
        total_cash_payment_amount: number;
        total_cash_payments: number;
        total_card_payment_amount: number;
        total_card_payments: number;
        total_card_payment_amount_online: number;
        total_card_payments_online: number;
        mobile_app_card_amount: number;
        mobile_app_payments: number;
        website_card_amount: number;
        website_card_payments: number;
        other_payments: {
          [method_id: string]: {
            amount: number;
            count: number;
            method_name: string;
            amount_label: string;
            count_label: string;
          }
        };
        group_clause: string;
      }
    }
  }
}

export const useRefundReport = ({ restaurantId, selectedDate = new Date(), periodType = 1 }: UseRefundReportParams) => {
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
  const sunday = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Needed for backward compatibility
  const saturday = endOfWeek(selectedDate, { weekStartsOn: 0 }); // Needed for backward compatibility
  
  // Use React Query for data fetching with proper caching
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['reports', 'refund', format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd"), restaurantId, periodType],
    queryFn: async () => {
      try {
        // Using the exact URL provided
        const url = `${apiBaseUrl}/sales-data`;
        const params = {
          report_type: periodType + 1, // Converting to API's expected report_type
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
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
    data: data || { data: {} },
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