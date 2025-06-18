import { ArrowDown, ArrowUp, DollarSign, Users, ShoppingCart, ChartBar, RefreshCw, Store, TrendingUp, CalendarRange, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { useOrdersData } from "@/hooks/use-orders-data";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import RestaurantProducts from './RestaurantProducts';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'ready':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'preparing':
    case 'placed':
    case 'in progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<string>('today');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  
  // Use our dashboard metrics hook
  const {
    metrics,
    isLoading,
    period,
    handlePeriodChange,
    handleDateRangeChange: hookHandleDateRangeChange,
    refreshAllData,
    formatCurrency,
    topSellingItems,
    isLoadingTopItems,
    topSellingItemsPeriodInfo,
    ongoingOrders,
    totalActiveOrders,
    isLoadingOngoingOrders,
    weeklySales,
    weeklySalesRestaurants,
    weeklySalesColors,
    totalWeeklySales,
    isLoadingWeeklySales,
    weeklySalesPeriodInfo,
    formatTime,
    overview,
    isLoadingOverview,
  } = useDashboardMetrics();

  // Map the dateRange to period recognized by the API
  useEffect(() => {
    const periodMap: Record<string, any> = {
      'today': 'today',
      'yesterday': 'yesterday',
      'current-week': 'current_week',
      'last-week': 'last_week',
      'this-month': 'this_month',
      'last-month': 'last_month',
      'this-year': 'this_year',
      'last-year': 'last_year'
    };
    
    if (periodMap[dateRange]) {
      handlePeriodChange(periodMap[dateRange]);
    }
  }, [dateRange, handlePeriodChange]);

  // Handle custom date range changes
  useEffect(() => {
    if (customDateRange?.from && customDateRange?.to) {
      // Use a ref to track if this is a new selection to avoid infinite loops
      const startDate = format(customDateRange.from, 'yyyy-MM-dd');
      const endDate = format(customDateRange.to, 'yyyy-MM-dd');
      
      // Only update if both dates are defined
      hookHandleDateRangeChange(startDate, endDate);
      
      // Show toast notification about date range selection
      toast({
        title: "Custom date range selected",
        description: `Data from ${format(customDateRange.from, 'MMM d, yyyy')} to ${format(customDateRange.to, 'MMM d, yyyy')}`,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDateRange?.from?.getTime(), customDateRange?.to?.getTime()]);

  const handleDateRangeChange = (value: string) => {
    // Reset custom date range when selecting a preset period
    if (value !== 'custom') {
      setCustomDateRange(undefined);
    }
    
    setDateRange(value);
    toast({
      title: "Date range updated",
      description: "Dashboard data is being refreshed...",
    });
  };

  const handleRefresh = () => {
    refreshAllData();
    toast({
      title: "Refreshing dashboard...",
      description: "Your dashboard data is being updated.",
    });
  };

  const handleTotalSalesClick = () => {
    navigate('/reports/sales');
  };

  const handleTotalOrdersClick = () => {
    navigate('/transactions');
  };

  const handleCashCollectionsClick = () => {
    navigate('/reports/cash-card');
  };

  const handleCardCollectionsClick = () => {
    navigate('/reports/cash-card');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill || entry.color }} />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium">${entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const HourlySalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-600 mt-1">
            Sales: <span className="font-medium text-gray-900">${payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Transform live hourly sales distribution into the shape required by the chart
  const hourlySalesData = useMemo(() => {
    return (
      overview?.hourly_sales?.distribution?.map(({ hour, amount }) => ({
        hour,
        sales: amount,
      })) || []
    );
  }, [overview]);

  // Extract peak hour information
  const peakHour = overview?.hourly_sales?.peak_hour;
  const peakAmount = overview?.hourly_sales?.peak_amount;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 animate-fade-in">
                <CalendarRange className="h-4 w-4 ml-3 text-gray-500" />
                <Select defaultValue={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger className="w-full sm:w-[180px] border-0 focus:ring-0">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="current-week">Current Week</SelectItem>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === 'custom' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal animate-fade-in"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {customDateRange?.from ? (
                        customDateRange.to ? (
                          <>
                            {format(customDateRange.from, "MMM d")} - {format(customDateRange.to, "MMM d, yyyy")}
                          </>
                        ) : (
                          format(customDateRange.from, "MMM d, yyyy")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DatePickerWithRange
                      selected={customDateRange}
                      onSelect={setCustomDateRange}
                    />
                  </PopoverContent>
                </Popover>
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className="animate-fade-in"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="stat-card animate-fade-in cursor-pointer hover:shadow-lg transition-shadow" onClick={handleTotalSalesClick}>
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-title">Total Sales</p>
                <p className="stat-value text-xl sm:text-2xl lg:text-3xl">
                  {isLoading ? '—' : formatCurrency(metrics?.total_sales.value || 0)}
                </p>
                <p className={`stat-desc flex items-center ${
                  metrics?.total_sales.trend === 'up' ? 'text-green-500' : 
                  metrics?.total_sales.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {metrics?.total_sales.trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : 
                   metrics?.total_sales.trend === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : null}
                  {metrics?.total_sales.percent_change}% {metrics?.period_info?.comparison_label || 'vs Last Period'}
                </p>
              </div>
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="stat-card animate-fade-in cursor-pointer hover:shadow-lg transition-shadow" onClick={handleTotalOrdersClick}>
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-title">Total Orders</p>
                <p className="stat-value text-xl sm:text-2xl lg:text-3xl">
                  {isLoading ? '—' : metrics?.total_orders.value.toLocaleString() || 0}
                </p>
                <p className={`stat-desc flex items-center ${
                  metrics?.total_orders.trend === 'up' ? 'text-green-500' : 
                  metrics?.total_orders.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {metrics?.total_orders.trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : 
                   metrics?.total_orders.trend === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : null}
                  {metrics?.total_orders.percent_change}% {metrics?.period_info?.comparison_label || 'vs Last Period'}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="stat-card animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-title">Avg. Order Value</p>
                <p className="stat-value text-xl sm:text-2xl lg:text-3xl">
                  {isLoading ? '—' : formatCurrency(metrics?.avg_order_value.value || 0)}
                </p>
                <p className={`stat-desc flex items-center ${
                  metrics?.avg_order_value.trend === 'up' ? 'text-green-500' : 
                  metrics?.avg_order_value.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {metrics?.avg_order_value.trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : 
                   metrics?.avg_order_value.trend === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : null}
                  {metrics?.avg_order_value.percent_change}% {metrics?.period_info?.comparison_label || 'vs Last Period'}
                </p>
              </div>
              <ChartBar className="w-8 h-8 text-purple-500 opacity-80" />
            </div>
          </div>

          <div className="stat-card animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-title">Total Customers</p>
                <p className="stat-value text-xl sm:text-2xl lg:text-3xl">
                  {isLoading ? '—' : metrics?.total_customers.value.toLocaleString() || 0}
                </p>
                <p className={`stat-desc flex items-center ${
                  metrics?.total_customers.trend === 'up' ? 'text-green-500' : 
                  metrics?.total_customers.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {metrics?.total_customers.trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : 
                   metrics?.total_customers.trend === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : null}
                  {metrics?.total_customers.percent_change}% {metrics?.period_info?.comparison_label || 'vs Last Period'}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500 opacity-80" />
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="stat-card animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-title">Total Orders</p>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">In-Store</p>
                    <p className="text-base sm:text-lg font-semibold">
                      {isLoading ? '—' : metrics?.order_breakdown.in_store.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Online</p>
                    <p className="text-base sm:text-lg font-semibold">
                      {isLoading ? '—' : metrics?.order_breakdown.online.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <p className={`stat-desc flex items-center mt-2 ${
                  metrics?.order_breakdown.in_store_trend === 'up' ? 'text-green-500' : 
                  metrics?.order_breakdown.in_store_trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {metrics?.order_breakdown.in_store_trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : 
                   metrics?.order_breakdown.in_store_trend === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : null}
                  {metrics?.order_breakdown.in_store_percent_change}% In-Store {metrics?.period_info?.comparison_label || 'vs Last Period'}
                </p>
              </div>
              <Store className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 opacity-80" />
            </div>
          </div>

          <div className="stat-card animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-title">Avg Processing Time</p>
                <p className="stat-value text-xl sm:text-2xl lg:text-3xl">
                  {isLoading ? '—' : `${metrics?.avg_processing_time.value.toFixed(1) || 0} min`}
                </p>
                <p className={`stat-desc flex items-center ${
                  metrics?.avg_processing_time.trend === 'up' ? 'text-red-500' : 
                  metrics?.avg_processing_time.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                }`}>
                  {/* Note that for processing time, UP is usually BAD so we invert the indicators */}
                  {metrics?.avg_processing_time.trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : 
                   metrics?.avg_processing_time.trend === 'down' ? <ArrowDown className="w-3 h-3 mr-1" /> : null}
                  {metrics?.avg_processing_time.percent_change}% {metrics?.period_info?.comparison_label || 'vs Last Period'}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-500 opacity-80" />
            </div>
          </div>

          <div className="stat-card animate-fade-in cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCashCollectionsClick}>
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-title">Cash Collections</p>
                <p className="stat-value text-xl sm:text-2xl lg:text-3xl">
                  {isLoading ? '—' : formatCurrency(metrics?.payment_collections.cash || 0)}
                </p>
                <p className="stat-desc text-gray-500">
                  {metrics && metrics.payment_collections ? 
                    `${((metrics.payment_collections.cash / (metrics.payment_collections.cash + metrics.payment_collections.card)) * 100).toFixed(1)}% of total` : 
                    '—'
                  }
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="stat-card animate-fade-in cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCardCollectionsClick}>
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-title">Card Collections</p>
                <p className="stat-value text-xl sm:text-2xl lg:text-3xl">
                  {isLoading ? '—' : formatCurrency(metrics?.payment_collections.card || 0)}
                </p>
                <p className="stat-desc text-gray-500">
                  {metrics && metrics.payment_collections ? 
                    `${((metrics.payment_collections.card / (metrics.payment_collections.cash + metrics.payment_collections.card)) * 100).toFixed(1)}% of total` : 
                    '—'
                  }
                </p>
              </div>
              <svg 
                className="w-8 h-8 text-blue-500 opacity-80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-lg animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Weekly Sales by Restaurant
                {weeklySalesPeriodInfo && !isLoadingWeeklySales && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({weeklySalesPeriodInfo.period_name})
                  </span>
                )}
              </h2>
              <div className="text-xs sm:text-sm text-gray-500">
                Total sales: {isLoadingWeeklySales ? 'Loading...' : formatCurrency(totalWeeklySales || 0)}
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              {isLoadingWeeklySales ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : weeklySales.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>No sales data available</p>
                  <p className="text-sm mt-1">Try selecting a different time period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklySales}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    className="select-none"
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                    />
                    {weeklySalesRestaurants.map((restaurant, index) => (
                      <Bar 
                        key={restaurant}
                        dataKey={restaurant} 
                        name={restaurant} 
                        fill={weeklySalesColors[restaurant] || '#6366f1'} 
                        radius={[4, 4, 0, 0]} 
                        barSize={20} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {weeklySalesRestaurants.map((restaurant) => (
                <div key={restaurant} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: weeklySalesColors[restaurant] || '#6366f1' }}
                  ></div>
                  <div className="text-sm font-medium text-gray-700">{restaurant}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg animate-fade-in h-[400px] sm:h-[532px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Top Selling Items
                {topSellingItemsPeriodInfo && !isLoadingTopItems && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({topSellingItemsPeriodInfo.period_name})
                  </span>
                )}
              </h2>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-3 sm:space-y-4 h-[calc(100%-4rem)] overflow-auto pr-2">
              {isLoadingTopItems ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : topSellingItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>No data available</p>
                  <p className="text-sm mt-1">Try selecting a different time period</p>
                </div>
              ) : (
                topSellingItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors animate-fade-in"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 w-6">{`#${index + 1}`}</span>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.orders} orders ({item.quantity} units)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(parseFloat(item.total_amount))}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.avg_price)}/unit</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 bg-white rounded-xl shadow-lg p-3 sm:p-4 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                Ongoing POS Orders
              </h2>
              <p className="text-xs text-gray-500">Real-time view of current orders</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              {totalActiveOrders} Active Orders
            </Badge>
          </div>
          
          <div className="overflow-x-auto">
            {isLoadingOngoingOrders ? (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : ongoingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <p>No active orders</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-2 py-1.5 text-left">Order ID</th>
                    <th className="px-2 py-1.5 text-left">Items</th>
                    <th className="px-2 py-1.5 text-center">Status</th>
                    <th className="px-2 py-1.5 text-center">Time</th>
                    <th className="px-2 py-1.5 text-right">Attendant</th>
                  </tr>
                </thead>
                <tbody>
                  {ongoingOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-t border-gray-100">
                      <td className="px-2 py-1.5">{order.order_id}</td>
                      <td className="px-2 py-1.5">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="inline-block bg-gray-50 px-1 py-0.5 rounded border border-gray-100">
                              {item}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="inline-block bg-gray-50 px-1 py-0.5 rounded border border-gray-100">
                              +{order.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <Badge variant="secondary" className={`${getStatusColor(order.status)} text-[10px]`}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-2 py-1.5 text-center flex items-center justify-center">
                        <Clock className="w-2.5 h-2.5 mr-1" />
                        {formatTime(order.time)}
                      </td>
                      <td className="px-2 py-1.5 text-right">{order.attendant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {ongoingOrders.length > 5 && (
            <div className="mt-2 text-right">
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => navigate('/order-status')}
              >
                View all {totalActiveOrders} orders
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6 sm:mt-8 glass-card rounded-xl p-4 sm:p-6 animate-fade-in">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            {metrics?.period_info?.period_name || "Today's"} Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            <div className="p-4 rounded-lg bg-white/50 border border-gray-100">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Online Orders</p>
              <p className="text-xl sm:text-2xl font-semibold mt-1">
                {isLoading ? '—' : metrics?.order_breakdown.online.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/50 border border-gray-100">
              <p className="text-xs sm:text-sm font-medium text-gray-500">In-Store Orders</p>
              <p className="text-xl sm:text-2xl font-semibold mt-1">
                {isLoading ? '—' : metrics?.order_breakdown.in_store.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/50 border border-gray-100">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Average Prep Time</p>
              <p className="text-xl sm:text-2xl font-semibold mt-1">
                {isLoading ? '—' : `${metrics?.avg_processing_time.value.toFixed(1) || 0} min`}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Hourly Sales Distribution</h3>
              <div className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
                {isLoadingOverview
                  ? 'Loading...'
                  : peakHour
                  ? `Peak hour: ${peakHour} (${formatCurrency(peakAmount ?? 0)})`
                  : 'No data'}
              </div>
            </div>
            <div className="h-[250px] sm:h-[300px] w-full">
              {isLoadingOverview ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : hourlySalesData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={hourlySalesData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis 
                      dataKey="hour"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip content={<HourlySalesTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
