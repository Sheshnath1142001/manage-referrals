import { dummyData, simulateApiCall } from './dummyData';
import { OperatingHours } from './types';

export const getOperatingHours = async (truckId: string): Promise<OperatingHours> => {
  return simulateApiCall(dummyData.operatingHours);
};
