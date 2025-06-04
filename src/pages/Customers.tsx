import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TablePagination } from "@/components/ui/table";
import { customersApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { CustomerHeader } from "@/components/customers/CustomerHeader";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { Customer } from "@/services/api/customers";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

const Customers = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    email: "",
    phone: "",
    status: "1" // Default to status 1 customers
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch customers with filters
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["customers", page, pageSize, filters],
    queryFn: () => customersApi.getCustomers({
      email: filters.email,
      phone: filters.phone,
      status: filters.status === "all" ? undefined : filters.status,
      page,
      per_page: pageSize
    }),
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
    navigate("/customers/new");
  };

  const handleViewCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  const handleEditCustomer = (customerId: string) => {
    // Find the customer data from the current list
    const customerToEdit = customers.find(customer => customer.id === customerId);
    
    if (customerToEdit) {
      // Pass the customer data as state when navigating
      navigate(`/customers/${customerId}/edit`, { state: { customerData: customerToEdit } });
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
    </div>
  );
};

export default Customers;
