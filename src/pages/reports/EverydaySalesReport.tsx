import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Calendar as CalendarIcon,
  PrinterIcon,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DailySalesData {
  created_date: string;
  num_items_sold: string;
  sales_price: string;
  restaurant_id: string;
  restaurant_name: string;
  group_clause: string;
}

interface RestaurantDailyData {
  [date: string]: DailySalesData;
}

interface SalesReportResponse {
  data: {
    [restaurantId: string]: RestaurantDailyData;
  };
}

const EverydaySalesReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restaurants: locations } = useGetRestaurants();
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [salesData, setSalesData] = useState<SalesReportResponse | null>(null);

  // State for date range selection - default from first date of current month to today
  const [startDate, setStartDate] = useState<Date | undefined>(
    startOfMonth(new Date())
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date()
  );

  // State for Popover control
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  // Format currency
  const formatCurrency = (value: string | number | undefined) => {
    const numValue = parseFloat(value?.toString() || '0');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  // Generate array of dates for the selected range
  const getDateRange = () => {
    if (!startDate || !endDate) return [];
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const dateRange = getDateRange();

  // Fetch everyday sales data
  const fetchEverydaySalesData = useCallback(async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Please select valid start and end dates.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the authentication token
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      
      const { token } = JSON.parse(adminData);
      
      // Format dates for the API (yyyy/MM/dd format as shown in curl)
      const formattedStartDate = format(startDate, "yyyy/MM/dd");
      const formattedEndDate = format(endDate, "yyyy/MM/dd");
      
      // Build the API URL with proper encoding
      const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.au/api';
      const apiUrl = new URL(`${apiBaseUrl}/everyday-sale-report`);
      apiUrl.searchParams.append('start_date', formattedStartDate);
      apiUrl.searchParams.append('end_date', formattedEndDate);
      // Always include restaurant_id, use 0 for all locations
      apiUrl.searchParams.append('restaurant_id', selectedLocation);

      

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Authorization': `Bearer ${token}`,
          'Connection': 'keep-alive',
          'Origin': window.location.origin,
          'Referer': window.location.href,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          'User-Agent': navigator.userAgent,
          'X-Timezone': 'Asia/Calcutta',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch everyday sales data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      setSalesData(data as SalesReportResponse);
    } catch (error) {
      
      setSalesData(null);
      toast({
        title: "Error",
        description: "Failed to load everyday sales data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedLocation, toast]);

  // Fetch data when dates or location changes
  useEffect(() => {
    fetchEverydaySalesData();
  }, [fetchEverydaySalesData]);

  const handleBack = () => {
    navigate("/reports");
  };

  const handleRefresh = () => {
    fetchEverydaySalesData();
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  // Helper function to safely access properties
  const safelyGetProperty = (obj: any, key: string, defaultValue: any = "0") => {
    return obj && obj[key] !== undefined ? obj[key] : defaultValue;
  };

  // Process data for display
  const processDataForDisplay = () => {
    const restaurantData = salesData?.data || {};
    
    // For each restaurant, collect its sales data by date
    const processed: { [restaurantId: string]: { [date: string]: any, name: string } } = {};
    
    Object.entries(restaurantData).forEach(([restaurantId, daysData]) => {
      if (!processed[restaurantId]) {
        // Get the restaurant name from any day's data
        const firstDayData = Object.values(daysData)[0] as DailySalesData;
        processed[restaurantId] = {
          name: firstDayData?.restaurant_name || 'Unknown Location',
        };
        
        // Add sales data for each day
        Object.entries(daysData).forEach(([dateStr, dayData]) => {
          processed[restaurantId][dateStr] = (dayData as DailySalesData)?.sales_price || '0';
        });
      }
    });
    
    return processed;
  };
  
  const processedData = processDataForDisplay();

  // Calculate totals for each restaurant and grand total
  const calculateTotals = () => {
    const restaurantTotals: { [restaurantId: string]: number } = {};
    let grandTotal = 0;

    Object.entries(processedData).forEach(([restaurantId, restaurant]) => {
      let restaurantTotal = 0;
      dateRange.forEach(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        const salesValue = parseFloat(restaurant[dateStr] || '0');
        restaurantTotal += isNaN(salesValue) ? 0 : salesValue;
      });
      restaurantTotals[restaurantId] = restaurantTotal;
      grandTotal += restaurantTotal;
    });

    return { restaurantTotals, grandTotal };
  };

  const { restaurantTotals, grandTotal } = calculateTotals();

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Download CSV function
  const handleDownloadCSV = () => {
    if (!processedData || Object.keys(processedData).length === 0) {
      toast({
        title: "No data",
        description: "No sales data available to download.",
        variant: "destructive"
      });
      return;
    }

    // Define headers
    const headers = [
      "Date",
      ...Object.entries(processedData).map(([restaurantId, restaurant]) => restaurant.name),
      "Total"
    ];

    const rows: string[][] = [];
    
    // Add data rows for each date
    dateRange.forEach((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const row = [
        dateStr,
        ...Object.entries(processedData).map(([restaurantId, restaurant]) => {
          const salesValue = restaurant[dateStr] || '0.00';
          return formatCurrency(salesValue).replace('$', '').trim(); // Remove $ for CSV
        }),
        // Total for this date
        formatCurrency(
          Object.entries(processedData).reduce((total, [restaurantId, restaurant]) => {
            const salesValue = parseFloat(restaurant[dateStr] || '0');
            return total + (isNaN(salesValue) ? 0 : salesValue);
          }, 0)
        ).replace('$', '').trim()
      ];
      rows.push(row);
    });

    // Add totals row
    const totalsRow = [
      "Total",
      ...Object.entries(processedData).map(([restaurantId, restaurant]) => {
        return formatCurrency(restaurantTotals[restaurantId] || 0).replace('$', '').trim();
      }),
      formatCurrency(grandTotal).replace('$', '').trim()
    ];
    rows.push(totalsRow);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Generate filename with date range
    const startDateStr = startDate ? format(startDate, "yyyy-MM-dd") : "start";
    const endDateStr = endDate ? format(endDate, "yyyy-MM-dd") : "end";
    const filename = `everyday-sales-${startDateStr}-to-${endDateStr}.csv`;
    
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: `Everyday sales report downloaded as ${filename}`
    });
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
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Everyday Sales Report</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end no-print">
          {/* From Date Picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">From Date</span>
            <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "yyyy-MM-dd") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setIsStartDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* To Date Picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">To Date</span>
            <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "yyyy-MM-dd") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setIsEndDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Location</span>
            <Select value={selectedLocation} onValueChange={handleLocationChange}>
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

          {/* Print and Refresh Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handlePrint} className="w-10 h-10 p-0">
              <PrinterIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleDownloadCSV} className="w-10 h-10 p-0">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="w-10 h-10 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table className="print-table">
              <TableHeader className="bg-[#0F172A]">
                <TableRow>
                  <TableHead className="text-white font-medium">Date</TableHead>
                  {Object.entries(processedData).map(([restaurantId, restaurant]) => (
                    <TableHead key={restaurantId} className="text-white font-medium">
                      {restaurant.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {!processedData || Object.keys(processedData).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      No data available for the selected criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  dateRange.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    return (
                      <TableRow key={dateStr} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {dateStr}
                        </TableCell>
                        {Object.entries(processedData).map(([restaurantId, restaurant]) => {
                          const salesValue = restaurant[dateStr] || '0.00';
                          return (
                            <TableCell key={`${restaurantId}-${dateStr}`} className="text-left">
                              {formatCurrency(salesValue)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
                
                {/* Total Row */}
                {processedData && Object.keys(processedData).length > 0 && (
                  <TableRow className="border-t-2 border-gray-300 bg-gray-100 font-bold">
                    <TableCell className="font-bold text-left">
                      Total
                    </TableCell>
                    {Object.entries(processedData).map(([restaurantId, restaurant]) => (
                      <TableCell key={`total-${restaurantId}`} className="text-left font-bold">
                        {formatCurrency(restaurantTotals[restaurantId] || 0)}
                      </TableCell>
                    ))}
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

export default EverydaySalesReport; 