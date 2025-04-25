
import { dummyData, simulateApiCall } from './dummyData';
import { Review } from '@/lib/types';

export const getReviews = async (truckId: string): Promise<Review[]> => {
  // Create dummy reviews data
  const dummyReviews: Review[] = [
    {
      id: "rev1",
      rating: 5,
      comment: "Amazing food! The tacos were delicious.",
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      userName: "John Smith",
      userId: "user1",
      foodTruckId: truckId
    },
    {
      id: "rev2",
      rating: 4,
      comment: "Great service and tasty food. Will come again!",
      date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      userName: "Sarah Jones",
      userId: "user2",
      foodTruckId: truckId
    },
    {
      id: "rev3",
      rating: 5,
      comment: "Best street food I've had in a long time.",
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      userName: "Michael Brown",
      userId: "user3",
      foodTruckId: truckId
    }
  ];
  
  return simulateApiCall(dummyReviews);
};

export const createReview = async (review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
  try {
    const newReview = {
      ...review,
      id: `review-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    // Add to dummy data instead of pushing to API
    if (!dummyData.reviews) {
      dummyData.reviews = [];
    }
    dummyData.reviews.push(newReview as any);
    
    return simulateApiCall(newReview as Review);
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId: string, review: Partial<Review>): Promise<Review> => {
  try {
    // If reviews array doesn't exist, create it
    if (!dummyData.reviews) {
      dummyData.reviews = [];
    }
    
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
    if (!dummyData.reviews) {
      dummyData.reviews = [];
    }
    
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
