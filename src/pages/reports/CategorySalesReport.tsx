import React, { useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useCategorySalesReport } from "@/hooks/reports/useCategorySalesReport";
import { ReportDatePicker } from "@/components/ui/report-date-picker";
import { TableChartToggle } from "@/components/ui/table-chart-toggle";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Define report period types
enum ReportPeriodType {
  Day = 0,
  Week = 1,
  Month = 2,
  Year = 3
}

const CategorySalesReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedView, setSelectedView] = useState("Table");
  const [periodType, setPeriodType] = useState<ReportPeriodType>(ReportPeriodType.Week);
  const { restaurants: locations } = useGetRestaurants();
  
  // Use the custom hook for data fetching
  const { 
    data: categorySalesData, 
    isLoading, 
    refetch,
    weekDates: { sunday, saturday },
    formatCurrency 
  } = useCategorySalesReport({
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
        const startMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
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

  // Helper function to safely access properties
  const safelyGetProperty = (obj: any, key: string, defaultValue: any = 0) => {
    return obj && obj[key] !== undefined ? obj[key] : defaultValue;
  };

  // Prepare data for the chart
  const getChartData = () => {
    if (!categorySalesData) return [];
    
    // First, group by date
    const dateData = periodDates.map((date) => {
      const dateStr = getDateStringKey(date);
      const result = {
        date: formatDateForChart(date),
      };
      
      // Add sales for each category
      Object.entries(categorySalesData).forEach(([categoryId, categoryData]) => {
        const dayData = categoryData[dateStr];
        if (dayData) {
          const categoryName = dayData.category_name;
          result[`${categoryId}_sales`] = dayData.total_sales;
          result[`${categoryId}_name`] = categoryName;
        }
      });
      
      return result;
    });
    
    return dateData;
  };

  // Get unique category names for chart legend
  const getCategoryBars = () => {
    if (!categorySalesData) return [];
    
    return Object.entries(categorySalesData).map(([categoryId, categoryData]) => {
      const firstDayData = Object.values(categoryData)[0];
      return {
        id: categoryId,
        name: firstDayData.category_name,
        dataKey: `${categoryId}_sales`,
        fill: getColorForCategory(parseInt(categoryId))
      };
    });
  };
  
  // Generate a color based on category ID
  const getColorForCategory = (categoryId: number) => {
    const colors = [
      "#f87171", "#60a5fa", "#4ade80", "#facc15", "#a78bfa", 
      "#fb7185", "#34d399", "#fbbf24", "#818cf8", "#f472b6"
    ];
    return colors[categoryId % colors.length];
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => {
            const categoryNameKey = entry.dataKey.replace('_sales', '_name');
            const name = entry.payload[categoryNameKey] || entry.name;
            return (
              <p key={index} className="text-sm text-gray-600 mt-1 flex items-center">
                <span 
                  className="inline-block w-3 h-3 mr-2 rounded-sm" 
                  style={{ backgroundColor: entry.color }}
                ></span>
                {name}: 
                <span className="font-medium ml-1">
                  {formatCurrency(entry.value)}
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const handleDownloadCSV = () => {
    // Implementation for downloading CSV
    toast({
      title: "Download started",
      description: "Your report is being downloaded"
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Category Sales Report</h1>
        </div>
        <div className="text-sm text-[#9b87f5] font-medium">
          ADMIN
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Select
          value={periodType.toString()}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="bg-white">
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

        <ReportDatePicker 
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

        <TableChartToggle 
          value={selectedView}
          onValueChange={handleViewChange}
        />

        <div className="flex items-center gap-4">
          <Select
            value={selectedLocation}
            onValueChange={handleLocationChange}
            className="flex-1"
          >
            <SelectTrigger>
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
      ) : selectedView.toLowerCase() === "chart" ? (
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
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
                <Legend />
                {getCategoryBars().map((category) => (
                  <Bar 
                    key={category.id}
                    dataKey={category.dataKey} 
                    fill={category.fill} 
                    radius={[4, 4, 0, 0]} 
                    barSize={20} 
                    name={category.name}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {!categorySalesData || Object.keys(categorySalesData).length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No category sales data found for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader className="bg-[#1e293b]">
                  <TableRow className="border-none">
                    <TableHead 
                      rowSpan={2} 
                      className="sticky left-0 bg-[#1e293b] text-white font-medium rounded-tl-lg border-r border-gray-700"
                    >
                      Category
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
                  {Object.entries(categorySalesData).map(([categoryId, categoryData]) => {
                    const firstDayData = Object.values(categoryData)[0];
                    const categoryName = firstDayData?.category_name || 'Unknown';
                    
                    // Define metrics to display
                    const metrics = [
                      { key: "total_sales", label: "Sales" },
                      { key: "total_sold_quantity", label: "Quantity" }
                    ];
                    
                    // Calculate totals across all days for each metric
                    const totals = metrics.reduce((acc, metric) => {
                      acc[metric.key] = 0;
                      periodDates.forEach(date => {
                        const dateStr = getDateStringKey(date);
                        const dayData = categoryData[dateStr];
                        if (dayData) {
                          acc[metric.key] += parseFloat(dayData[metric.key] || 0);
                        }
                      });
                      return acc;
                    }, {} as Record<string, number>);
                    
                    return (
                      <React.Fragment key={categoryId}>
                        {metrics.map((metric, index) => (
                          <TableRow 
                            key={`${categoryId}-${metric.key}`}
                            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                          >
                            {index === 0 && (
                              <TableCell 
                                rowSpan={metrics.length} 
                                className="font-medium sticky left-0 z-10 border-r border-gray-200"
                                style={{ backgroundColor: index % 2 === 0 ? "white" : "#f9fafb" }}
                              >
                                {categoryName}
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
                              const dayData = categoryData[dateStr] || {};
                              
                              // Format display value based on metric type
                              let displayValue;
                              if (metric.key === "total_sales") {
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
                              {metric.key === "total_sales"
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
  );
};

export default CategorySalesReport;