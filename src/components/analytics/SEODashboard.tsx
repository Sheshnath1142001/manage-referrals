import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExportService } from '@/lib/exportService';
import { AnalyticsData } from '@/types/analytics';
import { Button } from '@/components/ui/button';
import { Download, Search, Link as LinkIcon, Mobile } from 'lucide-react';

interface SEODashboardProps {
  data: AnalyticsData;
}

export const SEODashboard: React.FC<SEODashboardProps> = ({ data }) => {
  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    switch (format) {
      case 'csv':
        ExportService.exportToCSV(data, 'seo-metrics.csv');
        break;
      case 'json':
        ExportService.exportToJSON(data, 'seo-metrics.json');
        break;
      case 'excel':
        ExportService.exportToExcel(data, 'seo-metrics.xlsx');
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">SEO Metrics Dashboard</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Score</CardTitle>
            <Mobile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.seo?.mobileScore || 0}%</div>
            <Progress value={data.seo?.mobileScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backlinks</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.seo?.totalBacklinks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.seo?.backlinkGrowth || 0}% growth this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keyword Rankings</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(data.seo?.keywordRankings || {}).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tracked keywords
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Friendly Pages</CardTitle>
            <Mobile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.seo?.mobileFriendlyPages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data.seo?.mobileFriendlyPages || 0) / (data.traffic?.pageViews || 1) * 100)}% of total pages
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Keyword Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.seo?.keywordRankings || {}).map(([keyword, rankings]) => (
                <div key={keyword} className="flex items-center justify-between">
                  <div className="font-medium">{keyword}</div>
                  <div className="text-sm text-muted-foreground">
                    {rankings.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Average Load Time</div>
                <div className="text-sm text-muted-foreground">
                  {data.seo?.averageLoadTime || 0}ms
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-medium">Error Rate</div>
                <div className="text-sm text-muted-foreground">
                  {data.performance?.errorRate || 0}%
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-medium">API Response Time</div>
                <div className="text-sm text-muted-foreground">
                  {data.performance?.apiResponseTime || 0}ms
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};