import React, { useState, useEffect, useCallback } from "react"
import {
  Search,
  ArrowLeft,
  RefreshCw,
  Calendar as CalendarIcon,
  PrinterIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface AdditionalPayment {
  payment_method_id: number;
  amount: number;
  expected_amount: number;
  payment_method_name: string;
}

interface PaymentMethodCount {
  payment_method_id: number;
  payment_method_name: string;
  order_count: string;
}

interface CashupData {
  id: string;
  restaurant_id: number;
  active_user_id: number | null;
  witness_user_id: number | null;
  cashup_date: string;
  float_amount: string;
  eftpos_amount: string;
  till_amount: string;
  safedrop_amount: string;
  expected_eftpos_amount: string;
  expected_till_amount: string;
  expected_float_amount: string;
  note: string | null;
  status: number;
  cashup_done_at: string;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  terminal_id: number | null;
  pos_terminals: any | null;
  additional_payments: AdditionalPayment[];
  total_orders: number;
  total_sales: number;
  sales_average: number;
  void_order_count: number;
  void_amount: number;
  payment_method_counts: PaymentMethodCount[];
}

interface ApiResponse {
  cashups: CashupData[];
  total: number;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const CashupReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restaurants: locations, isLoading: isLoadingLocations } = useGetRestaurants();
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [cashupData, setCashupData] = useState<ApiResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State for date range selection
  const [startDate, setStartDate] = useState<Date | undefined>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    endOfWeek(new Date(), { weekStartsOn: 0 })
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

  // Fetch cashup data
  const fetchCashupData = useCallback(async () => {
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

      // Format dates for the API
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      // Build the API URL with query parameters
      const apiUrl = new URL(`${apiBaseUrl}/cashups`);
      apiUrl.searchParams.append('page', '1');
      apiUrl.searchParams.append('per_page', '10');
      // apiUrl.searchParams.append('start_date', formattedStartDate);
      // apiUrl.searchParams.append('end_date', formattedEndDate);
      // if (selectedLocation !== "0") {
      //   apiUrl.searchParams.append('restaurant_id', selectedLocation);
      // }

      const response = await fetch(apiUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cashup data');
      }

      const data = await response.json();
      if (data) {
        setCashupData(data);
      }
    } catch (error) {
      
      setCashupData(null);
      toast({
        title: "Error",
        description: "Failed to load cashup data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedLocation, toast]);

  // Fetch data when dates or location changes
  useEffect(() => {
    fetchCashupData();
  }, [fetchCashupData]);

  const handleBack = () => {
    navigate("/reports");
  };

  const handleRefresh = () => {
    fetchCashupData();
    toast({ title: "Refreshing data..." });
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
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

      <div className="p-6 print-container">

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6 items-end no-print">
          {/* From Date Picker */}
          {/* <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">From Date</span>
            <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
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
          </div> */}

          {/* To Date Picker */}
          {/* <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">To Date</span>
            <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
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
          </div> */}

          {/* Location Selector */}
          {/* <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Location</span>
            <Select value={selectedLocation} onValueChange={handleLocationChange}>
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
          </div> */}

<div className="flex justify-end gap-2 col-span-2">
          <Button variant="outline" onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        </div>

        {/* Print Header - Only visible when printing */}
        <div className="print-header" style={{ display: 'none' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Cashup Report</h1>
        </div>

        {isLoading || isLoadingLocations ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table className="print-table">
              <TableHeader className="bg-[#0F172A]">
                <TableRow>
                  <TableHead className="text-white font-medium">Id</TableHead>
                  <TableHead className="text-white font-medium">Cashup date</TableHead>
                  <TableHead className="text-white font-medium text-right">Total Orders</TableHead>
                  <TableHead className="text-white font-medium text-right">Total Sales</TableHead>
                  <TableHead className="text-white font-medium text-right">Sales Average</TableHead>
                  <TableHead className="text-white font-medium text-right">Void Orders</TableHead>
                  <TableHead className="text-white font-medium text-right">Void Amount</TableHead>
                  <TableHead className="text-white font-medium text-right">Float amount</TableHead>
                  <TableHead className="text-white font-medium text-right">Eftpos amount</TableHead>
                  <TableHead className="text-white font-medium text-right">Till amount</TableHead>
                  <TableHead className="text-white font-medium text-right">Safedrop amount</TableHead>
                  <TableHead className="text-white font-medium text-right">Expected eftpos amount</TableHead>
                  <TableHead className="text-white font-medium text-right">Expected till amount</TableHead>
                  <TableHead className="text-white font-medium text-right">Expected float amount</TableHead>
                  <TableHead className="text-white font-medium">Payment Methods</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!cashupData?.cashups.length ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center">
                      No data available for the selected criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  cashupData.cashups.map((cashup) => (
                    <TableRow key={cashup.id}>
                      <TableCell>{cashup.id}</TableCell>
                      <TableCell>{format(parseISO(cashup.cashup_date), "yyyy-MM-dd")}</TableCell>
                      <TableCell className="text-right">{cashup.total_orders}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashup.total_sales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashup.sales_average)}</TableCell>
                      <TableCell className="text-right">{cashup.void_order_count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashup.void_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashup.float_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashup.eftpos_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashup.till_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashup.safedrop_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashup.expected_eftpos_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashup.expected_till_amount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cashup.expected_float_amount)}</TableCell>
                      <TableCell>
                        {cashup.payment_method_counts.length > 0 
                          ? cashup.payment_method_counts.map(pmc => `${pmc.payment_method_name} (${pmc.order_count})`).join(', ')
                          : 'No payment methods'
                        }
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default CashupReport