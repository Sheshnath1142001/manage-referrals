import api from './api';
import { Review } from './foodTruckService';

export interface FeedbackListResponse {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get feedback for a food truck
export const getFeedback = async (
  foodTruckId: string,
  params: { page?: number; limit?: number; sort?: 'newest' | 'highest' | 'lowest' } = {}
): Promise<FeedbackListResponse> => {
  const response = await api.get<FeedbackListResponse>(`/feedback/food-truck/${foodTruckId}`, { params });
  return response.data;
};

// Get a single feedback by ID
export const getFeedbackById = async (id: string): Promise<Review> => {
  const response = await api.get<Review>(`/feedback/${id}`);
  return response.data;
};

// Create a new feedback
export const createFeedback = async (
  foodTruckId: string,
  feedbackData: { rating: number; comment: string }
): Promise<Review> => {
  const response = await api.post<Review>(`/feedback/food-truck/${foodTruckId}`, feedbackData);
  return response.data;
};

// Update a feedback
export const updateFeedback = async (
  id: string,
  feedbackData: { rating?: number; comment?: string }
): Promise<Review> => {
  const response = await api.put<Review>(`/feedback/${id}`, feedbackData);
  return response.data;
};

// Delete a feedback
export const deleteFeedback = async (id: string): Promise<void> => {
  await api.delete(`/feedback/${id}`);
};

// Upload feedback image
export const uploadFeedbackImage = async (id: string, file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<{ url: string }>(`/feedback/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Get user feedback
export const getUserFeedback = async (params: { page?: number; limit?: number } = {}): Promise<FeedbackListResponse> => {
  const response = await api.get<FeedbackListResponse>('/feedback/user/me', { params });
  return response.data;
};