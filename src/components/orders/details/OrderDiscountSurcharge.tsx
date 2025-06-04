import React from "react";
import { Percent, Clock } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

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

interface OrderDiscountSurchargeProps {
  discounts?: OrderDiscount[];
  surcharges?: OrderSurcharge[];
  subtotal?: number;
  tax?: number;
  total?: number;
}

export const OrderDiscountSurcharge: React.FC<OrderDiscountSurchargeProps> = ({
  discounts = [],
  surcharges = [],
  subtotal = 0,
  tax = 0,
  total = 0
}) => {
  const totalDiscounts = discounts.reduce((sum, disc) => sum + disc.amount, 0);
  const totalSurcharges = surcharges.reduce((sum, surcharge) => sum + surcharge.amount, 0);
  
  return (
    <div>
      <div className="bg-[#0f172a] text-white py-2.5 px-4 rounded-t-lg font-medium flex items-center gap-2 border border-gray-700">
        <Percent className="h-4 w-4" />
        Discount & Surcharge
      </div>
      <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-500 mb-2 block">Discount</span>
            <p className="text-gray-800 font-medium">${totalDiscounts.toFixed(2)}</p>
          </div>
          
          <div>
            <span className="text-sm text-gray-500 mb-2 block">Surcharge</span>
            <p className="text-gray-800 font-medium">${totalSurcharges.toFixed(2)}</p>
          </div>
          
          <div>
            <span className="text-sm text-gray-500 mb-2 block">Waiting Time (Mins)</span>
            <p className="text-gray-800 font-medium">-</p>
          </div>
          
          <div>
            <span className="text-sm text-gray-500 mb-2 block">Delivery Time (Mins)</span>
            <p className="text-gray-800 font-medium">-</p>
          </div>
        </div>
        
        {/* Order Summary Table */}
        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Subtotal</TableCell>
                <TableCell className="text-right">${subtotal.toFixed(2)}</TableCell>
              </TableRow>
              
              {totalDiscounts > 0 && (
                <TableRow>
                  <TableCell className="font-medium text-red-600">Discount</TableCell>
                  <TableCell className="text-right text-red-600">-${totalDiscounts.toFixed(2)}</TableCell>
                </TableRow>
              )}
              
              {totalSurcharges > 0 && (
                <TableRow>
                  <TableCell className="font-medium">Surcharge</TableCell>
                  <TableCell className="text-right">${totalSurcharges.toFixed(2)}</TableCell>
                </TableRow>
              )}
              
              <TableRow>
                <TableCell className="font-medium">Tax</TableCell>
                <TableCell className="text-right">${tax.toFixed(2)}</TableCell>
              </TableRow>
              
              <TableRow className="bg-gray-50">
                <TableCell className="font-medium text-lg">Total</TableCell>
                <TableCell className="text-right font-bold text-lg">${total.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {discounts.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Discount Details</p>
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              {discounts.map((discount, idx) => (
                <div key={discount.id || idx} className="mb-2 last:mb-0">
                  <span className="font-medium">{discount.name}</span>: ${discount.amount.toFixed(2)} ({discount.type})
                </div>
              ))}
            </div>
          </div>
        )}
        
        {surcharges.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Surcharge Details</p>
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              {surcharges.map((surcharge, idx) => (
                <div key={surcharge.id || idx} className="mb-2 last:mb-0">
                  <span className="font-medium">{surcharge.name}</span>: ${surcharge.amount.toFixed(2)} ({surcharge.type})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 