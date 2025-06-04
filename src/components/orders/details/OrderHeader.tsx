import React from "react";
import { DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, X } from "lucide-react";

interface OrderHeaderProps {
  orderType: string;
  orderId: string;
  amount: number | undefined;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ orderType, orderId, amount }) => {
  // Use default values for null/undefined
  const displayOrderType = orderType || 'N/A';
  const displayOrderId = orderId || 'N/A';
  const displayAmount = typeof amount === 'number' ? amount.toFixed(2) : '0.00';

  return (
    <DialogHeader className="bg-[#0f172a] px-6 py-4 text-white sticky top-0 z-10 border-b border-gray-700">
      <div className="flex items-center justify-between">
        <DialogTitle className="text-xl font-bold flex items-center gap-3">
          # {displayOrderId} ({displayOrderType}) - ${displayAmount}
        </DialogTitle>
        <DialogClose asChild>
          <Button variant="ghost" className="text-gray-300 hover:bg-[#1e293b] hover:text-white h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </DialogClose>
      </div>
    </DialogHeader>
  );
};
