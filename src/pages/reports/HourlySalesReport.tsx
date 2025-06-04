import React, { useEffect } from "react";
import {
  RefreshCw,
  CalendarIcon,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useHourlySalesReport } from "@/hooks/reports/useHourlySalesReport";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ViewToggle } from "@/components/ui/view-toggle";
import { TableChartToggle } from "@/components/ui/table-chart-toggle";

interface HourlySalesData {
  timestamp: string;
  hour: string;
  restaurant_id: string;
  restaurant_name: string;
  total_orders: string;
  sale: string;
  group_clause: string;
}

interface RestaurantData {
  [timeSlot: string]: HourlySalesData;
}

const HourlySalesReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restaurants: locations } = useGetRestaurants();
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState("table"); // Add view toggle state

  // Generate time slots from 10 AM to 5 PM
  const timeSlots = [
    "10am - 11am",
    "11am - 12pm",
    "12pm - 1pm",
    "1pm - 2pm",
    "2pm - 3pm",
    "3pm - 4pm", 
    "4pm - 5pm",
    "5pm - 6pm"
  ];

  // Use the enhanced hook for data fetching
  const { data: salesData, isLoading, refetch } = useHourlySalesReport({
    date: selectedDate,
    restaurantId: selectedLocation,
    startTime: "10:00 AM",
    endTime: "05:00 PM"
  });

  // Log data for debugging
  useEffect(() => {
    console.log("API data received:", salesData);
  }, [salesData]);

  const handleBack = () => {
    navigate("/reports");
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  // Handle view change
  const handleViewChange = (value: string) => {
    setSelectedView(value);
  };

  // Format currency
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  // Prepare data for the chart
  const getChartData = () => {
    if (!salesData) return [];
    
    const chartData = timeSlots.map(timeSlot => {
      let totalSales = 0;
      let totalOrders = 0;
      
      // Sum all restaurant data for this time slot
      Object.values(salesData).forEach(restaurantData => {
        const slotData = restaurantData[timeSlot];
        if (slotData) {
          totalSales += parseFloat(slotData.sale || '0');
          totalOrders += parseInt(slotData.total_orders || '0', 10);
        }
      });
      
      return {
        timeSlot,
        sales: totalSales,
        orders: totalOrders
      };
    });
    
    return chartData;
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
              {entry.name === "sales" ? "Sales" : "Orders"}: 
              <span className="font-medium ml-1">
                {entry.name === "sales" ? formatCurrency(entry.value) : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Is data empty?
  const isDataEmpty = !salesData || Object.keys(salesData).length === 0;

  // Calculate totals
  const calculateTotals = () => {
    if (isDataEmpty) return null;
    
    const totals = {};
    
    // Initialize all slots with zeros
    timeSlots.forEach(slot => {
      totals[slot] = { sale: 0, orders: 0 };
    });
    
    // Sum all data
    Object.values(salesData).forEach(restaurantData => {
      timeSlots.forEach(timeSlot => {
        const slotData = restaurantData[timeSlot];
        if (slotData) {
          totals[timeSlot].sale += parseFloat(slotData.sale || '0');
          totals[timeSlot].orders += parseInt(slotData.total_orders || '0', 10);
        }
      });
    });
    
    return totals;
  };
  
  const totalData = calculateTotals();

  // Get all restaurant data
  const restaurantData = Object.entries(salesData || {});

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Hourly Sales Report</h1>
        </div>
        <div className="text-sm text-[#9b87f5] font-medium">
          ADMIN
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

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

        <TableChartToggle
          value={selectedView}
          onValueChange={handleViewChange}
        />

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleRefresh} className="w-10 h-10 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
        </div>
      ) : isDataEmpty ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500">
          <p className="text-lg font-medium">No sales data available</p>
          <p className="text-sm mt-1">Try selecting a different date or location</p>
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
                  dataKey="timeSlot"
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
                  dataKey="sales" 
                  fill="#9b87f5" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20} 
                  name="sales"
                />
                <Bar 
                  yAxisId="right"
                  dataKey="orders" 
                  fill="#22c55e" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20} 
                  name="orders"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-[#0F172A]">
              <TableRow>
                <TableHead className="text-white font-medium rounded-tl-lg">Location</TableHead>
                <TableHead className="text-white font-medium">Attributes</TableHead>
                {timeSlots.map((timeSlot) => (
                  <TableHead 
                    key={timeSlot} 
                    className="text-white font-medium text-right"
                  >
                    {timeSlot}
                  </TableHead>
                ))}
                <TableHead className="text-white font-medium text-right rounded-tr-lg">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurantData.map(([restaurantId, restaurantData]) => {
                const attributes = [
                  { label: "Sale", key: "sale" },
                  { label: "Orders", key: "total_orders" }
                ];

                return attributes.map((attr, attrIndex) => (
                  <TableRow 
                    key={`${restaurantId}-${attr.key}`}
                    className={attrIndex === 0 ? "border-t-2 border-gray-200" : ""}
                  >
                    {attrIndex === 0 && (
                      <TableCell 
                        rowSpan={attributes.length} 
                        className="align-top border-r font-medium"
                      >
                        {Object.values(restaurantData)[0]?.restaurant_name || ''}
                      </TableCell>
                    )}
                    <TableCell className="border-r">{attr.label}</TableCell>
                    {timeSlots.map((timeSlot) => {
                      const slotData = restaurantData[timeSlot];
                      const value = slotData?.[attr.key] || "0";
                      return (
                        <TableCell 
                          key={timeSlot} 
                          className="text-right border-r"
                        >
                          {attr.key === "sale" ? formatCurrency(value) : value}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-medium">
                      {attr.key === "sale" 
                        ? formatCurrency(
                            timeSlots.reduce((total, timeSlot) => {
                              const value = restaurantData[timeSlot]?.[attr.key] || "0";
                              return total + parseFloat(value);
                            }, 0)
                          )
                        : timeSlots.reduce((total, timeSlot) => {
                            const value = restaurantData[timeSlot]?.[attr.key] || "0";
                            return total + parseInt(value || "0", 10);
                          }, 0)
                      }
                    </TableCell>
                  </TableRow>
                ));
              })}

              {/* Total row */}
              {totalData && (
                <>
                  <TableRow className="border-t-2 border-gray-200 bg-gray-50">
                    <TableCell rowSpan={2} className="align-top border-r font-medium">
                      Total
                    </TableCell>
                    <TableCell className="border-r font-medium">Sale</TableCell>
                    {timeSlots.map((timeSlot) => (
                      <TableCell key={timeSlot} className="text-right border-r font-medium">
                        {formatCurrency(totalData[timeSlot]?.sale || 0)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-medium">
                      {formatCurrency(
                        Object.values(totalData).reduce((sum, slot) => sum + slot.sale, 0)
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-gray-50">
                    <TableCell className="border-r font-medium">Orders</TableCell>
                    {timeSlots.map((timeSlot) => (
                      <TableCell key={timeSlot} className="text-right border-r font-medium">
                        {totalData[timeSlot]?.orders || 0}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-medium">
                      {Object.values(totalData).reduce((sum, slot) => sum + slot.orders, 0)}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default HourlySalesReport;
