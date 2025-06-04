import { useState, useCallback } from 'react';
import { api } from '@/services/api/client';
import { useToast } from '@/components/ui/use-toast';

export interface AttendanceReportParams {
  view_type: 'custom';
  format: 'summary';
  per_page?: number;
  location_id?: string | number;
  start_date: string;
  end_date: string;
}

export interface AttendanceReportData {
  // Add specific fields based on the API response
  // This is a placeholder - update based on actual API response
  data: any[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export function useAttendanceReport() {
  const { toast } = useToast();
  const [data, setData] = useState<AttendanceReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReport = useCallback(async (params: AttendanceReportParams) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching attendance report with params:', params);
      const response = await api.get('/v2/attendance/report', { params });
      console.log('Attendance report response:', response);

      if (response && typeof response === 'object') {
        setData(response);
      } else {
        throw new Error('Invalid response format from attendance report API');
      }
    } catch (err) {
      console.error('Error fetching attendance report:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching attendance report';
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: "Error loading attendance report",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    data,
    isLoading,
    error,
    fetchReport
  };
} 