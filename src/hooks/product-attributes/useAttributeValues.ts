import { useQuery } from "@tanstack/react-query";
import { attributeValuesService } from "@/services/api/items/productAttributeValues";
import { AttributeValue } from "@/types/productAttributes";
import axios from "axios";

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export function useAttributeValues(expandedAttribute: number | null) {
  // Fetch attribute values when an attribute is expanded
  const { data: attributeValues = [], isLoading: isLoadingValues } = useQuery({
    queryKey: ['attribute-values', expandedAttribute],
    queryFn: async () => {
      if (!expandedAttribute) return [];
      
      try {
        
        
        // First try using the service
        let response;
        try {
          response = await attributeValuesService.getProductAttributeValues({ 
            attribute_id: expandedAttribute 
          });
        } catch (serviceError) {
          
          
          // Fallback to direct API call if service fails
          const adminData = localStorage.getItem('Admin');
          let token = '';
          
          if (adminData) {
            try {
              const admin = JSON.parse(adminData);
              if (admin && admin.token) {
                token = admin.token;
              }
            } catch (e) {
              
            }
          }
          
          // Make a direct API call as fallback
          const directResponse = await axios.get(
            `${apiBaseUrl}/v2/products/attribute-values?attribute_id=${expandedAttribute}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              }
            }
          );
          
          response = directResponse.data;
        }
        
        
        
        // Handle the response data
        let values = [];
        if (Array.isArray(response)) {
          values = response;
        } else if (response?.data) {
          values = response.data;
        }
        
        
        
        // Map the API response fields to our AttributeValue type
        const mappedValues = values.map((value: any) => {
          const mappedValue: AttributeValue = {
            id: value.id || 0,
            attribute_id: value.attribute_id || expandedAttribute,
            name: value.value || '',
            display_name: value.display_value || '',
            base_price: parseFloat(value.base_price || '0') || 0,
            is_default: Number(value.is_default), // Keep as number (0 or 1)
            sequence: parseInt(value.sequence || '0') || 0,
            seq_no: parseInt(value.sequence || '0') || 0,
            status: Number(value.status) // Keep as number (0 or 1)
          };
          
          return mappedValue;
        });
        
        
        return mappedValues;
      } catch (error) {
        
        return [];
      }
    },
    enabled: !!expandedAttribute,
  });

  return {
    attributeValues,
    isLoadingValues
  };
}
