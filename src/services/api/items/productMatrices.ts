
import { api } from '../client';

// Product attributes for products related operations
const getAttributesForProducts = (params: any) => api.get(`/products/${params.product_id}/attributes`, params);

const createAttributesForProducts = (data: any) => api.post(`/products/${data.product_id}/attributes`, data);

const updateAttributesForProducts = (params: any) => api.put(`/product-attributes/${params.id}/products/${params.product_id}`, params);

// Product attribute price matrix related operations
const getProductAttributePriceMatrix = (params: any) => api.get(`/products/${params.product_id}/attribute-price-matrix`, params);

const createProductAttributePriceMatrix = (data: any) => api.post(`/products/${data.product_id}/attribute-price-matrix`, data);

const updateProductAttributePriceMatrix = (params: any) => api.put(`/product-attribute-price-matrix/${params.id}`, params);

const deleteProductAttributePriceMatrix = (params: any) => api.delete(`/product-attribute-price-matrix/${params.id}`);

// Product price matrix related operations
const getProductPriceMatrix = (params: any) => api.get(`/products/${params.product_id}/price-matrix`, params);

const createProductPriceMatrix = (data: any) => api.post(`/products/${data.product_id}/price-matrix`, data);

const updateProductPriceMatrix = (params: any) => api.put(`/product-price-matrix/${params.id}`, params);

export const productMatricesService = {
  // Product attributes for products
  getAttributesForProducts,
  createAttributesForProducts,
  updateAttributesForProducts,
  
  // Product attribute price matrix
  getProductAttributePriceMatrix,
  createProductAttributePriceMatrix,
  updateProductAttributePriceMatrix,
  deleteProductAttributePriceMatrix,
  
  // Product price matrix
  getProductPriceMatrix,
  createProductPriceMatrix,
  updateProductPriceMatrix
};
