
import { dummyData, simulateApiCall } from './dummyData';
import { OperatingHours } from './types';

export const getOperatingHours = async (truckId: string): Promise<OperatingHours> => {
  // Create dummy operating hours data
  const dummyHours: OperatingHours = {
    monday: [{ open: "08:00", close: "16:00" }],
    tuesday: [{ open: "08:00", close: "16:00" }],
    wednesday: [{ open: "08:00", close: "16:00" }],
    thursday: [{ open: "08:00", close: "16:00" }],
    friday: [{ open: "08:00", close: "20:00" }],
    saturday: [{ open: "10:00", close: "22:00" }],
    sunday: [{ open: "11:00", close: "15:00" }]
  };
  
  return simulateApiCall(dummyHours);
};
