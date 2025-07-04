import React, { useState } from "react";
import { useOrders } from "@/hooks/orders/useOrders";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrdersPagination } from "@/components/orders/OrdersPagination";
import { OrderDetailsDialog } from "@/components/OrderDetailsDialog";
import { UpdateOrderStatusDialog } from "@/components/orders/UpdateOrderStatusDialog";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/services/api/auth";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  note?: string;
  modifiers?: Array<{
    name: string;
    price: number;
  }>;
}

interface OrderDiscount {
  id: number;
  name: string;
  amount: number;
  type: string;
}

interface OrderSurcharge {
  id: number;
  name: string;
  amount: number;
  type: string;
}

interface CustomerDetail {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface DeliveryDetail {
  address?: string;
  instructions?: string;
  deliveryFee?: number;
  estimatedTime?: string;
  status?: string;
  waitingTime?: string;
  deliveryTime?: string;
}

interface OrderDetail {
  id: string;
  amount?: number;
  status?: string;
  paymentMethod: string;
  employee: string;
  platform: string;
  orderType: string;
  createdAt: string;
  location: string;
  items?: any[];
  note?: string;
  discounts?: OrderDiscount[];
  surcharges?: OrderSurcharge[];
  customer?: CustomerDetail;
  delivery?: DeliveryDetail;
  subtotal?: number;
  tax?: number;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const Orders = () => {
  const { toast } = useToast();
  const {
    orders,
    isLoading,
    currentPage,
    totalItems,
    itemsPerPage,
    filters,
    platforms,
    paymentMethods,
    orderTypes,
    orderStatuses,
    restaurants,
    staffMembers,
    handleFilterChange,
    handleDateChange,
    handlePageChange,
    handleItemsPerPageChange,
    fetchOrders,
  } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string>("");
  const [editingOrderCurrentStatus, setEditingOrderCurrentStatus] = useState<string>("");

  // Helper to convert UTC date-time string to store's local timezone
  const convertUtcToStoreTime = (utcString?: string, storeTz?: string): string | undefined => {
    if (!utcString) return undefined;
    try {
      // If the string does not contain timezone info, append 'Z' so Date treats it as UTC
      const isIsoWithZone = /Z$|[+-]\d{2}:?\d{2}$/.test(utcString);
      const isoString = isIsoWithZone ? utcString : `${utcString.replace(' ', 'T')}Z`;
      const dateObj = new Date(isoString);

      if (isNaN(dateObj.getTime())) return utcString; // fallback to original string

      const tz = storeTz || Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Format the date in the store's timezone
      const formatter = new Intl.DateTimeFormat(undefined, {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return formatter.format(dateObj);
    } catch {
      return utcString; // fallback to original if anything fails
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const adminData = localStorage.getItem('Admin');
      if (!adminData) {
        throw new Error('No authentication data found');
      }
      
      const { token } = JSON.parse(adminData);
      
      // Fetch store timezone using /me endpoint
      let storeTimezone: string | undefined;
      try {
        const meResp: any = await authApi.getMe();
        const meData = meResp && 'data' in meResp ? meResp.data : meResp;
        // Attempt to extract timezone from various possible paths
        storeTimezone = meData?.user?.restaurants?.timezone ||
                        meData?.user?.restaurant?.timezone ||
                        meData?.restaurant?.timezone ||
                        undefined;
      } catch (_) {
        // Ignore errors and fall back to browser timezone if extraction fails
      }
      
      const response = await fetch(`${apiBaseUrl}/v2/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      
      if (!data || !data.data) {
        throw new Error('Invalid response format');
      }
      
      // Log the full API response
      
      
      // Find the order in the orders list to get additional info
      const orderInList = orders.find(order => order.id === orderId);
      
      // Get payment methods as string
      let paymentMethod = 'N/A';
      try {
        if (data.data.payment_summary && Array.isArray(data.data.payment_summary.methods)) {
          paymentMethod = data.data.payment_summary.methods
            .map((m: any) => m.method)
            .filter(Boolean)
            .join(", ");
        }
      } catch (e) {
        
      }
      
      // Parse items with error handling
      let items: any[] = [];
      try {
        // Pass the raw order_line_items from the API response for the new format
        if (Array.isArray(data.data.order_line_items)) {
          items = data.data.order_line_items;
        } else if (Array.isArray(data.data.order_items)) {
          // Legacy format - convert to old structure
          items = data.data.order_items.map((item: any) => ({
            id: parseInt(item.id) || Math.random(),
            name: item.name || item.item_name || 'Unknown Item',
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1,
            totalPrice: parseFloat(item.total_price) || parseFloat(item.price) * parseInt(item.quantity) || 0,
            note: item.note || '',
            modifiers: Array.isArray(item.modifiers)
              ? item.modifiers.map((mod: any) => ({
                  name: mod.name || 'Unknown Modifier',
                  price: parseFloat(mod.price) || 0
                }))
              : []
          }));
        } else if (Array.isArray(data.data.items)) {
          // Legacy format - convert to old structure
          items = data.data.items.map((item: any) => ({
            id: parseInt(item.id) || Math.random(),
            name: item.name || item.item_name || 'Unknown Item',
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1,
            totalPrice: parseFloat(item.total_price || item.totalPrice) || parseFloat(item.price) * parseInt(item.quantity) || 0,
            note: item.note || '',
            modifiers: Array.isArray(item.modifiers)
              ? item.modifiers.map((mod: any) => ({
                  name: mod.name || 'Unknown Modifier',
                  price: parseFloat(mod.price) || 0
                }))
              : []
          }));
        }
        // No mock data fallback: if items is empty, just show empty
      } catch (e) {
        
      }
      
      // Parse discounts
      let discounts: OrderDiscount[] = [];
      try {
        if (data.data.discounts && Array.isArray(data.data.discounts)) {
          discounts = data.data.discounts.map((disc: any) => ({
            id: parseInt(disc.id) || Math.random(),
            name: disc.name,
            amount: parseFloat(disc.amount),
            type: disc.type
          }));
        } else if (data.data.discount && parseFloat(data.data.discount) !== 0) {
          discounts = [{
            id: Math.random(),
            name: 'Discount',
            amount: parseFloat(data.data.discount),
            type: 'fixed'
          }];
        }
      } catch (e) {
        
      }
      
      // Parse surcharges
      let surcharges: OrderSurcharge[] = [];
      try {
        if (data.data.surcharges && Array.isArray(data.data.surcharges)) {
          surcharges = data.data.surcharges.map((surcharge: any) => ({
            id: parseInt(surcharge.id) || Math.random(),
            name: surcharge.name,
            amount: parseFloat(surcharge.amount),
            type: surcharge.type
          }));
        } else if (data.data.surcharge_amount && parseFloat(data.data.surcharge_amount) !== 0) {
          surcharges = [{
            id: Math.random(),
            name: 'Surcharge',
            amount: parseFloat(data.data.surcharge_amount),
            type: 'fixed'
          }];
        }
      } catch (e) {
        
      }
      
      // Parse customer details
      let customer: CustomerDetail = {};
      try {
        if (data.data.customer) {
          customer = {
            id: data.data.customer.id,
            name: data.data.customer.name,
            email: data.data.customer.email,
            phone: data.data.customer.phone,
            address: data.data.customer.address
          };
        } else if (data.data.customer_name || data.data.customer_email || data.data.customer_phone_number) {
          customer = {
            name: data.data.customer_name,
            email: data.data.customer_email,
            phone: data.data.customer_phone_number
          };
        }
      } catch (e) {
        
      }
      
      // Parse delivery details
      let delivery: DeliveryDetail = {};
      try {
        /*
         * Build delivery details from the API response.
         * 1. Address: Compose a single line address from the first element of
         *    `order_delivery_addresses_order_delivery_addresses_order_idToorders` (if present).
         * 2. Delivery fee, waiting time and delivery time are available directly on the root object.
         */
        const addressArray =
          Array.isArray(data.data.order_delivery_addresses_order_delivery_addresses_order_idToorders) &&
          data.data.order_delivery_addresses_order_delivery_addresses_order_idToorders.length > 0
            ? (() => {
                const addr = data.data.order_delivery_addresses_order_delivery_addresses_order_idToorders[0];
                return [
                  addr.unit_number ? `Unit ${addr.unit_number}` : undefined,
                  addr.street_name,
                  addr.city,
                  addr.province,
                  addr.postcode,
                  addr.country,
                ].filter(Boolean);
              })()
            : [];

        delivery = {
          address: addressArray.length ? addressArray.join(', ') : undefined,
          instructions: data.data.delivery_instructions || undefined,
          deliveryFee: data.data.delivery_charge ? parseFloat(data.data.delivery_charge) : undefined,
          estimatedTime: convertUtcToStoreTime(data.data.estimated_time, storeTimezone),
          status: data.data.order_status_name || data.data.status || undefined,
          waitingTime: data.data.waiting_time || undefined,
          deliveryTime: convertUtcToStoreTime(data.data.delivery_time, storeTimezone),
        };
      } catch (e) {
        
      }
      
      // Map API response to OrderDetailsDialog expected structure
      const orderData: OrderDetail = {
        id: data.data.full_order_id || orderId,
        amount: data.data.total_amount ? parseFloat(data.data.total_amount) : undefined,
        status: data.data.order_status_name || data.data.status,
        paymentMethod: paymentMethod,
        employee: data.data.users_orders_created_byTousers?.name || orderInList?.users_orders_created_byTousers?.name,
        platform: data.data.order_platform_types?.type || orderInList?.order_platform_types?.type,
        orderType: data.data.order_type_name || orderInList?.order_type_name,
        createdAt: data.data.created_at,
        location: data.data.restaurant_name || orderInList?.restaurant_name,
        items: items,
        note: data.data.note,
        discounts: discounts.length > 0 ? discounts : undefined,
        surcharges: surcharges.length > 0 ? surcharges : undefined,
        customer: Object.keys(customer).length > 0 ? customer : undefined,
        delivery: Object.keys(delivery).length > 0 ? delivery : undefined,
        subtotal: data.data.subtotal ? parseFloat(data.data.subtotal) : undefined,
        tax: data.data.tax ? parseFloat(data.data.tax) : undefined
      };
      
      
      setSelectedOrder(orderData);
      setIsDetailsOpen(true);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditOrder = (orderId: string, currentStatus: string) => {
    setEditingOrderId(orderId);
    setEditingOrderCurrentStatus(currentStatus);
    setIsUpdateStatusOpen(true);
  };

  const handleStatusUpdated = () => {
    fetchOrders(); // Refresh the orders list
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <OrderFilters
        selectedPlatform={filters.platform}
        selectedPaymentMethod={filters.paymentMethod}
        selectedOrderType={filters.orderType}
        selectedAttendant={filters.attendant}
        selectedLocation={filters.location}
        selectedStatus={filters.status}
        startDate={filters.startDate}
        endDate={filters.endDate}
        searchTerm={filters.searchTerm}
        restaurants={restaurants}
        orderStatuses={orderStatuses}
        platforms={platforms}
        paymentMethods={paymentMethods}
        orderTypes={orderTypes}
        staffMembers={staffMembers}
        onFilterChange={handleFilterChange}
        onDateChange={handleDateChange}
        onRefresh={fetchOrders}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <OrdersTable
          orders={orders}
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
        />

        <OrdersPagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      <OrderDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        order={selectedOrder}
      />

      <UpdateOrderStatusDialog
        open={isUpdateStatusOpen}
        onOpenChange={setIsUpdateStatusOpen}
        orderId={editingOrderId}
        currentStatus={editingOrderCurrentStatus}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
};

export default Orders;
