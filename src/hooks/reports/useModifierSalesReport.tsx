import { reportsApi } from '@/services/api/reports';
import { ModifierSalesData, ReportParams } from '@/types/reports';
import { useBaseReport } from './useBaseReport';

export const useModifierSalesReport = () => {
  return useBaseReport<ModifierSalesData[]>({
    queryKey: 'modifier-sales',
    fetchFn: async (params) => {
      const apiParams: ReportParams = {
        report_type: 1,
        start_date: params.date,
        end_date: params.date,
        restaurant_id: parseInt(params.restaurantId) || 0
      };
      
      const response = await reportsApi.getModifierSalesReport(apiParams);
      return response.data;
    }
  });
};
