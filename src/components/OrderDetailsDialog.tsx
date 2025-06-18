import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrderHeader } from "./orders/details/OrderHeader";
import { OrderSummary } from "./orders/details/OrderSummary";
import { OrderItemsTable } from "./orders/details/OrderItemsTable";
import { OrderPaymentDetails } from "./orders/details/OrderPaymentDetails";
import { OrderDiscountSurcharge } from "./orders/details/OrderDiscountSurcharge";
import { OrderCustomerDetails } from "./orders/details/OrderCustomerDetails";
import { OrderDeliveryDetails } from "./orders/details/OrderDeliveryDetails";

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

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
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
  } | null;
}

export const OrderDetailsDialog: React.FC<OrderDetailsProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) {
    return null;
  }

  const hasDeliveryDetails = !!order.delivery && (
    !!order.delivery.address || 
    !!order.delivery.instructions || 
    !!order.delivery.deliveryFee || 
    !!order.delivery.estimatedTime
  );

  const hasCustomerDetails = !!order.customer && (
    !!order.customer.name || 
    !!order.customer.phone || 
    !!order.customer.email || 
    !!order.customer.address
  );

  const hasDiscountSurcharge = (
    (order.discounts && order.discounts.length > 0) || 
    (order.surcharges && order.surcharges.length > 0)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 bg-white text-gray-800 rounded-lg overflow-hidden border border-gray-200">
        <OrderHeader 
          orderType={order.orderType || 'N/A'}
          orderId={order.id || 'N/A'}
          amount={order.amount}
        />
        
        <ScrollArea className="max-h-[70vh]">
          <div className="px-4 py-5 sm:px-6 space-y-6">
            <OrderSummary 
              status={order.status}
              location={order.location || 'N/A'}
              employee={order.employee || 'N/A'}
            />
            
            <div>
              <div className="bg-[#0f172a] text-white py-2.5 px-4 rounded-t-lg font-medium flex items-center gap-2 border border-gray-200">
                Order Line Items
              </div>
              <OrderItemsTable 
                items={order.items || []}
                amount={order.subtotal}
                note={order.note}
              />
            </div>
            
            <OrderDiscountSurcharge 
              discounts={order.discounts || []}
              surcharges={order.surcharges || []}
              subtotal={order.subtotal}
              tax={order.tax}
              total={order.amount}
            />
            
            <OrderDeliveryDetails 
              delivery={order.delivery || {}}
              showIfEmpty={true}
            />
            
            <OrderCustomerDetails 
              customer={order.customer || {}}
              showIfEmpty={true}
            />
            
            <OrderPaymentDetails 
              paymentMethod={order.paymentMethod || 'N/A'}
              amount={order.amount}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
