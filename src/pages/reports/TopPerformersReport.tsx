
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  RefreshCw,
  PrinterIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Restaurant } from "@/services/api/restaurants";
import { ReportDatePicker } from "@/components/ui/report-date-picker";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useTopPerformersReport } from "@/hooks/reports/useTopPerformersReport";
import { useGetUsers } from "@/hooks/useGetUsers";

interface PerformerData {
  sale: string;
  total_orders: string;
  restaurant_id: string;
  restaurant_name: string;
  performers_id: string;
  performers_name: string;
  group_clause: string;
}

interface PerformerDailyData {
  [date: string]: PerformerData;
}

interface TopPerformerData {
  item_name: string;
  quantity_sold: number;
  total_revenue: number;
}

interface ApiResponse {
  data: {
    [performerId: string]: PerformerDailyData;
  };
  total: number;
}

interface User {
  id: string;
  name: string;
  role_id: number;
  roles: {
    id: number;
    role: string;
  };
  employee_outlet_id: number;
  restaurants_users_employee_outlet_idTorestaurants: {
    id: number;
    name: string;
  };
  restaurant_id: number;
  restaurants_users_restaurant_idTorestaurants: {
    id: number;
    name: string;
  };
  username: string;
  email: string;
  phone_no: string;
  status: number;
}

const TopPerformersReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedUser, setSelectedUser] = useState("0");
  const [periodType, setPeriodType] = useState("day"); // Add period type state
  const { restaurants: locations } = useGetRestaurants();
  const { users, isLoading: isLoadingUsers } = useGetUsers();

  // Debug: log users array
  

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

  // Use the custom hook for data fetching with updated parameters
  const { 
    data: performersData, 
    isLoading, 
    refetch,
    formatCurrency 
  } = useTopPerformersReport({
    restaurantId: selectedLocation,
    selectedDate,
    userId: selectedUser,
    periodType // Pass period type to hook
  });

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
        // Show weeks
        const weeks = [];
        let currentWeekStart = startDate;
        while (currentWeekStart <= endDate) {
          weeks.push(currentWeekStart);
          currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
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
  
  useEffect(() => {
    // Log the data for debugging
    if (performersData && Object.keys(performersData.data || {}).length > 0) {
      console.log("Performers data received:", performersData);
    } else {
      console.log("No performers data");
    }
  }, [performersData]);

  const handleBack = () => {
    navigate("/reports");
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  const handleUserChange = (value: string) => {
    setSelectedUser(value);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handlePeriodChange = (value: string) => {
    setPeriodType(value);
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
  const safelyGetProperty = (obj: PerformerData | undefined, key: string, defaultValue: string = "0"): string => {
    return obj && obj[key as keyof PerformerData] !== undefined ? obj[key as keyof PerformerData] : defaultValue;
  };

  // Get performer name from data
  const getPerformerName = (performerData: PerformerDailyData) => {
    // Find the first day with data
    const firstDay = Object.values(performerData)[0];
    return firstDay?.performers_name || 'Unknown Performer';
  };

  // Get restaurant name from data
  const getRestaurantName = (performerData: PerformerDailyData) => {
    // Find the first day with data 
    const firstDay = Object.values(performerData)[0];
    return firstDay?.restaurant_name || 'Unknown Location';
  };

  // Get all performers data (unfiltered)
  const allPerformers = Object.entries(performersData?.data || {}).filter(([_, performerData]) => {
    return Object.keys(performerData).length > 0;
  }) as [string, PerformerDailyData][];

  // Sort performers by total sales in descending order
  const sortedPerformers = [...allPerformers].sort((a, b) => {
    const getTotalSales = (data: PerformerDailyData) => {
      return Object.values(data).reduce((total, dayData) => {
        return total + parseFloat(dayData?.sale || "0");
      }, 0);
    };

    const totalSalesA = getTotalSales(a[1]);
    const totalSalesB = getTotalSales(b[1]);
    return totalSalesB - totalSalesA;
  });

  // Function to format date headers based on period type
  const formatDateHeader = (date: Date) => {
    switch (periodType) {
      case "day":
        return format(date, "EEE, MMM d");
      case "week":
        return format(date, "MMM d");
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
        return format(date, "yyyy-MM-dd");
      case "month":
        return format(date, "MMM yyyy");
      case "year":
        return format(date, "yyyy");
      default:
        return format(date, "yyyy-MM-dd");
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
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Top Performers Report</h1>
        </div>

        <div className="p-6">

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

        <Select
          value={selectedUser}
          onValueChange={handleUserChange}
          disabled={isLoadingUsers}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select user"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All Users</SelectItem>
            {isLoadingUsers ? (
              <SelectItem value="loading" disabled>
                Loading users...
              </SelectItem>
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                No users available
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <div className="sm:col-span-2 lg:col-span-1 flex justify-end gap-2 sm:ml-auto">
          <Button variant="outline" onClick={handlePrint} className="w-10 h-10 p-0">
            <PrinterIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="w-10 h-10 p-0"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table className="print-table">
            <TableHeader className="bg-[#0F172A]">
              <TableRow>
                <TableHead className="text-white font-medium rounded-tl-lg">Performer</TableHead>
                <TableHead className="text-white font-medium">Location</TableHead>
                <TableHead className="text-white font-medium">Attributes</TableHead>
                {displayDates.map((date, index) => (
                  <TableHead 
                    key={date.toISOString()}
                    className={`text-white font-medium text-right ${index === displayDates.length - 1 ? "" : "border-r border-gray-700"}`}
                  >
                    {formatDateHeader(date)}
                  </TableHead>
                ))}
                <TableHead className="text-white font-medium text-right rounded-tr-lg">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPerformers.length > 0 ? (
                sortedPerformers.map(([performerId, performerData]) => {
                  // Define attributes to display
                  const attributes = [
                    { label: "Sale", key: "sale" },
                    { label: "Orders", key: "total_orders" }
                  ];

                  return attributes.map((attr, attrIndex) => (
                    <TableRow 
                      key={`${performerId}-${attr.key}`}
                      className={attrIndex === 0 ? "border-t-2 border-gray-200" : ""}
                    >
                      {attrIndex === 0 && (
                        <>
                          <TableCell 
                            rowSpan={attributes.length} 
                            className="align-top border-r font-medium"
                          >
                            {getPerformerName(performerData)}
                          </TableCell>
                          <TableCell 
                            rowSpan={attributes.length} 
                            className="align-top border-r"
                          >
                            {getRestaurantName(performerData)}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="border-r">{attr.label}</TableCell>
                      {displayDates.map((date) => {
                        const dateKey = getDataKey(date);
                        const dayData = performerData[dateKey];
                        const value = safelyGetProperty(dayData, attr.key, "0");
                        
                        return (
                          <TableCell 
                            key={dateKey} 
                            className="text-right border-r"
                          >
                            {attr.key === "sale" ? formatCurrency(value) : value}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-medium">
                        {attr.key === "sale" 
                          ? formatCurrency(
                              displayDates.reduce((total, date) => {
                                const dateKey = getDataKey(date);
                                const value = safelyGetProperty(performerData[dateKey], attr.key, "0");
                                return total + parseFloat(value);
                              }, 0)
                            )
                          : displayDates.reduce((total, date) => {
                              const dateKey = getDataKey(date);
                              const value = safelyGetProperty(performerData[dateKey], attr.key, "0");
                              return total + parseInt(value || "0");
                            }, 0)
                        }
                      </TableCell>
                    </TableRow>
                  ));
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={displayDates.length + 4} className="text-center py-10">
                    No data found for the selected criteria
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
}

export default TopPerformersReport;
