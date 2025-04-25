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
    }

    // Add SEO data
    if (data.seo) {
      rows.push(['Average Load Time', data.seo.averageLoadTime]);
      rows.push(['Mobile Friendly Pages', data.seo.mobileFriendlyPages]);
      rows.push(['Total Backlinks', data.seo.totalBacklinks]);
      Object.entries(data.seo.keywordRankings).forEach(([keyword, rankings]) => {
        rows.push([`Keyword: ${keyword}`, rankings.join(', ')]);
      });
    }

    // Add conversion data
    if (data.conversions) {
      rows.push(['Total Bookings', data.conversions.totalBookings]);
      rows.push(['Total Orders', data.conversions.totalOrders]);
      rows.push(['Conversion Rate', data.conversions.conversionRate]);
      rows.push(['Revenue', data.conversions.revenue]);
    }

    // Add performance data
    if (data.performance) {
      rows.push(['Average Load Time', data.performance.averageLoadTime]);
      rows.push(['Error Rate', data.performance.errorRate]);
      rows.push(['API Response Time', data.performance.apiResponseTime]);
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
    URL.revokeObjectURL(url);
  }
}