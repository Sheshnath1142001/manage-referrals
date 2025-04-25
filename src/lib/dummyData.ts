
export const dummyData = {
  users: [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "customer",
      phoneNumber: "+61 123 456 789"
    },
    {
      id: 2,
      firstName: "Pete",
      lastName: "Owner",
      email: "pete@pizzatruck.com",
      role: "owner",
      phoneNumber: "+61 987 654 321"
    }
  ],
  foodTrucks: [
    {
      id: "1",
      name: "Pizza Pete's",
      description: "Best pizza truck in town!",
      cuisineType: "Italian",
      phone: "+61 123 456 789",
      location: {
        latitude: -33.8688,
        longitude: 151.2093,
        address: "Sydney CBD",
        city: "Sydney",
        state: "NSW",
        postalCode: "2000"
      },
      status: "active",
      isPremium: true,
      imageUrl: "/images/pizza-truck.jpg",
      averageRating: 4.5,
      totalRatings: 128,
      reviewCount: 89,
      isOpen: true
    }
  ],
  reviews: [
    {
      id: "1",
      rating: 5,
      comment: "Amazing pizza, best in Sydney!",
      date: "2025-04-25",
      userName: "John D.",
      userId: "1",
      foodTruckId: "1"
    }
  ],
  menuItems: [
    {
      id: "1",
      name: "Margherita Pizza",
      description: "Fresh tomatoes, mozzarella, and basil",
      price: 15.99,
      category: "Pizza",
      image: "/images/margherita.jpg",
      isAvailable: true,
      foodTruckId: "1"
    },
    {
      id: "2",
      name: "Pepperoni Pizza",
      description: "Classic pepperoni with cheese",
      price: 17.99,
      category: "Pizza",
      image: "/images/pepperoni.jpg",
      isAvailable: true,
      foodTruckId: "1"
    }
  ],
  locations: [
    {
      id: "1",
      latitude: -33.8688,
      longitude: 151.2093,
      address: "Sydney CBD",
      city: "Sydney",
      state: "NSW",
      zipCode: "2000",
      isActive: true,
      foodTruckId: "1"
    }
  ],
  operatingHours: {
    monday: [{ open: "11:00", close: "20:00" }],
    tuesday: [{ open: "11:00", close: "20:00" }],
    wednesday: [{ open: "11:00", close: "20:00" }],
    thursday: [{ open: "11:00", close: "20:00" }],
    friday: [{ open: "11:00", close: "22:00" }],
    saturday: [{ open: "12:00", close: "22:00" }],
    sunday: [{ open: "12:00", close: "20:00" }]
  }
};

// Helper functions to simulate API calls
export const simulateApiCall = <T>(data: T, delay: number = 500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export const getFoodTrucks = () => {
  return simulateApiCall(dummyData.foodTrucks);
};

export const getFoodTruckById = (id: string) => {
  const truck = dummyData.foodTrucks.find(t => t.id === id);
  return simulateApiCall(truck);
};

export const getMenuItems = (truckId: string) => {
  const items = dummyData.menuItems.filter(item => item.foodTruckId === truckId);
  return simulateApiCall(items);
};

export const getReviews = (truckId: string) => {
  const reviews = dummyData.reviews.filter(review => review.foodTruckId === truckId);
  return simulateApiCall(reviews);
};

export const getLocations = (truckId: string) => {
  const locations = dummyData.locations.filter(loc => loc.foodTruckId === truckId);
  return simulateApiCall(locations);
};

export const getOperatingHours = () => {
  return simulateApiCall(dummyData.operatingHours);
};

export const getCurrentUser = () => {
  // Simulate getting the first user as the current user
  return simulateApiCall(dummyData.users[0]);
};
