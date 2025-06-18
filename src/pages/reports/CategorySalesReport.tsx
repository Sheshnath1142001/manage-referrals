import React, { useState, useEffect } from "react";
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
import { format, addDays, startOfWeek, endOfWeek, subWeeks, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useNavigate } from "react-router-dom";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useCategorySalesReport } from "@/hooks/reports/useCategorySalesReport";
import { TableChartToggle } from "@/components/ui/table-chart-toggle";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Define report period types
enum ReportPeriodType {
  Day = 1,
  Week = 2,
  Month = 3,
  Year = 4
}

interface CategoryData {
  total_sales: number;
  total_sold_quantity: number;
  category_name: string;
}

interface CategorySalesData {
  [key: string]: {
    [date: string]: CategoryData;
  };
}

const CategorySalesReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedView, setSelectedView] = useState("table");
  const [periodType, setPeriodType] = useState<ReportPeriodType>(ReportPeriodType.Day);
  const { restaurants: locations } = useGetRestaurants();
  
  // Use the custom hook for data fetching
  const { 
    data: categorySalesData, 
    isLoading, 
    refetch,
    formatCurrency 
  } = useCategorySalesReport({
    restaurantId: selectedLocation,
    selectedDate,
    periodType
  }) as { 
    data: CategorySalesData; 
    isLoading: boolean; 
    refetch: () => void;
    formatCurrency: (value: number) => string;
  };

  // Add useEffect to trigger API call when component mounts or dependencies change
  useEffect(() => {
    refetch();
  }, [selectedDate, selectedLocation, periodType, refetch]);
  
  // Get the dates to display based on period type
  const getDisplayDates = () => {
    const dates: Date[] = [];
    
    switch (periodType) {
      case ReportPeriodType.Day:
        // Week containing the selected date (Sunday to Saturday)
        const selectedWeekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        for (let i = 0; i < 7; i++) {
          dates.push(addDays(selectedWeekStart, i));
        }
        break;
      case ReportPeriodType.Week:
        // Last 7 weeks from the selected date
        for (let i = 6; i >= 0; i--) {
          const weekStart = startOfWeek(subWeeks(selectedDate, i), { weekStartsOn: 0 });
          dates.push(weekStart);
        }
        break;
      case ReportPeriodType.Month:
        // Last 7 months from the selected date
        for (let i = 6; i >= 0; i--) {
          const monthStart = startOfMonth(subMonths(selectedDate, i));
          dates.push(monthStart);
        }
        break;
      case ReportPeriodType.Year:
        // Last 7 years from the selected date
        for (let i = 6; i >= 0; i--) {
          const yearStart = startOfYear(subYears(selectedDate, i));
          dates.push(yearStart);
        }
        break;
    }
    return dates;
  };

  // Format date for display
  const formatDisplayDate = (date: Date) => {
    switch (periodType) {
      case ReportPeriodType.Day:
        return format(date, "dd-MM-yyyy");
      case ReportPeriodType.Week:
        // For week periods, return Monday date to match API response
        const mondayDate = addDays(date, 1); // Add 1 day to get Monday
        return format(mondayDate, "yyyy-MM-dd");
      case ReportPeriodType.Month:
        return format(date, "MMM yyyy");
      case ReportPeriodType.Year:
        return format(date, "yyyy");
      default:
        return format(date, "dd-MM-yyyy");
    }
  };
  
  // Format the date header based on period type
  const formatDateHeader = (date: Date) => {
    switch (periodType) {
      case ReportPeriodType.Day:
        return (
          <>
            {format(date, "EEE")}
            <div className="text-xs font-normal">
              {format(date, "MMM dd")}
            </div>
          </>
        );
      case ReportPeriodType.Week:
        // Show week range (Sunday to Saturday)
        return (
          <>
            {format(date, "dd-MM-yyyy")}
          </>
        );
      case ReportPeriodType.Month:
        return format(date, "MMM yyyy");
      case ReportPeriodType.Year:
        return format(date, "yyyy");
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
        // For week periods, return Monday date to match API response
        const mondayDate = addDays(date, 1); // Add 1 day to get Monday
        return format(mondayDate, "yyyy-MM-dd");
      case ReportPeriodType.Month:
        return format(date, "MMM yyyy");
      case ReportPeriodType.Year:
        return format(date, "yyyy");
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

  // Calculate totals for a category
  const calculateCategoryTotals = (categoryData: any) => {
    let totalSales = 0;
    let totalQuantity = 0;

    Object.values(categoryData).forEach((yearData: any) => {
      totalSales += Number(yearData.total_sales) || 0;
      totalQuantity += Number(yearData.total_sold_quantity) || 0;
    });

    return { totalSales, totalQuantity };
  };

  // Calculate totals for a specific year
  const calculateYearTotals = (dateStr: string) => {
    let totalSales = 0;
    let totalQuantity = 0;

    Object.values(categorySalesData).forEach((categoryData: any) => {
      const yearData = categoryData[dateStr];
      if (yearData) {
        totalSales += Number(yearData.total_sales) || 0;
        totalQuantity += Number(yearData.total_sold_quantity) || 0;
      }
    });

    return { totalSales, totalQuantity };
  };

  // Prepare data for the chart
  const getChartData = () => {
    if (!categorySalesData) return [];
    
    // First, group by date
    const dateData = getDisplayDates().map((date) => {
      const dateStr = getDateStringKey(date);
      const result = {
        date: formatDisplayDate(date),
      };
      
      // Add sales for each category
      Object.entries(categorySalesData).forEach(([categoryId, categoryData]) => {
        const yearData = categoryData[dateStr];
        if (yearData) {
          result[`${categoryId}_sales`] = Number(yearData.total_sales) || 0;
          result[`${categoryId}_name`] = yearData.category_name;
        }
      });
      
      // Format the date label for display
      let dateLabel = result.date;
      if (periodType === ReportPeriodType.Week) {
        const weekEnd = addDays(date, 6);
        dateLabel = `${format(date, "dd-MM-yyyy")} to ${format(weekEnd, "dd-MM-yyyy")}`;
      }
      
      return {
        ...result,
        date: dateLabel
      };
    });
    
    return dateData;
  };

  // Get unique category names for chart legend
  const getCategoryBars = () => {
    if (!categorySalesData) return [];
    
    return Object.entries(categorySalesData)
      .map(([categoryId, categoryData]) => {
        const firstDayData = Object.values(categoryData)[0];
        const { totalSales } = calculateCategoryTotals(categoryData);
        return {
          id: categoryId,
          name: firstDayData.category_name,
          dataKey: `${categoryId}_sales`,
          fill: getColorForCategory(parseInt(categoryId)),
          totalSales
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales) // Sort by total sales in decreasing order
      .map(({ id, name, dataKey, fill }) => ({
        id,
        name,
        dataKey,
        fill
      }));
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
    if (!categorySalesData || Object.keys(categorySalesData).length === 0) {
      toast({
        title: "No data available",
        description: "There is no data to download",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get display dates
      const displayDates = getDisplayDates();
      
      // Create CSV headers
      const headers = ['Category', 'Attributes'];
      displayDates.forEach(date => {
        headers.push(formatDisplayDate(date));
      });
      headers.push('Total');
      
      // Create CSV rows
      const csvRows = [headers.join(',')];
      
      // Add data rows - sort by total sales in decreasing order
      Object.entries(categorySalesData)
        .map(([categoryId, categoryData]) => {
          const firstYearData = Object.values(categoryData)[0];
          const categoryName = firstYearData?.category_name || 'Unknown';
          const { totalSales, totalQuantity } = calculateCategoryTotals(categoryData);
          
          return {
            categoryId,
            categoryData,
            categoryName,
            totalSales,
            totalQuantity
          };
        })
        .sort((a, b) => b.totalSales - a.totalSales) // Sort by total sales in decreasing order
        .forEach(({ categoryId, categoryData, categoryName, totalSales, totalQuantity }) => {
          // Sales row
          const salesRow = [categoryName, 'Sales'];
          displayDates.forEach(date => {
            const dateStr = getDateStringKey(date);
            const monthData = categoryData[dateStr];
            const sales = Number(monthData?.total_sales) || 0;
            salesRow.push(formatCurrency(sales).replace('$', '')); // Remove $ for CSV
          });
          salesRow.push(formatCurrency(totalSales).replace('$', ''));
          csvRows.push(salesRow.join(','));
          
          // Quantity row
          const quantityRow = ['', 'Quantity'];
          displayDates.forEach(date => {
            const dateStr = getDateStringKey(date);
            const monthData = categoryData[dateStr];
            const quantity = Number(monthData?.total_sold_quantity) || 0;
            quantityRow.push(quantity.toString());
          });
          quantityRow.push(totalQuantity.toString());
          csvRows.push(quantityRow.join(','));
        });
      
      // Add totals row
      const totalSalesRow = ['Total', 'Sales'];
      const totalQuantityRow = ['', 'Quantity'];
      
      displayDates.forEach(date => {
        const dateStr = getDateStringKey(date);
        const { totalSales, totalQuantity } = calculateYearTotals(dateStr);
        totalSalesRow.push(formatCurrency(totalSales).replace('$', ''));
        totalQuantityRow.push(totalQuantity.toString());
      });
      
      // Calculate grand totals
      const grandTotalSales = displayDates.reduce((sum, date) => {
        const dateStr = getDateStringKey(date);
        const { totalSales } = calculateYearTotals(dateStr);
        return sum + totalSales;
      }, 0);
      
      const grandTotalQuantity = displayDates.reduce((sum, date) => {
        const dateStr = getDateStringKey(date);
        const { totalQuantity } = calculateYearTotals(dateStr);
        return sum + totalQuantity;
      }, 0);
      
      totalSalesRow.push(formatCurrency(grandTotalSales).replace('$', ''));
      totalQuantityRow.push(grandTotalQuantity.toString());
      
      csvRows.push(totalSalesRow.join(','));
      csvRows.push(totalQuantityRow.join(','));
      
      // Create CSV content
      const csvContent = csvRows.join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Get location name for filename
      const locationName = selectedLocation === "0" ? "All Locations" : 
        locations.find(loc => loc.id.toString() === selectedLocation)?.name || "Unknown";
      
      // Create filename with current date and location
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      const filename = `Category_Sales_Report_${locationName}_${currentDate}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download successful",
        description: "Category Sales Report has been downloaded as CSV"
      });
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the report",
        variant: "destructive"
      });
    }
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

  // Print function
  const handlePrint = () => {
    window.print();
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
            visibility: visible !important;
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
            visibility: visible !important;
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            font-size: 12px;
            visibility: visible !important;
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

      <div className="p-6 print-container">

        {/* Print Header - Only visible when printing */}
        <div className="print-header" style={{ display: 'none' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Category Sales Report</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 no-print">
          <div className="sm:col-span-1">
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
          </div>

          <div className="sm:col-span-1">
            <DatePicker
              date={selectedDate}
              onSelect={handleDateChange}
              placeholder="Select date"
            />
          </div>

          <div className="sm:col-span-1">
            <Select
              value={periodType.toString()}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Day</SelectItem>
                <SelectItem value="2">Week</SelectItem>
                <SelectItem value="3">Month</SelectItem>
                <SelectItem value="4">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-1">
            <TableChartToggle 
              value={selectedView}
              onValueChange={handleViewChange}
            />
          </div>

          <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-4 xl:col-span-2">
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
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
                  <Legend />
                  {getCategoryBars().map((bar) => (
                    <Bar
                      key={bar.id}
                      dataKey={bar.dataKey}
                      fill={bar.fill}
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                      name={bar.name}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table className="print-table">
              <TableHeader className="bg-[#0F172A]">
                <TableRow>
                  <TableHead className="text-white font-medium">Category</TableHead>
                  <TableHead className="text-white font-medium">Attributes</TableHead>
                  {getDisplayDates().map((date) => (
                    <TableHead 
                      key={date.toString()} 
                      className="text-white font-medium text-center"
                    >
                      {formatDateHeader(date)}
                    </TableHead>
                  ))}
                  <TableHead className="text-white font-medium text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!categorySalesData || Object.keys(categorySalesData).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      No data available for the selected criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  // Sort categories by total sales in decreasing order
                  Object.entries(categorySalesData)
                    .map(([categoryId, categoryData]) => {
                      const firstYearData = Object.values(categoryData)[0];
                      const categoryName = firstYearData?.category_name || 'Unknown';
                      const { totalSales, totalQuantity } = calculateCategoryTotals(categoryData);
                      
                      return {
                        categoryId,
                        categoryData,
                        categoryName,
                        totalSales,
                        totalQuantity
                      };
                    })
                    .sort((a, b) => b.totalSales - a.totalSales) // Sort by total sales in decreasing order
                    .map(({ categoryId, categoryData, categoryName, totalSales, totalQuantity }) => {
                      return (
                        <React.Fragment key={categoryId}>
                          {/* Sales Row */}
                          <TableRow>
                            <TableCell rowSpan={2} className="font-medium">
                              {categoryName}
                            </TableCell>
                            <TableCell className="text-purple-600">Sales</TableCell>
                            {getDisplayDates().map((date) => {
                              const dateStr = getDateStringKey(date);
                              const monthData = categoryData[dateStr];
                              const sales = Number(monthData?.total_sales) || 0;
                              
                              return (
                                <TableCell 
                                  key={`${dateStr}-sales`} 
                                  className="text-right"
                                >
                                  <span className="text-purple-600">
                                    {formatCurrency(sales)}
                                  </span>
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-right font-medium">
                              <span className="text-purple-600">
                                {formatCurrency(totalSales)}
                              </span>
                            </TableCell>
                          </TableRow>
                          
                          {/* Quantity Row */}
                          <TableRow>
                            <TableCell className="text-purple-600">Quantity</TableCell>
                            {getDisplayDates().map((date) => {
                              const dateStr = getDateStringKey(date);
                              const monthData = categoryData[dateStr];
                              const quantity = Number(monthData?.total_sold_quantity) || 0;
                              
                              return (
                                <TableCell 
                                  key={`${dateStr}-quantity`} 
                                  className="text-right"
                                >
                                  {quantity}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-right font-medium">
                              {totalQuantity}
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })
                )}
                
                {/* Total Row */}
                <TableRow className="bg-gray-100 font-bold">
                  <TableCell colSpan={2}>Total</TableCell>
                  {getDisplayDates().map((date) => {
                    const dateStr = getDateStringKey(date);
                    const { totalSales, totalQuantity } = calculateYearTotals(dateStr);
                    
                    return (
                      <TableCell 
                        key={`${dateStr}-total`} 
                        className="text-right"
                      >
                        <div className="text-purple-600">{formatCurrency(totalSales)}</div>
                        <div>{totalQuantity}</div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right">
                    <div className="text-purple-600">
                      {formatCurrency(
                        getDisplayDates().reduce((sum, date) => {
                          const dateStr = getDateStringKey(date);
                          const { totalSales } = calculateYearTotals(dateStr);
                          return sum + totalSales;
                        }, 0)
                      )}
                    </div>
                    <div>
                      {getDisplayDates().reduce((sum, date) => {
                        const dateStr = getDateStringKey(date);
                        const { totalQuantity } = calculateYearTotals(dateStr);
                        return sum + totalQuantity;
                      }, 0)}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default CategorySalesReport;