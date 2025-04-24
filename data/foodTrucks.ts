import { FoodTruck } from "@/types";

export const foodTrucks: FoodTruck[] = [
  {
    id: "1",
    name: "The Aussie Grill",
    image: "https://images.pexels.com/photos/2227960/pexels-photo-2227960.jpeg",
    cuisine: ["Australian", "BBQ"],
    description: "Authentic Australian BBQ with a modern twist. We serve all your favorites from kangaroo burgers to gourmet sausage rolls.",
    menu: [
      {
        id: "1-1",
        name: "Kangaroo Burger",
        description: "Premium kangaroo patty with beetroot, lettuce, tomato, and our special sauce",
        price: 15.99,
        category: "Burgers",
        popular: true,
        dietary: ["High Protein"]
      },
      {
        id: "1-2",
        name: "Gourmet Sausage Roll",
        description: "Flaky pastry wrapped around seasoned Australian beef and veggies",
        price: 8.99,
        category: "Pastries",
        popular: true
      },
      {
        id: "1-3",
        name: "Loaded Chips",
        description: "Thick-cut chips topped with melted cheese, bacon, and aioli",
        price: 10.99,
        category: "Sides"
      },
      {
        id: "1-4",
        name: "Veggie Stack",
        description: "Grilled veggies, halloumi, and avocado on sourdough",
        price: 14.99,
        category: "Vegetarian",
        dietary: ["Vegetarian"]
      }
    ],
    location: {
      address: "Bondi Beach, Sydney",
      coordinates: {
        lat: -33.891,
        lng: 151.276
      }
    },
    openingHours: [
      { day: "Monday", hours: "Closed" },
      { day: "Tuesday", hours: "11am - 8pm" },
      { day: "Wednesday", hours: "11am - 8pm" },
      { day: "Thursday", hours: "11am - 8pm" },
      { day: "Friday", hours: "11am - 10pm" },
      { day: "Saturday", hours: "10am - 10pm" },
      { day: "Sunday", hours: "10am - 8pm" }
    ],
    rating: 4.7,
    reviews: [
      {
        id: "r1-1",
        userId: "u1",
        userName: "Sarah Johnson",
        userImage: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        rating: 5,
        comment: "The kangaroo burger was amazing! So juicy and the special sauce is to die for.",
        date: "2023-11-15",
        reply: {
          text: "Thanks for your kind words, Sarah! Hope to see you again soon.",
          date: "2023-11-16"
        }
      },
      {
        id: "r1-2",
        userId: "u2",
        userName: "Mike Peters",
        userImage: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
        rating: 4,
        comment: "Great food but the queue was pretty long. Worth the wait though!",
        date: "2023-11-10"
      }
    ],
    owner: "o1",
    contact: {
      phone: "02 1234 5678",
      email: "contact@aussiegrill.com.au",
      website: "www.aussiegrill.com.au",
      social: {
        facebook: "facebook.com/aussiegrill",
        instagram: "instagram.com/aussiegrill"
      }
    }
  },
  {
    id: "2",
    name: "Taco Fiesta",
    image: "https://images.pexels.com/photos/2119758/pexels-photo-2119758.jpeg",
    cuisine: ["Mexican", "Tex-Mex"],
    description: "Authentic Mexican street food with an Australian twist. Our tacos and burritos are made fresh daily.",
    menu: [
      {
        id: "2-1",
        name: "Beef Tacos (3)",
        description: "Slow-cooked beef, fresh salsa, guacamole, and sour cream in corn tortillas",
        price: 14.99,
        category: "Tacos",
        popular: true
      },
      {
        id: "2-2",
        name: "Chicken Burrito",
        description: "Grilled chicken, beans, rice, cheese, and pico de gallo wrapped in a flour tortilla",
        price: 13.99,
        category: "Burritos"
      },
      {
        id: "2-3",
        name: "Vegetarian Quesadilla",
        description: "Melted cheese, beans, capsicum, and onions in a grilled tortilla",
        price: 12.99,
        category: "Quesadillas",
        dietary: ["Vegetarian"]
      },
      {
        id: "2-4",
        name: "Loaded Nachos",
        description: "Tortilla chips topped with melted cheese, beans, jalapeños, sour cream, and guacamole",
        price: 16.99,
        category: "Shares",
        popular: true
      }
    ],
    location: {
      address: "Darling Harbour, Sydney",
      coordinates: {
        lat: -33.873,
        lng: 151.201
      }
    },
    openingHours: [
      { day: "Monday", hours: "11am - 8pm" },
      { day: "Tuesday", hours: "11am - 8pm" },
      { day: "Wednesday", hours: "11am - 8pm" },
      { day: "Thursday", hours: "11am - 9pm" },
      { day: "Friday", hours: "11am - 10pm" },
      { day: "Saturday", hours: "10am - 10pm" },
      { day: "Sunday", hours: "10am - 9pm" }
    ],
    rating: 4.5,
    reviews: [
      {
        id: "r2-1",
        userId: "u3",
        userName: "Lisa Wong",
        userImage: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
        rating: 5,
        comment: "Best Mexican food in Sydney! The nachos are incredible.",
        date: "2023-11-12"
      },
      {
        id: "r2-2",
        userId: "u4",
        userName: "Dave Smith",
        userImage: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
        rating: 4,
        comment: "Really good tacos, but a bit pricey. Great flavors though!",
        date: "2023-11-05",
        reply: {
          text: "Thanks for your feedback, Dave. We use premium local ingredients which affects our pricing, but we're always looking to provide the best value!",
          date: "2023-11-06"
        }
      }
    ],
    owner: "o2",
    contact: {
      phone: "02 9876 5432",
      email: "info@tacofiesta.com.au",
      social: {
        instagram: "instagram.com/tacofiestaau"
      }
    }
  },
  {
    id: "3",
    name: "Pizza On Wheels",
    image: "https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg",
    cuisine: ["Italian", "Pizza"],
    description: "Wood-fired pizzas made in our custom truck. We use authentic Italian techniques with Australian ingredients.",
    menu: [
      {
        id: "3-1",
        name: "Margherita",
        description: "San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil",
        price: 15.99,
        category: "Classic Pizzas",
        dietary: ["Vegetarian"],
        popular: true
      },
      {
        id: "3-2",
        name: "Aussie Special",
        description: "Tomato base, mozzarella, ham, egg, and bacon",
        price: 18.99,
        category: "Specialty Pizzas",
        popular: true
      },
      {
        id: "3-3",
        name: "Veggie Supreme",
        description: "Tomato base, mozzarella, mushrooms, capsicum, onion, olives, and rocket",
        price: 17.99,
        category: "Specialty Pizzas",
        dietary: ["Vegetarian"]
      },
      {
        id: "3-4",
        name: "Garlic Bread",
        description: "Wood-fired bread with garlic butter and herbs",
        price: 7.99,
        category: "Sides",
        dietary: ["Vegetarian"]
      }
    ],
    location: {
      address: "Circular Quay, Sydney",
      coordinates: {
        lat: -33.861,
        lng: 151.213
      }
    },
    openingHours: [
      { day: "Monday", hours: "Closed" },
      { day: "Tuesday", hours: "Closed" },
      { day: "Wednesday", hours: "4pm - 9pm" },
      { day: "Thursday", hours: "4pm - 9pm" },
      { day: "Friday", hours: "12pm - 10pm" },
      { day: "Saturday", hours: "12pm - 10pm" },
      { day: "Sunday", hours: "12pm - 8pm" }
    ],
    rating: 4.8,
    reviews: [
      {
        id: "r3-1",
        userId: "u5",
        userName: "James Wilson",
        userImage: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg",
        rating: 5,
        comment: "Best pizza I've had in Australia! Rivals the ones I had in Italy.",
        date: "2023-11-20"
      },
      {
        id: "r3-2",
        userId: "u6",
        userName: "Emma Thompson",
        userImage: "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg",
        rating: 4,
        comment: "The wood-fired crust is amazing. Wish they were open more days though!",
        date: "2023-11-18",
        reply: {
          text: "Thanks Emma! We're considering expanding our days soon, so stay tuned!",
          date: "2023-11-19"
        }
      }
    ],
    owner: "o3",
    contact: {
      phone: "02 3456 7890",
      email: "hello@pizzaonwheels.com.au",
      website: "www.pizzaonwheels.com.au",
      social: {
        facebook: "facebook.com/pizzaonwheelsau",
        instagram: "instagram.com/pizzaonwheelsau"
      }
    }
  }
];