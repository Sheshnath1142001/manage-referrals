
import axios from 'axios';
import { Review } from '@/lib/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getReviews = async (truckId: string): Promise<Review[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reviews/truck/${truckId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const createReview = async (review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reviews`, review);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId: string, review: Partial<Review>): Promise<Review> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/reviews/${reviewId}`, review);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
