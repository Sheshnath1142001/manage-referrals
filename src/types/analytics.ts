
export interface AnalyticsData {
  id?: string;
  date?: string;
  seo?: SEOData;
  traffic?: TrafficData;
  performance?: PerformanceData;
  conversions?: ConversionsData;
}

export interface SEOData {
  mobileScore?: number;
  averageLoadTime?: number;
  mobileFriendlyPages?: number;
  totalBacklinks?: number;
  backlinkGrowth?: number;
  keywordRankings?: Record<string, number[] | number>;
  socialEngagement?: {
    facebook?: number;
    twitter?: number;
    instagram?: number;
    linkedin?: number;
    pinterest?: number;
  };
}

export interface TrafficData {
  currentVisitors?: number;
  pageViews?: number;
  bounceRate?: number;
  averageSessionDuration?: number;
  sources?: Record<string, number>;
  deviceTypes?: Record<string, number>;
  uniqueVisitors?: number;
  returningVisitors?: number;
}

export interface PerformanceData {
  averageLoadTime?: number;
  errorRate?: number;
  apiResponseTime?: number;
  resourceUsage?: Record<string, number>;
  serverUptime?: number;
}

export interface ConversionsData {
  totalBookings?: number;
  totalOrders?: number;
  conversionRate?: number;
  revenue?: number;
  averageOrderValue?: number;
}
