import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Grid, Typography, Box, CircularProgress } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { io } from 'socket.io-client';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface AnalyticsData {
  timestamp: string;
  data: {
    traffic?: {
      currentVisitors: number;
      pageViews: number;
      bounceRate: number;
      averageSessionDuration: number;
    };
    seo?: {
      averageLoadTime: number;
      mobileFriendlyPages: number;
      totalBacklinks: number;
      keywordRankings: Record<string, number[]>;
      socialEngagement: {
        facebook: number;
        twitter: number;
        linkedin: number;
        pinterest: number;
      };
    };
    conversions?: {
      totalBookings: number;
      totalOrders: number;
      conversionRate: number;
      revenue: number;
    };
    performance?: {
      averageLoadTime: number;
      errorRate: number;
      apiResponseTime: number;
    };
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

    socket.emit('subscribeAnalytics', {
      subscriptionId,
      metrics: ['traffic', 'seo', 'conversions', 'performance']
    });

    socket.on(`analytics:${subscriptionId}`, (data: AnalyticsData) => {
      setAnalyticsData(data);
      setLoading(false);
    });

    socket.on('error', (error: string) => {
      setError(error);
      setLoading(false);
    });

    return () => {
      socket.emit('unsubscribeAnalytics', subscriptionId);
      socket.disconnect();
    };
  }, [subscriptionId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const { data } = analyticsData;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Last updated: {format(new Date(analyticsData.timestamp), 'PPpp')}
      </Typography>

      <Grid container spacing={3}>
        {/* Traffic Overview */}
        {data.traffic && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Traffic Overview
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[data.traffic]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="currentVisitors" stroke="#8884d8" />
                    <Line type="monotone" dataKey="pageViews" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* SEO Performance */}
        {data.seo && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  SEO Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[data.seo]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalBacklinks" fill="#8884d8" />
                    <Bar dataKey="mobileFriendlyPages" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Conversions */}
        {data.conversions && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Conversions
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Bookings', value: data.conversions.totalBookings },
                        { name: 'Orders', value: data.conversions.totalOrders },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[data.conversions.totalBookings, data.conversions.totalOrders].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Performance Metrics */}
        {data.performance && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[data.performance]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="averageLoadTime" stroke="#8884d8" />
                    <Line type="monotone" dataKey="errorRate" stroke="#ff7300" />
                    <Line type="monotone" dataKey="apiResponseTime" stroke="#387908" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};