export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  userGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  topProducts: Array<{
    id: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
  userDemographics: {
    ageGroups: Array<{
      range: string;
      count: number;
    }>;
    genderDistribution: {
      male: number;
      female: number;
      other: number;
    };
  };
}

export interface SEOData {
  organicTraffic: number;
  keywordRankings: Array<{
    keyword: string;
    position: number;
    change: number;
  }>;
  backlinks: number;
  domainAuthority: number;
  pageSpeedScore: number;
  mobileFriendly: boolean;
  indexedPages: number;
  crawlErrors: number;
}

export interface TrafficData {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  trafficSources: {
    direct: number;
    organic: number;
    referral: number;
    social: number;
    paid: number;
  };
  topPages: Array<{
    url: string;
    views: number;
    averageTimeOnPage: number;
  }>;
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

export interface PerformanceData {
  loadTime: number;
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  serverResponseTime: number;
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
}