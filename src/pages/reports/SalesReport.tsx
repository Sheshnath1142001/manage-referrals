import React, { useState, useRef, useEffect } from "react";
import { 
  Download,
  Printer,
  RefreshCw,
  ChevronDown,
  FileText,
  BarChart as BarChartIcon,
  PrinterIcon
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  format, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  addDays
} from "date-fns";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { api } from "@/services/api/client";
import { reportsApi } from "@/services/api/reports";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Type definitions
interface SalesReportData {
  [restaurantId: string]: {
    [header: string]: {
      restaurant_name: string;
      sale: string | number;
      total_refund_amount?: string | number;
    };
  };
}

interface TableRowData {
  Location: string;
  Total: string;
  [key: string]: string | number;
}

interface VerticalSum {
  [key: string]: string | number;
}

interface RestaurantOption {
  id: string;
  name: string;
}

interface ReportTypeOption {
  id: number;
  type: string;
}

interface SaleTypeOption {
  id: string;
  type: string;
}

interface ColumnDefinition {
  name: string;
  label: string;
  field: string;
}

interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

interface ApiParams {
  report_type: number;
  restaurant_id: number;
  start_date: string;
  end_date: string;
  week_start_date?: string;
}

// Define report types enum to match the Vue implementation
const ReportType = {
  Day: 1,
  Week: 2,
  Month: 3,
  Year: 4,
  Sunday: 5,
  Monday: 6,
  Tuesday: 7,
  Wednesday: 8,
  Thursday: 9,
  Friday: 10,
  Saturday: 11
} as const;

const SalesReport: React.FC = () => {
  const { toast } = useToast();
  const tableRef = useRef<HTMLDivElement>(null);

  // State variables
  const [date, setDate] = useState<Date>(new Date());
  const [restaurantId, setRestaurantId] = useState<string>("0");
  const [selectedView, setSelectedView] = useState<string>("Table");
  const [reportType, setReportType] = useState<number>(ReportType.Day);
  const [saleType, setSaleType] = useState<string>("1"); // 1: Gross Sale, 2: Net Sale
  const [loading, setLoading] = useState<boolean>(false);
  
  // Data state
  const [salesReport, setSalesReport] = useState<SalesReportData>({});
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  const [objVerticalSum, setObjVerticalSum] = useState<VerticalSum>({});
  const [sumOfTotal, setSumOfTotal] = useState<number>(0);

  // Use the hook to get restaurants
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();

  // Fetch data on mount
  useEffect(() => {
    getReportData();
  }, []);

  // Watch for changes and update data
  useEffect(() => {
    getReportData();
  }, [reportType, date, restaurantId, saleType]);

  // Mock API call to get sales report data - replace with your actual API
  const getSalesReport = async (params: ApiParams): Promise<SalesReportData> => {
    try {
      setLoading(true);
      // Use the reports API client
      const response = await reportsApi.getSalesReport(params);
      return response.data || {};
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to load sales report data",
        variant: "destructive"
      });
      return {};
    } finally {
      setLoading(false);
    }
  };

  // Get report data based on current selections
  const getReportData = async (): Promise<void> => {
    setObjVerticalSum({});
    setSumOfTotal(0);
    
    let params: ApiParams = {
      report_type: reportType,
      restaurant_id: parseInt(restaurantId),
      start_date: getStartDate(),
      end_date: getEndDate()
    };
    
    // For weekly reports, add the week_start_date parameter
    if (reportType === ReportType.Week) {
      // Get the current week's Sunday date
      const currentWeekStart = startOfWeek(date, { weekStartsOn: 0 });
      
      // Remove the "to" format for start_date
      if (params.start_date && params.start_date.includes(' to ')) {
        params.start_date = params.start_date.split(' to ')[0];
      }
      
      // Add the week_start_date parameter
      params = {
        ...params,
        week_start_date: 'Sunday'
      };
    }
    
    const reportData = await getSalesReport(params);
    setSalesReport(reportData);
    
    // Process the data for display
    processTableData(reportData);
  };

  // Process the sales report data for the table
  const processTableData = (reportData: SalesReportData): void => {
    // Always use last 7 years for headers when yearly is selected
    const headers = reportType === ReportType.Year ? getLastSevenYears() : getHeaders();
    const temp: TableRowData[] = [];
    const verticalSums: VerticalSum = {};
    let totalSum = 0;
    
    // Initialize vertical sums
    headers.forEach(header => {
      verticalSums[header] = 0;
    });
    
    // Process data for each restaurant
    for (let restaurant_id in reportData) {
      let obj: TableRowData = { Location: "", Total: "0" };
      let restaurant_name = "";
      let total_sale_of_restaurant = 0;
      
      for (let header of headers) {
        let total_sale_at = 0;
        // For weekly reports, we need to match the date in the response with our header
        if (reportType === ReportType.Week) {
          // Extract the start date from the header range
          const headerStartDate = header.split(' to ')[0];
          if (reportData[restaurant_id][headerStartDate] !== undefined) {
            restaurant_name = reportData[restaurant_id][headerStartDate].restaurant_name;
            
            if (saleType === "1") {
              total_sale_at = Number(reportData[restaurant_id][headerStartDate].sale);
            } else {
              total_sale_at = Number(reportData[restaurant_id][headerStartDate].sale) - 
                             Number(reportData[restaurant_id][headerStartDate].total_refund_amount || 0);
            }
            total_sale_of_restaurant += Number(total_sale_at);
          }
        } else {
          if (reportData[restaurant_id][header] !== undefined) {
            restaurant_name = reportData[restaurant_id][header].restaurant_name;
            
            if (saleType === "1") {
              total_sale_at = Number(reportData[restaurant_id][header].sale);
            } else {
              total_sale_at = Number(reportData[restaurant_id][header].sale) - 
                             Number(reportData[restaurant_id][header].total_refund_amount || 0);
            }
            total_sale_of_restaurant += Number(total_sale_at);
          }
        }
        
        // If year is missing in response, keep 0
        obj["Location"] = restaurant_name;
        obj[header] = Number(total_sale_at);
        // Calculate vertical sum
        if (reportType === ReportType.Week) {
          const headerStartDate = header.split(' to ')[0];
          if (reportData[restaurant_id][headerStartDate]) {
            verticalSums[header] = (Number(verticalSums[header]) + Number(total_sale_at)).toFixed(2);
          } else if (!verticalSums[header]) {
            verticalSums[header] = "0.00";
          }
        } else {
          if (reportData[restaurant_id][header]) {
            verticalSums[header] = (Number(verticalSums[header]) + Number(total_sale_at)).toFixed(2);
          } else if (!verticalSums[header]) {
            verticalSums[header] = "0.00";
          }
        }
      }
      obj["Total"] = parseFloat(total_sale_of_restaurant.toString()).toFixed(2);
      if (obj.Location !== "") {
        temp.push(obj);
      }
      totalSum += Number(total_sale_of_restaurant);
    }
    // Set state with processed data
    setTableData(temp);
    setObjVerticalSum(verticalSums);
    setSumOfTotal(totalSum);
  };

  // Handle date change
  const handleDateChange = (newDate: Date | undefined): void => {
    if (newDate) {
      setDate(newDate);
    }
  };

  // Handle report type change
  const handleReportTypeChange = (value: string): void => {
    setReportType(Number(value));
  };

  // Handle restaurant change
  const handleRestaurantChange = (value: string): void => {
    setRestaurantId(value);
  };

  // Handle sale type change
  const handleSaleTypeChange = (value: string): void => {
    setSaleType(value);
  };

  // Handle view change
  const handleViewChange = (value: string): void => {
    setSelectedView(value);
  };

  // Export CSV function
  const exportCSV = (): void => {
    if (tableData.length === 0) return;
    
    const headers = getHeaders();
    const csvHeaders = ["Location", ...headers, "Total"];
    const csvData = [
      csvHeaders.join(","),
      ...tableData.map(row => 
        csvHeaders.map(header => 
          wrapCsvValue(row[header] || "0")
        ).join(",")
      ),
      // Add total row
      ["Total", ...headers.map(header => objVerticalSum[header]), sumOfTotal.toFixed(2)].join(",")
    ];
    
    const csvString = csvData.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  // Wrap CSV values in quotes if they contain commas
  const wrapCsvValue = (val: string | number): string => {
    const stringVal = String(val);
    return stringVal.includes(",") ? `"${stringVal}"` : stringVal;
  };

  // Print to PDF
  const printPDF = (): void => {
    if (tableData.length === 0) return;
    
    const doc = new jsPDF();
    const headers = getHeaders();
    const columns = [
      { header: 'Location', dataKey: 'Location' },
      ...headers.map(header => ({ header, dataKey: header })),
      { header: 'Total', dataKey: 'Total' }
    ];
     
    // Add title
    doc.text('Sales Report', 14, 15);
    
    // Add table
    doc.autoTable({
      columns,
      body: tableData,
      startY: 20,
      foot: [{
        Location: 'Total',
        ...objVerticalSum,
        Total: sumOfTotal.toFixed(2)
      }],
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 68, 156] }
    });
    
    doc.save('SalesReport.pdf');
  };

  // Print function for browser printing
  const handlePrint = (): void => {
    window.print();
  };

  // Get location name for print header
  const getLocationName = (): string => {
    if (restaurantId === "0") return "All Locations";
    const location = restaurants?.find(loc => loc.id.toString() === restaurantId);
    return location?.name || "Unknown Location";
  };

  // Get column definitions
  const getColumns = (): ColumnDefinition[] => {
    const headers = getHeaders();
    const columns: ColumnDefinition[] = [
      {
        name: "Location",
        label: "Location",
        field: "Location"
      }
    ];
    
    headers.forEach(header => {
      columns.push({
        name: header,
        label: header,
        field: header
      });
    });
    
    columns.push({
      name: "Total",
      label: "Total",
      field: "Total"
    });
    
    return columns;
  };

  // Get headers based on report type
  const getHeaders = (): string[] => {
    // This is a simplified implementation - you would need to implement 
    // the full header generation logic from reportHeader.js in the Vue code
    
    switch (reportType) {
      case ReportType.Day:
        return getCurrentWeek();
      case ReportType.Week:
        return getLastSevenWeeks();
      case ReportType.Month:
        return getLastSevenMonths();
      case ReportType.Year:
        return getLastSevenYears();
      case ReportType.Sunday:
      case ReportType.Monday:
      case ReportType.Tuesday:
      case ReportType.Wednesday:
      case ReportType.Thursday:
      case ReportType.Friday:
      case ReportType.Saturday:
        return getLastSevenDaysOfWeek(reportType - ReportType.Sunday);
      default:
        return getCurrentWeek();
    }
  };

  // Date utility functions - simplified versions of what would be in reportHeader.js
  const getCurrentWeek = (): string[] => {
    const currentDate = new Date(date);
    const day = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = currentDate.getDate() - day;
    
    const weekStart = new Date(currentDate);
    weekStart.setDate(diff);
    
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(weekStart);
      nextDay.setDate(weekStart.getDate() + i);
      days.push(format(nextDay, 'yyyy-MM-dd'));
    }
    
    return days;
  };

  const getLastSevenWeeks = (): string[] => {
    const currentDate = new Date(date);
    const weeks: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const weekDate = new Date(currentDate);
      weekDate.setDate(currentDate.getDate() - (i * 7));
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(weekDate, { weekStartsOn: 0 });
      weeks.push(format(weekStart, 'yyyy-MM-dd') + ' to ' + format(weekEnd, 'yyyy-MM-dd'));
    }
    
    return weeks;
  };

  const getLastSevenMonths = (): string[] => {
    const currentDate = new Date(date);
    const months: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(currentDate.getMonth() - i);
      months.push(format(monthDate, 'MMM yyyy'));
    }
    
    return months;
  };

  const getLastSevenYears = (): string[] => {
    const currentDate = new Date(date);
    const years: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const yearDate = new Date(currentDate);
      yearDate.setFullYear(currentDate.getFullYear() - i);
      years.push(format(yearDate, 'yyyy'));
    }
    
    return years;
  };

  // Get last seven occurrences of a specific day of the week
  const getLastSevenDaysOfWeek = (dayIndex: number): string[] => {
    const currentDate = new Date(date);
    const days: string[] = [];
    
    // Find the most recent occurrence of the specified day
    let targetDate = new Date(currentDate);
    const currentDay = currentDate.getDay();
    
    // Calculate days to go back to reach the most recent occurrence of the target day
    const daysToGoBack = (currentDay - dayIndex + 7) % 7;
    targetDate.setDate(currentDate.getDate() - daysToGoBack);
    
    // Get the last 7 occurrences of this day (going backwards in time)
    for (let i = 0; i < 7; i++) {
      days.push(format(targetDate, 'yyyy-MM-dd'));
      targetDate.setDate(targetDate.getDate() - 7); // Go back 7 days each time
    }
    
    // Return the days in chronological order (oldest to newest)
    return days.reverse();
  };

  // Get start date for API request
  const getStartDate = (): string => {
    const headers = getHeaders();
    let sd: string;
    
    if (reportType === ReportType.Day || reportType > 4) {
      sd = headers[0];
    } else if (reportType === ReportType.Week) {
      // Extract the start date from the range format
      const dateRange = headers[0].split(' to ');
      sd = dateRange[0];
    } else if (reportType === ReportType.Month) {
      const monthYear = headers[0].split(' ');
      const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(monthYear[0]) + 1;
      sd = `${monthYear[1]}-${month.toString().padStart(2, '0')}-01`;
    } else if (reportType === ReportType.Year) {
      sd = `${headers[0]}-01-01`;
    } else {
      sd = headers[0];
    }
    
    return sd;
  };

  // Get end date for API request
  const getEndDate = (): string => {
    const headers = getHeaders();
    let ed: string;
    
    if (reportType === ReportType.Day || reportType > 4) {
      ed = headers[headers.length - 1];
    } else if (reportType === ReportType.Week) {
      // Extract the end date from the range format
      const dateRange = headers[headers.length - 1].split(' to ');
      ed = dateRange[1];
    } else if (reportType === ReportType.Month) {
      const monthYear = headers[headers.length - 1].split(' ');
      const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(monthYear[0]) + 1;
      const lastDay = new Date(parseInt(monthYear[1]), month, 0).getDate();
      ed = `${monthYear[1]}-${month.toString().padStart(2, '0')}-${lastDay}`;
    } else if (reportType === ReportType.Year) {
      ed = `${headers[headers.length - 1]}-12-31`;
    } else {
      ed = headers[headers.length - 1];
    }
    
    return ed;
  };

  // Restaurant list for dropdown
  const restaurantList: RestaurantOption[] = [
    { id: "0", name: "All Locations" },
    ...(restaurants || []).map(rest => ({
      id: rest.id.toString(),
      name: rest.name
    }))
  ];

  // Report type options
  const reportTypeOptions: ReportTypeOption[] = [
    { id: ReportType.Day, type: "Daily" },
    { id: ReportType.Week, type: "Weekly" },
    { id: ReportType.Month, type: "Monthly" },
    { id: ReportType.Year, type: "Yearly" },
    { id: ReportType.Sunday, type: "Sunday" },
    { id: ReportType.Monday, type: "Monday" },
    { id: ReportType.Tuesday, type: "Tuesday" },
    { id: ReportType.Wednesday, type: "Wednesday" },
    { id: ReportType.Thursday, type: "Thursday" },
    { id: ReportType.Friday, type: "Friday" },
    { id: ReportType.Saturday, type: "Saturday" }
  ];

  // Sale type options
  const saleTypeOptions: SaleTypeOption[] = [
    { id: "1", type: "Gross Sale" },
    { id: "2", type: "Net Sale" }
  ];

  // Get chart data
  const getChartData = (): ChartDataPoint[] => {
    const headers = getHeaders();
    
    // Format data for the chart
    return headers.map((header, index) => ({
      name: formatDateForDisplay(header),
      ...tableData.reduce((acc, row) => {
        acc[row.Location] = parseFloat(String(row[header]) || "0");
        return acc;
      }, {} as { [key: string]: number })
    }));
  };

  // Format date for display in table header
  const formatDateForDisplay = (dateStr: string): string => {
    try {
      // For weekly reports, format the date range
      if (reportType === ReportType.Week && dateStr.includes(' to ')) {
        const [startDate, endDate] = dateStr.split(' to ');
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      }
      
      // For specific days of the week when using day filters
      if (reportType >= ReportType.Sunday && reportType <= ReportType.Saturday) {
        const dateObj = parseISO(dateStr);
        return format(dateObj, 'MMM d, yyyy');
      }
      
      // For regular dates
      const dateObj = parseISO(dateStr);
      return format(dateObj, 'MMM d');
    } catch (error) {
      return dateStr;
    }
  };

  // Get report title based on current selections
  const getReportTitle = (): string => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    switch (reportType) {
      case ReportType.Day:
        return `Daily Sales Report (${format(date, "MMMM d, yyyy")})`;
      case ReportType.Week:
        return `Weekly Sales Report (Week of ${format(date, "MMMM d, yyyy")})`;
      case ReportType.Month:
        return `Monthly Sales Report (${format(date, "MMMM yyyy")})`;
      case ReportType.Year:
        return `Yearly Sales Report (${format(date, "yyyy")})`;
      case ReportType.Sunday:
      case ReportType.Monday:
      case ReportType.Tuesday:
      case ReportType.Wednesday:
      case ReportType.Thursday:
      case ReportType.Friday:
      case ReportType.Saturday:
        const dayIndex = reportType - ReportType.Sunday;
        return `${dayNames[dayIndex]} Sales Report (Last 7 ${dayNames[dayIndex]}s)`;
      default:
        return "Sales Report";
    }
  };

  return (
    <>
      {/* Print-specific styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          
          .print-container,
          .print-container * {
            visibility: visible;
          }
          
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-header {
            display: block !important;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }
          
          .print-table th {
            background-color: #d1d5db !important;
            color: #111827 !important;
            font-weight: bold;
          }
          
          .print-table .text-right {
            text-align: right;
          }
          
          .print-info {
            margin-bottom: 15px;
            font-size: 14px;
          }
        }
        `
      }} />

      <div className="print-container">
        {/* Print Header - Only visible when printing */}
        <div className="print-header" style={{ display: 'none' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Sales Report</h1>
        </div>

        <div className="shadow-lg bg-white p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
            {/* Report Type Select */}
            <div className="w-full">
              <Select
                value={reportType.toString()}
                onValueChange={handleReportTypeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value={ReportType.Day.toString()}>Daily</SelectItem>
                  <SelectItem value={ReportType.Week.toString()}>Weekly</SelectItem>
                  <SelectItem value={ReportType.Month.toString()}>Monthly</SelectItem>
                  <SelectItem value={ReportType.Year.toString()}>Yearly</SelectItem>
                  <SelectItem value="separator" disabled className="font-semibold text-muted-foreground">
                    Days of Week
                  </SelectItem>
                  <SelectItem value={ReportType.Sunday.toString()}>Sunday</SelectItem>
                  <SelectItem value={ReportType.Monday.toString()}>Monday</SelectItem>
                  <SelectItem value={ReportType.Tuesday.toString()}>Tuesday</SelectItem>
                  <SelectItem value={ReportType.Wednesday.toString()}>Wednesday</SelectItem>
                  <SelectItem value={ReportType.Thursday.toString()}>Thursday</SelectItem>
                  <SelectItem value={ReportType.Friday.toString()}>Friday</SelectItem>
                  <SelectItem value={ReportType.Saturday.toString()}>Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div className="w-full">
              <DatePicker
                date={date}
                onSelect={handleDateChange}
                className="w-full"
              />
            </div>

            {/* Restaurant Select */}
            <div className="w-full">
              <Select
                value={restaurantId}
                onValueChange={handleRestaurantChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {restaurantList.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sale Type Select */}
            <div className="w-full">
              <Select
                value={saleType}
                onValueChange={handleSaleTypeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sales metric" />
                </SelectTrigger>
                <SelectContent>
                  {saleTypeOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4 no-print">
            {/* View Select */}
            <div className="w-44">
              <Tabs 
                value={selectedView}
                onValueChange={handleViewChange}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="Table" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Table
                  </TabsTrigger>
                  <TabsTrigger value="Chart" className="flex items-center gap-2">
                    <BarChartIcon className="w-4 h-4" />
                    Chart
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={exportCSV}
                className="mr-1"
              >
                <Download className="h-5 w-5 text-primary" />
                <span className="sr-only">Download CSV</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrint}
                className="mr-1"
                title="Print Report"
              >
                <PrinterIcon className="h-5 w-5 text-primary" />
                <span className="sr-only">Print Report</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={getReportData}
              >
                <RefreshCw className="h-5 w-5 text-primary" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </div>

          <div className="w-full h-[79vh]">
            {/* Table View */}
            {selectedView === "Table" && (
              <div className="shadow-lg bg-white">
                <div className="w-full max-h-full overflow-auto" ref={tableRef}>
                  {loading || isLoadingRestaurants ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : tableData.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-center text-xl text-primary">
                        <span className="mr-2">😔</span>
                        <span>Sorry..We couldn't find anything for you..</span>
                      </div>
                    </div>
                  ) : (
                    <Table className="print-table">
                      <TableHeader>
                        <TableRow>
                          {getColumns().map((column) => (
                            <TableHead 
                              key={column.name}
                              className="bg-primary text-white font-medium"
                            >
                              {column.name === "Location" || column.name === "Total" 
                                ? column.label 
                                : (reportType === ReportType.Year ? column.label : formatDateForDisplay(column.label))}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...tableData]
                          .sort((a, b) => Number(b.Total) - Number(a.Total))
                          .map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {getColumns().map((column) => (
                              <TableCell key={`${rowIndex}-${column.name}`} className={column.name !== "Location" ? "text-right" : ""}>
                                {column.name === "Location" 
                                  ? row[column.field] 
                                  : `$ ${row[column.field]}`}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow className="font-bold">
                          <TableCell>Total</TableCell>
                          {getHeaders().map((header, index) => (
                            <TableCell key={index} className="text-right">
                              $ {objVerticalSum[header]}
                            </TableCell>
                          ))}
                          <TableCell className="text-right">$ {sumOfTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            )}

            {/* Chart View */}
            {selectedView === "Chart" && (
              <div className="mt-4">
                <Card className="p-4">
                  {loading || isLoadingRestaurants ? (
                    <div className="flex justify-center items-center h-[550px]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : tableData.length === 0 ? (
                    <div className="flex justify-center items-center h-[550px]">
                      <div className="text-center text-xl text-primary">
                        <span className="mr-2">😔</span>
                        <span>Sorry..We couldn't find anything for you..</span>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={550}>
                      <BarChart
                        data={getChartData()}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis 
                          label={{ 
                            value: 'Total Gross Sale', 
                            angle: -90, 
                            position: 'insideLeft' 
                          }}
                          tickFormatter={(value: number) => `$ ${value}`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`$ ${value}`, 'Total']}
                        />
                        <Legend />
                        {tableData.map((row, index) => (
                          <Bar 
                            key={index}
                            dataKey={row.Location} 
                            name={row.Location}
                            fill={`hsl(${(index * 40) % 360}, 70%, 50%)`}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesReport;