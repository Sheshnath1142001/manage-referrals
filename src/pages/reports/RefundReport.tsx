import React, { useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Calendar,
  PrinterIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, addDays, subMonths, startOfMonth, endOfMonth, subYears, startOfYear, endOfYear } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useRefundReport } from "@/hooks/reports/useRefundReport";
import { ViewToggle } from "@/components/ui/view-toggle";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TableChartToggle } from "@/components/ui/table-chart-toggle";

// Define report period types
enum ReportPeriodType {
  Day = 0,
  Week = 1,
  Month = 2,
  Year = 3
}

const RefundReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedView, setSelectedView] = useState("table");
  const [periodType, setPeriodType] = useState<ReportPeriodType>(ReportPeriodType.Day);
  const { restaurants: locations } = useGetRestaurants();
  
  // Use the custom hook for data fetching
  const { 
    data: refundData, 
    isLoading, 
    refetch,
    weekDates: { sunday, saturday },
    formatCurrency 
  } = useRefundReport({
    restaurantId: selectedLocation,
    selectedDate,
    periodType
  });
  
  // Generate array of dates for the selected period
  const getDatesForPeriod = () => {
    switch (periodType) {
      case ReportPeriodType.Day:
        return [selectedDate];
      case ReportPeriodType.Week:
        return Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
      case ReportPeriodType.Month:
        const startMonth = startOfMonth(selectedDate);
        const endMonth = endOfMonth(selectedDate);
        const daysInMonth = endMonth.getDate();
        return Array.from({ length: daysInMonth }, (_, i) => addDays(startMonth, i));
      case ReportPeriodType.Year:
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date(selectedDate);
          date.setMonth(i);
          return date;
        });
      default:
        return Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
    }
  };
  
  const periodDates = getDatesForPeriod();
  
  // Format the date header based on period type
  const formatDateHeader = (date: Date) => {
    switch (periodType) {
      case ReportPeriodType.Day:
        return format(date, "h:mm a");
      case ReportPeriodType.Week:
        return (
          <>
            {format(date, "EEE")}
            <div className="text-xs font-normal">
              {format(date, "MMM dd")}
            </div>
          </>
        );
      case ReportPeriodType.Month:
        return format(date, "d");
      case ReportPeriodType.Year:
        return format(date, "MMM");
      default:
        return format(date, "MMM dd");
    }
  };
  
  // Format date for chart display
  const formatDateForChart = (date: Date) => {
    switch (periodType) {
      case ReportPeriodType.Day:
        return format(date, "h:mm a");
      case ReportPeriodType.Week:
        return format(date, "EEE");
      case ReportPeriodType.Month:
        return format(date, "d");
      case ReportPeriodType.Year:
        return format(date, "MMM");
      default:
        return format(date, "MMM dd");
    }
  };
  
  // Get the date string key format based on period type
  const getDateStringKey = (date: Date) => {
    switch (periodType) {
      case ReportPeriodType.Day:
        return format(date, "yyyy-MM-dd");
      case ReportPeriodType.Week:
        return format(date, "yyyy-MM-dd");
      case ReportPeriodType.Month:
        return format(date, "yyyy-MM-dd");
      case ReportPeriodType.Year:
        return format(date, "yyyy-MM");
      default:
        return format(date, "yyyy-MM-dd");
    }
  };

  const handleBack = () => {
    navigate("/reports");
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleViewChange = (value: string) => {
    setSelectedView(value);
  };
  
  const handlePeriodChange = (value: string) => {
    setPeriodType(parseInt(value) as ReportPeriodType);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Get location name for print header
  const getLocationName = () => {
    if (selectedLocation === "0") return "All Locations";
    const location = locations.find(loc => loc.id.toString() === selectedLocation);
    return location?.name || "Unknown Location";
  };

  // Helper function to safely access properties
  const safelyGetProperty = (obj: any, key: string, defaultValue: any = 0) => {
    return obj && obj[key] !== undefined ? obj[key] : defaultValue;
  };

  // Prepare data for the chart
  const getChartData = () => {
    if (!refundData?.data) return [];
    
    return periodDates.map((date) => {
      const dateStr = getDateStringKey(date);
      let totalRefundAmount = 0;
      let totalRefundedItems = 0;
      
      // Sum up refund amounts and counts for all restaurants on this date
      Object.entries(refundData.data).forEach(([restaurantId, restaurantData]) => {
        const dateDayData = restaurantData[dateStr];
        if (dateDayData) {
          totalRefundAmount += safelyGetProperty(dateDayData, 'total_refund_amount', 0);
          totalRefundedItems += safelyGetProperty(dateDayData, 'total_refunded_items', 0);
        }
      });
      
      return {
        date: formatDateForChart(date),
        refundAmount: totalRefundAmount,
        refundedItems: totalRefundedItems
      };
    });
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600 mt-1 flex items-center">
              <span 
                className="inline-block w-3 h-3 mr-2 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              ></span>
              {entry.name === "refundAmount" ? "Refund Amount" : "Refunded Items"}: 
              <span className="font-medium ml-1">
                {entry.name === "refundAmount" ? formatCurrency(entry.value) : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Filter restaurants based on search query
  const filteredData = Object.entries(refundData?.data || {});

  const handleDownloadCSV = () => {
    if (!refundData?.data || Object.keys(refundData.data).length === 0) {
      toast({
        title: "No data",
        description: "No refund data available to download.",
        variant: "destructive"
      });
      return;
    }

    // Define headers based on period type
    const headers = [
      "Restaurant",
      "Metrics",
      ...periodDates.map(date => formatDateForChart(date)),
      "Total"
    ];

    // Define metrics to display
    const metrics = [
      { key: "sale", label: "Sales" },
      { key: "net_sale", label: "Net Sales" },
      { key: "total_orders", label: "Total Orders" },
      { key: "total_sold_items", label: "Items Sold" },
      { key: "total_refund_amount", label: "Refund Amount" },
      { key: "total_refunded_items", label: "Refunded Items" }
    ];

    const rows: string[][] = [];
    
    // Process each restaurant's data
    filteredData.forEach(([restaurantId, restaurantData]) => {
      const firstDayData = Object.values(restaurantData)[0];
      const restaurantName = firstDayData?.restaurant_name || 'Unknown';
      
      // Calculate totals across all days for each metric
      const totals = metrics.reduce((acc, metric) => {
        acc[metric.key] = 0;
        periodDates.forEach(date => {
          const dateStr = getDateStringKey(date);
          const dayData = restaurantData[dateStr];
          if (dayData) {
            acc[metric.key] += parseFloat(dayData[metric.key] || 0);
          }
        });
        return acc;
      }, {} as Record<string, number>);
      
      // Add data rows for each metric
      metrics.forEach(metric => {
        const row = [
          restaurantName,
          metric.label,
          ...periodDates.map(date => {
            const dateStr = getDateStringKey(date);
            const dayData = restaurantData[dateStr] || {};
            const value = safelyGetProperty(dayData, metric.key, 0);
            
            // Format value based on metric type
            if (metric.key.includes('sale') || metric.key.includes('amount')) {
              return formatCurrency(value).replace('$', '').trim(); // Remove $ for CSV
            } else {
              return value.toString();
            }
          }),
          // Total column
          metric.key.includes('sale') || metric.key.includes('amount')
            ? formatCurrency(totals[metric.key]).replace('$', '').trim()
            : totals[metric.key].toString()
        ];
        rows.push(row);
      });
    });

    // Add summary totals row
    const summaryTotals = metrics.reduce((acc, metric) => {
      acc[metric.key] = 0;
      filteredData.forEach(([restaurantId, restaurantData]) => {
        periodDates.forEach(date => {
          const dateStr = getDateStringKey(date);
          const dayData = restaurantData[dateStr];
          if (dayData) {
            acc[metric.key] += parseFloat(dayData[metric.key] || 0);
          }
        });
      });
      return acc;
    }, {} as Record<string, number>);

    // Add summary row
    metrics.forEach(metric => {
      const summaryRow = [
        "TOTAL",
        metric.label,
        ...periodDates.map(date => {
          const dateStr = getDateStringKey(date);
          let totalForDate = 0;
          filteredData.forEach(([restaurantId, restaurantData]) => {
            const dayData = restaurantData[dateStr];
            if (dayData) {
              totalForDate += parseFloat(dayData[metric.key] || 0);
            }
          });
          
          if (metric.key.includes('sale') || metric.key.includes('amount')) {
            return formatCurrency(totalForDate).replace('$', '').trim();
          } else {
            return totalForDate.toString();
          }
        }),
        metric.key.includes('sale') || metric.key.includes('amount')
          ? formatCurrency(summaryTotals[metric.key]).replace('$', '').trim()
          : summaryTotals[metric.key].toString()
      ];
      rows.push(summaryRow);
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Generate filename with date range
    const startDate = periodDates[0];
    const endDate = periodDates[periodDates.length - 1];
    const filename = `refund-report-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}.csv`;
    
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: `Refund report downloaded as ${filename}`
    });
  };
  
  // Get period label for display
  const getPeriodLabel = () => {
    switch (periodType) {
      case ReportPeriodType.Day:
        return "Day";
      case ReportPeriodType.Week:
        return "Week";
      case ReportPeriodType.Month:
        return "Month";
      case ReportPeriodType.Year:
        return "Year";
      default:
        return "Week";
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
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Refund Report</h1>
        </div>

        <div className="p-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 no-print">
            <Select
              value={periodType.toString()}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger className="bg-white w-full">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{getPeriodLabel()}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReportPeriodType.Day.toString()}>Day</SelectItem>
                <SelectItem value={ReportPeriodType.Week.toString()}>Week</SelectItem>
                <SelectItem value={ReportPeriodType.Month.toString()}>Month</SelectItem>
                <SelectItem value={ReportPeriodType.Year.toString()}>Year</SelectItem>
              </SelectContent>
            </Select>

            <TableChartToggle 
              value={selectedView}
              onValueChange={handleViewChange}
            />

            <Select
              value={selectedLocation}
              onValueChange={handleLocationChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handlePrint} className="w-10 h-10 p-0">
                <PrinterIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleRefresh} className="w-10 h-10 p-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleDownloadCSV} className="w-10 h-10 p-0">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
            </div>
          ) : selectedView === "chart" ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getChartData()}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="refundAmount" 
                      fill="#f87171" 
                      radius={[4, 4, 0, 0]} 
                      barSize={20} 
                      name="Refund Amount"
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="refundedItems" 
                      fill="#60a5fa" 
                      radius={[4, 4, 0, 0]} 
                      barSize={20} 
                      name="Refunded Items"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {filteredData.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No refund data found for the selected period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="border-collapse print-table">
                    <TableHeader className="bg-[#1e293b]">
                      <TableRow className="border-none">
                        <TableHead 
                          rowSpan={2} 
                          className="sticky left-0 bg-[#1e293b] text-white font-medium rounded-tl-lg border-r border-gray-700"
                        >
                          Restaurant
                        </TableHead>
                        <TableHead 
                          rowSpan={2} 
                          className="sticky left-[200px] bg-[#1e293b] text-white font-medium border-r border-gray-700"
                        >
                          Attributes
                        </TableHead>
                        {periodDates.map((date, index) => (
                          <TableHead 
                            key={date.toString()} 
                            className={`text-center border-x border-gray-700 bg-[#1e293b] text-white font-medium ${
                              index === periodDates.length - 1 ? "border-r-0" : ""
                            }`}
                          >
                            {formatDateHeader(date)}
                          </TableHead>
                        ))}
                        <TableHead 
                          className="text-center border-l border-gray-700 bg-[#1e293b] text-white font-medium rounded-tr-lg"
                        >
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map(([restaurantId, restaurantData]) => {
                        const firstDayData = Object.values(restaurantData)[0];
                        const restaurantName = firstDayData?.restaurant_name || 'Unknown';
                        
                        // Define metrics to display
                        const metrics = [
                          { key: "sale", label: "Sales" },
                          { key: "net_sale", label: "Net Sales" },
                          { key: "total_orders", label: "Total Orders" },
                          { key: "total_sold_items", label: "Items Sold" },
                          { key: "total_refund_amount", label: "Refund Amount" },
                          { key: "total_refunded_items", label: "Refunded Items" }
                        ];
                        
                        // Calculate totals across all days for each metric
                        const totals = metrics.reduce((acc, metric) => {
                          acc[metric.key] = 0;
                          periodDates.forEach(date => {
                            const dateStr = getDateStringKey(date);
                            const dayData = restaurantData[dateStr];
                            if (dayData) {
                              acc[metric.key] += parseFloat(dayData[metric.key] || 0);
                            }
                          });
                          return acc;
                        }, {} as Record<string, number>);
                        
                        return (
                          <React.Fragment key={restaurantId}>
                            {metrics.map((metric, index) => (
                              <TableRow 
                                key={`${restaurantId}-${metric.key}`}
                                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                              >
                                {index === 0 && (
                                  <TableCell 
                                    rowSpan={metrics.length} 
                                    className="font-medium sticky left-0 z-10 border-r border-gray-200"
                                    style={{ backgroundColor: index % 2 === 0 ? "white" : "#f9fafb" }}
                                  >
                                    {restaurantName}
                                  </TableCell>
                                )}
                                <TableCell 
                                  className="sticky left-[200px] z-10 border-r border-gray-200"
                                  style={{ backgroundColor: index % 2 === 0 ? "white" : "#f9fafb" }}
                                >
                                  {metric.label}
                                </TableCell>
                                
                                {periodDates.map((date) => {
                                  const dateStr = getDateStringKey(date);
                                  const dayData = restaurantData[dateStr] || {};
                                  
                                  // Format display value based on metric type
                                  let displayValue;
                                  if (metric.key.includes('sale') || metric.key.includes('amount')) {
                                    displayValue = formatCurrency(safelyGetProperty(dayData, metric.key, 0));
                                  } else {
                                    displayValue = safelyGetProperty(dayData, metric.key, 0);
                                  }
                                  
                                  return (
                                    <TableCell key={dateStr} className="text-right border-r border-gray-200">
                                      {displayValue}
                                    </TableCell>
                                  );
                                })}
                                
                                <TableCell className="text-right font-medium border-l border-gray-200"
                                  style={{ backgroundColor: index % 2 === 0 ? "#f8fafc" : "#f1f5f9" }}
                                >
                                  {metric.key.includes('sale') || metric.key.includes('amount')
                                    ? formatCurrency(totals[metric.key])
                                    : totals[metric.key]}
                                </TableCell>
                              </TableRow>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RefundReport;