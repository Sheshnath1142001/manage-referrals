
export interface FoodTruck {
  id: string;
  name: string;
  owner: string;
  cuisineType: string;
  description: string;
  rating: number;
  reviewCount: number;
  image: string;
  logo?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  distance?: number;
  isOpen: boolean;
  openHours: {
    [key: string]: string;
  };
  menu: MenuItem[];
  tags: string[];
  featuredItem?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isPopular?: boolean;
  category: string;
}

export interface Review {
  id: string;
  truckId: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  images?: string[];
}

// Mock food trucks data
export const foodTrucks: FoodTruck[] = [
  {
    id: "ft1",
    name: "Aussie Grilled Goodness",
    owner: "Jake Williams",
    cuisineType: "Australian BBQ",
    description: "Classic Australian BBQ with a modern twist. We use locally sourced ingredients and traditional techniques to create mouthwatering dishes that showcase the best of Aussie cuisine.",
    rating: 4.8,
    reviewCount: 127,
    image: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    logo: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    location: {
      latitude: -33.865143,
      longitude: 151.209900,
      address: "Circular Quay, Sydney NSW 2000"
    },
    isOpen: true,
    openHours: {
      "Monday": "11:00 AM - 9:00 PM",
      "Tuesday": "11:00 AM - 9:00 PM",
      "Wednesday": "11:00 AM - 9:00 PM",
      "Thursday": "11:00 AM - 10:00 PM",
      "Friday": "11:00 AM - 11:00 PM",
      "Saturday": "10:00 AM - 11:00 PM",
      "Sunday": "10:00 AM - 9:00 PM"
    },
    menu: [
      {
        id: "m1",
        name: "Aussie Burger",
        description: "Classic beef patty with beetroot, fried egg, bacon, lettuce, and special sauce",
        price: 14.99,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        isPopular: true,
        category: "Burgers"
      },
      {
        id: "m2",
        name: "Barramundi & Chips",
        description: "Grilled barramundi fillet with thick-cut potato chips and homemade tartare sauce",
        price: 17.99,
        category: "Seafood"
      },
      {
        id: "m3",
        name: "Kangaroo Sliders",
        description: "Trio of mini kangaroo patty burgers with native herbs and bush tomato relish",
        price: 15.99,
        category: "Specialty"
      },
      {
        id: "m4",
        name: "Veggie Stack",
        description: "Grilled eggplant, zucchini, capsicum, and halloumi with balsamic glaze",
        price: 13.99,
        isVegetarian: true,
        category: "Vegetarian"
      }
    ],
    tags: ["Australian", "BBQ", "Burgers", "Seafood"],
    featuredItem: "Aussie Burger"
  },
  {
    id: "ft2",
    name: "Thai Street Eats",
    owner: "Sunisa Chen",
    cuisineType: "Thai",
    description: "Authentic Thai street food bringing the vibrant flavors of Bangkok to your neighborhood. Our recipes have been passed down through generations.",
    rating: 4.6,
    reviewCount: 89,
    image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    location: {
      latitude: -33.870747,
      longitude: 151.208765,
      address: "Hyde Park, Sydney NSW 2000"
    },
    isOpen: true,
    openHours: {
      "Monday": "11:30 AM - 8:30 PM",
      "Tuesday": "11:30 AM - 8:30 PM",
      "Wednesday": "11:30 AM - 8:30 PM",
      "Thursday": "11:30 AM - 9:00 PM",
      "Friday": "11:30 AM - 10:00 PM",
      "Saturday": "12:00 PM - 10:00 PM",
      "Sunday": "12:00 PM - 8:00 PM"
    },
    menu: [
      {
        id: "m5",
        name: "Pad Thai",
        description: "Rice noodles stir-fried with eggs, tofu, bean sprouts, and crushed peanuts",
        price: 12.99,
        isPopular: true,
        category: "Noodles"
      },
      {
        id: "m6",
        name: "Green Curry",
        description: "Spicy curry with coconut milk, bamboo shoots, eggplant, and your choice of protein",
        price: 14.99,
        category: "Curry"
      },
      {
        id: "m7",
        name: "Mango Sticky Rice",
        description: "Sweet coconut sticky rice with fresh mango slices",
        price: 6.99,
        category: "Dessert"
      }
    ],
    tags: ["Thai", "Spicy", "Asian", "Curry", "Street Food"]
  },
  {
    id: "ft3",
    name: "Taco Fiesta",
    owner: "Carlos Rodriguez",
    cuisineType: "Mexican",
    description: "Vibrant Mexican street tacos and more, made with traditional recipes and fresh ingredients. Our salsa is made fresh daily!",
    rating: 4.7,
    reviewCount: 104,
    image: "https://images.unsplash.com/photo-1519861155730-0b5fbf0dd889?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    location: {
      latitude: -33.861887,
      longitude: 151.211029,
      address: "The Rocks, Sydney NSW 2000"
    },
    isOpen: false,
    openHours: {
      "Monday": "Closed",
      "Tuesday": "11:00 AM - 9:00 PM",
      "Wednesday": "11:00 AM - 9:00 PM",
      "Thursday": "11:00 AM - 9:00 PM",
      "Friday": "11:00 AM - 11:00 PM",
      "Saturday": "11:00 AM - 11:00 PM",
      "Sunday": "12:00 PM - 8:00 PM"
    },
    menu: [
      {
        id: "m8",
        name: "Street Tacos",
        description: "Three soft corn tortillas with your choice of protein, cilantro, onion, and salsa",
        price: 9.99,
        isPopular: true,
        category: "Tacos"
      },
      {
        id: "m9",
        name: "Loaded Nachos",
        description: "Corn chips topped with beans, cheese, guacamole, pico de gallo, and sour cream",
        price: 11.99,
        category: "Starters"
      },
      {
        id: "m10",
        name: "Burrito Bowl",
        description: "Rice, beans, lettuce, your choice of protein, with all the toppings",
        price: 13.99,
        category: "Bowls"
      }
    ],
    tags: ["Mexican", "Tacos", "Burritos", "Spicy"]
  },
  {
    id: "ft4",
    name: "Pizza Wheels",
    owner: "Marco Bianchi",
    cuisineType: "Italian",
    description: "Artisanal wood-fired pizzas made in our custom truck oven. We use traditional Italian techniques and imported ingredients.",
    rating: 4.5,
    reviewCount: 76,
    image: "https://images.unsplash.com/photo-1565564194296-14db6e0bf8a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    location: {
      latitude: -33.856737,
      longitude: 151.215130,
      address: "Barangaroo Reserve, Sydney NSW 2000"
    },
    isOpen: true,
    openHours: {
      "Monday": "Closed",
      "Tuesday": "4:00 PM - 9:00 PM",
      "Wednesday": "4:00 PM - 9:00 PM",
      "Thursday": "4:00 PM - 9:00 PM",
      "Friday": "12:00 PM - 10:00 PM",
      "Saturday": "12:00 PM - 10:00 PM",
      "Sunday": "12:00 PM - 8:00 PM"
    },
    menu: [
      {
        id: "m11",
        name: "Margherita",
        description: "Classic tomato sauce, fresh mozzarella, basil, and olive oil",
        price: 12.99,
        isVegetarian: true,
        category: "Classic Pizzas"
      },
      {
        id: "m12",
        name: "Pepperoni",
        description: "Tomato sauce, mozzarella, and spicy pepperoni",
        price: 14.99,
        isPopular: true,
        category: "Classic Pizzas"
      },
      {
        id: "m13",
        name: "Quattro Formaggi",
        description: "Four cheese blend of mozzarella, gorgonzola, parmesan, and ricotta",
        price: 15.99,
        isVegetarian: true,
        category: "Specialty Pizzas"
      }
    ],
    tags: ["Italian", "Pizza", "Wood-fired"]
  },
  {
    id: "ft5",
    name: "Smokin' BBQ",
    owner: "Robert Johnson",
    cuisineType: "American BBQ",
    description: "Low and slow smoked meats using traditional American BBQ techniques. Our brisket is smoked for 12 hours!",
    rating: 4.9,
    reviewCount: 143,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    location: {
      latitude: -33.866551,
      longitude: 151.207474,
      address: "Darling Harbour, Sydney NSW 2000"
    },
    isOpen: true,
    openHours: {
      "Monday": "11:00 AM - 8:00 PM",
      "Tuesday": "11:00 AM - 8:00 PM",
      "Wednesday": "11:00 AM - 8:00 PM",
      "Thursday": "11:00 AM - 9:00 PM",
      "Friday": "11:00 AM - 10:00 PM",
      "Saturday": "11:00 AM - 10:00 PM",
      "Sunday": "11:00 AM - 8:00 PM"
    },
    menu: [
      {
        id: "m14",
        name: "Brisket Plate",
        description: "Slow-smoked beef brisket with two sides and cornbread",
        price: 18.99,
        isPopular: true,
        category: "Plates"
      },
      {
        id: "m15",
        name: "Pulled Pork Sandwich",
        description: "Tender pulled pork on a brioche bun with coleslaw",
        price: 13.99,
        category: "Sandwiches"
      },
      {
        id: "m16",
        name: "Ribs Half Rack",
        description: "Smoked pork ribs with BBQ sauce and two sides",
        price: 16.99,
        category: "Plates"
      }
    ],
    tags: ["BBQ", "American", "Smoked", "Meat"]
  },
  {
    id: "ft6",
    name: "Sushi on Wheels",
    owner: "Hiroshi Tanaka",
    cuisineType: "Japanese",
    description: "Fresh, made-to-order sushi and Japanese street food. We source the freshest fish and ingredients daily.",
    rating: 4.4,
    reviewCount: 62,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    location: {
      latitude: -33.873951,
      longitude: 151.214736,
      address: "Surry Hills, Sydney NSW 2010"
    },
    isOpen: true,
    openHours: {
      "Monday": "11:30 AM - 8:00 PM",
      "Tuesday": "11:30 AM - 8:00 PM",
      "Wednesday": "11:30 AM - 8:00 PM",
      "Thursday": "11:30 AM - 8:00 PM",
      "Friday": "11:30 AM - 9:00 PM",
      "Saturday": "12:00 PM - 9:00 PM",
      "Sunday": "Closed"
    },
    menu: [
      {
        id: "m17",
        name: "California Roll",
        description: "Crab, avocado, and cucumber roll with tobiko",
        price: 8.99,
        category: "Rolls"
      },
      {
        id: "m18",
        name: "Salmon Nigiri",
        description: "Fresh salmon over pressed sushi rice (2 pieces)",
        price: 6.99,
        isPopular: true,
        category: "Nigiri"
      },
      {
        id: "m19",
        name: "Chicken Katsu Bento",
        description: "Breaded chicken cutlet with rice, salad, and miso soup",
        price: 14.99,
        category: "Bento"
      }
    ],
    tags: ["Japanese", "Sushi", "Healthy", "Fresh"]
  }
];

// Mock reviews data
export const reviews: Review[] = [
  {
    id: "r1",
    truckId: "ft1",
    userName: "Sarah J.",
    rating: 5,
    date: "2023-08-15",
    comment: "The Aussie Burger is to die for! The beetroot and fried egg make it truly authentic. Will definitely be back!"
  },
  {
    id: "r2",
    truckId: "ft1",
    userName: "Michael T.",
    rating: 4,
    date: "2023-07-29",
    comment: "Great barramundi and chips. The fish was fresh and perfectly cooked. Service was a bit slow though."
  },
  {
    id: "r3",
    truckId: "ft2",
    userName: "Jessica L.",
    rating: 5,
    date: "2023-08-02",
    comment: "Most authentic Thai food I've had outside of Thailand! The Pad Thai is amazing!"
  },
  {
    id: "r4",
    truckId: "ft3",
    userName: "David W.",
    rating: 4,
    date: "2023-08-10",
    comment: "Love the street tacos - very authentic and flavorful. Wish they had more vegetarian options though."
  },
  {
    id: "r5",
    truckId: "ft4",
    userName: "Emma S.",
    rating: 5,
    date: "2023-07-25",
    comment: "Best wood-fired pizza in Sydney! The crust is perfectly crispy and chewy."
  }
];

// Helper function to calculate distance between two coordinates in km
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * 
    Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(1));
};

// Helper function to get reviews for a specific food truck
export const getTruckReviews = (truckId: string): Review[] => {
  return reviews.filter(review => review.truckId === truckId);
};

// Helper function to get a truck by ID
export const getTruckById = (id: string): FoodTruck | undefined => {
  return foodTrucks.find(truck => truck.id === id);
};

// Helper function to search trucks by query, including tags, name, and cuisineType
export const searchTrucks = (
  query: string, 
  userLat?: number, 
  userLng?: number
): FoodTruck[] => {
  if (!query) return foodTrucks;
  
  const lowercaseQuery = query.toLowerCase();
  let results = foodTrucks.filter(truck => 
    truck.name.toLowerCase().includes(lowercaseQuery) ||
    truck.cuisineType.toLowerCase().includes(lowercaseQuery) ||
    truck.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    truck.menu.some(item => item.name.toLowerCase().includes(lowercaseQuery))
  );
  
  // If user location is provided, add distance to each result
  if (userLat && userLng) {
    results = results.map(truck => ({
      ...truck,
      distance: calculateDistance(
        userLat,
        userLng,
        truck.location.latitude,
        truck.location.longitude
      )
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }
  
  return results;
};
