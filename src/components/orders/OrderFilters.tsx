
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar as CalendarIcon, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  startDate: Date | undefined;
  endDate: Date | undefined;
  searchTerm: string;
  restaurants: FilterOption[];
  orderStatuses: FilterOption[];
  platforms: FilterOption[];
  paymentMethods: FilterOption[];
  orderTypes: FilterOption[];
  staffMembers: StaffMember[];
  onFilterChange: (filterName: string, value: string) => void;
  onDateChange: (filterName: string, date: Date | undefined) => void;
  onRefresh: () => void;
}

export const OrderFilters = ({
  selectedPlatform,
  selectedPaymentMethod,
  selectedOrderType,
  selectedAttendant,
  selectedLocation,
  selectedStatus,
  startDate,
  endDate,
  searchTerm,
  restaurants,
  orderStatuses,
  platforms,
  paymentMethods,
  orderTypes,
  staffMembers,
  onFilterChange,
  onDateChange,
  onRefresh,
}: OrderFiltersProps) => {
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = React.useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = React.useState(false);
  
  return (
    <div className="space-y-4">
      {/* First Row - Search and Date Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name or order ID..."
            value={searchTerm}
            onChange={(e) => onFilterChange("searchTerm", e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* From Date Picker */}
        <div className="w-full">
          <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "yyyy-MM-dd") : <span>From Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  onDateChange("startDate", date);
                  setIsStartDatePickerOpen(false);
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* To Date Picker */}
        <div className="w-full">
          <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "yyyy-MM-dd") : <span>To Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  onDateChange("endDate", date);
                  setIsEndDatePickerOpen(false);
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Second Row - Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <div className="w-full">
          <Select value={selectedLocation} onValueChange={(value) => onFilterChange("location", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {restaurants && restaurants.length > 0 ? restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                  {restaurant.name}
                </SelectItem>
              )) : (
                <SelectItem value="no-data" disabled>No locations available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Select value={selectedStatus} onValueChange={(value) => onFilterChange("status", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {orderStatuses && orderStatuses.length > 0 ? orderStatuses.map((status) => (
                <SelectItem key={status.id} value={status.id.toString()}>
                  {status.status_name}
                </SelectItem>
              )) : (
                <SelectItem value="no-data" disabled>No statuses available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Select value={selectedPlatform} onValueChange={(value) => onFilterChange("platform", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms && platforms.length > 0 ? platforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id.toString()}>
                  {platform.type}
                </SelectItem>
              )) : (
                <SelectItem value="no-data" disabled>No platforms available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Select value={selectedPaymentMethod} onValueChange={(value) => onFilterChange("paymentMethod", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Payment Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Methods</SelectItem>
              {paymentMethods && paymentMethods.length > 0 ? paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id.toString()}>
                  {method.method}
                </SelectItem>
              )) : (
                <SelectItem value="no-data" disabled>No payment methods available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Third Row - Additional Filters and Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <div className="w-full">
          <Select value={selectedOrderType} onValueChange={(value) => onFilterChange("orderType", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {orderTypes && orderTypes.length > 0 ? orderTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.type}
                </SelectItem>
              )) : (
                <SelectItem value="no-data" disabled>No order types available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Select value={selectedAttendant} onValueChange={(value) => onFilterChange("attendant", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Attendants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Attendants</SelectItem>
              {staffMembers && staffMembers.length > 0 ? staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              )) : (
                <SelectItem value="no-data" disabled>No attendants available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Empty columns for spacing */}
        <div className="hidden lg:block"></div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onRefresh} 
            className="w-10 h-10 p-0"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
