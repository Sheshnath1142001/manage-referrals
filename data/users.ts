import { User } from "@/types";

export const users: User[] = [
  {
    id: "u1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
    savedTrucks: ["1", "3"],
    reviews: ["r1-1"],
    role: "customer"
  },
  {
    id: "u2",
    name: "Mike Peters",
    email: "mike.p@example.com",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
    savedTrucks: ["2"],
    reviews: ["r1-2"],
    role: "customer"
  },
  {
    id: "u3",
    name: "Lisa Wong",
    email: "lisa.w@example.com",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
    savedTrucks: ["1", "2"],
    reviews: ["r2-1"],
    role: "customer"
  },
  {
    id: "o1",
    name: "John Smith",
    email: "john@aussiegrill.com.au",
    image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
    savedTrucks: [],
    reviews: [],
    role: "owner"
  },
  {
    id: "o2",
    name: "Maria Garcia",
    email: "maria@tacofiesta.com.au",
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
    savedTrucks: [],
    reviews: [],
    role: "owner"
  },
  {
    id: "o3",
    name: "Tony Russo",
    email: "tony@pizzaonwheels.com.au",
    image: "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg",
    savedTrucks: [],
    reviews: [],
    role: "owner"
  }
];