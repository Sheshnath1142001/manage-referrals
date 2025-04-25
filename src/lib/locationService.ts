
import { simulateApiCall } from './dummyData';
import { Location } from './types';

export const getLocations = async (truckId: string): Promise<{ items: Location[]; total: number }> => {
  const dummyLocations = [
    {
      latitude: 37.7749,
      longitude: -122.4194,
      address: "123 Main St",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105"
    }
  ];

  return simulateApiCall({
    items: dummyLocations,
    total: dummyLocations.length
  });
};

export const getNearbyLocations = async (params: { lat: number; lng: number; distance?: number }) => {
  return simulateApiCall([]);
};
