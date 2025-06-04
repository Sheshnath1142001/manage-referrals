import { useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { customersApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { Card } from "@/components/ui/card";
import { Customer } from "@/services/api/customers";
import { useEffect, useState } from "react";

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export default function CustomerEdit() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const isNewCustomer = id === 'new';
  
  // Get customer data from router state (passed from Customers page)
  const customerData = location.state?.customerData;
  
  useEffect(() => {
    if (customerData) {
      setCustomer(customerData);
    } else if (isNewCustomer) {
      // Create an empty customer object for new customer
      setCustomer({
        id: 'new',
        name: '',
        email: '',
        phone_no: '',
        country_code: null,
        role_id: 4, // Default role for customer
        roles: {
          id: 4,
          role: 'Customer'
        },
        username: '',
        status: 1,
        customer_groups: []
      });
    } else {
      toast({
        title: "Warning",
        description: "Customer data not available. Please go back to the customers list and try again.",
        variant: "destructive"
      });
    }
  }, [customerData, toast, isNewCustomer]);

  // Fetch customer address - only if this is not a new customer
  const { data: address = [] } = useQuery({
    queryKey: ["customer-address", id],
    queryFn: () => customersApi.getCustomerAddress(id!),
    enabled: !!id && !isNewCustomer,
  });

  // Extract address data safely
  const hasAddress = Array.isArray(address) && address.length > 0;
  
  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    try {
      const adminData = localStorage.getItem('Admin');
      if (adminData) {
        const admin = JSON.parse(adminData);
        return admin?.token || null;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  };

  // Fetch customer groups with auth token
  const { data: customerGroups } = useQuery({
    queryKey: ["customer-groups"],
    queryFn: async () => {
      // Get auth token
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`${apiBaseUrl}/v2/customer-groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch customer groups: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data.data.map((group: any) => ({
        label: group.name,
        value: group.id,
      }));
    },
  });

  // Update or create customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isNewCustomer) {
        // Create new customer
        const newCustomer = await customersApi.createCustomer({
          name: data.name,
          email: data.email,
          phone_no: data.phone_no,
          country_code: data.country_code,
          customer_groups: data.customer_groups,
        });

        // If address details are provided, create address for the new customer
        if (data.street_name || data.city || data.postcode) {
          const newCustomerId = typeof newCustomer === 'object' && 'id' in newCustomer 
            ? newCustomer.id 
            : null;
            
          if (newCustomerId) {
            await customersApi.createCustomerAddress({
              unit_number: data.unit_number || '',
              street_name: data.street_name || '',
              postcode: data.postcode || '',
              city: data.city || '',
              province: data.province || '',
              country: data.country || '',
              module_id: parseInt(newCustomerId),
              module_type: 6,
            });
          }
        }
      } else {
        // Update existing customer
        await customersApi.updateCustomer(id!, {
          name: data.name,
          email: data.email,
          phone_no: data.phone_no,
          country_code: data.country_code,
          customer_groups: data.customer_groups,
        });

        // Update or create address if provided
        if (hasAddress) {
          await customersApi.updateCustomerAddress(address[0].id, {
            unit_number: data.unit_number,
            street_name: data.street_name,
            postcode: data.postcode,
            city: data.city,
            province: data.province,
            country: data.country,
          });
        } else if (data.street_name || data.city || data.postcode) {
          await customersApi.createCustomerAddress({
            unit_number: data.unit_number || '',
            street_name: data.street_name || '',
            postcode: data.postcode || '',
            city: data.city || '',
            province: data.province || '',
            country: data.country || '',
            module_id: parseInt(id!),
            module_type: 6,
          });
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: isNewCustomer ? "Customer created successfully" : "Customer updated successfully",
      });
      window.history.back();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isNewCustomer ? 'create' : 'update'} customer. Please try again.`,
        variant: "destructive",
      });
    },
  });

  if (!customer || updateCustomerMutation.isPending) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="flex items-center justify-center h-32">
            {!customer ? "Loading customer data..." : `${isNewCustomer ? 'Creating' : 'Updating'} customer...`}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <CustomerForm
        customer={customer}
        address={hasAddress ? address[0] : undefined}
        customerGroups={customerGroups}
        isLoading={updateCustomerMutation.isPending}
        onSubmit={(data) => updateCustomerMutation.mutate(data)}
      />
    </div>
  );
}
