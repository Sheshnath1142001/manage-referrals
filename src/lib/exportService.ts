
import { AnalyticsData } from '../types/analytics';

export class ExportService {
  static exportToCSV(data: AnalyticsData, filename: string = 'analytics.csv') {
    const csvContent = this.convertToCSV(data);
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  static exportToJSON(data: AnalyticsData, filename: string = 'analytics.json') {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  static exportToExcel(data: AnalyticsData, filename: string = 'analytics.xlsx') {
    // Note: This is a simplified version. In a real implementation,
    // you would use a library like xlsx to create proper Excel files
    const excelContent = this.convertToExcel(data);
    this.downloadFile(excelContent, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  private static convertToCSV(data: AnalyticsData): string {
    const headers = ['Metric', 'Value'];
    const rows = [];

    // Add traffic data
    if (data.traffic) {
      rows.push(['Current Visitors', data.traffic.currentVisitors]);
      rows.push(['Page Views', data.traffic.pageViews]);
      rows.push(['Bounce Rate', data.traffic.bounceRate]);
      rows.push(['Average Session Duration', data.traffic.averageSessionDuration]);
    } else {
      rows.push(['Current Visitors', 'N/A']);
      rows.push(['Page Views', 'N/A']);
      rows.push(['Bounce Rate', 'N/A']);
      rows.push(['Average Session Duration', 'N/A']);
    }

    // Add SEO data
    if (data.seo) {
      rows.push(['Average Load Time', data.seo.averageLoadTime]);
      rows.push(['Mobile Friendly Pages', data.seo.mobileFriendlyPages]);
      rows.push(['Total Backlinks', data.seo.totalBacklinks]);
      if (data.seo.keywordRankings) {
        Object.entries(data.seo.keywordRankings).forEach(([keyword, rankings]) => {
          rows.push([`Keyword: ${keyword}`, Array.isArray(rankings) ? rankings.join(', ') : rankings]);
        });
      }
    } else {
      rows.push(['Average Load Time', 'N/A']);
      rows.push(['Mobile Friendly Pages', 'N/A']);
      rows.push(['Total Backlinks', 'N/A']);
    }

    // Add conversion data
    if (data.conversions) {
      rows.push(['Total Bookings', data.conversions.totalBookings]);
      rows.push(['Total Orders', data.conversions.totalOrders]);
      rows.push(['Conversion Rate', data.conversions.conversionRate]);
      rows.push(['Revenue', data.conversions.revenue]);
    } else {
      rows.push(['Total Bookings', 'N/A']);
      rows.push(['Total Orders', data.totalOrders]);
      rows.push(['Conversion Rate', data.conversionRate]);
      rows.push(['Revenue', data.revenue]);
    }

    // Add performance data
    if (data.performance) {
      rows.push(['Average Load Time', data.performance.averageLoadTime || 'N/A']);
      rows.push(['Error Rate', data.performance.errorRate || 'N/A']);
      rows.push(['API Response Time', data.performance.apiResponseTime || 'N/A']);
    } else {
      rows.push(['Average Load Time', 'N/A']);
      rows.push(['Error Rate', 'N/A']);
      rows.push(['API Response Time', 'N/A']);
    }

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  private static convertToExcel(data: AnalyticsData): string {
    // This is a simplified version. In a real implementation,
    // you would use a library like xlsx to create proper Excel files
    return this.convertToCSV(data);
  }

  private static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revoObjectURL(url);
  }
}
