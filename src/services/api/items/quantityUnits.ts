import { api } from '../client';

// Quantity units related operations
const getQuantityUnits = (params: any) => api.get('/quantity-units', { params });

const createQuantityUnit = (data: any) => api.post('/quantity-unit', data);

const updateQuantityUnit = (params: any) => api.patch(`/quantity-unit/${params.id}`, { unit: params.unit, status: params.status });

const importQuantityUnit = (data: FormData) => api.post('/quantity-units/import', data);

// Get a single quantity unit by ID
const getQuantityUnitById = (id: number) => api.get(`/quantity-unit/${id}`);

export const quantityUnitsService = {
  getQuantityUnits,
  createQuantityUnit,
  updateQuantityUnit,
  importQuantityUnit,
  getQuantityUnitById
};
