import { api } from '../client';

// Payment methods related operations
const getPaymentMethods = (params?: any) => api.get('/payment-methods', { params });

const createPaymentMethod = (data: any) => api.post('/create-payment-method', data);

const updatePaymentMethod = (params: any) => api.patch(`/update-payment-method/${params.id}`, {
  method: params.method,
  description: params.description,
  status: params.status
});

// Get payment method by ID
const getPaymentMethodById = (id: number) => api.get(`/payment-method/${id}`);

export const paymentMethodsService = {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  getPaymentMethodById
}; 