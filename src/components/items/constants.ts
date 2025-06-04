const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const API_ENDPOINTS = {
  PRODUCTS: `${apiBaseUrl}/products`,
  CATEGORY: `${apiBaseUrl}/category`,
  CATEGORIES: `${apiBaseUrl}/categories`,
  QUANTITY_UNITS: `${apiBaseUrl}/quantity-units`,
  DISCOUNT_TYPES: `${apiBaseUrl}/discount-types`,
  RESTAURANTS: `${apiBaseUrl}/restaurant`
};

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_CURRENT_PAGE = 1;

export const INITIAL_FORM_DATA = {
  name: '',
  category_id: '',
  quantity: '1',
  quantity_unit_id: 1,
  price: '',
  online_price: '',
  barcode: '',
  discount: '0',
  online_discount: '',
  discount_type_id: 1,
  description: '',
  status: true,
  is_offer_half_n_half: false,
  locations: []
};

export const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: '1' },
  { label: 'Inactive', value: '0' }
];

export const QUANTITY_UNITS = [
  "Unit", "Kilograms", "Grams", "Liters", "Milliliters", "Pieces"
];

export const LOCATIONS = [
  "All Locations", "Downtown", "Uptown", "Midtown", "West End"
];

export const DISCOUNT_TYPES = [
  "Flat", "Percentage"
];
