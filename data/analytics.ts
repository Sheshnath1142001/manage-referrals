import { OwnerAnalytics, Subscription } from "@/types";

export const ownerAnalytics: Record<string, OwnerAnalytics> = {
  "o1": {
    profileViews: 245,
    averageRating: 4.7,
    reviewsCount: 18,
    popularItems: [
      { itemId: "1-1", count: 87 },
      { itemId: "1-2", count: 63 },
      { itemId: "1-4", count: 42 }
    ],
    viewsByDay: [
      { day: "Mon", count: 12 },
      { day: "Tue", count: 15 },
      { day: "Wed", count: 22 },
      { day: "Thu", count: 28 },
      { day: "Fri", count: 45 },
      { day: "Sat", count: 78 },
      { day: "Sun", count: 45 }
    ]
  },
  "o2": {
    profileViews: 187,
    averageRating: 4.5,
    reviewsCount: 12,
    popularItems: [
      { itemId: "2-1", count: 65 },
      { itemId: "2-4", count: 54 },
      { itemId: "2-2", count: 38 }
    ],
    viewsByDay: [
      { day: "Mon", count: 10 },
      { day: "Tue", count: 12 },
      { day: "Wed", count: 18 },
      { day: "Thu", count: 25 },
      { day: "Fri", count: 36 },
      { day: "Sat", count: 52 },
      { day: "Sun", count: 34 }
    ]
  },
  "o3": {
    profileViews: 276,
    averageRating: 4.8,
    reviewsCount: 24,
    popularItems: [
      { itemId: "3-2", count: 92 },
      { itemId: "3-1", count: 78 },
      { itemId: "3-3", count: 45 }
    ],
    viewsByDay: [
      { day: "Mon", count: 0 },
      { day: "Tue", count: 0 },
      { day: "Wed", count: 32 },
      { day: "Thu", count: 30 },
      { day: "Fri", count: 58 },
      { day: "Sat", count: 86 },
      { day: "Sun", count: 70 }
    ]
  }
};

export const subscriptions: Record<string, Subscription> = {
  "o1": {
    id: "sub1",
    name: "Premium",
    price: 29.99,
    features: [
      "Featured listing",
      "Advanced analytics",
      "Menu customization",
      "Customer messaging",
      "Social media integration"
    ],
    current: true
  },
  "o2": {
    id: "sub2",
    name: "Basic",
    price: 9.99,
    features: [
      "Standard listing",
      "Basic analytics",
      "Simple menu management"
    ],
    current: true
  },
  "o3": {
    id: "sub3",
    name: "Premium",
    price: 29.99,
    features: [
      "Featured listing",
      "Advanced analytics",
      "Menu customization",
      "Customer messaging",
      "Social media integration"
    ],
    current: true
  }
};