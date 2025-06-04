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
        console.log(`Fetching attribute values for attribute ID ${expandedAttribute}`);
        
        // First try using the service
        let response;
        try {
          response = await attributeValuesService.getProductAttributeValues({ 
            attribute_id: expandedAttribute 
          });
        } catch (serviceError) {
          console.error('Error using service, trying direct API call:', serviceError);
          
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
              console.error('Error parsing admin data:', e);
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
        
        console.log('Raw API response:', response);
        
        // Handle the response data
        let values = [];
        if (Array.isArray(response)) {
          values = response;
        } else if (response?.data) {
          values = response.data;
        }
        
        console.log('Extracted values array:', values);
        
        // Map the API response fields to our AttributeValue type
        const mappedValues = values.map((value: any) => {
          const mappedValue: AttributeValue = {
            id: value.id || 0,
            attribute_id: value.attribute_id || expandedAttribute,
            name: value.value || '',
            display_name: value.display_value || '',
            base_price: parseFloat(value.base_price || '0') || 0,
            is_default: value.is_default === 1 || value.is_default === true,
            sequence: parseInt(value.sequence || '0') || 0,
            seq_no: parseInt(value.sequence || '0') || 0,
            status: value.status === 1 ? "Active" : "Inactive"
          };
          
          return mappedValue;
        });
        
        console.log('Final mapped attribute values:', mappedValues);
        return mappedValues;
      } catch (error) {
        console.error('Error fetching attribute values:', error);
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
