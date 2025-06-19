
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardSalesApi, DashboardSalesParams } from '@/services/api/dashboardSales';
import { useToast } from './use-toast';

export const useDashboardSales = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<DashboardSalesParams['period']>('current_week');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  // Query for dashboard sales
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', 'sales', period, startDate, endDate],
    queryFn: async () => {
      const params: DashboardSalesParams = {
        period
      };

      if (period === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      try {
        console.log('Fetching dashboard sales with params:', params);
        return await dashboardSalesApi.getDashboardSales(params);
      } catch (err) {
        console.error('Dashboard sales fetch error:', err);
        toast({
          title: 'Error',
          description: 'Failed to fetch dashboard sales data',
          variant: 'destructive'
        });
        throw err;
      }
    },
    refetchOnWindowFocus: false
  });

  const handlePeriodChange = (newPeriod: DashboardSalesParams['period']) => {
    console.log('Period changed to:', newPeriod);
    setPeriod(newPeriod);
    
    // Reset custom date range if not choosing custom
    if (newPeriod !== 'custom') {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    
    // Set period to custom when manually setting date range
    setPeriod('custom');
  };

  return {
    // Data
    salesData: data?.data?.sales_data || [],
    totalSales: data?.data?.total_sales || 0,
    periodInfo: data?.data?.period_info,
    
    // Loading states
    isLoading,
    
    // Errors
    error,
    
    // State
    period,
    startDate,
    endDate,
    
    // Actions
    handlePeriodChange,
    handleDateRangeChange,
    refetch
  };
};
