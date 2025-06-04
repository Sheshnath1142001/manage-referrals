import { api } from '../client';
import { AttributeValue } from '@/types/productAttributes';

// Product attribute values related operations
const getProductAttributeValues = (params: any) => {
  // Format the params for the API endpoint
  const queryParams = {
    page: params.page || 1,
    per_page: params.per_page || 10,
    ...params
  };
  
  return api.get('/v2/products/attribute-values', { params: queryParams });
};

const createProductAttributeValues = (data: any) => api.post('/v2/products/attribute-values', data);

const updateProductAttributeValues = (params: any) => api.put(`/v2/products/attribute-values/${params.id}`, params);

const updateProductAttributeValuesSeqNo = (params: any) => {
  const data = new FormData();
  data.append('seq_no', params.seq_no.toString());
  return api.put(`/v2/products/attribute-values/${params.id}/sequence`, data);
};

interface UpdateSequencePayload {
  id: number;
  new_seq_no: number;
}

export const attributeValuesService = {
  getProductAttributeValues,
  createProductAttributeValues,
  updateProductAttributeValues,
  updateProductAttributeValuesSeqNo,
  getAttributeValues: (attributeId: number) => {
    return api.get(`/v2/products/attributes/${attributeId}/values`);
  },
  createAttributeValue: (attributeId: number, data: Partial<AttributeValue>) => {
    return api.post(`/v2/products/attributes/${attributeId}/values`, data);
  },
  updateAttributeValue: (attributeId: number, valueId: number, data: Partial<AttributeValue>) => {
    return api.put(`/v2/products/attributes/${attributeId}/values/${valueId}`, data);
  },
  updateSequence: (data: UpdateSequencePayload) => {
    return api.patch('/v2/products/attribute-values-seq', data);
  }
};
