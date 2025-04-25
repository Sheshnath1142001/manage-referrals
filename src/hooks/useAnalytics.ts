
import { useState, useEffect } from 'react';
import { AnalyticsData } from '../types/analytics';

export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use dummy data instead of real API calls
      const dummyData: AnalyticsData = {
        seo: {
          mobileScore: 85,
          averageLoadTime: 320,
          mobileFriendlyPages: 42,
          totalBacklinks: 187,
          backlinkGrowth: 12,
          keywordRankings: {
            "food trucks": [3, 5, 7],
            "mobile food": [12],
            "street food": [8]
          }
        },
        traffic: {
          currentVisitors: 128,
          pageViews: 1450,
          bounceRate: 35,
          averageSessionDuration: 184
        },
        performance: {
          averageLoadTime: 310,
          errorRate: 2.5,
          apiResponseTime: 180
        },
        conversions: {
          totalBookings: 83,
          totalOrders: 146,
          conversionRate: 3.8,
          revenue: 4320
        }
      };

      setAnalyticsData(dummyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
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
    loading,
    error,
    refreshData,
  };
};
