
export interface CustomerGroup {
  id: number;
  name: string;
  description: string;
  status: number;
  restaurant_id: number;
  user_ids: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CustomerGroupsResponse {
  data: CustomerGroup[];
  total: number;
  total_pages: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface CreateCustomerGroupData {
  name: string;
  description: string;
  status: number;
  restaurant_id: number;
  user_ids: string[];
}
