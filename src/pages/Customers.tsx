import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TablePagination } from "@/components/ui/table";
import { customersApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { CustomerHeader } from "@/components/customers/CustomerHeader";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { Customer } from "@/services/api/customers";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const Customers = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    email: "",
    phone: "",
    status: "1" // Default to status 1 customers
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerAddress, setCustomerAddress] = useState(null);

  // Fetch customers with filters
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["customers", page, pageSize, filters],
    queryFn: () => customersApi.getCustomers({
      email: filters.email,
      phone_no: filters.phone,
      status: filters.status === "all" ? undefined : filters.status,
      page,
      per_page: pageSize
    }),
  });

  // Fetch customer address when needed
  const { data: address } = useQuery({
    queryKey: ["customer-address", selectedCustomer?.id],
    queryFn: () => customersApi.getCustomerAddress(selectedCustomer!.id),
    enabled: !!selectedCustomer?.id && selectedCustomer.id !== 'new',
  });

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    try {
      const adminData = localStorage.getItem('Admin');
      if (adminData) {
        const admin = JSON.parse(adminData);
        return admin?.token || null;
      }
    } catch (error) {
      
    }
    return null;
  };

  // Fetch customer groups
  const { data: customerGroups } = useQuery({
    queryKey: ["customer-groups"],
    queryFn: async () => {
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
      
      const result = await response.json();
      return result.data.data.map((group: any) => ({
        label: group.name,
        value: group.id.toString(),
      }));
    },
  });

  // Create/Update customer mutation
  const customerMutation = useMutation({
    mutationFn: async (data: any) => {
       // Debug log
      const isNewCustomer = selectedCustomer?.id === 'new';
      
      if (isNewCustomer) {
        // Create new customer
        const newCustomerResponse = await customersApi.createCustomer({
          name: data.name,
          email: data.email,
          phone_no: data.phone_no,
          country_code: data.country_code,
          status: data.status,
          role_id: 3, // Default to Customer role
          customer_groups: data.customer_groups,
        });

        // Extract customer ID from response
        const newCustomerId = newCustomerResponse?.id;

        // If user wants to include address and address details are provided, create address for the new customer
        if (newCustomerId && data.include_address && (data.street_name || data.city || data.postcode || data.unit_number)) {
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
      } else {
        // Update existing customer
        await customersApi.updateCustomer(selectedCustomer!.id, {
          name: data.name,
          email: data.email,
          phone_no: data.phone_no,
          country_code: data.country_code,
          status: data.status,
          customer_groups: data.customer_groups, // This will be converted to customer_group_ids in the API function
        });

        // Update or create address if user wants to include address
        if (data.include_address) {
          const hasAddress = Array.isArray(address) && address.length > 0;
          if (hasAddress) {
            await customersApi.updateCustomerAddress(address[0].id, {
              unit_number: data.unit_number,
              street_name: data.street_name,
              postcode: data.postcode,
              city: data.city,
              province: data.province,
              country: data.country,
              module_id: selectedCustomer!.id, // Pass the customer ID as module_id
            });
          } else if (data.street_name || data.city || data.postcode) {
            await customersApi.createCustomerAddress({
              unit_number: data.unit_number || '',
              street_name: data.street_name || '',
              postcode: data.postcode || '',
              city: data.city || '',
              province: data.province || '',
              country: data.country || '',
              module_id: parseInt(selectedCustomer!.id),
              module_type: 6,
            });
          }
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: selectedCustomer?.id === 'new' ? "Customer created successfully" : "Customer updated successfully",
      });
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
      setSelectedCustomer(null);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${selectedCustomer?.id === 'new' ? 'create' : 'update'} customer. Please try again.`,
        variant: "destructive",
      });
    },
  });

  // Extract customer data and total safely
  const customers: Customer[] = data?.customers || [];
  const totalItems = data?.total || 0;
  
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      email: "",
      phone: "",
      status: "1"
    });
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Customers",
      description: "Customer data is being refreshed."
    });
  };

  const handleAddCustomer = () => {
    setSelectedCustomer({
      id: 'new',
      name: '',
      email: '',
      phone_no: '',
      country_code: null,
      role_id: 4,
      roles: { id: 4, role: 'Customer' },
      username: '',
      status: 1,
      customer_groups: []
    });
    setIsAddDialogOpen(true);
  };

  const handleViewCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsViewDialogOpen(true);
    }
  };

  const handleEditCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsEditDialogOpen(true);
    } else {
      toast({
        title: "Error",
        description: "Customer data not found. Please reload the page and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Customers</h1>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <CustomerFilters 
            emailFilter={filters.email}
            phoneFilter={filters.phone}
            statusFilter={filters.status}
            onEmailFilterChange={(value) => handleFilterChange("email", value)}
            onPhoneFilterChange={(value) => handleFilterChange("phone", value)}
            onStatusFilterChange={(value) => handleFilterChange("status", value)}
            onClearFilters={clearFilters}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={handleAddCustomer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>
        
        <CustomerTable 
          customers={customers}
          isLoading={isLoading}
          isError={isError}
          onView={handleViewCustomer}
          onEdit={handleEditCustomer}
        />
        
        <TablePagination
          currentPage={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1); // Reset to first page when page size changes
          }}
        />
      </div>

      {/* View Customer Dialog */}
      <CustomerDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        customer={selectedCustomer || undefined}
        address={address?.[0]}
        customerGroups={customerGroups}
        isViewMode={true}
      />

      {/* Edit Customer Dialog */}
      <CustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        customer={selectedCustomer || undefined}
        address={address?.[0]}
        customerGroups={customerGroups}
        isLoading={customerMutation.isPending}
        onSubmit={(data) => customerMutation.mutate(data)}
      />

      {/* Add Customer Dialog */}
      <CustomerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        customer={selectedCustomer || undefined}
        customerGroups={customerGroups}
        isLoading={customerMutation.isPending}
        onSubmit={(data) => customerMutation.mutate(data)}
      />
    </div>
  );
};

export default Customers;
