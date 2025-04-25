import { AnalyticsData, SEOData, TrafficData, PerformanceData } from '../types/analytics';

class AnalyticsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  async getSEOMetrics(): Promise<SEOData> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/seo`);
      if (!response.ok) {
        throw new Error('Failed to fetch SEO metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching SEO metrics:', error);
      throw error;
    }
  }

  async getTrafficData(): Promise<TrafficData> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/traffic`);
      if (!response.ok) {
        throw new Error('Failed to fetch traffic data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      throw error;
    }
  }

  async getPerformanceData(): Promise<PerformanceData> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/performance`);
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching performance data:', error);
      throw error;
    }
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