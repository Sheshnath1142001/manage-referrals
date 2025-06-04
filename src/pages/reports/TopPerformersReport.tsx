import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, eachDayOfInterval } from "date-fns";
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
  const { restaurants: locations } = useGetRestaurants();
  const { users, isLoading: isLoadingUsers } = useGetUsers();

  // Debug: log users array
  console.log('Users in dropdown:', users);

  // Use the custom hook for data fetching
  const { 
    data: performersData, 
    isLoading, 
    refetch,
    weekDates: { sunday, saturday },
    formatCurrency 
  } = useTopPerformersReport({
    restaurantId: selectedLocation,
    selectedDate,
    userId: selectedUser
  });
  
  useEffect(() => {
    // Log the data for debugging
    if (performersData && Object.keys(performersData.data || {}).length > 0) {
      console.log("Current performers data:", performersData);
    } else {
      console.log("No performers data available");
    }
  }, [performersData]);

  // Generate array of dates for the week
  const weekDates = eachDayOfInterval({ start: sunday, end: saturday });

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

  // Helper function to safely access properties
  const safelyGetProperty = (obj: any, key: string, defaultValue: any = "0") => {
    return obj && obj[key] !== undefined ? obj[key] : defaultValue;
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
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Top Performers Report</h1>
        </div>
        <div className="text-sm text-[#9b87f5] font-medium">
          ADMIN
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ReportDatePicker 
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

        <Select
          value={selectedLocation}
          onValueChange={handleLocationChange}
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

        <div className="flex items-center gap-4">
          <Select
            value={selectedUser}
            onValueChange={handleUserChange}
            className="flex-1"
            disabled={isLoadingUsers}
          >
            <SelectTrigger>
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
          <Table>
            <TableHeader className="bg-[#0F172A]">
              <TableRow>
                <TableHead className="text-white font-medium rounded-tl-lg">Performer</TableHead>
                <TableHead className="text-white font-medium">Location</TableHead>
                <TableHead className="text-white font-medium">Attributes</TableHead>
                {weekDates.map((date, index) => (
                  <TableHead 
                    key={format(date, "yyyy-MM-dd")}
                    className={`text-white font-medium text-right ${index === weekDates.length - 1 ? "" : "border-r border-gray-700"}`}
                  >
                    {format(date, "EEE, MMM d")}
                  </TableHead>
                ))}
                <TableHead className="text-white font-medium text-right rounded-tr-lg">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPerformers.length > 0 ? (
                allPerformers.map(([performerId, performerData]) => {
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
                      {weekDates.map((date) => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        const dayData = performerData[dateStr];
                        const value = safelyGetProperty(dayData, attr.key, "0");
                        
                        return (
                          <TableCell 
                            key={dateStr} 
                            className="text-right border-r"
                          >
                            {attr.key === "sale" ? formatCurrency(value) : value}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-medium">
                        {attr.key === "sale" 
                          ? formatCurrency(
                              weekDates.reduce((total, date) => {
                                const dateStr = format(date, "yyyy-MM-dd");
                                const value = safelyGetProperty(performerData[dateStr], attr.key, "0");
                                return total + parseFloat(value);
                              }, 0)
                            )
                          : weekDates.reduce((total, date) => {
                              const dateStr = format(date, "yyyy-MM-dd");
                              const value = safelyGetProperty(performerData[dateStr], attr.key, "0");
                              return total + parseInt(value || "0");
                            }, 0)
                        }
                      </TableCell>
                    </TableRow>
                  ));
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={weekDates.length + 4} className="text-center py-10">
                    No data found for the selected criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default TopPerformersReport;
