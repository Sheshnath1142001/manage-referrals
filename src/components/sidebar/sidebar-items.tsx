
import { 
  Home,
  BarChart,
  Layout,
  Boxes,
  Database,
  MapPin,
  List,
  Grid,
  Book,
  Truck,
  ShoppingCart,
  FileBarChart,
  DollarSign,
  ReceiptText,
  Megaphone,
  Tag,
  Users,
  User,
  UserRound,
  UsersRound,
  Table,
  CreditCard,
  Printer,
  MonitorSmartphone,
  LayoutGrid,
  Store,
  Ticket,
  Monitor,
  HelpCircle
} from "lucide-react";

export const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileBarChart,
  }
];

export const masterDataItems = [
  {
    title: "Categories",
    url: "/categories",
    icon: Layout,
  },
  {
    title: "Item Library",
    url: "/items",
    icon: Boxes,
  },
  {
    title: "Product Attributes",
    url: "/product-attributes",
    icon: Tag,
  },
  {
    title: "Modifiers Categories",
    url: "/modifiers-categories",
    icon: List,
  },
  {
    title: "Modifiers",
    url: "/modifiers-screen",
    icon: Grid,
  }
];

export const locationsManagementItems = [
  {
    title: "Location",
    url: "/location",
    icon: MapPin,
  },
  {
    title: "Location Items",
    url: "/location-items",
    icon: Book,
  },
  // {
  //   title: "Combo Deals",
  //   url: "/restaurant-products",
  //   icon: Store,
  // },
  {
    title: "Deals",
    url: "/deals",
    icon: Ticket,
  },
  {
    title: "Delivery Zones",
    url: "/delivery-zones",
    icon: Truck,
  }
];

export const orderManagementItems = [
  {
    title: "Transactions",
    url: "/transactions",
    icon: ShoppingCart,
  },
  {
    title: "Order Refunds",
    url: "/order-refunds",
    icon: DollarSign,
  },
  {
    title: "Order Status",
    url: "/order-status",
    icon: ReceiptText,
  }
];

export const userManagementItems = [
  {
    title: "Staff",
    url: "/staff",
    icon: Users,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: User,
  },
  {
    title: "Guest Customers",
    url: "/guest-customers",
    icon: UserRound,
  },
  {
    title: "Customer Groups",
    url: "/customer-groups",
    icon: UsersRound,
  }
];

export const settingsManagementItems = [
  {
    title: "Table Types",
    url: "/table-types",
    icon: Table,
  },
  {
    title: "Quantity Units",
    url: "/quantity-units",
    icon: Table,
  },
  {
    title: "Payment Methods",
    url: "/payment-methods",
    icon: CreditCard,
  },
  {
    title: "Cloud Printing",
    url: "/cloud-printing",
    icon: Printer,
  },
  {
    title: "Tags",
    url: "/tags",
    icon: Tag,
  }
];

// Updated promotions management items
export const promotionsManagementItems = [
  {
    title: "Marketing Campaigns",
    url: "/promotions",
    icon: Megaphone,
  },
  {
    title: "Online Promotions",
    url: "/online-promotions",
    icon: LayoutGrid,
  },
  {
    title: "Promotional Groups",
    url: "/promotional-groups",
    icon: LayoutGrid,
  },
  {
    title: "Customer Display",
    url: "/customer-display",
    icon: MonitorSmartphone,
  },
  {
    title: "Self-Checkout Display",
    url: "/self-checkout-display",
    icon: Monitor,
  }
];

// New help & support items - moved to bottom
export const helpSupportItems = [
  {
    title: "Help & Support",
    url: "/help-support",
    icon: HelpCircle,
  }
];
