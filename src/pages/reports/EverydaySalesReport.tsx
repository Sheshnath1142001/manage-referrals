import React, { useState } from "react";
import {
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ReportDatePicker } from "@/components/ui/report-date-picker";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useEverydaySalesReport } from "@/hooks/reports/useEverydaySalesReport";

interface DailySalesData {
  [date: string]: {
    created_date: string;
    num_items_sold: string;
    sales_price: string;
    restaurant_id: string;
    restaurant_name: string;
    group_clause: string;
  }
}

const EverydaySalesReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState("0");
  const { restaurants: locations } = useGetRestaurants();

  // Use the custom hook for data fetching
  const { 
    data: salesData, 
    isLoading, 
    refetch,
    weekDates: { sunday, saturday },
    formatCurrency 
  } = useEverydaySalesReport({
    restaurantId: selectedLocation,
    selectedDate
  });
  
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

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
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
        const firstDayData = Object.values(daysData)[0];
        processed[restaurantId] = {
          name: firstDayData?.restaurant_name || 'Unknown Location',
        };
        
        // Add sales data for each day
        Object.entries(daysData).forEach(([dateStr, dayData]) => {
          processed[restaurantId][dateStr] = dayData?.sales_price || '0';
        });
      }
    });
    
    return processed;
  };
  
  const processedData = processDataForDisplay();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Everyday Sales Report</h1>
        </div>
        <div className="text-sm text-[#9b87f5] font-medium">
          ADMIN
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ReportDatePicker 
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
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
                <TableHead className="text-white font-medium rounded-tl-lg w-1/4">Day</TableHead>
                {Object.entries(processedData).map(([restaurantId, restaurant], index) => (
                  <TableHead 
                    key={restaurantId}
                    className={`text-white font-medium text-center 
                      ${index === Object.keys(processedData).length - 1 ? 'rounded-tr-lg' : ''}`}
                  >
                    {restaurant.name} {index === 0 && '↑'}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {weekDates.map((date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return (
                  <TableRow key={dateStr} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {dateStr}
                    </TableCell>
                    {Object.entries(processedData).map(([restaurantId, restaurant]) => {
                      const salesValue = restaurant[dateStr] || '0.00';
                      return (
                        <TableCell key={`${restaurantId}-${dateStr}`} className="text-right">
                          {formatCurrency(salesValue)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EverydaySalesReport; 