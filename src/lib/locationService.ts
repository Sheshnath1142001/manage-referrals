
import { simulateApiCall } from './dummyData';
import { Location, FoodTruck } from './types';

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

// Add the missing getNearbyFoodTrucks function to fix the import error in Index.tsx
export const getNearbyFoodTrucks = async (params: { 
  lat: number; 
  lng: number; 
  distance?: number;
  limit?: number;
}): Promise<{ items: FoodTruck[]; total: number }> => {
  // Using dummy data instead of actual API call
  const dummyNearbyFoodTrucks = [
    {
      id: "1",
      name: "Tasty Tacos",
      description: "Best tacos in town",
      cuisineType: "Mexican",
      phone: "123-456-7890",
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "123 Main St",
        city: "San Francisco",
        state: "CA",
        postalCode: "94105"
      },
      image: "/placeholder.svg",
      status: "active" as const,
      isPremium: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      name: "Sushi Express",
      description: "Fresh sushi on the go",
      cuisineType: "Japanese",
      phone: "415-555-1234",
      location: {
        latitude: 37.7833,
        longitude: -122.4167,
        address: "456 Market St",
        city: "San Francisco",
        state: "CA",
        postalCode: "94103"
      },
      image: "/placeholder.svg",
      status: "active" as const,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ];

  // If limit is provided, slice the array accordingly
  const limitedTrucks = params.limit ? dummyNearbyFoodTrucks.slice(0, params.limit) : dummyNearbyFoodTrucks;

  return simulateApiCall({
    items: limitedTrucks,
    total: limitedTrucks.length
  });
};
