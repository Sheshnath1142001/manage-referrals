import React, { useState } from "react";
import {
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useCashCardReport } from "@/hooks/reports/useCashCardReport";
import { ReportDatePicker } from "@/components/ui/report-date-picker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ViewToggle } from "@/components/ui/view-toggle";
import { TableChartToggle } from "@/components/ui/table-chart-toggle";

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
  const [selectedView, setSelectedView] = useState("table"); // Add view toggle state
  const { restaurants: locations } = useGetRestaurants();
  
  // Use the enhanced hook for data fetching with selectedDate
  const { 
    data: salesData, 
    isLoading, 
    refetch,
    weekDates: { sunday, saturday },
    formatCurrency 
  } = useCashCardReport({
    restaurantId: selectedLocation,
    selectedDate
  });
  
  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => 
    addDays(sunday, i)
  );

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

  // Prepare data for the chart
  const getChartData = () => {
    if (!salesData?.data) return [];
    
    return weekDates.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayData = {};
      let cashTotal = 0;
      let cardTotal = 0;
      
      // Sum up cash and card totals for all restaurants on this date
      Object.entries(salesData.data).forEach(([restaurantId, restaurantData]) => {
        const dateSalesData = restaurantData[dateStr];
        if (dateSalesData) {
          cashTotal += dateSalesData.total_cash_payment_amount || 0;
          cardTotal += dateSalesData.total_card_payment_amount || 0;
        }
      });
      
      return {
        date: dateStr,
        cash: cashTotal,
        card: cardTotal
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
  const restaurantData = Object.entries(salesData?.data || {});
  const isDataEmpty = !salesData?.data || Object.keys(salesData.data).length === 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Cash & Card Report</h1>
        </div>
        <div className="text-sm text-[#9b87f5] font-medium">
          ADMIN
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
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

        <ReportDatePicker 
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

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
                {weekDates.map((date, index) => (
                  <TableHead 
                    key={date.toISOString()} 
                    className="text-white font-medium text-right"
                  >
                    {format(date, "yyyy-MM-dd")}
                  </TableHead>
                ))}
                <TableHead className="text-white font-medium text-right rounded-tr-lg">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurantData.length > 0 ? (
                restaurantData.map(([restaurantId, restaurantData]) => {
                  const firstDayData = Object.values(restaurantData)[0] || {};
                  const attributes = [
                    { label: "Sale", key: "sale" },
                    { label: "Orders", key: "total_orders" },
                    { label: "Card Payment Amount", key: "total_card_payment_amount" },
                    { label: "Card Payments", key: "total_card_payments" },
                    { label: "Cash Payment Amount", key: "total_cash_payment_amount" },
                    { label: "Cash Payments", key: "total_cash_payments" },
                    { label: "Website Card Payment Amount", key: "website_card_amount" },
                    { label: "Website Card Payments", key: "website_card_payments" },
                    { label: "Mobile App Card Amount", key: "mobile_app_card_amount" },
                    { label: "Mobile App Payments", key: "mobile_app_payments" }
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
                          {firstDayData.restaurant_name || 'Unknown Location'}
                        </TableCell>
                      )}
                      <TableCell className="border-r">{attr.label}</TableCell>
                      {weekDates.map((date) => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        const dayData = restaurantData[dateStr] || {};
                        return (
                          <TableCell key={dateStr} className="text-right border-r">
                            {attr.key.includes('amount') || attr.key === 'sale' 
                              ? formatCurrency(dayData[attr.key as keyof SalesData] || 0)
                              : dayData[attr.key as keyof SalesData] || 0}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-medium">
                        {attr.key.includes('amount') || attr.key === 'sale'
                          ? formatCurrency(
                              Object.values(restaurantData)
                                .reduce((sum, day) => sum + (day[attr.key as keyof SalesData] || 0), 0)
                            )
                          : Object.values(restaurantData)
                              .reduce((sum, day) => sum + (day[attr.key as keyof SalesData] || 0), 0)}
                      </TableCell>
                    </TableRow>
                  ));
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={weekDates.length + 3} className="text-center py-4">
                    No data available
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

export default CashCardReport;
