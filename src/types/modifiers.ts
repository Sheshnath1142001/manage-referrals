
// Types for modifiers
export interface Modifier {
  id: string;
  name: string;
  seqNo: number;
  category: string;
  categoryId?: number | string | null;  // Added categoryId field
  status: "Active" | "Inactive";
}

// Types for modifier categories
export interface ModifierCategory {
  id: string;
  name: string;
  modifier_category?: string; // Added to match Vue implementation
  seqNo: number;
  max: number | null;
  min?: number | null; // Added to match Vue implementation
  status: "Active" | "Inactive";
  isMandatory: boolean;
  isSingleSelect: boolean;
}

// Types for restaurant product modifiers
export interface RestaurantProductModifier {
  id: string;
  restaurantProductId: string;
  modifierId: string;
  modifier: {
    id: string;
    name: string;
  };
  price: number;
  seqNo: number;
  status: "Active" | "Inactive";
}

// API payload interfaces
export interface CreateModifierPayload {
  modifier: string;
  modifier_category_id: number;
}

export interface UpdateModifierPayload {
  modifier?: string;
  modifier_category_id?: number;
  status?: number;
}
