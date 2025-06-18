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
      return 'bg-gray-100 text-gray-800';
    }
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'finished':
      case 'delivered':
        return 'bg-green-50 text-green-700';
      case 'preparing':
      case 'in progress':
      case 'ready to serve':
        return 'bg-blue-50 text-blue-700';
      case 'pending':
      case 'placed':
      case 'accept':
        return 'bg-yellow-50 text-yellow-700';
      case 'cancelled':
      case 'declined':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <span className="text-sm text-gray-500 mb-1.5 block">Order Status</span>
        <Badge 
          variant="secondary" 
          className={`${getStatusColor(status)} mt-0.5 w-fit border border-transparent`}
        >
          {displayStatus}
        </Badge>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <span className="text-sm text-gray-500 mb-1.5 block">Location</span>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-800">{displayLocation}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <span className="text-sm text-gray-500 mb-1.5 block">Attendant</span>
        <div className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-800">{displayEmployee}</span>
        </div>
      </div>
    </div>
  );
};
