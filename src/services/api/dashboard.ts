import { api } from './client';

export interface DashboardMetricsParams {
  start_date?: string;
  end_date?: string;
  period?: 'today' | 'yesterday' | 'current_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';
}

export interface TopSellingItemsParams {
  period?: 'today' | 'yesterday' | 'current_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export interface OngoingOrdersParams {
  limit?: number;
}

export interface WeeklySalesParams {
  period?: 'today' | 'yesterday' | 'current_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';
  start_date?: string;
  end_date?: string;
}

export interface OverviewParams {
  period?: 'today' | 'yesterday' | 'current_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';
  date?: string;
}

export interface MetricValue {
  value: number;
  percent_change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface OrderBreakdown {
  in_store: number;
  online: number;
  in_store_percent_change: number;
  online_percent_change: number;
  in_store_trend: 'up' | 'down' | 'neutral';
  online_trend: 'up' | 'down' | 'neutral';
}

export interface PaymentCollections {
  cash: number;
  card: number;
}

export interface PeriodInfo {
  comparison_label: string;
  current_period: {
    start: string;
    end: string;
    days: number;
  };
  previous_period: {
    start: string;
    end: string;
    days: number;
  };
  selected_period: string;
  selected_comparison: string;
  period_name: string;
  is_custom_range: boolean;
  comparison_metadata: {
    has_data: {
      current: boolean;
      previous: boolean;
    };
    data_summary: {
      current: {
        orders: number;
        sales: number;
      };
      previous: {
        orders: number;
        sales: number;
      };
    };
    note?: string;
  };
}

export interface TopSellingItem {
  id: number;
  name: string;
  orders: number;
  quantity: string;
  total_amount: string;
  avg_price: number;
}

export interface OngoingOrder {
  id: string;
  order_id: string;
  items: string[];
  status: string;
  time: string;
  attendant: string;
}

export interface SalesDataItem {
  date: string;
  display_label: string;
  day_of_week: string;
  [key: string]: string | number; // For restaurant names and their sales values
}

export interface HourlySalesDistribution {
  hour: string;
  hour_24: string;
  amount: number;
}

export interface TopSellingItemsResponse {
  success: boolean;
  data: TopSellingItem[];
  period_info: {
    selected_period: string;
    period_name: string;
    is_custom_range: boolean;
    date_range: {
      start: string;
      end: string;
      days: number;
    };
  };
}

export interface OngoingOrdersResponse {
  success: boolean;
  data: {
    orders: OngoingOrder[];
    total_active_orders: number;
  };
}

export interface WeeklySalesResponse {
  success: boolean;
  data: {
    sales_data: SalesDataItem[];
    total_sales: number;
    period_info: {
      selected_period: string;
      period_name: string;
      is_custom_range: boolean;
      date_range: {
        start: string;
        end: string;
        days: number;
      };
    };
  };
}

export interface OverviewResponse {
  success: boolean;
  data: {
    date: string;
    online_orders: number;
    in_store_orders: number;
    avg_prep_time: number;
    total_sales: number;
    hourly_sales: {
      distribution: HourlySalesDistribution[];
      peak_hour: string;
      peak_amount: number;
    };
  };
}

export interface DashboardMetricsResponse {
  success: boolean;
  data: {
    total_sales: MetricValue;
    total_orders: MetricValue;
    avg_order_value: MetricValue;
    total_customers: MetricValue;
    order_breakdown: OrderBreakdown;
    payment_collections: PaymentCollections;
    avg_processing_time: MetricValue;
    period_info: PeriodInfo;
  };
}

export const dashboardApi = {
  getDashboardMetrics: async (params: DashboardMetricsParams): Promise<DashboardMetricsResponse> => {
    try {
      const response = await api.get<DashboardMetricsResponse>('/v2/dashboard/metrics', { params });
      return response;
    } catch (error) {
      
      throw error;
    }
  },
  
  getTopSellingItems: async (params: TopSellingItemsParams): Promise<TopSellingItemsResponse> => {
    try {
      const response = await api.get<TopSellingItemsResponse>('/v2/dashboard/top-selling-items', { params });
      return response;
    } catch (error) {
      
      throw error;
    }
  },
  
  getOngoingOrders: async (params: OngoingOrdersParams): Promise<OngoingOrdersResponse> => {
    try {
      const response = await api.get<OngoingOrdersResponse>('/v2/dashboard/ongoing-orders', { params });
      return response;
    } catch (error) {
      
      throw error;
    }
  },
  
  getWeeklySales: async (params: WeeklySalesParams): Promise<WeeklySalesResponse> => {
    try {
      const response = await api.get<WeeklySalesResponse>('/v2/dashboard/sales', { params });
      return response;
    } catch (error) {
      
      throw error;
    }
  },
  
  getOverview: async (params: OverviewParams): Promise<OverviewResponse> => {
    try {
      const response = await api.get<OverviewResponse>('/v2/dashboard/overview', { params });
      return response;
    } catch (error) {
      
      throw error;
    }
  }
}; 