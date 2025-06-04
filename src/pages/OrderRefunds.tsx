import React, { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Restaurant {
  id: number;
  name: string;
  status: number;
}

interface RefundedOrder {
  id: string;
  order_line_item_id: string;
  type: number;
  refund_reason: string;
  refunded_by: string;
  created_at: string;
  status: number;
  order_line_items: {
    id: string;
    order_id: string;
    quantity: string;
    price: string;
    line_item_total: string;
    total_amount: string;
    note: string | null;
    status: number;
    created_at: string;
    products: any;
    orders: {
      full_order_id: string;
      customer_name: string | null;
      customer_email: string | null;
      customer_phone_number: string | null;
      restaurants: {
        id: number;
        name: string;
      };
    };
  };
  payment_info: any;
}

interface ApiResponse {
  refunded_orders: RefundedOrder[];
  total: number;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const OrderRefunds = () => {
  const { toast } = useToast();
  const [refundedOrders, setRefundedOrders] = useState<RefundedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RefundedOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch restaurants for location filter
  const fetchRestaurants = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      
      const { token } = JSON.parse(adminData);
      const response = await fetch(`${apiBaseUrl}/restaurants`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }

      const data = await response.json();
      setRestaurants(data.restaurants.filter((restaurant: Restaurant) => restaurant.status === 1));
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast({
        title: "Error",
        description: "Failed to load restaurants. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Fetch refunded orders
  const fetchRefundedOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      
      const { token } = JSON.parse(adminData);
      
      let url = `${apiBaseUrl}/refunded-orders?page=${currentPage}&per_page=${itemsPerPage}`;
      
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
        throw new Error('Failed to fetch refunded orders');
      }

      const data: ApiResponse = await response.json();
      setRefundedOrders(data.refunded_orders);
      setTotalItems(data.total);
    } catch (error) {
      console.error("Error fetching refunded orders:", error);
      toast({
        title: "Error",
        description: "Failed to load refunded orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, selectedLocation, toast]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    fetchRefundedOrders();
  }, [fetchRefundedOrders]);

  const handleRefresh = () => {
    fetchRefundedOrders();
    toast({
      title: "Refreshing data...",
      description: "Fetching the latest refunded orders."
    });
  };

  const handleViewDetails = (order: RefundedOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Order Refunds</h1>
        <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger>
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

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#0f172a]">
              <TableRow>
                <TableHead className="text-white font-medium">Order ID</TableHead>
                <TableHead className="text-white font-medium">Item Name</TableHead>
                <TableHead className="text-white font-medium">Refund Reason</TableHead>
                <TableHead className="text-white font-medium">Refunded At</TableHead>
                <TableHead className="text-white font-medium text-right">Refund Amount</TableHead>
                <TableHead className="text-white font-medium">Restaurant Name</TableHead>
                <TableHead className="text-white font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refundedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No refunded orders found
                  </TableCell>
                </TableRow>
              ) : (
                refundedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_line_items.orders.full_order_id}</TableCell>
                    <TableCell>{order.order_line_items.products?.name || '-'}</TableCell>
                    <TableCell>{order.refund_reason || '-'}</TableCell>
                    <TableCell>{format(parseISO(order.created_at), "yyyy-MM-dd HH:mm")}</TableCell>
                    <TableCell className="text-right">
                      ${parseFloat(order.order_line_items.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{order.order_line_items.orders.restaurants.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="h-4 w-4" />
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

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Order ID</p>
                  <p>{selectedOrder.order_line_items.orders.full_order_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p>{selectedOrder.order_line_items.orders.restaurants.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p>${parseFloat(selectedOrder.order_line_items.total_amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Refund Reason</p>
                  <p>{selectedOrder.refund_reason || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Refunded By</p>
                  <p>{selectedOrder.refunded_by}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created At</p>
                  <p>{format(parseISO(selectedOrder.created_at), "yyyy-MM-dd HH:mm")}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Customer Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p>{selectedOrder.order_line_items.orders.customer_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{selectedOrder.order_line_items.orders.customer_email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p>{selectedOrder.order_line_items.orders.customer_phone_number || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderRefunds; 