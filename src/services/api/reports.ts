import { api } from './client';
import axios from 'axios';
import { 
  ReportParams, 
  ReportResponse,
  SalesReportData,
  EntitySalesData,
  ModifierSalesData,
  LoginReportData,
  CashCardReportData,
  HourlySalesData,
  TopPerformerData,
  RefundData,
  CategorySalesData
} from '@/types/reports';

// Define a more accurate type based on the provided API response
interface EverydaySaleReportItem {
  created_date: string;
  num_items_sold: string;
  sales_price: string;
  restaurant_id: string;
  restaurant_name: string;
  group_clause: string;
}

interface EverydaySaleReportRestaurantData {
  [date: string]: EverydaySaleReportItem;
}

interface EverydaySaleReportApiResponseData {
  [restaurantId: string]: EverydaySaleReportRestaurantData;
}

// Helper function to get auth token
const getAuthToken = (): string => {
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
  return token;
};

// Helper function to get user timezone
const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error detecting timezone:', error);
    return 'UTC';
  }
};

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const reportsApi = {
  // Sales Report
  getSalesReport: async (params: ReportParams) => {
    // Using the exact URL as specified in requirements
    const url = `${apiBaseUrl}/sales-data`;
    const token = getAuthToken();
    
    const response = await axios.get(url, {
      params,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Timezone': getUserTimezone()
      }
    });
    
    return response.data;
  },

  // Entity Sales Report
  getEntitySalesReport: async (params: ReportParams) => {
    return api.get<ReportResponse<EntitySalesData[]>>('/entity-sales-data', { params });
  },

  // Modifier Sales Report
  getModifierSalesReport: async (params: ReportParams) => {
    return api.get<ReportResponse<ModifierSalesData[]>>('/modifier-sales-data', { params });
  },

  // Login Report
  getLoginReport: async (params: ReportParams) => {
    return api.get<ReportResponse<LoginReportData[]>>('/login-data', { params });
  },

  // Cash Sale Report
  getCashSaleReport: async (params: Pick<ReportParams, 'date' | 'restaurant_id'>) => {
    return api.get<ReportResponse<CashCardReportData>>('/cash-sale-data', { params });
  },

  // Card Sale Report
  getCardSaleReport: async (params: Pick<ReportParams, 'date' | 'restaurant_id'>) => {
    return api.get<ReportResponse<CashCardReportData>>('/card-sale-data', { params });
  },

  // Hourly Sales Report
  getHourlySalesReport: async (params: ReportParams) => {
    return api.get<ReportResponse<HourlySalesData[]>>('/hourly-sales-data', { params });
  },

  // Top Performers Report
  getTopPerformersReport: async (params: ReportParams) => {
    return api.get<ReportResponse<TopPerformerData[]>>('/top-performers-data', { params });
  },

  // Refund Report
  getRefundReport: async (params: ReportParams) => {
    return api.get<ReportResponse<RefundData[]>>('/refund-data', { params });
  },

  // Everyday Sales Report - Using the refined type
  getEverydaySalesReport: async (params: Pick<ReportParams, 'start_date' | 'end_date' | 'restaurant_id'>) => {
    return api.get<ReportResponse<EverydaySaleReportApiResponseData>>('/everyday-sale-report', { params });
  },

  // Category Sales Report
  getCategorySalesReport: async (params: ReportParams) => {
    return api.get<ReportResponse<CategorySalesData[]>>('/category-sales-data', { params });
  }
}; 