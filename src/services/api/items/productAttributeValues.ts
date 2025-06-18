import { api } from '../client';

// Interface for product attribute values
export interface ProductAttributeValue {
  id: string | number;
  attribute_id: string | number;
  name: string;
  seq_no: number;
  status: number;
}

// Interface for sequence update payload
export interface UpdateAttributeValueSequencePayload {
  id: number;
  new_seq_no: number;
}

// Product attribute values related operations
export const getProductAttributeValues = (params: any) => {
  // Format the params for the API endpoint
  const queryParams = {
    attribute_id: params.attribute_id
  };
  
  // Use the exact endpoint URL format from the example
  return api.get('/v2/products/attribute-values', { params: queryParams });
};

export const createProductAttributeValues = (data: any) => 
  api.post('/v2/products/attribute-values', data);

export const updateProductAttributeValues = (params: any) => 
  api.put(`/v2/products/attribute-values/${params.id}`, params);

export const updateProductAttributeValuesSeqNo = (params: UpdateAttributeValueSequencePayload) => {
  return api.patch('/v2/products/attribute-values-seq', {
    id: params.id,
    new_seq_no: params.new_seq_no
  });
};

export const attributeValuesService = {
  getProductAttributeValues,
  createProductAttributeValues,
  updateProductAttributeValues,
  updateProductAttributeValuesSeqNo
};
