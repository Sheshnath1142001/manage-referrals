import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/services/api/reports';
import { HourlySalesData, ReportParams } from '@/types/reports';
import { format } from 'date-fns';

interface HourlySalesReportParams {
  date: Date;
  restaurantId: string | number;
  startTime?: string;
  endTime?: string;
  timezone?: string;
}

export const useHourlySalesReport = ({
  date,
  restaurantId,
  startTime = "10:00 AM",
  endTime = "05:00 PM",
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
}: HourlySalesReportParams) => {
  // Create query key with all parameters
  const queryKey = [
    'hourly-sales',
    format(date, 'yyyy-MM-dd'),
    restaurantId.toString(),
    startTime,
    endTime,
    timezone
  ];
  
  // Use React Query to handle caching and preventing duplicate requests
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('Fetching hourly sales data with params:', {
        date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        restaurant_id: Number(restaurantId),
        timezone
      });
      
      const apiParams: ReportParams = {
        date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        restaurant_id: Number(restaurantId),
        timezone
      };
      
      try {
        const response = await reportsApi.getHourlySalesReport(apiParams);
        console.log('API response structure:', JSON.stringify(response, null, 2));
        
        // Process the response data into a more usable format
        const processedData = {};
        
        // Handle different potential response structures
        if (response?.data?.data) {
          console.log('Processing response.data.data array');
          response.data.data.forEach(item => {
            if (!processedData[item.restaurant_id]) {
              processedData[item.restaurant_id] = {};
            }
            processedData[item.restaurant_id][item.group_clause] = item;
          });
        } else if (response?.data) {
          // This is for the structure you mentioned in the example
          // Example: { data: { "35": { "1pm - 2pm": {...}, "2pm - 3pm": {...} } } }
          console.log('Processing nested restaurant data structure');
          
          Object.entries(response.data).forEach(([restaurantId, restaurantData]) => {
            if (!processedData[restaurantId]) {
              processedData[restaurantId] = {};
            }
            
            if (typeof restaurantData === 'object') {
              Object.entries(restaurantData).forEach(([timeSlot, slotData]) => {
                processedData[restaurantId][timeSlot] = slotData;
              });
            }
          });
        }
        
        console.log('Processed data structure:', processedData);
        console.log('Restaurant IDs in data:', Object.keys(processedData));
        
        // If no data was processed, return sample data for testing
        if (Object.keys(processedData).length === 0) {
          console.log('No data found in API response, returning empty object');
          return {}; 
        }
        
        return processedData;
      } catch (error) {
        console.error('Error in hourly sales API call:', error);
        return {}; // Return empty data on error
      }
    },
    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000
  });
  
  return {
    data: data || {},
    isLoading,
    error,
    refetch
  };
};
