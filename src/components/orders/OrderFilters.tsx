import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  id: number;
  name?: string;
  type?: string;
  method?: string;
  status_name?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role_id: number;
  roles: {
    id: number;
    role: string;
  };
  employee_outlet_id: number;
  restaurants_users_employee_outlet_idTorestaurants: {
    id: number;
    name: string;
  };
  restaurant_id: number;
  restaurants_users_restaurant_idTorestaurants: {
    id: number;
    name: string;
  };
  username: string;
  email: string;
  phone_no: string;
  status: number;
}

interface OrderFiltersProps {
  selectedPlatform: string;
  selectedPaymentMethod: string;
  selectedOrderType: string;
  selectedAttendant: string;
  selectedLocation: string;
  selectedStatus: string;
  restaurants: FilterOption[];
  orderStatuses: FilterOption[];
  platforms: FilterOption[];
  paymentMethods: FilterOption[];
  orderTypes: FilterOption[];
  staffMembers: StaffMember[];
  onFilterChange: (filterName: string, value: string) => void;
  onRefresh: () => void;
}

export const OrderFilters = ({
  selectedPlatform,
  selectedPaymentMethod,
  selectedOrderType,
  selectedAttendant,
  selectedLocation,
  selectedStatus,
  restaurants,
  orderStatuses,
  platforms,
  paymentMethods,
  orderTypes,
  staffMembers,
  onFilterChange,
  onRefresh,
}: OrderFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 items-center">
      <Select value={selectedLocation} onValueChange={(value) => onFilterChange("location", value)}>
        <SelectTrigger>
          <SelectValue placeholder="All Locations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {restaurants.map((restaurant) => (
            <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
              {restaurant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={(value) => onFilterChange("status", value)}>
        <SelectTrigger>
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {orderStatuses.map((status) => (
            <SelectItem key={status.id} value={status.id.toString()}>
              {status.status_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedPlatform} onValueChange={(value) => onFilterChange("platform", value)}>
        <SelectTrigger>
          <SelectValue placeholder="All Platforms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Platforms</SelectItem>
          {platforms.map((platform) => (
            <SelectItem key={platform.id} value={platform.id.toString()}>
              {platform.type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedPaymentMethod} onValueChange={(value) => onFilterChange("paymentMethod", value)}>
        <SelectTrigger>
          <SelectValue placeholder="All Payment Methods" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment Methods</SelectItem>
          {paymentMethods.map((method) => (
            <SelectItem key={method.id} value={method.id.toString()}>
              {method.method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedOrderType} onValueChange={(value) => onFilterChange("orderType", value)}>
        <SelectTrigger>
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {orderTypes.map((type) => (
            <SelectItem key={type.id} value={type.id.toString()}>
              {type.type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-2">
        <Select value={selectedAttendant} onValueChange={(value) => onFilterChange("attendant", value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Attendants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Attendants</SelectItem>
            {staffMembers.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh} 
          className="h-9 w-9"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
