import { api } from './client';

export interface CloudPrinter {
  id: number;
  restaurant_id: number;
  name: string;
  sn: string;
  voice_type: number;
  should_print_order: boolean;
  should_announce: boolean;
  order_types: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
  location_restaurant_id: number;
  restaurants_cloud_printers_location_restaurant_idTorestaurants: {
    id: number;
    name: string;
  };
}

export interface CloudPrinterResponse {
  success: boolean;
  data: CloudPrinter[];
}

export interface CreateCloudPrinterPayload {
  name: string;
  sn: string;
  voice_type: number;
  should_print_order: boolean;
  should_announce: boolean;
  order_types: number[];
  is_active: boolean;
  restaurant_id: number;
  location_restaurant_id: number;
}

// Get cloud printers
export const getCloudPrinters = (params?: {
  page?: number;
  per_page?: number;
  is_active?: boolean;
  restaurant_id?: number;
}) => {
  return api.get<CloudPrinterResponse>('/v2/cloud-printers', { params });
};

// Create cloud printer
export const createCloudPrinter = (data: CreateCloudPrinterPayload) => {
  return api.post<CloudPrinterResponse>('/v2/cloud-printers', data);
};

// Update cloud printer
export const updateCloudPrinter = (id: number, data: Partial<CreateCloudPrinterPayload>) => {
  return api.put<CloudPrinterResponse>(`/v2/cloud-printers/${id}`, data);
};

// Delete cloud printer
export const deleteCloudPrinter = (id: number) => {
  return api.delete<CloudPrinterResponse>(`/v2/cloud-printers/${id}`, { data: {} });
};

export const cloudPrintersApi = {
  getCloudPrinters,
  createCloudPrinter,
  updateCloudPrinter,
  deleteCloudPrinter,
}; 