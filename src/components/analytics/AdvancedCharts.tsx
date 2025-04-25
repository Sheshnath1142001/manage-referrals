import React from 'react';
import {
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  ReferenceLine,
  Brush
} from 'recharts';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';

interface AdvancedChartsProps {
  data: any;
}

export const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ data }) => {
  const formatDataForRadar = (metrics: any) => {
    return [
      { subject: 'Load Time', A: metrics.averageLoadTime },
      { subject: 'Error Rate', A: metrics.errorRate },
      { subject: 'API Response', A: metrics.apiResponseTime },
      { subject: 'Mobile Score', A: metrics.mobileFriendlyPages },
      { subject: 'SEO Score', A: metrics.totalBacklinks }
    ];
  };

  const formatDataForScatter = (traffic: any) => {
    return [
      { x: traffic.currentVisitors, y: traffic.pageViews, z: traffic.bounceRate }
    ];
  };

  return (
    <Grid container spacing={3}>
      {/* Area Chart for Traffic Trends */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Traffic Trends
            </Typography>
            <Box height={300}>
              <AreaChart
                width={500}
                height={300}
                data={data.traffic ? [data.traffic] : []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
                <Brush dataKey="name" height={30} stroke="#8884d8" />
              </AreaChart>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Radar Chart for Performance Metrics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance Radar
            </Typography>
            <Box height={300}>
              <RadarChart
                cx={300}
                cy={150}
                outerRadius={100}
                width={500}
                height={300}
                data={data.performance ? formatDataForRadar(data.performance) : []}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Scatter Chart for Traffic Analysis */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Traffic Analysis
            </Typography>
            <Box height={300}>
              <ScatterChart
                width={500}
                height={300}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Visitors" />
                <YAxis type="number" dataKey="y" name="Page Views" />
                <ZAxis type="number" dataKey="z" name="Bounce Rate" range={[0, 100]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name="Traffic"
                  data={data.traffic ? formatDataForScatter(data.traffic) : []}
                  fill="#8884d8"
                />
              </ScatterChart>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Composed Chart for SEO Metrics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              SEO Metrics Overview
            </Typography>
            <Box height={300}>
              <ComposedChart
                width={500}
                height={300}
                data={data.seo ? [data.seo] : []}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalBacklinks" barSize={20} fill="#413ea0" />
                <Line type="monotone" dataKey="mobileFriendlyPages" stroke="#ff7300" />
                <ReferenceLine y={0} stroke="#000" />
              </ComposedChart>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};