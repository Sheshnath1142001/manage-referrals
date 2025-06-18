import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  dashboardApi, 
  DashboardMetricsParams, 
  DashboardMetricsResponse, 
  TopSellingItemsParams,
  TopSellingItem,
  OngoingOrdersParams,
  OngoingOrder,
  WeeklySalesParams,
  SalesDataItem,
  OverviewParams,
  HourlySalesDistribution
} from '@/services/api/dashboard';
import { useToast } from './use-toast';
import { useGetRestaurants } from './useGetRestaurants';

// Configuration options for component behavior
interface DashboardConfig {
  // If true, ongoing orders will always show today's data regardless of selected period
  fixedOngoingOrders?: boolean;
  // If true, overview will always show today's data regardless of selected period
  fixedOverview?: boolean;
  // If true, weekly sales will always show current week data regardless of selected period
  fixedWeeklySales?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: DashboardConfig = {
  fixedOngoingOrders: true,
  fixedOverview: true,
  fixedWeeklySales: true
};

export const useDashboardMetrics = (config: DashboardConfig = DEFAULT_CONFIG) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState<DashboardMetricsParams['period']>('today');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  // Merge provided config with defaults
  const effectiveConfig = { ...DEFAULT_CONFIG, ...config };

  // Query for dashboard metrics
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', 'metrics', period, startDate, endDate],
    queryFn: async () => {
      const params: DashboardMetricsParams = {};

      if (period) {
        params.period = period;
      }

      if (period === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      try {
        return await dashboardApi.getDashboardMetrics(params);
      } catch (err) {
        
        toast({
          title: 'Error',
          description: 'Failed to fetch dashboard metrics',
          variant: 'destructive'
        });
        throw err;
      }
    },
    refetchOnWindowFocus: false
  });

  // Query for top selling items
  const {
    data: topSellingItemsData,
    isLoading: isLoadingTopItems,
    error: topItemsError,
    refetch: refetchTopItems
  } = useQuery({
    queryKey: ['dashboard', 'top-selling-items', period, startDate, endDate],
    queryFn: async () => {
      const params: TopSellingItemsParams = {
        period,
        limit: 10
      };

      if (period === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      try {
        return await dashboardApi.getTopSellingItems(params);
      } catch (err) {
        
        toast({
          title: 'Error',
          description: 'Failed to fetch top selling items',
          variant: 'destructive'
        });
        throw err;
      }
    },
    refetchOnWindowFocus: false
  });

  // Query for ongoing orders - always use today's data if fixedOngoingOrders is true
  const {
    data: ongoingOrdersData,
    isLoading: isLoadingOngoingOrders,
    error: ongoingOrdersError,
    refetch: refetchOngoingOrders
  } = useQuery({
    // Only include period in query key if we're not using fixed period
    queryKey: effectiveConfig.fixedOngoingOrders 
      ? ['dashboard', 'ongoing-orders'] 
      : ['dashboard', 'ongoing-orders', period, startDate, endDate],
    queryFn: async () => {
      const params: OngoingOrdersParams = {
        limit: 10
      };

      // Use today's data for ongoing orders if fixedOngoingOrders is true
      // Otherwise use selected period

      try {
        return await dashboardApi.getOngoingOrders(params);
      } catch (err) {
        
        toast({
          title: 'Error',
          description: 'Failed to fetch ongoing orders',
          variant: 'destructive'
        });
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    refetchInterval: 60000 // Refresh every minute
  });

  // Query for weekly sales data - always use current week data if fixedWeeklySales is true
  const {
    data: weeklySalesData,
    isLoading: isLoadingWeeklySales,
    error: weeklySalesError,
    refetch: refetchWeeklySales
  } = useQuery({
    // Only include period in query key if we're not using fixed period
    queryKey: effectiveConfig.fixedWeeklySales 
      ? ['dashboard', 'weekly-sales', 'current_week'] 
      : ['dashboard', 'weekly-sales', period, startDate, endDate],
    queryFn: async () => {
      // For weekly sales, either use current_week (if fixed) or determine based on selected period
      const effectivePeriod = effectiveConfig.fixedWeeklySales 
        ? 'current_week' 
        : (period === 'today' || period === 'yesterday' ? 'current_week' : period);
        
      const params: WeeklySalesParams = {
        period: effectivePeriod
      };

      if (!effectiveConfig.fixedWeeklySales && period === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      try {
        return await dashboardApi.getWeeklySales(params);
      } catch (err) {
        
        toast({
          title: 'Error',
          description: 'Failed to fetch weekly sales data',
          variant: 'destructive'
        });
        throw err;
      }
    },
    refetchOnWindowFocus: false
  });
  
  // Query for overview data - always use today's data if fixedOverview is true
  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    error: overviewError,
    refetch: refetchOverview
  } = useQuery({
    // Only include period in query key if we're not using fixed period
    queryKey: effectiveConfig.fixedOverview 
      ? ['dashboard', 'overview', 'today'] 
      : ['dashboard', 'overview', period, startDate, endDate],
    queryFn: async () => {
      const params: OverviewParams = {
        // For overview, either use 'today' (if fixed) or the selected period
        period: effectiveConfig.fixedOverview ? 'today' : period
      };

      if (!effectiveConfig.fixedOverview && period === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      try {
        return await dashboardApi.getOverview(params);
      } catch (err) {
        
        toast({
          title: 'Error',
          description: 'Failed to fetch dashboard overview',
          variant: 'destructive'
        });
        throw err;
      }
    },
    refetchOnWindowFocus: false
  });

  // Process weekly sales data to extract restaurant names and create formatted data for the chart
  const processedWeeklySalesData = useMemo(() => {
    if (!weeklySalesData?.data?.sales_data) return { chartData: [], restaurants: [], colors: {}, totalSales: 0 };

    const salesData = weeklySalesData.data.sales_data;
    const totalSales = weeklySalesData.data.total_sales;
    
    // Extract restaurant names - get all keys except 'date', 'display_label', and 'day_of_week'
    const restaurants = Object.keys(salesData[0] || {}).filter(key => 
      !['date', 'display_label', 'day_of_week'].includes(key)
    );
    
    // Assign colors to each restaurant
    const colorPalette = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b'];
    const colors: Record<string, string> = {};
    restaurants.forEach((restaurant, index) => {
      colors[restaurant] = colorPalette[index % colorPalette.length];
    });

    // Format data for chart
    const chartData = salesData.map(item => ({
      date: item.display_label,
      ...restaurants.reduce((acc, restaurant) => {
        acc[restaurant] = item[restaurant] as number;
        return acc;
      }, {} as Record<string, number>)
    }));

    return {
      chartData,
      restaurants,
      colors,
      totalSales
    };
  }, [weeklySalesData]);

  const handlePeriodChange = (newPeriod: DashboardMetricsParams['period']) => {
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

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format time helper (convert minutes to hours and minutes)
  const formatTime = (timeInMinutes: string) => {
    const minutes = parseInt(timeInMinutes);
    if (isNaN(minutes)) return timeInMinutes;
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      
      if (remainingHours === 0 && remainingMinutes === 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
      } else if (remainingMinutes === 0) {
        return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hr`;
      } else {
        return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hr ${remainingMinutes} min`;
      }
    }
    
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${remainingMinutes} min`;
  };

  // Refresh all dashboard data
  const refreshAllData = () => {
    refetch();
    refetchTopItems();
    refetchOngoingOrders();
    refetchWeeklySales();
    refetchOverview();
  };

  return {
    // Data
    metrics: data?.data,
    topSellingItems: topSellingItemsData?.data || [],
    topSellingItemsPeriodInfo: topSellingItemsData?.period_info,
    ongoingOrders: ongoingOrdersData?.data?.orders || [],
    totalActiveOrders: ongoingOrdersData?.data?.total_active_orders || 0,
    weeklySales: processedWeeklySalesData.chartData,
    weeklySalesRestaurants: processedWeeklySalesData.restaurants,
    weeklySalesColors: processedWeeklySalesData.colors,
    totalWeeklySales: processedWeeklySalesData.totalSales,
    weeklySalesPeriodInfo: weeklySalesData?.data?.period_info,
    overview: overviewData?.data,
    
    // Loading states
    isLoading,
    isLoadingTopItems,
    isLoadingOngoingOrders,
    isLoadingWeeklySales,
    isLoadingOverview,
    
    // Errors
    error,
    topItemsError,
    ongoingOrdersError,
    weeklySalesError,
    overviewError,
    
    // State
    period,
    startDate,
    endDate,
    
    // Actions
    handlePeriodChange,
    handleDateRangeChange,
    refetch,
    refetchTopItems,
    refetchOngoingOrders,
    refetchWeeklySales,
    refetchOverview,
    refreshAllData,
    
    // Helpers
    formatCurrency,
    formatTime,
    
    // Config
    config: effectiveConfig,
  };
}; 