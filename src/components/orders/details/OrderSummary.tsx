import React from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, User } from "lucide-react";

interface OrderSummaryProps {
  status: string | undefined;
  location: string;
  employee: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ status, location, employee }) => {
  // Safe handling of data
  const displayStatus = status || 'N/A';
  const displayLocation = location || 'N/A';
  const displayEmployee = employee || 'N/A';
  
  const getStatusColor = (status: string | undefined) => {
    if (!status || typeof status !== 'string') {
      return 'bg-gray-700 text-gray-300';
    }
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'finished':
      case 'delivered':
        return 'bg-green-900 text-green-300';
      case 'preparing':
      case 'in progress':
      case 'ready to serve':
        return 'bg-blue-900 text-blue-300';
      case 'pending':
      case 'placed':
      case 'accept':
        return 'bg-yellow-900 text-yellow-300';
      case 'cancelled':
      case 'declined':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-[#111827] rounded-lg border border-gray-700 p-4">
        <span className="text-sm text-gray-400 mb-1.5 block">Order Status</span>
        <Badge 
          variant="secondary" 
          className={`${getStatusColor(status)} mt-0.5 w-fit border-0`}
        >
          {displayStatus}
        </Badge>
      </div>
      
      <div className="bg-[#111827] rounded-lg border border-gray-700 p-4">
        <span className="text-sm text-gray-400 mb-1.5 block">Location</span>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-300">{displayLocation}</span>
        </div>
      </div>
      
      <div className="bg-[#111827] rounded-lg border border-gray-700 p-4">
        <span className="text-sm text-gray-400 mb-1.5 block">Attendant</span>
        <div className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-300">{displayEmployee}</span>
        </div>
      </div>
    </div>
  );
};
