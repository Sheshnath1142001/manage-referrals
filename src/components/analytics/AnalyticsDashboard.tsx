
import React, { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

export const AnalyticsDashboard: React.FC = () => {
  const { analyticsData, loading, error } = useAnalytics();

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
      <p className="text-sm text-gray-500 mb-6">
        Last updated: {new Date().toLocaleString()}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Traffic Overview */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Current Visitors</h3>
          <p className="text-3xl font-bold">{analyticsData.traffic?.currentVisitors || 0}</p>
        </div>

        {/* Page Views */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Page Views</h3>
          <p className="text-3xl font-bold">{analyticsData.traffic?.pageViews || 0}</p>
        </div>

        {/* SEO Score */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Mobile Score</h3>
          <p className="text-3xl font-bold">{analyticsData.seo?.mobileScore || 0}%</p>
        </div>

        {/* Conversion Rate */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Conversion Rate</h3>
          <p className="text-3xl font-bold">{analyticsData.conversions?.conversionRate || 0}%</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Charts</h3>
        <div className="border rounded-lg p-6 bg-white shadow-sm flex items-center justify-center h-64">
          <p className="text-center text-gray-500">
            Charts require recharts and @mui/material libraries.<br />
            Please install these dependencies to view interactive charts.
          </p>
        </div>
      </div>
    </div>
  );
};
