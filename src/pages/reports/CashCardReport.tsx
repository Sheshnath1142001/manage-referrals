
import React, { useState } from "react";
import {
  RefreshCw,
  ArrowLeft,
  PrinterIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, startOfWeek, endOfWeek, addDays, subWeeks, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
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
import { useCashCardReport } from "@/hooks/reports/useCashCardReport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ViewToggle } from "@/components/ui/view-toggle";
import { TableChartToggle } from "@/components/ui/table-chart-toggle";

// Define report period types
enum ReportPeriodType {
  Day = 1,
  Week = 2,
  Month = 3,
  Year = 4
}

interface SalesData {
  restaurant_name: string;
  restaurant_id: string;
  sale: number;
  total_orders: number;
  total_cash_payment_amount: number;
  total_cash_payments: number;
  total_card_payment_amount: number;
  total_card_payments: number;
  website_card_amount: number;
  website_card_payments: number;
  mobile_app_card_amount: number;
  mobile_app_payments: number;
  other_payments?: {
    [key: string]: {
      amount: number;
      count: number;
      method_name: string;
      amount_label: string;
      count_label: string;
    };
  };
  group_clause: string;
}

interface RestaurantData {
  [date: string]: SalesData;
}

const CashCardReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [selectedView, setSelectedView] = useState("table");
  const [periodType, setPeriodType] = useState<ReportPeriodType>(ReportPeriodType.Day);
  const { restaurants: locations } = useGetRestaurants();
  
  // Use the enhanced hook for data fetching with selectedDate and periodType
  const { 
    data: salesData, 
    isLoading, 
    refetch,
    formatCurrency 
  } = useCashCardReport({
    restaurantId: selectedLocation,
    selectedDate,
    periodType
  });
  
  // Generate array of dates for the display based on period type
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
        const weekEnd = addDays(date, 6); // Add 6 days to get Saturday
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

  // Handle view change
  const handleViewChange = (value: string) => {
    setSelectedView(value);
  };

  const handlePeriodChange = (value: string) => {
    setPeriodType(parseInt(value) as ReportPeriodType);
  };

  // Prepare data for the chart
  const getChartData = () => {
    if (!salesData?.data) return [];
    
    return getDisplayDates().map((date) => {
      const dateStr = formatDisplayDate(date);
      const dayData = {};
      let cashTotal = 0;
      let cardTotal = 0;
      let onlineCardTotal = 0;
      
      // Sum up cash and card totals for all restaurants on this date
      Object.entries(salesData.data).forEach(([restaurantId, restaurantData]) => {
        const dateSalesData = restaurantData[dateStr];
        if (dateSalesData) {
          cashTotal += dateSalesData.total_cash_payment_amount || 0;
          cardTotal += dateSalesData.total_card_payment_amount || 0;
          
          // Add online card amounts from other_payments
          if (dateSalesData.other_payments) {
            Object.values(dateSalesData.other_payments).forEach(payment => {
              if (payment.method_name?.toLowerCase().includes('online') && 
                  payment.method_name?.toLowerCase().includes('card')) {
                onlineCardTotal += payment.amount || 0;
              }
            });
          }
        }
      });
      
      // Format the date label for display
      let dateLabel = dateStr;
      if (periodType === ReportPeriodType.Week) {
        const weekEnd = addDays(date, 6);
        dateLabel = `${format(date, "dd-MM-yyyy")} to ${format(weekEnd, "dd-MM-yyyy")}`;
      }
      
      return {
        date: dateLabel,
        cash: cashTotal,
        card: cardTotal,
        onlineCard: onlineCardTotal
      };
    });
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
              {entry.name}: <span className="font-medium ml-1">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get all restaurant data
  const restaurantData = Object.entries(salesData?.data || {})
    .sort((a, b) => {
      const aTotal = Object.values(a[1]).reduce((sum, day) => sum + (day.sale || 0), 0);
      const bTotal = Object.values(b[1]).reduce((sum, day) => sum + (day.sale || 0), 0);
      return bTotal - aTotal;
    });

  const isDataEmpty = !salesData?.data || Object.keys(salesData.data).length === 0;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Define all attributes to display
  const attributes = [
    { key: 'sale', label: 'Sale', color: 'text-purple-600' },
    { key: 'total_orders', label: 'Orders', color: 'text-blue-600' },
    { key: 'total_card_payment_amount', label: 'Card Payment Amount', color: 'text-indigo-600' },
    { key: 'total_card_payments', label: 'Card Payments', color: 'text-indigo-500' },
    { key: 'total_cash_payment_amount', label: 'Cash Payment Amount', color: 'text-green-600' },
    { key: 'total_cash_payments', label: 'Cash Payments', color: 'text-green-500' },
    { key: 'website_card_amount', label: 'Website Card Payment Amount', color: 'text-cyan-600' },
    { key: 'website_card_payments', label: 'Website Card Payments', color: 'text-cyan-500' },
    { key: 'mobile_app_card_amount', label: 'App Card Payment Amount', color: 'text-orange-600' },
    { key: 'mobile_app_payments', label: 'App Card Payments', color: 'text-orange-500' },
  ];

  // Get online card payment totals for a specific date and restaurant
  const getOnlineCardTotals = (restaurant: RestaurantData, dateStr: string) => {
    const dayData = restaurant[dateStr];
    if (!dayData?.other_payments) return { amount: 0, count: 0 };
    
    let totalAmount = 0;
    let totalCount = 0;
    
    Object.values(dayData.other_payments).forEach(payment => {
      if (payment.method_name?.toLowerCase().includes('online') && 
          payment.method_name?.toLowerCase().includes('card')) {
        totalAmount += payment.amount || 0;
        totalCount += payment.count || 0;
      }
    });
    
    return { amount: totalAmount, count: totalCount };
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
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Cash & Card Report</h1>
        </div>

        <div className="space-y-4 mb-6 no-print">
          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div className="w-full">
              <DatePicker
                date={selectedDate}
                onSelect={handleDateChange}
                placeholder="Select date"
              />
            </div>

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

            <TableChartToggle 
              value={selectedView}
              onValueChange={handleViewChange}
            />
          </div>

          {/* Action Buttons Row - Always visible */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handlePrint} className="w-10 h-10 p-0">
              <PrinterIcon className="h-4 w-4" />
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
                  <Bar 
                    dataKey="cash" 
                    fill="#4ade80" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20} 
                    name="Cash"
                  />
                  <Bar 
                    dataKey="card" 
                    fill="#9b87f5" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20} 
                    name="Card"
                  />
                  <Bar 
                    dataKey="onlineCard" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]} 
                    barSize={20} 
                    name="Online Card"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table className="print-table min-w-full">
              <TableHeader className="bg-[#0F172A]">
                <TableRow>
                  <TableHead className="text-white font-medium rounded-tl-lg whitespace-nowrap sticky left-0 bg-[#0F172A] z-20">Location</TableHead>
                  <TableHead className="text-white font-medium whitespace-nowrap sticky left-[120px] bg-[#0F172A] z-10">Attributes</TableHead>
                  {getDisplayDates().map((date, index) => (
                    <TableHead 
                      key={date.toISOString()} 
                      className="text-white font-medium text-center whitespace-nowrap min-w-[120px]"
                    >
                      {formatDateHeader(date)}
                    </TableHead>
                  ))}
                  <TableHead className="text-white font-medium text-center rounded-tr-lg whitespace-nowrap min-w-[120px]">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDataEmpty ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      No data available for the selected criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  restaurantData.map(([restaurantId, restaurant]) => {
                    const restaurantName = Object.values(restaurant)[0]?.restaurant_name || 'Unknown';

                    return (
                      <React.Fragment key={restaurantId}>
                        {attributes.map((attribute, attrIndex) => {
                          let total = 0;
                          
                          return (
                            <TableRow key={`${restaurantId}-${attribute.key}`}>
                              {attrIndex === 0 && (
                                <TableCell 
                                  rowSpan={attributes.length + 2} 
                                  className="font-medium whitespace-nowrap sticky left-0 bg-white z-20 border-r"
                                >
                                  {restaurantName}
                                </TableCell>
                              )}
                              <TableCell className={`${attribute.color} whitespace-nowrap sticky left-[120px] bg-white z-10 border-r`}>
                                {attribute.label}
                              </TableCell>
                              {getDisplayDates().map((date) => {
                                const dateStr = formatDisplayDate(date);
                                const dayData = restaurant[dateStr];
                                let value = 0;
                                
                                if (dayData) {
                                  if (attribute.key === 'sale') {
                                    value = dayData.sale || 0;
                                  } else if (attribute.key === 'total_orders') {
                                    value = dayData.total_orders || 0;
                                  } else if (attribute.key === 'total_card_payment_amount') {
                                    value = dayData.total_card_payment_amount || 0;
                                  } else if (attribute.key === 'total_card_payments') {
                                    value = dayData.total_card_payments || 0;
                                  } else if (attribute.key === 'total_cash_payment_amount') {
                                    value = dayData.total_cash_payment_amount || 0;
                                  } else if (attribute.key === 'total_cash_payments') {
                                    value = dayData.total_cash_payments || 0;
                                  } else if (attribute.key === 'website_card_amount') {
                                    value = dayData.website_card_amount || 0;
                                  } else if (attribute.key === 'website_card_payments') {
                                    value = dayData.website_card_payments || 0;
                                  } else if (attribute.key === 'mobile_app_card_amount') {
                                    value = dayData.mobile_app_card_amount || 0;
                                  } else if (attribute.key === 'mobile_app_payments') {
                                    value = dayData.mobile_app_payments || 0;
                                  }
                                }
                                
                                total += value;
                                
                                return (
                                  <TableCell key={`${dateStr}-${attribute.key}`} className="text-center whitespace-nowrap">
                                    <span className={attribute.color}>
                                      {attribute.key.includes('amount') || attribute.key === 'sale' 
                                        ? formatCurrency(value) 
                                        : value.toString()}
                                    </span>
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-center font-medium whitespace-nowrap">
                                <span className={attribute.color}>
                                  {attribute.key.includes('amount') || attribute.key === 'sale' 
                                    ? formatCurrency(total) 
                                    : total.toString()}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        {/* Online Card Payment Amount Row */}
                        <TableRow>
                          <TableCell className="text-red-600 whitespace-nowrap sticky left-[120px] bg-white z-10 border-r">
                            Online Card Payment Amount
                          </TableCell>
                          {getDisplayDates().map((date) => {
                            const dateStr = formatDisplayDate(date);
                            const onlineCardTotals = getOnlineCardTotals(restaurant, dateStr);
                            return (
                              <TableCell key={`${dateStr}-online-amount`} className="text-center whitespace-nowrap">
                                <span className="text-red-600">
                                  {formatCurrency(onlineCardTotals.amount)}
                                </span>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center font-medium whitespace-nowrap">
                            <span className="text-red-600">
                              {formatCurrency(
                                getDisplayDates().reduce((total, date) => {
                                  const dateStr = formatDisplayDate(date);
                                  const onlineCardTotals = getOnlineCardTotals(restaurant, dateStr);
                                  return total + onlineCardTotals.amount;
                                }, 0)
                              )}
                            </span>
                          </TableCell>
                        </TableRow>

                        {/* Online Card Payments Row */}
                        <TableRow>
                          <TableCell className="text-red-500 whitespace-nowrap sticky left-[120px] bg-white z-10 border-r">
                            Online Card Payments
                          </TableCell>
                          {getDisplayDates().map((date) => {
                            const dateStr = formatDisplayDate(date);
                            const onlineCardTotals = getOnlineCardTotals(restaurant, dateStr);
                            return (
                              <TableCell key={`${dateStr}-online-count`} className="text-center whitespace-nowrap">
                                <span className="text-red-500">
                                  {onlineCardTotals.count}
                                </span>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center font-medium whitespace-nowrap">
                            <span className="text-red-500">
                              {getDisplayDates().reduce((total, date) => {
                                const dateStr = formatDisplayDate(date);
                                const onlineCardTotals = getOnlineCardTotals(restaurant, dateStr);
                                return total + onlineCardTotals.count;
                              }, 0)}
                            </span>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default CashCardReport;
