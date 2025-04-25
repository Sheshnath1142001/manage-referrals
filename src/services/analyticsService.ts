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

  async getSEOData(): Promise<SEOData> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/seo`);
      if (!response.ok) {
        throw new Error('Failed to fetch SEO data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching SEO data:', error);
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

  async getAnalyticsDataWithCache(): Promise<AnalyticsData> {
    const cacheKey = 'analytics_data';
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();
      const cacheAge = now - timestamp;

      // Cache is valid for 5 minutes
      if (cacheAge < 5 * 60 * 1000) {
        return data;
      }
    }

    const data = await this.getAnalyticsData();
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: new Date().getTime()
    }));

    return data;
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}

export const analyticsService = new AnalyticsService();