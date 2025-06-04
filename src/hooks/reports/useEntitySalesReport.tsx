
import { reportsApi } from '@/services/api/reports';
import { EntitySalesData, ReportParams } from '@/types/reports';
import { useBaseReport } from './useBaseReport';

export const useEntitySalesReport = () => {
  return useBaseReport<EntitySalesData[]>({
    queryKey: 'entity-sales',
    fetchFn: async (params) => {
      const apiParams: ReportParams = {
        report_type: 1,
        start_date: params.date,
        end_date: params.date,
        restaurant_id: parseInt(params.restaurantId) || 0
      };
      // Return the data property from the response
      const response = await reportsApi.getEntitySalesReport(apiParams);
      return response.data;
    }
  });
};
