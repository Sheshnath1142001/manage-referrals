import React from "react";
import { CreditCard } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface OrderPaymentDetailsProps {
  paymentMethod: string;
  amount: number | undefined;
}

export const OrderPaymentDetails: React.FC<OrderPaymentDetailsProps> = ({
  paymentMethod,
  amount,
}) => {
  // Safe handling of data
  const displayMethod = paymentMethod || 'N/A';
  const safeAmount = typeof amount === 'number' ? amount : 0;
  
  return (
    <div>
      <div className="bg-[#0f172a] text-white py-2.5 px-4 rounded-t-lg font-medium flex items-center gap-2 border border-gray-700">
        Payment Details
      </div>
      <div className="bg-[#111827] border border-t-0 border-gray-700 rounded-b-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#0f172a]">
              <TableRow>
                <TableHead className="text-gray-300">Sr No.</TableHead>
                <TableHead className="text-gray-300">Payment Method</TableHead>
                <TableHead className="text-gray-300 text-right">Amount Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-gray-400">1</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{displayMethod}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-gray-300">${safeAmount.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
