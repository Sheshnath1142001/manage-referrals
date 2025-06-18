import React, { useState, useEffect, useCallback } from "react";
import { Pencil, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { Restaurant } from "@/services/api/restaurants";
import { OrdersPagination } from "@/components/orders/OrdersPagination";
import { useAuth } from "@/hooks/use-auth";

interface OrderStatus {
  id: number;
  status_name: string;
  restaurant_id: number | null;
  status: number;
  description: string;
  order_status_bind_restaurants: any[];
  custom_label?: string;
  custom_label_description?: string;
  custom_label_record_id?: number; // ID of the custom label record for PATCH requests
}

interface ApiResponse {
  order_statuses: OrderStatus[];
  total: number;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const OrderStatus = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const tenantId = user.restaurant_id;
  console.log({ tenantId })
  const { restaurants, isLoading: isLoadingRestaurants, refreshRestaurants } = useGetRestaurants();
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<{
    id: number;
    status_name?: string;
    custom_label: string;
    custom_label_description: string;
    custom_label_record_id?: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Set default location to first restaurant when restaurants are loaded
  useEffect(() => {
    if (restaurants.length > 0 && !selectedLocation) {
      setSelectedLocation(restaurants[0].id.toString());
    }
  }, [restaurants, selectedLocation]);

  // Fetch order statuses
  const fetchOrderStatuses = useCallback(async (searchQuery?: string) => {
    try {
      setIsLoading(true);
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      
      const { token } = JSON.parse(adminData);
      
      let url = `${apiBaseUrl}/order-statuses?page=${currentPage}&per_page=${itemsPerPage}`;
      
      if (user.restaurant_id) {
        url += `&restaurant_id=${user.restaurant_id}`;
      }

      // Add search parameter if provided
      if (searchQuery && searchQuery.trim()) {
        url += `&status_name=${encodeURIComponent(searchQuery.trim())}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order statuses');
      }

      const data: ApiResponse = await response.json();
      
      // Process order statuses data to extract custom labels from order_status_bind_restaurants
      const processedOrderStatuses = data.order_statuses.map(status => {
        let customLabel = "";
        let customLabelDescription = "";
        let customLabelRecordId = undefined;
        if (status.order_status_bind_restaurants && status.order_status_bind_restaurants.length > 0) {
          const restaurantId = selectedLocation ? parseInt(selectedLocation) : null;
          let customBinding = status.order_status_bind_restaurants.find(
            binding => binding.restaurant_id === restaurantId
          );
          // Fallback: use the first binding if no match for selected location
          if (!customBinding) {
            customBinding = status.order_status_bind_restaurants[0];
          }
          if (customBinding) {
            customLabel = customBinding.custom_status_label || "";
            customLabelDescription = customBinding.description || "";
            customLabelRecordId = customBinding.id; // Store the custom label record ID
          }
        }
        return {
          ...status,
          custom_label: customLabel,
          custom_label_description: customLabelDescription,
          custom_label_record_id: customLabelRecordId
        };
      });
      
      // Sort by ID for consistency
      const sortedStatuses = processedOrderStatuses.sort((a, b) => a.id - b.id);
      
      setOrderStatuses(sortedStatuses);
      setTotalItems(data.total);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to load order statuses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, selectedLocation, toast, user.restaurant_id]);

  // Initial data load
  useEffect(() => {
    if (selectedLocation) {
      fetchOrderStatuses();
    }
  }, [currentPage, itemsPerPage, selectedLocation]);

  // Debounced search effect
  useEffect(() => {
    if (!selectedLocation) return;
    
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchOrderStatuses(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedLocation, fetchOrderStatuses]);

  const handleRefresh = () => {
    fetchOrderStatuses(searchTerm);
    refreshRestaurants(); // Also refresh restaurants list
    toast({
      title: "Refreshing data...",
      description: "Fetching the latest order statuses."
    });
  };

  const handleEditStatus = (status: OrderStatus) => {
    // Use the processed custom labels directly from the status object
    setEditingStatus({
      id: status.id,
      status_name: status.status_name,
      custom_label: status.custom_label || "",
      custom_label_description: status.custom_label_description || "",
      custom_label_record_id: status.custom_label_record_id
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingStatus) return;

    try {
      setIsSubmitting(true);
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      
      const { token } = JSON.parse(adminData);
      
      // Prepare request payload - simplified for PATCH request
      const payload = {
        custom_status_label: editingStatus.custom_label.trim(),
        description: editingStatus.custom_label_description.trim()
      };
      
      
      
      // Check if we have an existing custom label record ID for PATCH
      if (editingStatus.custom_label_record_id) {
        // Use PATCH method for existing custom label
        const response = await fetch(`${apiBaseUrl}/label-custom-order-status/${editingStatus.custom_label_record_id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to update status';
          try {
            const errorData = await response.json();
            if (errorData?.message) {
              errorMessage = errorData.message;
            }
            
          } catch (parseError) {
            
          }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        
      } else {
        // Use POST method for creating new custom label
        const createPayload = {
          original_status_id: editingStatus.id,
          custom_status_label: editingStatus.custom_label.trim(),
          description: editingStatus.custom_label_description.trim(),
          restaurant_id: tenantId ? tenantId : null
        };

        const response = await fetch(`${apiBaseUrl}/label-custom-order-status`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createPayload),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to create custom label';
          try {
            const errorData = await response.json();
            if (errorData?.message) {
              errorMessage = errorData.message;
            }
            
          } catch (parseError) {
            
          }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        
      }
      
      toast({
        title: "Success",
        description: "Custom label updated successfully",
      });

      setIsEditDialogOpen(false);
      
      // Immediately refresh to show the changes
      fetchOrderStatuses(searchTerm);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Error",
        description: errorMessage || "Failed to update custom label. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Add this effect to close the dialog if location changes
  useEffect(() => {
    setIsEditDialogOpen(false);
  }, [selectedLocation]);

  return (
    <div className="p-6">
      {/* Search Field and Refresh Button Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by order status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading || isLoadingRestaurants}
          className="h-10 w-10 ml-4"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading || isLoadingRestaurants ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Table */}
      {isLoading || isLoadingRestaurants ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#0f172a]">
              <TableRow>
                <TableHead className="text-white font-medium">ID</TableHead>
                <TableHead className="text-white font-medium">Status Name</TableHead>
                <TableHead className="text-white font-medium">Description</TableHead>
                <TableHead className="text-white font-medium">Custom Label</TableHead>
                <TableHead className="text-white font-medium">Custom Label Description</TableHead>
                <TableHead className="text-white font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderStatuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {searchTerm ? "No order statuses match your search" : "No order statuses found"}
                  </TableCell>
                </TableRow>
              ) : (
                orderStatuses.map((status) => (
                  <TableRow key={status.id}>
                    <TableCell>{status.id}</TableCell>
                    <TableCell>{status.status_name}</TableCell>
                    <TableCell>{status.description}</TableCell>
                    <TableCell>
                      {status.custom_label ? (
                        <span className="font-medium text-green-600">{status.custom_label}</span>
                      ) : (
                        <span className="text-gray-400">No custom label</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {status.custom_label_description ? (
                        <span>{status.custom_label_description}</span>
                      ) : (
                        <span className="text-gray-400">No description</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditStatus(status)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Updated Pagination using OrdersPagination component */}
      <OrdersPagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Custom Label for "{editingStatus?.status_name || 'Status'}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom_label">Custom Label</Label>
              <Input
                id="custom_label"
                value={editingStatus?.custom_label || ""}
                onChange={(e) => setEditingStatus(prev => prev ? {
                  ...prev,
                  custom_label: e.target.value
                } : null)}
                placeholder="Enter custom label"
                className={!editingStatus?.custom_label?.trim() ? "border-red-300" : ""}
              />
              {!editingStatus?.custom_label?.trim() && (
                <p className="text-xs text-red-500 mt-1">Custom label is required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom_label_description">
                Custom Label Description
                <span className="text-gray-400 text-xs ml-2">(Optional)</span>
              </Label>
              <Textarea
                id="custom_label_description"
                value={editingStatus?.custom_label_description || ""}
                onChange={(e) => setEditingStatus(prev => prev ? {
                  ...prev,
                  custom_label_description: e.target.value
                } : null)}
                placeholder="Enter a description that will be shown to customers (optional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isSubmitting || !editingStatus || !editingStatus.custom_label.trim()}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderStatus;