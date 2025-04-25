import { dummyData, simulateApiCall } from './dummyData';
import { Review } from '@/lib/types';

export const getReviews = async (truckId: string): Promise<Review[]> => {
  const reviews = dummyData.reviews.filter(review => review.foodTruckId === truckId);
  return simulateApiCall(reviews);
};

export const createReview = async (review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
  try {
    const newReview = {
      ...review,
      id: `review-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    dummyData.reviews.push(newReview as any);
    return simulateApiCall(newReview as Review);
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId: string, review: Partial<Review>): Promise<Review> => {
  try {
    const index = dummyData.reviews.findIndex(r => r.id === reviewId);
    if (index === -1) {
      throw new Error('Review not found');
    }
    
    const updatedReview = {
      ...dummyData.reviews[index],
      ...review,
      updatedAt: new Date().toISOString()
    };
    
    dummyData.reviews[index] = updatedReview as any;
    return simulateApiCall(updatedReview as Review);
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    const index = dummyData.reviews.findIndex(r => r.id === reviewId);
    if (index !== -1) {
      dummyData.reviews.splice(index, 1);
    }
    return simulateApiCall(undefined);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
