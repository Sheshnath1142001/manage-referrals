
import { AnalyticsData, SEOData, TrafficData, PerformanceData } from '../types/analytics';

class AnalyticsService {
  // Replace API calls with dummy data

  async getAnalyticsData(): Promise<AnalyticsData> {
    // Return dummy analytics data
    const dummyData: AnalyticsData = {
      totalUsers: 1250,
      activeUsers: 850,
      totalOrders: 3200,
      revenue: 45600,
      averageOrderValue: 14.25,
      conversionRate: 2.8,
      userGrowth: 12.5,
      orderGrowth: 8.7,
      revenueGrowth: 15.2,
      topProducts: [
        { id: "p1", name: "Classic Taco", orders: 450, revenue: 3825 },
        { id: "p2", name: "Veggie Burrito", orders: 325, revenue: 3574 },
        { id: "p3", name: "Chicken Quesadilla", orders: 280, revenue: 2793 }
      ],
      userDemographics: {
        ageGroups: [
          { range: "18-24", count: 320 },
          { range: "25-34", count: 480 },
          { range: "35-44", count: 250 },
          { range: "45-54", count: 120 },
          { range: "55+", count: 80 }
        ],
        genderDistribution: {
          male: 48,
          female: 51,
          other: 1
        }
      },
      traffic: {
        currentVisitors: 86,
        pageViews: 1450,
        bounceRate: 32,
        averageSessionDuration: 185
      },
      seo: {
        averageLoadTime: 2.4,
        mobileFriendlyPages: 42,
        totalBacklinks: 860,
        keywordRankings: {
          "food truck near me": [2, 1, 3],
          "mexican food truck": [5, 4, 4],
          "street tacos": [8, 7, 6]
        },
        mobileScore: 92,
        backlinkGrowth: 5.3
      },
      performance: {
        averageLoadTime: 2.4,
        errorRate: 0.8,
        apiResponseTime: 180
      },
      conversions: {
        totalBookings: 250,
        totalOrders: 3200,
        conversionRate: 2.8,
        revenue: 45600
      }
    };
    
    return Promise.resolve(dummyData);
  }

  async getSEOMetrics(): Promise<SEOData> {
    // Return dummy SEO data
    const dummyData: SEOData = {
      organicTraffic: 2800,
      keywordRankings: [
        { keyword: "food truck near me", position: 2, change: 1 },
        { keyword: "mexican food truck", position: 4, change: 0 },
        { keyword: "street tacos", position: 7, change: -1 }
      ],
      backlinks: 860,
      domainAuthority: 42,
      pageSpeedScore: 88,
      mobileFriendly: true,
      indexedPages: 65,
      crawlErrors: 3,
      mobileScore: 92,
      mobileFriendlyPages: 42,
      totalBacklinks: 860,
      averageLoadTime: 2.4,
      backlinkGrowth: 5.3
    };
    
    return Promise.resolve(dummyData);
  }

  async getTrafficData(): Promise<TrafficData> {
    // Return dummy traffic data
    const dummyData: TrafficData = {
      totalVisitors: 4500,
      uniqueVisitors: 3200,
      pageViews: 12000,
      averageSessionDuration: 185,
      bounceRate: 32,
      trafficSources: {
        direct: 35,
        organic: 42,
        referral: 15,
        social: 8,
        paid: 0
      },
      topPages: [
        { url: "/", views: 2800, averageTimeOnPage: 120 },
        { url: "/search", views: 1200, averageTimeOnPage: 180 },
        { url: "/food-trucks/taco-delight", views: 850, averageTimeOnPage: 240 }
      ],
      deviceTypes: {
        desktop: 35,
        mobile: 60,
        tablet: 5
      },
      currentVisitors: 86
    };
    
    return Promise.resolve(dummyData);
  }

  async getPerformanceData(): Promise<PerformanceData> {
    // Return dummy performance data
    const dummyData: PerformanceData = {
      loadTime: 2.4,
      timeToFirstByte: 0.8,
      firstContentfulPaint: 1.2,
      largestContentfulPaint: 2.8,
      cumulativeLayoutShift: 0.03,
      firstInputDelay: 75,
      serverResponseTime: 120,
      apiResponseTime: 180,
      errorRate: 0.8,
      uptime: 99.97,
      averageLoadTime: 2.4
    };
    
    return Promise.resolve(dummyData);
  }

  // Helper method to format numbers with appropriate units
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  // Helper method to calculate growth percentage
  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }
}

export const analyticsService = new AnalyticsService();
