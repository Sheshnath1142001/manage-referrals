import { useState, useRef, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ReportParams, ReportType } from '@/types/reports';
import { useToast } from '@/components/ui/use-toast';
import { useGetRestaurants } from '@/hooks/useGetRestaurants';
import { api } from '@/services/api/client';

export const useReportsData = () => {
  const { toast } = useToast();
  
  // Use the custom hook for restaurants
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
  
  // Track API call state to prevent duplicate calls
  const fetchInProgress = useRef(false);
  const isInitialMount = useRef(true);

  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reportType, setReportType] = useState<ReportType>(ReportType.Day);
  
  // Initialize dates
  const currentDate = new Date();
  const [startDate, setStartDate] = useState<Date>(
    startOfWeek(currentDate, { weekStartsOn: 0 })
  );
  const [endDate, setEndDate] = useState<Date>(
    endOfWeek(currentDate, { weekStartsOn: 0 })
  );
  
  const [restaurantId, setRestaurantId] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<Error | null>(null);

  // Update date range based on report type
  const updateDateRangeForReportType = useCallback((type: ReportType, baseDate?: Date) => {
    // Use the provided date or startDate or fall back to current date
    const dateToUse = baseDate || startDate || currentDate;
    
    switch (type) {
      case ReportType.Day:
        // Keep the selected date as is
        setStartDate(dateToUse);
        setEndDate(dateToUse);
        break;
      case ReportType.Week:
        setStartDate(startOfWeek(dateToUse, { weekStartsOn: 0 }));
        setEndDate(endOfWeek(dateToUse, { weekStartsOn: 0 }));
        break;
      case ReportType.Month:
        setStartDate(startOfMonth(dateToUse));
        setEndDate(endOfMonth(dateToUse));
        break;
      case ReportType.Year:
        setStartDate(startOfYear(dateToUse));
        setEndDate(endOfYear(dateToUse));
        break;
    }
  }, [currentDate, startDate]);

  // Effect to update dates when report type changes
  useEffect(() => {
    if (!isInitialMount.current) {
      // When report type changes, update date range based on current startDate
      updateDateRangeForReportType(reportType);
    }
  }, [reportType, updateDateRangeForReportType]);

  // Fetch data function - without using dependencies to avoid closure issues
  const fetchReportData = useCallback(async () => {
    // Prevent concurrent API calls
    if (fetchInProgress.current) return;
    
    fetchInProgress.current = true;
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Format dates for the API - using the current state values directly
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      // Use the API client which automatically adds the required headers
      const response = await api.get('/sales-data', {
        params: {
          report_type: reportType,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          restaurant_id: restaurantId,
          week_start_date: "Sunday"
        }
      });
      
      setApiResponse(response);
      return response;
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(error instanceof Error ? error : new Error('Unknown error'));
      toast({
        title: "Error",
        description: "Failed to load reports data: " + errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, []); // Empty dependency array to avoid stale closures

  // Initial data fetch
  useEffect(() => {
    if (isInitialMount.current) {
      fetchReportData();
      isInitialMount.current = false;
    }
  }, [fetchReportData]);

  // Manual refetch function - always fetch with the current state
  const refetch = useCallback(() => {
    // Skip the fetchReportData function and directly make the API call
    // to ensure we're using the most current state values
    
    // Prevent concurrent API calls
    if (fetchInProgress.current) return;
    
    fetchInProgress.current = true;
    setIsLoading(true);
    setApiError(null);
    
    // Capture current state values at the moment of refetch
    const currentReportType = reportType;
    const currentStartDate = startDate;
    const currentEndDate = endDate;
    const currentRestaurantId = restaurantId;
    
    console.log("Refetch with current state:", {
      report_type: currentReportType,
      start_date: format(currentStartDate, "yyyy-MM-dd"),
      end_date: format(currentEndDate, "yyyy-MM-dd"),
      restaurant_id: currentRestaurantId
    });
    
    // Make API call with current state
    api.get('/sales-data', {
      params: {
        report_type: currentReportType,
        start_date: format(currentStartDate, "yyyy-MM-dd"),
        end_date: format(currentEndDate, "yyyy-MM-dd"),
        restaurant_id: currentRestaurantId,
        week_start_date: "Sunday"
      }
    })
    .then(response => {
      setApiResponse(response);
      console.log("Refetch successful with dates:", 
        format(currentStartDate, "yyyy-MM-dd"), 
        "to", 
        format(currentEndDate, "yyyy-MM-dd")
      );
      return response;
    })
    .catch(error => {
      console.error("Refetch failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(error instanceof Error ? error : new Error('Unknown error'));
      toast({
        title: "Error",
        description: "Failed to load reports data: " + errorMessage,
        variant: "destructive"
      });
      throw error;
    })
    .finally(() => {
      setIsLoading(false);
      fetchInProgress.current = false;
    });
  }, [reportType, startDate, endDate, restaurantId, toast]);

  // When filter params change, fetch data with debounce
  useEffect(() => {
    if (isInitialMount.current) return;
    
    const timer = setTimeout(() => {
      fetchReportData();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [reportType, startDate, endDate, restaurantId, fetchReportData]);

  // Custom refetch function with specific dates - useful for Daily reports
  const refetchWithDates = useCallback((customStartDate: Date, customEndDate: Date) => {
    // Prevent concurrent API calls
    if (fetchInProgress.current) return;
    
    fetchInProgress.current = true;
    setIsLoading(true);
    setApiError(null);
    
    console.log("Custom refetch with specific dates:", {
      report_type: reportType,
      start_date: format(customStartDate, "yyyy-MM-dd"),
      end_date: format(customEndDate, "yyyy-MM-dd"),
      restaurant_id: restaurantId
    });
    
    // Make API call with the provided custom dates
    api.get('/sales-data', {
      params: {
        report_type: reportType,
        start_date: format(customStartDate, "yyyy-MM-dd"),
        end_date: format(customEndDate, "yyyy-MM-dd"),
        restaurant_id: restaurantId,
        week_start_date: "Sunday"
      }
    })
    .then(response => {
      setApiResponse(response);
      console.log("Custom refetch successful");
      return response;
    })
    .catch(error => {
      console.error("Custom refetch failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(error instanceof Error ? error : new Error('Unknown error'));
      toast({
        title: "Error",
        description: "Failed to load reports data: " + errorMessage,
        variant: "destructive"
      });
      throw error;
    })
    .finally(() => {
      setIsLoading(false);
      fetchInProgress.current = false;
    });
  }, [reportType, restaurantId, toast]);

  return {
    // State
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    reportType,
    setReportType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    restaurantId,
    setRestaurantId,
    isLoading: isLoading || isLoadingRestaurants,
    apiError,
    apiResponse,
    
    // Data
    restaurants,
    
    // Actions
    refetch,
    updateDateRangeForReportType,
    refetchWithDates
  };
};
