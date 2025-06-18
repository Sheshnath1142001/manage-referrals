
import { api } from '../client';

export interface AttributeValue {
  id: number;
  attribute_id: number;
  value: string;
  display_value: string;
  base_price: string;
  is_default: number;
  sequence: number;
  status: number;
  created_at: string;
  updated_at: string;
}

export const getAttributeValues = async (attributeId: number): Promise<AttributeValue[]> => {
  try {
    const response = await api.get('/v2/products/attribute-values', {
      params: { attribute_id: attributeId }
    });
    return response.data || response || [];
  } catch (error) {
    console.error('Error fetching attribute values:', error);
    return [];
  }
};

export const attributeValuesService = {
  updateProductAttributeValuesSeqNo: async (data: { id: number; new_seq_no: number }) => {
    try {
      const response = await api.put('/v2/products/attribute-values/sequence', data);
      return response.data;
    } catch (error) {
      console.error('Error updating attribute value sequence:', error);
      throw error;
    }
  }
};

// Default export for compatibility
export default {
  getAttributeValues,
  attributeValuesService
};
