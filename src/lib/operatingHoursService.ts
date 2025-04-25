
import axios from 'axios';
import { OperatingHours } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getOperatingHours = async (truckId: string): Promise<OperatingHours> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/food-trucks/${truckId}/operating-hours`);
    return response.data;
  } catch (error) {
    console.error('Error fetching operating hours:', error);
    throw error;
  }
};

export const updateOperatingHours = async (truckId: string, hours: OperatingHours): Promise<OperatingHours> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/food-trucks/${truckId}/operating-hours`, hours);
    return response.data;
  } catch (error) {
    console.error('Error updating operating hours:', error);
    throw error;
  }
};
