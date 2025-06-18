export interface ReportParams {
  report_type?: number;
  start_date?: string;
  end_date?: string;
  restaurant_id?: number;
  platform_id?: number;
  week_start_date?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  sale_type?: number;
  timezone?: string;
  user_id?: string;
}

export interface SalesReportData {
  sale: number;
  total_orders: number;
  total_card_payment_amount: number;
  total_card_payments: number;
  total_cash_payment_amount: number;
  total_cash_payments: number;
  website_card_amount: number;
  website_card_payments: number;
  mobile_app_card_amount: number;
  mobile_app_payments: number;
  restaurant_name?: string;
  other_payments?: {
    [key: string]: {
      amount: number;
      count: number;
    };
  };
}

export interface ReportResponse<T> {
  data: T;
  total: number;
  message?: string;
}

export enum ReportType {
  Day = 1,
  Week = 2,
  Month = 3,
  Year = 4
}

export interface EntitySalesData {
  entity_name: string;
  quantity: number;
  total_amount: number;
}

export interface ModifierSalesData {
  modifier_name: string;
  quantity: number;
  total_amount: number;
  date?: string;
  item_name?: string;
  modifier_category?: string;
}

export interface LoginReportData {
  user_name: string;
  login_time: string;
  logout_time: string;
  duration: string;
}

export interface CashCardReportData {
  amount: number;
  transaction_count: number;
  transaction_details: Array<{
    order_id: string;
    amount: number;
    time: string;
  }>;
}

export interface HourlySalesData {
  hour: string;
  total_orders: string;
  total_amount: string;
  timestamp: string;
  restaurant_id: string;
  restaurant_name: string;
  sale: string;
  group_clause: string;
}

export interface TopPerformerData {
  item_name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface RefundData {
  order_id: string;
  refund_amount: number;
  refund_date: string;
  reason: string;
  restaurant_id: number;
  restaurant_name: string;
}

export interface EverydaySaleData {
  date: string;
  total_orders: number;
  total_amount: number;
}

export interface CategorySalesData {
  category_name: string;
  total_items: number;
  total_amount: number;
} 