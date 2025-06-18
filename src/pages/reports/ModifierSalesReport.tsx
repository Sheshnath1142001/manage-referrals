import React, { useState, useEffect } from "react";
import {
  Download,
  PrinterIcon,
  RefreshCw,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears, eachDayOfInterval } from "date-fns";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { reportsApi } from "@/services/api/reports";
import { ReportType } from "@/types/reports";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { ReportDatePicker } from "@/components/ui/report-date-picker";

// Type definition for the API response
interface ModifierReportItem {
  total_orders: string;
  modifier_sale: string;
  modifier_total_sold_quantity: string;
  modifier: string;
  product_id: string;
  product_name: string;
  modifier_id: string;
  modifier_category_id: number;
  modifier_category: string;
  category_name: string;
  group_clause: string;
}

// Type for structured data format
interface ModifierData {
  item_name: string;
  category_name: string;
  modifierCategories: {
    [categoryId: string]: {
      name: string;
      modifiers: {
        [modifierId: string]: {
          name: string;
          sales: { [date: string]: number };
          quantities: { [date: string]: number };
        }
      }
    }
  }
}

const ModifierSalesReport = () => {
  const { toast } = useToast();
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [periodType, setPeriodType] = useState("day");
  const [searchQuery, setSearchQuery] = useState("");
  const [salesData, setSalesData] = useState<ModifierData[]>([]);

  // Function to get date range based on period type
  const getDateRangeForPeriod = () => {
    const currentDate = selectedDate;
    
    switch (periodType) {
      case "day":
        // For day: get current week (Sunday to Saturday)
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return {
          start_date: format(weekStart, "yyyy-MM-dd"),
          end_date: format(weekEnd, "yyyy-MM-dd"),
          report_type: 1
        };
      
      case "week":
        // For week: get from 7 weeks ago to current week
        const sevenWeeksAgo = subWeeks(currentDate, 6);
        const currentWeekStart = startOfWeek(sevenWeeksAgo, { weekStartsOn: 0 });
        const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return {
          start_date: format(currentWeekStart, "yyyy-MM-dd"),
          end_date: format(currentWeekEnd, "yyyy-MM-dd"),
          report_type: 2
        };
      
      case "month":
        // For month: get from 6 months ago to current month
        const sixMonthsAgo = subMonths(currentDate, 6);
        const monthStart = startOfMonth(sixMonthsAgo);
        const monthEnd = endOfMonth(currentDate);
        return {
          start_date: format(monthStart, "yyyy-MM-dd"),
          end_date: format(monthEnd, "yyyy-MM-dd"),
          report_type: 3
        };
      
      case "year":
        // For year: get from 2019 to current year
        const yearStart = new Date(2019, 0, 1); // January 1, 2019
        const yearEnd = endOfYear(currentDate);
        return {
          start_date: format(yearStart, "yyyy-MM-dd"),
          end_date: format(yearEnd, "yyyy-MM-dd"),
          report_type: 4
        };
      
      default:
        const defaultStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const defaultEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return {
          start_date: format(defaultStart, "yyyy-MM-dd"),
          end_date: format(defaultEnd, "yyyy-MM-dd"),
          report_type: 1
        };
    }
  };

  // Generate array of dates based on period type
  const getDisplayDates = () => {
    const { start_date, end_date } = getDateRangeForPeriod();
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    switch (periodType) {
      case "day":
        // Show days of the week
        return eachDayOfInterval({ start: startDate, end: endDate });
      case "week":
        // Show weeks - generate week start dates for the range
        const weeks = [];
        let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 0 });
        while (currentWeekStart <= endDate) {
          weeks.push(currentWeekStart);
          currentWeekStart = addDays(currentWeekStart, 7); // Add 7 days for next week
        }
        return weeks;
      case "month":
        // Show months
        const months = [];
        let currentMonth = startOfMonth(startDate);
        while (currentMonth <= endDate) {
          months.push(currentMonth);
          currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        }
        return months;
      case "year":
        // Show years
        const years = [];
        let currentYear = startOfYear(startDate);
        while (currentYear <= endDate) {
          years.push(currentYear);
          currentYear = new Date(currentYear.getFullYear() + 1, 0, 1);
        }
        return years;
      default:
        return eachDayOfInterval({ start: startDate, end: endDate });
    }
  };

  const displayDates = getDisplayDates();

  // Function to format date headers based on period type
  const formatDateHeader = (date: Date) => {
    switch (periodType) {
      case "day":
        return format(date, "EEE, MMM d");
      case "week":
        const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
        return `${format(date, "MMM d")} - ${format(weekEnd, "MMM d")}`;
      case "month":
        return format(date, "MMM yyyy");
      case "year":
        return format(date, "yyyy");
      default:
        return format(date, "EEE, MMM d");
    }
  };

  // Function to get the correct key for data lookup based on period type
  const getDataKey = (date: Date) => {
    switch (periodType) {
      case "day":
        return format(date, "yyyy-MM-dd");
      case "week":
        // For week period, we need to check all dates within that week
        // Return the week start date in yyyy-MM-dd format
        return format(date, "yyyy-MM-dd");
      case "month":
        return format(date, "MMM yyyy");
      case "year":
        return format(date, "yyyy");
      default:
        return format(date, "yyyy-MM-dd");
    }
  };

  // Helper function to get all dates in a week for week period type
  const getWeekDates = (weekStart: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(format(addDays(weekStart, i), "yyyy-MM-dd"));
    }
    return dates;
  };

  // Function to get sales and quantity for a specific date/period
  const getModifierDataForPeriod = (modifier: any, date: Date) => {
    if (periodType === "week") {
      // For week, sum all data within that week
      const weekDates = getWeekDates(date);
      let totalSales = 0;
      let totalQuantity = 0;
      
      weekDates.forEach(dateKey => {
        totalSales += modifier.sales[dateKey] || 0;
        totalQuantity += modifier.quantities[dateKey] || 0;
      });
      
      return { sales: totalSales, quantity: totalQuantity };
    } else {
      // For other periods, use the formatted key
      const formattedDate = getDataKey(date);
      return {
        sales: modifier.sales[formattedDate] || 0,
        quantity: modifier.quantities[formattedDate] || 0
      };
    }
  };

  // Function to transform nested API data to a structured format
  const transformApiData = (apiData: any): ModifierData[] => {
    
    if (!apiData || !apiData.data) return [];
    
    const structuredData: Record<string, ModifierData> = {};
    
    try {
      // Process each product
      Object.entries(apiData.data).forEach(([productId, productData]: [string, any]) => {
        let itemName = '';
        let categoryName = '';
        
        // Get or create the product entry
        if (!structuredData[productId]) {
          structuredData[productId] = {
            item_name: '',
            category_name: '',
            modifierCategories: {}
          };
        }
        
        // Process each modifier category
        Object.entries(productData).forEach(([categoryId, categoryData]: [string, any]) => {
          
          // Create category if it doesn't exist
          if (!structuredData[productId].modifierCategories[categoryId]) {
            structuredData[productId].modifierCategories[categoryId] = {
              name: '',
              modifiers: {}
            };
          }
          
          // Process each modifier
          Object.entries(categoryData).forEach(([modifierId, modifierData]: [string, any]) => {
            
            // Create modifier if it doesn't exist
            if (!structuredData[productId].modifierCategories[categoryId].modifiers[modifierId]) {
              structuredData[productId].modifierCategories[categoryId].modifiers[modifierId] = {
                name: '',
                sales: {},
                quantities: {}
              };
            }
            
            // Process each date
            Object.entries(modifierData).forEach(([date, dateData]: [string, any]) => {
              const data = dateData as ModifierReportItem;
              
              // Set names if not already set
              itemName = data.product_name;
              categoryName = data.category_name;
              structuredData[productId].item_name = data.product_name;
              structuredData[productId].category_name = data.category_name;
              structuredData[productId].modifierCategories[categoryId].name = data.modifier_category;
              structuredData[productId].modifierCategories[categoryId].modifiers[modifierId].name = data.modifier;
              
              // Set sales and quantities
              const saleAmount = parseFloat(data.modifier_sale) || 0;
              const quantity = parseInt(data.modifier_total_sold_quantity) || 0;
              
              structuredData[productId].modifierCategories[categoryId].modifiers[modifierId].sales[date] = saleAmount;
              structuredData[productId].modifierCategories[categoryId].modifiers[modifierId].quantities[date] = quantity;
            });
          });
        });
      });
      
      
      return Object.values(structuredData);
    } catch (error) {
      
      return [];
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { start_date, end_date, report_type } = getDateRangeForPeriod();
      
      const response = await reportsApi.getModifierSalesReport({
        report_type,
        start_date,
        end_date,
        restaurant_id: parseInt(selectedLocation)
      });

      if (response) {
        // Transform the nested API response to a structured format
        const structuredData = transformApiData(response);
        setSalesData(structuredData);
      } else {
        setSalesData([]);
      }
    } catch (error) {
      console.error("Error fetching modifier sales data:", error);
      toast({
        title: "Error",
        description: "Failed to load modifier sales data.",
        variant: "destructive"
      });
      setSalesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const calculateTotals = React.useMemo(() => {
    const daySales = displayDates.map(date => ({ 
      sales: 0, 
      quantity: 0 
    }));
    
    const totalSales = { sales: 0, quantity: 0 };
    
    // Process each item
    salesData.forEach(item => {
      // Process each modifier category
      Object.values(item.modifierCategories).forEach(category => {
        // Process each modifier
        Object.values(category.modifiers).forEach(modifier => {
          // Process each date
          displayDates.forEach((date, dateIndex) => {
            const { sales, quantity } = getModifierDataForPeriod(modifier, date);
            
            daySales[dateIndex].sales += sales;
            daySales[dateIndex].quantity += quantity;
            
            totalSales.sales += sales;
            totalSales.quantity += quantity;
          });
        });
      });
    });
    
    return { daySales, totalSales };
  }, [salesData, displayDates, periodType]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePeriodChange = (value: string) => {
    setPeriodType(value);
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchData();
  }, [selectedLocation, selectedDate, periodType]);

  // Filter sales data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return salesData;
    
    return salesData.filter(item => {
      // Check if item name matches
      if (item.item_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Check if any modifier category or modifier name matches
      return Object.values(item.modifierCategories).some(category => {
        // Check category name
        if (category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return true;
        }
        
        // Check modifier names
        return Object.values(category.modifiers).some(modifier =>
          modifier.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    });
  }, [salesData, searchQuery]);

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

      <div className="print-container">
        {/* Print Header - Only visible when printing */}
        <div className="print-header" style={{ display: 'none' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Modifier Sales Report</h1>
        </div>

        <div className="p-6">
          {/* <div className="flex justify-between items-center mb-6 no-print">
            <div className="text-sm text-[#9b87f5] font-medium flex items-center gap-2">
              ADMIN
            </div>
          </div> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 no-print">
            <ReportDatePicker 
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />

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
              </SelectContent>
            </Select>
            
            <Select
              value={selectedLocation}
              onValueChange={handleLocationChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Locations</SelectItem>
                {!isLoadingRestaurants && restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item or modifier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1 flex justify-end gap-2 sm:ml-auto">
              <Button variant="outline" onClick={handlePrint}>
                <PrinterIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table className="border-collapse print-table">
                <TableHeader className="bg-[#0F172A]">
                  <TableRow>
                    <TableHead className="text-white font-medium">Item</TableHead>
                    <TableHead className="text-white font-medium">Modifier Category</TableHead>
                    <TableHead className="text-white font-medium">Modifier</TableHead>
                    <TableHead className="text-white font-medium">Attributes</TableHead>
                    {displayDates.map((date) => (
                      <TableHead 
                        key={date.toISOString()} 
                        className="text-white font-medium text-center whitespace-nowrap px-2 py-1"
                      >
                        {formatDateHeader(date)}
                      </TableHead>
                    ))}
                    <TableHead className="text-white font-medium text-center px-2 py-1">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-sm">
                  {filteredData.length > 0 ? (
                    <>
                      {filteredData.map((item, itemIndex) => {
                        // Get all categories for this item
                        const categories = Object.values(item.modifierCategories);
                        const rowSpanForItem = categories.reduce((total, category) => 
                          total + (Object.keys(category.modifiers).length * 2), 0);
                        
                        return (
                          <React.Fragment key={`item-${itemIndex}`}>
                            {categories.map((category, categoryIndex) => {
                              // Get all modifiers for this category
                              const modifiers = Object.values(category.modifiers);
                              const rowSpanForCategory = modifiers.length * 2;
                              
                              return (
                                <React.Fragment key={`category-${categoryIndex}`}>
                                  {modifiers.map((modifier, modifierIndex) => {
                                    // Calculate modifier totals
                                    let totalSales = 0;
                                    let totalQuantity = 0;
                                    
                                    displayDates.forEach(date => {
                                      const { sales, quantity } = getModifierDataForPeriod(modifier, date);
                                      totalSales += sales;
                                      totalQuantity += quantity;
                                    });
                                    
                                    return (
                                      <React.Fragment key={`modifier-${modifierIndex}`}>
                                        {/* Sale row */}
                                        <TableRow className="border-b border-gray-200">
                                          {modifierIndex === 0 && categoryIndex === 0 ? (
                                            <TableCell 
                                              rowSpan={rowSpanForItem} 
                                              className="px-2 py-1 border-r border-gray-200"
                                            >
                                              {item.item_name}
                                            </TableCell>
                                          ) : null}
                                          
                                          {modifierIndex === 0 ? (
                                            <TableCell 
                                              rowSpan={rowSpanForCategory} 
                                              className="px-2 py-1 border-r border-gray-200"
                                            >
                                              {category.name}
                                            </TableCell>
                                          ) : null}
                                          
                                          <TableCell className="px-2 py-1 border-r border-gray-200" rowSpan={2}>
                                            {modifier.name}
                                          </TableCell>
                                          
                                          <TableCell className="px-2 py-1 border-r border-gray-200 text-blue-600">
                                            Sale
                                          </TableCell>
                                          
                                          {displayDates.map((date, dateIndex) => {
                                            const { sales } = getModifierDataForPeriod(modifier, date);
                                            
                                            return (
                                              <TableCell key={dateIndex} className="text-center px-2 py-1 border-r border-gray-200">
                                                $ {sales.toFixed(2)}
                                              </TableCell>
                                            );
                                          })}
                                          
                                          <TableCell className="text-center font-medium px-2 py-1">
                                            $ {totalSales.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                        
                                        {/* Quantity row */}
                                        <TableRow className={
                                          modifierIndex === modifiers.length - 1 && categoryIndex < categories.length - 1
                                            ? "border-b-2 border-gray-300" // thicker border for category separation
                                            : "border-b border-gray-200"
                                        }>
                                          <TableCell className="px-2 py-1 border-r border-gray-200">
                                            Quantity
                                          </TableCell>
                                          
                                          {displayDates.map((date, dateIndex) => {
                                            const { quantity } = getModifierDataForPeriod(modifier, date);
                                            
                                            return (
                                              <TableCell key={dateIndex} className="text-center px-2 py-1 border-r border-gray-200">
                                                {quantity}
                                              </TableCell>
                                            );
                                          })}
                                          
                                          <TableCell className="text-center font-medium px-2 py-1">
                                            {totalQuantity}
                                          </TableCell>
                                        </TableRow>
                                      </React.Fragment>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                      
                      {/* Totals rows */}
                      <TableRow className="border-b border-gray-200 font-medium bg-gray-50">
                        <TableCell className="px-2 py-1">Total</TableCell>
                        <TableCell className="px-2 py-1">-</TableCell>
                        <TableCell className="px-2 py-1">-</TableCell>
                        <TableCell className="px-2 py-1 text-blue-600">Sale</TableCell>
                        {calculateTotals.daySales.map((dayTotal, index) => (
                          <TableCell key={index} className="text-center px-2 py-1">
                            $ {dayTotal.sales.toFixed(2)}
                          </TableCell>
                        ))}
                        <TableCell className="text-center px-2 py-1">
                          $ {calculateTotals.totalSales.sales.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="font-medium bg-gray-50">
                        <TableCell className="px-2 py-1">Total</TableCell>
                        <TableCell className="px-2 py-1">-</TableCell>
                        <TableCell className="px-2 py-1">-</TableCell>
                        <TableCell className="px-2 py-1">Quantity</TableCell>
                        {calculateTotals.daySales.map((dayTotal, index) => (
                          <TableCell key={index} className="text-center px-2 py-1">
                            {dayTotal.quantity}
                          </TableCell>
                        ))}
                        <TableCell className="text-center px-2 py-1">
                          {calculateTotals.totalSales.quantity}
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={displayDates.length + 5} className="text-center py-4">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModifierSalesReport;
