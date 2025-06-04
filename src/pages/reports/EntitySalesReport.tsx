import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Download, CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { reportsApi } from "@/services/api/reports";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
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
  const [periodType, setPeriodType] = useState<string>("week");

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
      console.error("Invalid data format:", dataToProcess);
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
          
          processedProduct.sales[dateStr] = sale;
          processedProduct.quantities[dateStr] = quantity;
          
          // Add to totals
          processedProduct.totalSales += sale;
          processedProduct.totalQuantity += quantity;
        });
        
        // Only add products that have name and data
        if (processedProduct.name) {
          result.push(processedProduct);
        }
      });
      return result;
    } catch (error) {
      console.error("Error processing data:", error);
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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Create API request parameters
      const requestParams: any = {
        report_type: getReportTypeFromPeriod(),
        start_date: format(sunday, "yyyy-MM-dd"),
        end_date: format(saturday, "yyyy-MM-dd"),
        restaurant_id: parseInt(selectedLocation)
      };
      
      // Add week_start_date parameter for day of week filters
      if (["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].includes(periodType)) {
        requestParams.week_start_date = periodType.charAt(0).toUpperCase() + periodType.slice(1);
      }
      
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
        console.error("No response from API");
        setProcessedData([]);
        toast({
          title: "Error",
          description: "No response received from the server."
        });
      }
    } catch (error) {
      console.error("Error fetching entity sales data:", error);
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

  const getReportTypeFromPeriod = (): number => {
    switch (periodType) {
      case "day": return ReportType.Day;
      case "week": return ReportType.Week;
      case "month": return ReportType.Month;
      case "year": return ReportType.Year;
      case "sunday": return ReportType.Day;
      case "monday": return ReportType.Day;
      case "tuesday": return ReportType.Day;
      case "wednesday": return ReportType.Day;
      case "thursday": return ReportType.Day;
      case "friday": return ReportType.Day;
      case "saturday": return ReportType.Day;
      default: return ReportType.Week;
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

  const getDateDisplayText = () => {
    const { sunday, saturday } = getCurrentWeekDates(selectedDate);
    return `${format(sunday, "MMM d")} - ${format(saturday, "MMM d, yyyy")}`;
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
      ...weekDates.map(date => format(date, "yyyy-MM-dd")),
      "Total"
    ];

    const rows: string[][] = [];
    
    // Add data rows
    processedData.forEach(product => {
      // Sale row
      const saleRow = [
        product.name,
        "Sale",
        ...weekDates.map(date => {
          const dateStr = format(date, "yyyy-MM-dd");
          return `$ ${product.sales[dateStr] || 0}`;
        }),
        `$ ${product.totalSales.toFixed(2)}`
      ];
      
      // Quantity row
      const quantityRow = [
        product.name,
        "Quantity",
        ...weekDates.map(date => {
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
      ...weekDates.map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        return `$ ${dateTotals[dateStr].sales.toFixed(2)}`;
      }),
      `$ ${overallSales.toFixed(2)}`
    ];
    
    const totalQuantityRow = [
      "Total",
      "Quantity",
      ...weekDates.map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        return `${dateTotals[dateStr].quantity}`;
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            Back to Reports
          </Button>
          <h2 className="text-xl font-bold">Entity Sales Report</h2>
        </div>
        <div className="text-sm text-[#9b87f5] font-medium flex items-center gap-2">
          ADMIN
          <Button variant="outline" onClick={handleDownloadCSV}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Date Picker */}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal"
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
          <SelectTrigger>
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
        
        {/* Location Filter */}
        <Select
          value={selectedLocation}
          onValueChange={handleLocationChange}
        >
          <SelectTrigger>
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
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <Table className="border-collapse">
            <TableHeader className="bg-[#0F172A]">
              <TableRow>
                <TableHead className="text-white font-medium px-3 py-2 first:rounded-tl-lg">Item</TableHead>
                <TableHead className="text-white font-medium px-3 py-2">Attributes</TableHead>
                {weekDates.map((date, index) => (
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
                  {processedData.map((product, index) => (
                    <React.Fragment key={product.id}>
                      {/* Sale Row */}
                      <TableRow className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                        <TableCell className="font-medium px-3 py-2" rowSpan={2}>
                          {product.name}
                        </TableCell>
                        <TableCell className="px-3 py-2 text-blue-600">Sale</TableCell>
                        {weekDates.map(date => {
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
                        <TableCell className="px-3 py-2">Quantity</TableCell>
                        {weekDates.map(date => {
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
                  
                  {/* Total Rows */}
                  <TableRow className="border-t border-gray-300 bg-gray-100">
                    <TableCell className="font-bold px-3 py-2" rowSpan={2}>
                      Total
                    </TableCell>
                    <TableCell className="px-3 py-2 text-blue-600 font-medium">Sale</TableCell>
                    {weekDates.map(date => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      return (
                        <TableCell key={dateStr} className="text-center font-medium px-3 py-2">
                          $ {totals.dateTotals[dateStr].sales.toFixed(2)}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-bold px-3 py-2">
                      $ {totals.overallSales.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-gray-100">
                    <TableCell className="px-3 py-2 font-medium">Quantity</TableCell>
                    {weekDates.map(date => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      return (
                        <TableCell key={dateStr} className="text-center font-medium px-3 py-2">
                          {totals.dateTotals[dateStr].quantity}
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
                  <TableCell colSpan={9} className="text-center py-6">
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
  );
};

export default EntitySalesReport;
