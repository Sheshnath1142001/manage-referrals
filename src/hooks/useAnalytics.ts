import { useState, useEffect } from 'react';
import { AnalyticsData, SEOData, TrafficData, PerformanceData } from '../types/analytics';
import { analyticsService } from '../lib/analyticsService';

export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analytics, seo, traffic, performance] = await Promise.all([
        analyticsService.getAnalyticsData(),
        analyticsService.getSEOMetrics(),
        analyticsService.getTrafficData(),
        analyticsService.getPerformanceData(),
      ]);

      setAnalyticsData(analytics);
      setSeoData(seo);
      setTrafficData(traffic);
      setPerformanceData(performance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const refreshData = () => {
    fetchAllData();
  };

  return {
    analyticsData,
    seoData,
    trafficData,
    performanceData,
    loading,
    error,
    refreshData,
  };
};