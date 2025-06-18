import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface OrderStatus {
  id: number;
  status_name: string;
  restaurant_id: number | null;
  status: number;
  description: string;
}

interface UpdateOrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

export const UpdateOrderStatusDialog = ({ 
  open, 
  onOpenChange, 
  orderId, 
  currentStatus, 
  onStatusUpdated 
}: UpdateOrderStatusDialogProps) => {
  const { toast } = useToast();
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch order statuses
  const fetchOrderStatuses = async () => {
    try {
      setIsLoading(true);
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      
      const { token } = JSON.parse(adminData);
      
      const response = await fetch(`${apiBaseUrl}/order-statuses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Timezone': 'Asia/Calcutta'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order statuses');
      }

      const data = await response.json();
      const activeStatuses = data.order_statuses.filter((status: OrderStatus) => status.status === 1);
      setOrderStatuses(activeStatuses);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to load order statuses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async () => {
    if (!selectedStatus) {
      toast({
        title: "Error",
        description: "Please select a status to update.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdating(true);
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      
      const { token } = JSON.parse(adminData);
      
      const response = await fetch(`${apiBaseUrl}/v2/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Timezone': 'Asia/Calcutta'
        },
        body: JSON.stringify({
          status: parseInt(selectedStatus)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Order status updated successfully.",
        });
        onStatusUpdated();
        onOpenChange(false);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      fetchOrderStatuses();
      setSelectedStatus("");
    }
  }, [open]);

  const handleCancel = () => {
    setSelectedStatus("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Order #{orderId}
          </div>
          
          <div className="space-y-2">
            <Label>Current Status:</Label>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
              {currentStatus}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select 
              value={selectedStatus} 
              onValueChange={setSelectedStatus}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status..." />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.status_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={updateOrderStatus}
            disabled={isUpdating || !selectedStatus}
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 