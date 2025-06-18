import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { CustomerGroupDialog } from "@/components/customer-groups/CustomerGroupDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { customerGroupsApi, type Customer, type CustomerGroup } from '@/services/api/customerGroups';
import { authApi } from '@/services/api/auth'; // Import authApi
import { ArrowLeft, Edit, Eye, Plus, RefreshCw, Trash2, Users } from "lucide-react";

// Define proper interfaces for the actual API response structure
interface ApiPaginationResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface ApiDataResponse {
  data: CustomerGroup[];
  pagination: ApiPaginationResponse;
}

interface ActualApiResponse {
  success: boolean;
  data: ApiDataResponse;
}

const CustomerGroups: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentUser, setCurrentUser] = useState(null); // Add state for current user
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 1,
    user_ids: [] as string[]
  });

  // Function to fetch current user data from /me endpoint
  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.getMe();
      
      
      // Handle both direct data and axios wrapper response
      const userData = 'data' in response ? response.data : response;
      setCurrentUser(userData);
      return userData; // Return userData for immediate use
    } catch (error) {
      
      toast({
        title: "Warning",
        description: "Could not fetch user information",
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchCustomerGroups = async (restaurantId?: number) => {
    setLoading(true);
    try {
      const response = await customerGroupsApi.getCustomerGroups(
        currentPage,
        pageSize,
        undefined, // search
        undefined, // status
        restaurantId // Add restaurant_id parameter
      );

      

      // Since the API client interceptor returns response.data, 
      // the response should already be the ActualApiResponse structure
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        const apiResponse = response as ActualApiResponse;
        
        if (apiResponse.success && apiResponse.data) {
          const customerGroupsData: CustomerGroup[] = apiResponse.data.data || [];
          const paginationData: ApiPaginationResponse = apiResponse.data.pagination || { total: 0, page: 1, limit: 10, total_pages: 0 };
          
          
          
          
          setCustomerGroups(customerGroupsData);
          setTotalItems(paginationData.total);
        } else {
          
          setCustomerGroups([]);
          setTotalItems(0);
        }
      } else {
        
        setCustomerGroups([]);
        setTotalItems(0);
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to fetch customer groups",
        variant: "destructive",
      });
      setCustomerGroups([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerGroupsApi.getCustomers();
      
      if (response && response.customers) {
        
        setCustomers(response.customers);
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Call /me API when component mounts and then fetch customer groups with restaurant_id
    const initializeData = async () => {
      const userData = await fetchCurrentUser();
      const restaurantId = userData?.user?.restaurant_id;
      
      if (restaurantId) {
        await fetchCustomerGroups(restaurantId);
      } else {
        await fetchCustomerGroups(); // Fallback without restaurant_id
      }
      
      await fetchCustomers();
    };
    
    initializeData();
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefresh = async () => {
    const userData = await fetchCurrentUser(); // Also refresh user data on refresh
    const restaurantId = userData?.user?.restaurant_id;
    
    if (restaurantId) {
      await fetchCustomerGroups(restaurantId);
    } else {
      await fetchCustomerGroups();
    }
    
    toast({ title: "Refreshing data..." });
  };

  const handleView = (group: CustomerGroup) => {
    
    
    setSelectedGroup(group);
    setIsViewDialogOpen(true);
  };

  const handleOpenEditDialog = (group: CustomerGroup) => {
    setSelectedGroup(group);
    setIsEditDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setSelectedGroup(null);
    setFormData({
      name: '',
      description: '',
      status: 1,
      user_ids: []
    });
    setIsCreateDialogOpen(true);
  };

  const handleOpenDeleteDialog = (group: CustomerGroup) => {
    setSelectedGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (values: any) => {
    try {
      
      
      // Check if user_ids are present directly
      let userIds = values.user_ids || [];
      
      // If no user_ids, check for 'customers' from the form
      if (!userIds.length && values.customers) {
        userIds = values.customers;
      }
      
      // Get restaurant_id from current user
      const restaurantId = currentUser?.user?.restaurant_id;
      
      const data = {
        name: values.name,
        description: values.description || '',
        status: values.status ? 1 : 0,
        user_ids: userIds,
        restaurant_id: restaurantId // Add restaurant_id to payload
      };
      
      
      await customerGroupsApi.createCustomerGroup(data);
      toast({
        title: "Success",
        description: "Customer group created successfully",
      });
      setIsCreateDialogOpen(false);
      
      // Refresh with restaurant_id
      if (restaurantId) {
        await fetchCustomerGroups(restaurantId);
      } else {
        await fetchCustomerGroups();
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to create customer group",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!selectedGroup) return;

    try {
      // Check if user_ids are present directly
      let userIds = values.user_ids || [];
      
      // If no user_ids, check for 'customers' from the form
      if (!userIds.length && values.customers) {
        userIds = values.customers;
      }
      
      // Get restaurant_id from current user
      const restaurantId = currentUser?.user?.restaurant_id;
      const data = {
        name: values.name,
        description: values.description || '',
        status: values.status ? 1 : 0,
        user_ids: userIds
      };
      
      await customerGroupsApi.updateCustomerGroup(selectedGroup.id, data);
      toast({
        title: "Success",
        description: "Customer group updated successfully",
      });
      setIsEditDialogOpen(false);
      
      // Refresh with restaurant_id
      if (restaurantId) {
        await fetchCustomerGroups(restaurantId);
      } else {
        await fetchCustomerGroups();
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to update customer group",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;

    try {
      await customerGroupsApi.deleteCustomerGroup(selectedGroup.id);
      toast({
        title: "Success",
        description: "Customer group deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      
      // Refresh with restaurant_id
      const restaurantId = currentUser?.user?.restaurant_id;
      if (restaurantId) {
        await fetchCustomerGroups(restaurantId);
      } else {
        await fetchCustomerGroups();
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to delete customer group",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-0 hover:bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Customer Groups</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0F172A] hover:bg-[#0F172A]/90">
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Description</TableHead>
                <TableHead className="text-white">Members</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <span className="text-muted-foreground">Loading...</span>
                  </TableCell>
                </TableRow>
              ) : customerGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <span className="text-muted-foreground">No groups found</span>
                  </TableCell>
                </TableRow>
              ) : (
                customerGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group._count?.customer_groups_users || group.customer_groups_users?.length || 0}
                        {(() => {
                          const names = group.customer_groups_users?.map(u => u.users?.name).filter(Boolean) || [];
                          if (names.length === 0) return null;
                          const visibleNames = names.slice(0, 2).join(', ');
                          const extra = names.length > 2 ? ` (+${names.length - 2})` : '';
                          return (
                            <span className="ml-2 truncate max-w-[180px] text-xs text-muted-foreground" title={names.join(', ')}>
                              {visibleNames}{extra}
                            </span>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        group.status === 1 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {group.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleView(group)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenEditDialog(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleOpenDeleteDialog(group)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <CustomerGroupDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateSubmit}
          isSubmitting={loading}
        />
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <CustomerGroupDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleEditSubmit}
          customerGroup={selectedGroup || undefined}
          isSubmitting={loading}
        />
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer Group</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the customer group and remove all associations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this customer group?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Customer Group</DialogTitle>
            <DialogDescription>
              Viewing details for customer group "{selectedGroup?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="mt-1">{selectedGroup?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="mt-1">{selectedGroup?.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Members</label>
              <div className="mt-1 space-y-1">
                {selectedGroup?.customer_groups_users && selectedGroup.customer_groups_users.length > 0 ? (
                  <>
                    {selectedGroup.customer_groups_users.length === customers.length && 
                     customers.length > 0 && 
                     selectedGroup.customer_groups_users.every(u => 
                      customers.some(c => c.id === u.user_id)
                     ) ? (
                      <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700">
                        <Users className="h-3 w-3 mr-1" />
                        All Customers ({customers.length})
                      </Badge>
                    ) : (
                      selectedGroup.customer_groups_users.map((user) => {
                        const apiName = user.users?.name;
                        const customer = customers.find(c => c.id === user.user_id);
                        const displayName = apiName || customer?.name || `Customer ID: ${user.user_id}`;
                        return (
                          <Badge key={user.user_id} variant="outline" className="mr-1">
                            {displayName}
                          </Badge>
                        );
                      })
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No members</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <p className="mt-1">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  selectedGroup?.status === 1 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {selectedGroup?.status === 1 ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerGroups;
