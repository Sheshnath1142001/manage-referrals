
import React, { useEffect } from "react";
import {
  RefreshCw,
  CalendarIcon,
  ArrowLeft,
  PrinterIcon
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
import { TimePicker } from "@/components/ui/time-picker";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useHourlySalesReport } from "@/hooks/reports/useHourlySalesReport";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ViewToggle } from "@/components/ui/view-toggle";
import { TableChartToggle } from "@/components/ui/table-chart-toggle";

interface LocalHourlySalesData {
  timestamp: string;
  hour: string;
  restaurant_id: string;
  restaurant_name: string;
  total_orders: string;
  sale: string;
  group_clause: string;
}

interface RestaurantData {
  [timeSlot: string]: LocalHourlySalesData;
}

const HourlySalesReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restaurants: locations } = useGetRestaurants();
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState("table");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("05:00 PM");
  const [salesMetric, setSalesMetric] = useState("net_sale");

  // Generate time slots based on start and end time
  const generateTimeSlots = (start: string, end: string) => {
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      return hour24;
    };

    const formatTime = (hour: number) => {
      const period = hour >= 12 ? 'pm' : 'am';
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${hour12}${period}`;
    };

    const startHour = parseTime(start);
    const endHour = parseTime(end);
    const slots = [];
    
    let currentHour = startHour;
    while (currentHour < endHour) {
      const nextHour = currentHour + 1;
      const startFormat = formatTime(currentHour);
      const endFormat = formatTime(nextHour);
      slots.push(`${startFormat} - ${endFormat}`);
      currentHour++;
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots(startTime, endTime);

  // Use the enhanced hook for data fetching
  const { data: salesData, isLoading, refetch } = useHourlySalesReport({
    date: selectedDate,
    restaurantId: selectedLocation,
    startTime: startTime,
    endTime: endTime
  });

  // Log data for debugging
  useEffect(() => {
    console.log('Sales data:', salesData);
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
  const calculateTotals = (): Record<string, { sale: number; orders: number }> | null => {
    if (isDataEmpty) return null;
    
    const totals: Record<string, { sale: number; orders: number }> = {};
    
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
  const restaurantData = Object.entries(salesData || {})
    .sort((a, b) => {
      const aTotal = Object.values(a[1] as RestaurantData).reduce((sum, slot) => sum + parseFloat(slot.sale || "0"), 0);
      const bTotal = Object.values(b[1] as RestaurantData).reduce((sum, slot) => sum + parseFloat(slot.sale || "0"), 0);
      return bTotal - aTotal;
    }) as [string, RestaurantData][];

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
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Hourly Sales Report</h1>
        </div>

        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200 no-print">
          {/* Main Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Title and Back Button */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-2 hover:bg-white/80 rounded-lg transition-all duration-200 shadow-sm"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hourly Sales Report</h1>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <TableChartToggle
                  value={selectedView}
                  onValueChange={handleViewChange}
                />
                <Button 
                  variant="outline" 
                  onClick={handlePrint} 
                  className="h-10 px-3 hover:bg-white transition-all duration-200 shadow-sm border-gray-300"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh} 
                  className="h-10 px-3 hover:bg-white transition-all duration-200 shadow-sm border-gray-300"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Date Picker */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal bg-white hover:bg-gray-50 border-gray-300 transition-colors"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {format(selectedDate, "MMM d, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Time
                  </label>
                  <TimePicker
                    value={startTime}
                    onValueChange={setStartTime}
                    placeholder="Start Time"
                  />
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    End Time
                  </label>
                  <TimePicker
                    value={endTime}
                    onValueChange={setEndTime}
                    placeholder="End Time"
                  />
                </div>

                {/* Location Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location
                  </label>
                  <Select
                    value={selectedLocation}
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 hover:bg-gray-50 transition-colors">
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

                {/* Sales Metric */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Sales Metric
                  </label>
                  <Select
                    value={salesMetric}
                    onValueChange={setSalesMetric}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 hover:bg-gray-50 transition-colors">
                      <SelectValue placeholder="Sales Metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net_sale">Net Sale</SelectItem>
                      <SelectItem value="gross_sale">Gross Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
              </div>
            </div>
          </div>
          
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
            </div>
          ) : isDataEmpty ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500">
              <p className="text-lg font-medium">No sales data available</p>
              <p className="text-sm mt-1">Try selecting a different date, time range, or location</p>
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
              <Table className="print-table">
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
                          const value = slotData?.[attr.key as keyof LocalHourlySalesData] || "0";
                          return (
                            <TableCell 
                              key={timeSlot} 
                              className="text-right border-r"
                            >
                              {attr.key === "sale" ? formatCurrency(String(value)) : String(value)}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-medium">
                          {attr.key === "sale" 
                            ? formatCurrency(
                                timeSlots.reduce((total, timeSlot) => {
                                  const value = restaurantData[timeSlot]?.[attr.key as keyof LocalHourlySalesData] || "0";
                                  return total + parseFloat(String(value));
                                }, 0)
                              )
                            : timeSlots.reduce((total, timeSlot) => {
                                const value = restaurantData[timeSlot]?.[attr.key as keyof LocalHourlySalesData] || "0";
                                return total + parseInt(String(value) || "0", 10);
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
                          {totalData ? formatCurrency(
                            Object.values(totalData).reduce((sum: number, slot) => sum + (slot?.sale || 0), 0)
                          ) : formatCurrency(0)}
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
                          {totalData ? Object.values(totalData).reduce((sum: number, slot) => sum + (slot?.orders || 0), 0) : 0}
                        </TableCell>
                      </TableRow>
                    </>
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

export default HourlySalesReport;
