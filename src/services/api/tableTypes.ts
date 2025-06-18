import { api } from './client';

export interface TableType {
  id: number;
  type: string;
  restaurant_id: number | null;
  restaurants: any | null;
  status: number;
}

export interface TableTypeResponse {
  success: boolean;
  data: TableType[];
  total: number;
}

export interface TableTypeParams {
  status?: number;
  page?: number;
  per_page?: number;
  with_prd_defines?: number;
}

export interface CreateTableTypeData {
  type: string;
  status: number;
  restaurant_ids?: number[];
}

export interface UpdateTableTypeData {
  type?: string;
  status?: number;
  restaurant_ids?: number[];
}

export const tableTypesApi = {
  getTableTypes: async (params?: TableTypeParams) => {
    const response = await api.get<TableTypeResponse>('/get-table-types', { params });
    return response;
  },

  createTableType: (data: CreateTableTypeData) => 
    api.post<TableType>('/table-type', data),

  updateTableType: (id: number, data: UpdateTableTypeData) => {
    return api.patch<TableType>(`/table-type/${id}`, data);
  },

  deleteTableType: (id: number) => 
    api.delete(`/table-type/${id}`)
}; 