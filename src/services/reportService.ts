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
  EverydaySaleData,
  CategorySalesData
} from '../types/reports';

const API_BASE_URL = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reportService = {
  // Sales Report
  getSalesReport: async (params: ReportParams): Promise<ReportResponse<SalesReportData>> => {
    const { data } = await api.get('/sales-data', { params });
    return data;
  },

  // Entity Sales Report
  getEntitySalesReport: async (params: ReportParams): Promise<ReportResponse<EntitySalesData[]>> => {
    const { data } = await api.get('/entity-sales-data', { params });
    return data;
  },

  // Modifier Sales Report
  getModifierSalesReport: async (params: ReportParams): Promise<ReportResponse<ModifierSalesData[]>> => {
    const { data } = await api.get('/modifier-sales-data', { params });
    return data;
  },

  // Login Report
  getLoginReport: async (params: ReportParams): Promise<ReportResponse<LoginReportData[]>> => {
    const { data } = await api.get('/login-data', { params });
    return data;
  },

  // Cash Sale Report
  getCashSaleReport: async (params: Pick<ReportParams, 'date' | 'restaurant_id'>): Promise<ReportResponse<CashCardReportData>> => {
    const { data } = await api.get('/report/per-day-cash-sale', { params });
    return data;
  },

  // Card Sale Report
  getCardSaleReport: async (params: Pick<ReportParams, 'date' | 'restaurant_id'>): Promise<ReportResponse<CashCardReportData>> => {
    const { data } = await api.get('/report/per-day-card-sale', { params });
    return data;
  },

  // Hourly Sales Report
  getHourlySalesReport: async (params: ReportParams): Promise<ReportResponse<HourlySalesData[]>> => {
    const { data } = await api.get('/hourly-sales-data', { params });
    return data;
  },

  // Top Performers Report
  getTopPerformersReport: async (params: ReportParams): Promise<ReportResponse<TopPerformerData[]>> => {
    const { data } = await api.get('/top-performers-data', { params });
    return data;
  },

  // Refund Report
  getRefundReport: async (params: ReportParams): Promise<ReportResponse<RefundData[]>> => {
    const { data } = await api.get('/refunded-orders', { params });
    return data;
  },

  // Everyday Sales Report
  getEverydaySalesReport: async (params: ReportParams): Promise<ReportResponse<EverydaySaleData[]>> => {
    const { data } = await api.get('/everyday-sale-report', { params });
    return data;
  },

  // Category Sales Report
  getCategorySalesReport: async (params: ReportParams): Promise<ReportResponse<CategorySalesData[]>> => {
    const { data } = await api.get('/category-sales', { params });
    return data;
  },
}; 