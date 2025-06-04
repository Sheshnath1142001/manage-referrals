import React, { useState, useEffect, useCallback } from "react";
import { Pencil, RefreshCw, Plus } from "lucide-react";
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

interface OrderStatus {
  id: number;
  status_name: string;
  restaurant_id: number | null;
  status: number;
  description: string;
  order_status_bind_restaurants: any[];
  custom_label?: string;
  custom_label_description?: string;
}

interface ApiResponse {
  order_statuses: OrderStatus[];
  total: number;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const OrderStatus = () => {
  const { toast } = useToast();
  const { restaurants, isLoading: isLoadingRestaurants, refreshRestaurants } = useGetRestaurants();
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<{
    id: number;
    status_name?: string;
    custom_label: string;
    custom_label_description: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch order statuses
  const fetchOrderStatuses = useCallback(async () => {
    try {
      setIsLoading(true);
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      
      const { token } = JSON.parse(adminData);
      
      let url = `${apiBaseUrl}/order-statuses?page=${currentPage}&per_page=${itemsPerPage}`;
      
      if (selectedLocation !== "all") {
        url += `&restaurant_id=${selectedLocation}`;
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
        if (status.order_status_bind_restaurants && status.order_status_bind_restaurants.length > 0) {
          const restaurantId = selectedLocation !== "all" ? parseInt(selectedLocation) : null;
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
          }
        }
        return {
          ...status,
          custom_label: customLabel,
          custom_label_description: customLabelDescription
        };
      });
      
      // Sort by ID for consistency
      const sortedStatuses = processedOrderStatuses.sort((a, b) => a.id - b.id);
      
      setOrderStatuses(sortedStatuses);
      setTotalItems(data.total);
    } catch (error) {
      console.error("Error fetching order statuses:", error);
      toast({
        title: "Error",
        description: "Failed to load order statuses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, selectedLocation, toast]);

  // Initial data load
  useEffect(() => {
    fetchOrderStatuses();
  }, [currentPage, itemsPerPage, selectedLocation]);

  const handleRefresh = () => {
    fetchOrderStatuses();
    refreshRestaurants(); // Also refresh restaurants list
    toast({
      title: "Refreshing data...",
      description: "Fetching the latest order statuses."
    });
  };

  const handleAddStatus = () => {
    toast({
      title: "Add Status",
      description: "Add new status functionality will be implemented here",
    });
  };

  const handleEditStatus = (status: OrderStatus) => {
    // Find the binding for the selected location
    let customLabel = "";
    let customLabelDescription = "";
    if (status.order_status_bind_restaurants && status.order_status_bind_restaurants.length > 0) {
      const restaurantId = selectedLocation !== "all" ? parseInt(selectedLocation) : null;
      const customBinding = status.order_status_bind_restaurants.find(
        binding => binding.restaurant_id === restaurantId
      );
      if (customBinding) {
        customLabel = customBinding.custom_status_label || "";
        customLabelDescription = customBinding.description || "";
      }
    }
    setEditingStatus({
      id: status.id,
      status_name: status.status_name,
      custom_label: customLabel,
      custom_label_description: customLabelDescription
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
      
      // Prepare request payload
      const payload = {
        original_status_id: editingStatus.id,
        custom_status_label: editingStatus.custom_label.trim(),
        description: editingStatus.custom_label_description.trim(),
        restaurant_id: selectedLocation !== "all" ? parseInt(selectedLocation) : null
      };
      
      console.log("Updating order status with payload:", payload);
      
      const response = await fetch(`${apiBaseUrl}/label-custom-order-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Handle API errors
      if (!response.ok) {
        let errorMessage = 'Failed to update status';
        try {
          const errorData = await response.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
          console.error("API Error Response:", errorData);
        } catch (parseError) {
          console.error("Error parsing API error response");
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("Update successful:", responseData);
      
      toast({
        title: "Success",
        description: "Custom label updated successfully",
      });

      setIsEditDialogOpen(false);
      
      // Immediately refresh to show the changes
      fetchOrderStatuses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: errorMessage || "Failed to update custom label. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Add this effect to close the dialog if location changes
  useEffect(() => {
    setIsEditDialogOpen(false);
  }, [selectedLocation]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Order Status</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleAddStatus}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Status
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={isLoading || isLoadingRestaurants}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || isLoadingRestaurants ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Location</label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="h-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
                    No order statuses found
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Custom Label for "{editingStatus?.status_name || 'Status'}"</DialogTitle>
          </DialogHeader>
          {selectedLocation === "all" ? (
            <div className="py-4">
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-700">
                <p className="text-sm font-medium mb-2">Restaurant Selection Required</p>
                <p className="text-xs">
                  Please select a specific restaurant from the dropdown menu before editing custom labels.
                </p>
              </div>
            </div>
          ) : (
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
          )}
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
              disabled={isSubmitting || !editingStatus || !editingStatus.custom_label.trim() || selectedLocation === "all"}
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
