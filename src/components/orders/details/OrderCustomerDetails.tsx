import React from "react";
import { Phone, Mail, User, MapPin } from "lucide-react";

interface CustomerDetail {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface OrderCustomerDetailsProps {
  customer?: CustomerDetail;
  showIfEmpty?: boolean;
}

export const OrderCustomerDetails: React.FC<OrderCustomerDetailsProps> = ({ 
  customer = {}, 
  showIfEmpty = false 
}) => {
  const { name, email, phone, address } = customer;
  
  const hasContent = name || email || phone || address;
  if (!hasContent && !showIfEmpty) return null;
  
  return (
    <div>
      <div className="bg-[#0f172a] text-white py-2.5 px-4 rounded-t-lg font-medium flex items-center gap-2 border border-gray-200">
        <User className="h-4 w-4" />
        Customer Details
      </div>
      <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Name: {name || '-'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Phone: {phone || '-'}</span>
          </div>
          
          <div className="flex items-center gap-2 col-span-full">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">Email: {email || '-'}</span>
          </div>
          
          <div className="flex items-start gap-2 col-span-full">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
            <span className="text-gray-700">Address: {address || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 