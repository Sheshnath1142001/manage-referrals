
export interface ApiResponse<T = any> {
  data: T;
  success?: boolean;
  message?: string;
  total?: number;
  pagination?: {
    page: number;
    per_page: number;
    total_pages: number;
    total: number;
  };
}

export interface TagsApiResponse {
  tags: Array<{
    id: number;
    tag: string;
    status: number;
  }>;
}

export interface AttributesApiResponse {
  attributes: Array<{
    id: number;
    attribute: string;
    status: number;
  }>;
}

export interface AttributeValuesApiResponse {
  attribute_values: Array<{
    id: number;
    attribute_id: number;
    value: string;
    status: number;
  }>;
}

export interface ModifierCategoriesApiResponse {
  modifier_categories: Array<{
    id: number;
    modifier_category: string;
    is_mandatory: number;
    is_single_select: number;
    status: number;
    min?: number | null;
    max?: number | null;
  }>;
}

export interface ModifiersApiResponse {
  modifiers: Array<{
    id: number;
    modifier: string;
    modifier_category_id: number;
    status: number;
    seq_no: number;
  }>;
}

export interface CategoriesApiResponse {
  categories: Array<{
    id: number;
    category: string;
    status: number;
  }>;
}

export interface QuantityUnitsApiResponse {
  quantity_units: Array<{
    id: number;
    unit: string;
    status: number;
  }>;
}

export interface DiscountTypesApiResponse {
  discount_types: Array<{
    id: number;
    type: string;
    status: number;
  }>;
}

export interface RestaurantsApiResponse {
  restaurants: Array<{
    id: number;
    name: string;
    status: number;
  }>;
}

export interface LoginReportApiResponse {
  report: Array<{
    id: number;
    user_name: string;
    login_time: string;
    logout_time?: string;
    duration?: string;
  }>;
  totalRecords: number;
}
