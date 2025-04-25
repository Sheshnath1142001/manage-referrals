import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreateSubscriptionResponse {
  clientSecret: string;
  subscriptionId: string;
}

export const createSubscription = async (amount: number, interval: string): Promise<CreateSubscriptionResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/payment/create-subscription`, {
      amount,
      currency: 'usd',
      interval
    });
    return response.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/payment/cancel-subscription`, {
      subscriptionId
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export const getSubscriptionStatus = async (subscriptionId: string): Promise<string> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payment/subscription-status/${subscriptionId}`);
    return response.data.status;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
};