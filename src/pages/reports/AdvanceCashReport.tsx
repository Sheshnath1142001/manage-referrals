import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ArrowLeft,
  RefreshCw,
  Calendar as CalendarIcon
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
import { restaurantsApi } from "@/services/api";
import { Restaurant } from "@/services/api/restaurants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface AdvanceCashData {
  id: string;
  restaurant_id: number;
  date: string;
  advance_amount: number;
  expected_float_amount: number;
  note: string | null;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

interface ApiResponse {
  advanceCashes: AdvanceCashData[];
  total: number;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const AdvanceCashReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [locations, setLocations] = useState<Restaurant[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [advanceCashData, setAdvanceCashData] = useState<ApiResponse | null>(null);

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
  const formatCurrency = (value: number | undefined) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  // Calculate difference
  const calculateDifference = (advance: number, expected: number) => {
    return advance - expected;
  };

  // Fetch advance cash data
  const fetchAdvanceCashData = useCallback(async () => {
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
      const formattedStartDate = format(startDate, "yyyy/MM/dd");
      const formattedEndDate = format(endDate, "yyyy/MM/dd");
      
      // Build the API URL with query parameters
      const apiUrl = new URL(`${apiBaseUrl}/advance-cashes`);
      apiUrl.searchParams.append('page', '1');
      apiUrl.searchParams.append('per_page', '10');
      apiUrl.searchParams.append('start_date', formattedStartDate);
      apiUrl.searchParams.append('end_date', formattedEndDate);
      if (selectedLocation !== "0") {
        apiUrl.searchParams.append('restaurant_id', selectedLocation);
      }

      const response = await fetch(apiUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch advance cash data');
      }

      const data = await response.json();
      if (data) {
        setAdvanceCashData(data);
      }
    } catch (error) {
      console.error("Error fetching advance cash data:", error);
      setAdvanceCashData(null);
      toast({
        title: "Error",
        description: "Failed to load advance cash data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedLocation, toast]);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await restaurantsApi.getRestaurants();
        if (Array.isArray(response)) {
          setLocations(response);
        } else if (response?.data) {
          setLocations(response.data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast({
          title: "Error loading locations",
          description: "Could not fetch locations. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchLocations();
  }, [toast]);

  // Fetch data when dates or location changes
  useEffect(() => {
    fetchAdvanceCashData();
  }, [fetchAdvanceCashData]);

  const handleBack = () => {
    navigate("/reports");
  };

  const handleRefresh = () => {
    fetchAdvanceCashData();
    toast({ title: "Refreshing data..." });
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Advance Cash Report</h1>
        </div>
        <div className="text-sm text-[#9b87f5] font-medium">
          ADMIN
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
        {/* From Date Picker */}
        <div className="flex flex-col gap-1.5">
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
        </div>

        {/* To Date Picker */}
        <div className="flex flex-col gap-1.5">
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
        </div>

        {/* Location Selector */}
        <div className="flex flex-col gap-1.5">
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
        </div>

        {/* Refresh Button */}
        <div className="flex items-end justify-end">
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
          <Table>
            <TableHeader className="bg-[#0F172A]">
              <TableRow>
                <TableHead className="text-white font-medium">Id</TableHead>
                <TableHead className="text-white font-medium">Date</TableHead>
                <TableHead className="text-white font-medium text-right">Difference</TableHead>
                <TableHead className="text-white font-medium text-right">Advance amount</TableHead>
                <TableHead className="text-white font-medium text-right">Expected float amount</TableHead>
                <TableHead className="text-white font-medium">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!advanceCashData?.advanceCashes.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No data available for the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                advanceCashData.advanceCashes.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{format(parseISO(item.date), "yyyy-MM-dd")}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calculateDifference(item.advance_amount, item.expected_float_amount))}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.advance_amount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.expected_float_amount)}</TableCell>
                    <TableCell>{item.note || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdvanceCashReport;
