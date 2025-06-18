import React from "react";
import { Eye, Edit } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface OrderData {
  id: string;
  full_order_id: string;
  daily_order_number: number;
  total_amount: string;
  status: number;
  order_status_name: string;
  order_type_name: string;
  restaurant_name: string;
  created_at: string;
  payment_summary: {
    methods: Array<{
      method: string;
      amount: string;
    }>;
    total_paid: number;
  };
  users_orders_created_byTousers: {
    name: string;
  } | null;
  order_platform_types: {
    type: string;
  } | null;
}

interface OrdersTableProps {
  orders: OrderData[];
  onViewOrder: (orderId: string) => void;
  onEditOrder: (orderId: string, currentStatus: string) => void;
}

export const OrdersTable = ({ orders, onViewOrder, onEditOrder }: OrdersTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "finished":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in progress":
      case "ready to serve":
        return "bg-blue-100 text-blue-800";
      case "placed":
      case "accept":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleViewOrderClick = (order: OrderData) => {
    
    onViewOrder(order.id);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-[#0f172a]">
          <TableRow>
            <TableHead className="text-white font-medium">Order ID</TableHead>
            <TableHead className="text-white font-medium">Daily ID</TableHead>
            <TableHead className="text-white font-medium">Amount</TableHead>
            <TableHead className="text-white font-medium">Status</TableHead>
            <TableHead className="text-white font-medium">Payment</TableHead>
            <TableHead className="text-white font-medium">Employee</TableHead>
            <TableHead className="text-white font-medium">Platform</TableHead>
            <TableHead className="text-white font-medium">Type</TableHead>
            <TableHead className="text-white font-medium">Location</TableHead>
            <TableHead className="text-white font-medium">Created At</TableHead>
            <TableHead className="text-white font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-4">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.full_order_id}</TableCell>
                <TableCell>#{order.daily_order_number}</TableCell>
                <TableCell>${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.order_status_name)}`}>
                    {order.order_status_name}
                  </span>
                </TableCell>
                <TableCell>
                  {order.payment_summary?.methods?.map(method => method.method).join(", ") || "-"}
                </TableCell>
                <TableCell>{order.users_orders_created_byTousers?.name || "-"}</TableCell>
                <TableCell>{order.order_platform_types?.type || "-"}</TableCell>
                <TableCell>{order.order_type_name || "-"}</TableCell>
                <TableCell>{order.restaurant_name || "-"}</TableCell>
                <TableCell>{order.created_at ? format(parseISO(order.created_at), "yyyy-MM-dd HH:mm") : "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-blue-500"
                      onClick={() => handleViewOrderClick(order)}
                      title="View Order"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-green-500"
                      onClick={() => onEditOrder(order.id, order.order_status_name)}
                      title="Edit Order Status"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
