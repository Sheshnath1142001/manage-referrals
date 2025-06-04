
import { api } from './client';

export interface HourlySalesData {
  [restaurantId: string]: {
    location: string;
    attributes: {
      [key: string]: {
        label: string;
        values: (number | string)[];
        total: number;
      };
    };
  };
}

export interface HourlySalesRequest {
  date: string;
  start_time: string;
  end_time: string;
  restaurant_id: string;
  timezone?: string;
}

export const hourlySalesApi = {
  getHourlySalesData: async (params: HourlySalesRequest) => {
    const { date, start_time, end_time, restaurant_id, timezone } = params;
    
    // Format parameters for API
    const formattedStartTime = start_time.replace(':', '%3A').replace(' ', '+');
    const formattedEndTime = end_time.replace(':', '%3A').replace(' ', '+');
    const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const encodedTimezone = encodeURIComponent(userTimezone);
    
    const url = `hourly-sales-data?date=${date}&start_time=${formattedStartTime}&end_time=${formattedEndTime}&restaurant_id=${restaurant_id}&timezone=${encodedTimezone}`;
    
    return api.get<HourlySalesData>(url);
  }
};
