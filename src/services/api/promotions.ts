import { api } from './client';

// Types for campaign responses
export interface CustomerGroup {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
}

export interface Restaurant {
  id: number;
  name: string;
}

export interface CampaignDelivery {
  id: string;
  status: string;
}

export interface CampaignHistory {
  id: string;
  sent_at: string;
  content: string;
  total_recipients: number;
  successful_deliveries: number;
  failed_deliveries: number;
  sent_by: string;
  users: User;
  customer_groups: CustomerGroup[];
}

export interface CampaignStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  opened: number;
  clicked: number;
  success_rate: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'sms' | 'newsletter' | 'push_notification';
  content: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_by: string;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
  target_type: string;
  is_resend_enabled: boolean;
  users: User;
  campaign_deliveries: CampaignDelivery[];
  restaurants: Restaurant;
  customer_group_ids: number[];
  customer_groups: CustomerGroup[];
  recent_history: CampaignHistory[];
  stats: CampaignStats;
}

export interface CampaignListResponse {
  success: boolean;
  data: {
    campaigns: Campaign[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface CreateCampaignPayload {
  name: string;
  description: string;
  type: 'sms' | 'newsletter' | 'push_notification';
  content: string;
  status: string;
  customer_group_ids?: number[];
}

export interface ResendCampaignPayload {
  content: string;
  resend_target: string;
  customer_group_ids: number[];
}

export const promotionsApi = {
  getCampaigns: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    type: 'sms' | 'newsletter' | 'push_notification';
  }): Promise<CampaignListResponse> => {
    try {
      const response = await api.get('/v2/promotions/campaigns', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  createCampaign: async (data: CreateCampaignPayload): Promise<any> => {
    try {
      const response = await api.post('/v2/promotions/campaigns', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteCampaign: async (id: string): Promise<any> => {
    try {
      const response = await api.delete(`/v2/promotions/campaigns/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  resendCampaign: async (
    id: string,
    data: ResendCampaignPayload
  ): Promise<any> => {
    try {
      const response = await api.post(`/v2/promotions/campaigns/${id}/resend`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }
}; 
