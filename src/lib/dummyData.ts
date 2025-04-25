import { FoodTruck, MenuItem, Review, Tag } from './types';

export const dummyData = {
  foodTrucks: [
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
    {
      id: "3",
      name: "Pizza Wheels",
      description: "Authentic Italian pizza",
      cuisineType: "Italian",
      phone: "415-555-6789",
      location: {
        latitude: 37.7694,
        longitude: -122.4862,
        address: "789 Golden Gate Ave",
        city: "San Francisco",
        state: "CA",
        postalCode: "94102"
      },
      image: "/placeholder.svg",
      status: "active" as const,
      isPremium: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  menuItems: [],
  reviews: [],
  tags: [
    { id: "1", name: "Mexican", foodTruckCount: 5 },
    { id: "2", name: "Asian", foodTruckCount: 3 },
    { id: "3", name: "Italian", foodTruckCount: 4 },
    { id: "4", name: "Vegetarian", foodTruckCount: 7 },
    { id: "5", name: "Vegan", foodTruckCount: 2 },
    { id: "6", name: "Gluten-Free", foodTruckCount: 3 },
    { id: "7", name: "Dessert", foodTruckCount: 4 },
    { id: "8", name: "Breakfast", foodTruckCount: 6 },
    { id: "9", name: "Lunch", foodTruckCount: 8 },
    { id: "10", name: "Dinner", foodTruckCount: 7 }
  ]
};

// Helper function to simulate API delay
export const simulateApiCall = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 500);
  });
};
