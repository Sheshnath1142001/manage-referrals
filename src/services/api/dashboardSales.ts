
import { api } from './client';

export interface DashboardSalesParams {
  period: 'today' | 'yesterday' | 'current_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';
  start_date?: string;
  end_date?: string;
}

export interface DashboardSalesResponse {
  success: boolean;
  data: {
    sales_data: Array<{
      date: string;
      display_label: string;
      day_of_week: string;
      [key: string]: string | number; // For restaurant names and their sales values
    }>;
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

export const dashboardSalesApi = {
  getDashboardSales: async (params: DashboardSalesParams): Promise<DashboardSalesResponse> => {
    try {
      const response = await api.get<DashboardSalesResponse>('/v2/dashboard/sales', { params });
      return response;
    } catch (error) {
      console.error('Dashboard sales API error:', error);
      throw error;
    }
  }
};
