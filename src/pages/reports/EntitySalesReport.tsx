import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Download, CalendarIcon, PrinterIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { reportsApi } from "@/services/api/reports";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subWeeks, 
  subMonths, 
  subYears 
} from "date-fns";
import { ReportType, EntitySalesData } from "@/types/reports";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface ProductData {
  total_orders: string;
  sale: string;
  total_sold_quantity: string;
  restaurant_id: string;
  product_id: string;
  product_name: string;
  category_id: number;
  category_name: string;
  product_type: string;
  group_clause: string;
}

interface ProcessedProduct {
  id: string;
  name: string;
  categoryName: string;
  sales: { [date: string]: number };
  quantities: { [date: string]: number };
  totalSales: number;
  totalQuantity: number;
}

const EntitySalesReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [processedData, setProcessedData] = useState<ProcessedProduct[]>([]);
  const [apiResponseDebug, setApiResponseDebug] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [periodType, setPeriodType] = useState<string>("day");

  // Get current week's Sunday and Saturday based on selected date
  const getCurrentWeekDates = (date: Date) => {
    const sunday = startOfWeek(date, { weekStartsOn: 0 });
    const saturday = endOfWeek(date, { weekStartsOn: 0 });
    return { sunday, saturday };
  };

  const { sunday, saturday } = getCurrentWeekDates(selectedDate);
  
  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => 
    addDays(sunday, i)
  );

  const handleBack = () => {
    navigate("/reports");
  };

  // Process raw data into a format easier for rendering
  const processRawData = (rawData: any): ProcessedProduct[] => {
    // Extract the data from the API response
    let dataToProcess = null;
    
    if (rawData && typeof rawData === 'object') {
      if (rawData.data) {
        dataToProcess = rawData.data;
      } else {
        dataToProcess = rawData;
      }
    }
    
    if (!dataToProcess || typeof dataToProcess !== 'object') {
      return [];
    }
    
    try {
      const result: ProcessedProduct[] = [];
      
      // Process each product
      Object.entries(dataToProcess).forEach(([productId, dateData]: [string, any]) => {
        if (!dateData || typeof dateData !== 'object') {
          return;
        }
        
        // Initialize product data structure
        const processedProduct: ProcessedProduct = {
          id: productId,
          name: '',
          categoryName: '',
          sales: {},
          quantities: {},
          totalSales: 0,
          totalQuantity: 0
        };
        
        // Get display dates based on period type
        const displayDates = getDisplayDates();
        
        // Initialize sales and quantities for each display date
        displayDates.forEach(date => {
          const dateStr = format(date, "yyyy-MM-dd");
          processedProduct.sales[dateStr] = 0;
          processedProduct.quantities[dateStr] = 0;
        });
        
        // Process each date for this product
        Object.entries(dateData).forEach(([dateStr, dateInfo]: [string, any]) => {
          if (!dateInfo || typeof dateInfo !== 'object') return;
          
          // Set product info if not already set
          if (!processedProduct.name) {
            processedProduct.name = dateInfo.product_name || 'Unknown Product';
            processedProduct.categoryName = dateInfo.category_name || 'Unknown Category';
          }
          
          // Extract sales and quantities
          const sale = parseFloat(dateInfo.sale || '0');
          const quantity = parseInt(dateInfo.total_sold_quantity || '0');
          
          // Find which display date this data belongs to
          const dataDate = new Date(dateStr);
          let targetDate: Date | null = null;
          
          switch (periodType) {
            case "day":
              // For day view, use the exact date
              targetDate = dataDate;
              break;
            case "week":
              // For week view, find the start of the week
              targetDate = startOfWeek(dataDate, { weekStartsOn: 0 });
              break;
            case "month":
              // For month view, find the start of the month
              targetDate = startOfMonth(dataDate);
              break;
            case "year":
              // For year view, find the start of the year
              targetDate = startOfYear(dataDate);
              break;
          }
          
          if (targetDate) {
            const targetDateStr = format(targetDate, "yyyy-MM-dd");
            // Add to the appropriate period's totals
            processedProduct.sales[targetDateStr] = (processedProduct.sales[targetDateStr] || 0) + sale;
            processedProduct.quantities[targetDateStr] = (processedProduct.quantities[targetDateStr] || 0) + quantity;
          }
        });
        
        // Calculate totals
        Object.values(processedProduct.sales).forEach(sale => {
          processedProduct.totalSales += sale;
        });
        Object.values(processedProduct.quantities).forEach(quantity => {
          processedProduct.totalQuantity += quantity;
        });
        
        // Only add products that have name and data
        if (processedProduct.name) {
          result.push(processedProduct);
        }
      });
      return result;
    } catch (error) {
      return [];
    }
  };

  // Calculate totals for each date and overall
  const calculateTotals = (data: ProcessedProduct[]) => {
    const dateTotals: { [date: string]: { sales: number, quantity: number } } = {};
    let overallSales = 0;
    let overallQuantity = 0;
    
    // Initialize totals for each date
    weekDates.forEach(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      dateTotals[dateString] = { sales: 0, quantity: 0 };
    });
    
    // Sum up totals for each date
    data.forEach(product => {
      weekDates.forEach(date => {
        const dateString = format(date, 'yyyy-MM-dd');
        const salesValue = Number(product.sales[dateString] || 0);
        const quantityValue = Number(product.quantities[dateString] || 0);
        
        dateTotals[dateString].sales += isNaN(salesValue) ? 0 : salesValue;
        dateTotals[dateString].quantity += isNaN(quantityValue) ? 0 : quantityValue;
      });
      
      overallSales += isNaN(product.totalSales) ? 0 : Number(product.totalSales);
      overallQuantity += isNaN(product.totalQuantity) ? 0 : Number(product.totalQuantity);
    });
    
    return { dateTotals, overallSales, overallQuantity };
  };

  const getReportTypeFromPeriod = (): number => {
    switch (periodType) {
      case "day": return 1;
      case "week": return 2;
      case "month": return 3;
      case "year": return 4;
      default: return 1;
    }
  };

  const getDisplayDates = () => {
    switch (periodType) {
      case "day":
        // For day selection, show all days in the current week
        return Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
      case "week":
        // For week selection, show last 7 weeks
        return Array.from({ length: 7 }, (_, i) => {
          const weekStart = startOfWeek(subWeeks(selectedDate, 6 - i), { weekStartsOn: 0 });
          return weekStart;
        });
      case "month":
        // For month selection, show last 7 months
        return Array.from({ length: 7 }, (_, i) => {
          const monthStart = startOfMonth(subMonths(selectedDate, 6 - i));
          return monthStart;
        });
      case "year":
        // For year selection, show last 7 years
        return Array.from({ length: 7 }, (_, i) => {
          const yearStart = startOfYear(subYears(selectedDate, 6 - i));
          return yearStart;
        });
      default:
        return Array.from({ length: 7 }, (_, i) => addDays(sunday, i));
    }
  };

  const getDateDisplayText = () => {
    const dates = getDisplayDates();
    if (dates.length === 0) return "";
    
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    switch (periodType) {
      case "day":
        return `${format(firstDate, "MMM d")} - ${format(lastDate, "MMM d, yyyy")}`;
      case "week":
        return `${format(firstDate, "MMM d")} - ${format(lastDate, "MMM d, yyyy")}`;
      case "month":
        return `${format(firstDate, "MMM yyyy")} - ${format(lastDate, "MMM yyyy")}`;
      case "year":
        return `${format(firstDate, "yyyy")} - ${format(lastDate, "yyyy")}`;
      default:
        return `${format(firstDate, "MMM d")} - ${format(lastDate, "MMM d, yyyy")}`;
    }
  };

  const getDateRangeForPeriod = (date: Date, periodType: string) => {
    switch (periodType) {
      case "day":
        // For day selection, get the full week's data
        const weekStart = startOfWeek(date, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
        return {
          start_date: format(weekStart, "yyyy-MM-dd"),
          end_date: format(weekEnd, "yyyy-MM-dd")
        };
      case "week":
        // For week selection, get last 7 weeks data
        const sevenWeeksAgo = subWeeks(date, 6);
        return {
          start_date: format(startOfWeek(sevenWeeksAgo, { weekStartsOn: 0 }), "yyyy-MM-dd"),
          end_date: format(endOfWeek(date, { weekStartsOn: 0 }), "yyyy-MM-dd")
        };
      case "month":
        // For month selection, get last 7 months data
        const sevenMonthsAgo = subMonths(date, 6);
        return {
          start_date: format(startOfMonth(sevenMonthsAgo), "yyyy-MM-dd"),
          end_date: format(endOfMonth(date), "yyyy-MM-dd")
        };
      case "year":
        // For year selection, get last 7 years data
        const sevenYearsAgo = subYears(date, 6);
        return {
          start_date: format(startOfYear(sevenYearsAgo), "yyyy-MM-dd"),
          end_date: format(endOfYear(date), "yyyy-MM-dd")
        };
      default:
        return {
          start_date: format(date, "yyyy-MM-dd"),
          end_date: format(date, "yyyy-MM-dd")
        };
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const dateRange = getDateRangeForPeriod(selectedDate, periodType);
      
      // Create API request parameters
      const requestParams: any = {
        report_type: getReportTypeFromPeriod(),
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        restaurant_id: parseInt(selectedLocation)
      };
      
      const response = await reportsApi.getEntitySalesReport(requestParams);

      setApiResponseDebug(response);
      
      if (response) {
        const processed = processRawData(response);
        
        if (processed.length > 0) {
          setProcessedData(processed);
        } else {
          setProcessedData([]);
          toast({
            title: "No data",
            description: "No entity sales data found for the selected criteria."
          });
        }
      } else {
        setProcessedData([]);
        toast({
          title: "Error",
          description: "No response received from the server."
        });
      }
    } catch (error) {
      setApiResponseDebug(error);
      toast({
        title: "Error",
        description: "Failed to load entity sales data.",
        variant: "destructive"
      });
      setProcessedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  const handlePeriodChange = (value: string) => {
    setPeriodType(value);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (processedData.length === 0) {
      toast({
        title: "No data",
        description: "No data available to download.",
        variant: "destructive"
      });
      return;
    }

    const headers = [
      "Item",
      "Attributes",
      ...getDisplayDates().map(date => format(date, "yyyy-MM-dd")),
      "Total"
    ];

    const rows: string[][] = [];
    
    // Add data rows
    processedData.forEach(product => {
      // Sale row
      const saleRow = [
        product.name,
        "Sale",
        ...getDisplayDates().map(date => {
          const dateStr = format(date, "yyyy-MM-dd");
          return `$ ${product.sales[dateStr] || 0}`;
        }),
        `$ ${product.totalSales.toFixed(2)}`
      ];
      
      // Quantity row
      const quantityRow = [
        product.name,
        "Quantity",
        ...getDisplayDates().map(date => {
          const dateStr = format(date, "yyyy-MM-dd");
          return `${product.quantities[dateStr] || 0}`;
        }),
        `${product.totalQuantity}`
      ];
      
      rows.push(saleRow, quantityRow);
    });
    
    // Get totals
    const { dateTotals, overallSales, overallQuantity } = calculateTotals(processedData);
    
    // Add totals rows
    const totalSalesRow = [
      "Total",
      "Sale",
      ...getDisplayDates().map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        return `$ ${dateTotals[dateStr]?.sales.toFixed(2) || "0.00"}`;
      }),
      `$ ${overallSales.toFixed(2)}`
    ];
    
    const totalQuantityRow = [
      "Total",
      "Quantity",
      ...getDisplayDates().map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        return `${dateTotals[dateStr]?.quantity || 0}`;
      }),
      `${overallQuantity}`
    ];
    
    rows.push(totalSalesRow, totalQuantityRow);

    const csvContent = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entity-sales-${format(sunday, "yyyy-MM-dd")}-to-${format(saturday, "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get totals - with check for empty data
  const totals = processedData.length > 0 ? calculateTotals(processedData) : {
    dateTotals: weekDates.reduce((acc, date) => {
      acc[format(date, 'yyyy-MM-dd')] = { sales: 0, quantity: 0 };
      return acc;
    }, {} as { [date: string]: { sales: number, quantity: number } }),
    overallSales: 0,
    overallQuantity: 0
  };

  useEffect(() => {
    fetchData();
  }, [selectedLocation, selectedDate, periodType]);

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
          
          .print-table .text-center {
            text-align: center;
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
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Entity Sales Report</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
          {/* Date Picker */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getDateDisplayText()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {/* Period Type Filter */}
          <Select
            value={periodType}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="sunday">Sunday</SelectItem>
              <SelectItem value="monday">Monday</SelectItem>
              <SelectItem value="tuesday">Tuesday</SelectItem>
              <SelectItem value="wednesday">Wednesday</SelectItem>
              <SelectItem value="thursday">Thursday</SelectItem>
              <SelectItem value="friday">Friday</SelectItem>
              <SelectItem value="saturday">Saturday</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Location Select */}
          <Select
            value={selectedLocation}
            onValueChange={handleLocationChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Locations</SelectItem>
              {!isLoadingRestaurants && restaurants?.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action Buttons */}
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
        ) : (
          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <Table className="border-collapse print-table">
              <TableHeader className="bg-[#0F172A]">
                <TableRow>
                  <TableHead className="text-white font-medium px-3 py-2 first:rounded-tl-lg">Item</TableHead>
                  <TableHead className="text-white font-medium px-3 py-2">Attributes</TableHead>
                  {getDisplayDates().map((date) => (
                    <TableHead 
                      key={date.toISOString()} 
                      className="text-white font-medium text-center px-3 py-2"
                    >
                      {format(date, "yyyy-MM-dd")}
                    </TableHead>
                  ))}
                  <TableHead className="text-white font-medium text-center px-3 py-2 last:rounded-tr-lg">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.length > 0 ? (
                  <>
                    {[...processedData]
                      .sort((a, b) => b.totalSales - a.totalSales)
                      .map((product, index) => (
                        <React.Fragment key={product.id}>
                          {/* Sale Row */}
                          <TableRow className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                            <TableCell className="font-medium px-3 py-2" rowSpan={2}>
                              {product.name}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-blue-600">Sale</TableCell>
                            {getDisplayDates().map(date => {
                              const dateStr = format(date, "yyyy-MM-dd");
                              const sale = product.sales[dateStr] || 0;
                              return (
                                <TableCell key={dateStr} className="text-center px-3 py-2">
                                  $ {sale.toFixed(2)}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-center font-medium px-3 py-2">
                              $ {product.totalSales.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          {/* Quantity Row */}
                          <TableRow className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                            <TableCell className="px-3 py-2 text-blue-600">Quantity</TableCell>
                            {getDisplayDates().map(date => {
                              const dateStr = format(date, "yyyy-MM-dd");
                              const quantity = product.quantities[dateStr] || 0;
                              return (
                                <TableCell key={dateStr} className="text-center px-3 py-2">
                                  {quantity}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-center font-medium px-3 py-2">
                              {product.totalQuantity}
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}
                    
                    {/* Totals Row */}
                    <TableRow className="bg-gray-100">
                      <TableCell className="px-3 py-2 font-medium" colSpan={2}>Total</TableCell>
                      {getDisplayDates().map(date => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        return (
                          <TableCell key={dateStr} className="text-center font-medium px-3 py-2">
                            $ {totals.dateTotals[dateStr]?.sales.toFixed(2) || "0.00"}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold px-3 py-2">
                        $ {totals.overallSales.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-100">
                      <TableCell className="px-3 py-2 font-medium">Quantity</TableCell>
                      {getDisplayDates().map(date => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        return (
                          <TableCell key={dateStr} className="text-center font-medium px-3 py-2">
                            {totals.dateTotals[dateStr]?.quantity || 0}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold px-3 py-2">
                        {totals.overallQuantity}
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={getDisplayDates().length + 3}>
                      <div className="flex flex-col items-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-10 w-10 text-gray-400 mb-2" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                          />
                        </svg>
                        <h3 className="text-base font-semibold text-gray-800 mb-1">No data available</h3>
                        <p className="text-sm text-gray-500">Select a location and date range to view entity sales.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default EntitySalesReport;
