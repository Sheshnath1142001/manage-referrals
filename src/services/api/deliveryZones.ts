import { api, PaginatedResponse } from './client';

export interface DeliveryZone {
  id: number;
  name: string;
  description?: string;
  delivery_fee?: number;
  minimum_order?: number;
  restaurant_id?: number;
  status: 'Active' | 'Inactive' | number;
  fromDistance?: number;
  toDistance?: number;
  // Additional properties that API returns
  zone_type?: number;
  from_distance?: number;
  to_distance?: number;
  postcode?: string;
  suburb?: string;
}

export interface DeliveryZoneResponse extends PaginatedResponse<DeliveryZone> {
  data: DeliveryZone[];
}

export const deliveryZonesApi = {
  getDeliveryZones: async (params?: {
    page?: number;
    per_page?: number;
    restaurant_id?: number;
    status?: string | number;
    offset?: number;
    limit?: number;
    zone_type?: number;
    name?: string;
  }) => {
    try {
      // Map pagination params to offset/limit for the new API
      const offset = params?.page && params?.per_page ? ((params.page - 1) * params.per_page) : (params?.offset || 0);
      const limit = params?.per_page || params?.limit || 10;
      const queryParams: any = {
        offset,
        limit,
      };
      if (params?.restaurant_id) queryParams.restaurant_id = params.restaurant_id;
      if (params?.status) queryParams.status = params.status;
      if (params?.zone_type) queryParams.zone_type = params.zone_type;
      if (params?.name) queryParams.name = params.name;
      // Call the new endpoint
      const response = await api.get<any>('/v2/zones', { params: queryParams });
      // Parse the new API response
      let zones: DeliveryZone[] = [];
      let total = 0;
      let page = params?.page || 1;
      let perPage = limit;
      if (response && response.data && typeof response.data === 'object') {
        const responseData = response.data;
        if (responseData.data && Array.isArray(responseData.data)) {
          zones = responseData.data;
          total = responseData.pagination?.total || zones.length;
          page = Math.floor((responseData.pagination?.offset || 0) / perPage) + 1;
          perPage = responseData.pagination?.limit || perPage;
        } else if (Array.isArray(responseData)) {
          zones = responseData;
          total = zones.length;
        }
      }
      return {
        data: zones,
        total: total,
        page: page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage)
      } as DeliveryZoneResponse;
    } catch (error) {
      
      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        per_page: params?.per_page || 10,
        total_pages: 0
      } as DeliveryZoneResponse;
    }
  },

  getDeliveryZone: (id: number) => api.get<DeliveryZone>(`/v2/zones/${id}`),

  createDeliveryZone: (data: {
    name: string;
    description?: string;
    restaurant_id: number;
    status: number;
    zone_type: number;
    from_distance?: string;
    to_distance?: string;
    postcode?: string;
    suburb?: string;
    charges: Array<{
      min_order_amount: string;
      delivery_charge: string;
    }>;
  }) => api.post<{success: boolean; data: DeliveryZone}>('/v2/zones', data),

  updateDeliveryZone: (id: number, data: Partial<Omit<DeliveryZone, 'id'>>) => 
    api.put<DeliveryZone>(`/v2/zones/${id}`, data),

  deleteDeliveryZone: (id: number) => api.delete(`/v2/zones/${id}`)
};
