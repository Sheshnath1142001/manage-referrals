import React from "react";
import { Truck, Clock, MapPin, MessageSquare, DollarSign, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeliveryDetail {
  address?: string;
  instructions?: string;
  deliveryFee?: number;
  estimatedTime?: string;
  status?: string;
  waitingTime?: string;
  deliveryTime?: string;
}

interface OrderDeliveryDetailsProps {
  delivery?: DeliveryDetail;
  showIfEmpty?: boolean;
}

export const OrderDeliveryDetails: React.FC<OrderDeliveryDetailsProps> = ({ 
  delivery = {}, 
  showIfEmpty = false 
}) => {
  const { address, instructions, deliveryFee, estimatedTime, status, waitingTime, deliveryTime } = delivery;
  
  const hasContent = address || instructions || deliveryFee || estimatedTime || status || waitingTime || deliveryTime;
  if (!hasContent && !showIfEmpty) return null;
  
  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case 'delivered':
        return "bg-green-100 text-green-800";
      case 'in transit':
        return "bg-blue-100 text-blue-300";
      case 'preparing':
        return "bg-yellow-100 text-yellow-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div>
      <div className="bg-[#0f172a] text-white py-2.5 px-4 rounded-t-lg font-medium flex items-center gap-2 border border-gray-200">
        <Truck className="h-4 w-4" />
        Delivery Details
        {status && (
          <Badge className={`ml-2 ${getStatusColor(status)}`}>
            {status}
          </Badge>
        )}
      </div>
      <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Waiting Time: {waitingTime || '-'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Delivery Time: {deliveryTime || '-'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Estimated Time: {estimatedTime || '-'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Delivery Fee: ${typeof deliveryFee === 'number' ? deliveryFee.toFixed(2) : '0.00'}</span>
          </div>
          
          <div className="flex items-start gap-2 col-span-full">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
            {address ? (
              <span className="text-gray-700 whitespace-pre-line">
                Address:
                {" "}
                {address.split(',').map((part, idx) => (
                  <span key={idx} className="block first:inline">
                    {part.trim()}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-gray-700">Address: -</span>
            )}
          </div>
          
          <div className="flex items-start gap-2 col-span-full">
            <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
            <span className="text-gray-700">Instructions: {instructions || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 