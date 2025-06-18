import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getUserRoles } from "@/services/api/userRoles";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useMemo } from "react";

interface StaffFiltersProps {
  status: string;
  onStatusChange: (value: string) => void;
  onClearStatusFilter: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  email?: string;
  onEmailChange?: (value: string) => void;
  phone?: string;
  onPhoneChange?: (value: string) => void;
  userType?: string;
  onUserTypeChange?: (value: string) => void;
  location?: string;
  onLocationChange?: (value: string) => void;
}

export function StaffFilters({
  status,
  onStatusChange,
  onClearStatusFilter,
  search = "",
  onSearchChange,
  email = "",
  onEmailChange,
  phone = "",
  onPhoneChange,
  userType = "",
  onUserTypeChange,
  location = "",
  onLocationChange
}: StaffFiltersProps) {
  // Fetch user roles for the user type filter
  const { data: rolesData } = useQuery({
    queryKey: ["user-roles-filter"],
    queryFn: async () => {
      const response = await getUserRoles({ with_pre_defines: 1 });
      return response;
    },
  });

  // Get restaurants for location filter
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();

  // Filter roles to only show Admin, Attendant, and Delivery Agent
  const userRoles = useMemo(() => {
    const allRoles = rolesData?.user_roles || [];
    const allowedRoles = ['Admin', 'Attendant', 'Delivery Agent'];
    return allRoles.filter(role => allowedRoles.includes(role.role));
  }, [rolesData]);

  return (
    <div className="flex flex-col gap-3 w-full md:flex-row md:flex-wrap md:items-center md:gap-4">
      {/* Name Search */}
      <div className="w-full md:w-[180px]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-8 pr-8 h-9"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          {search && (
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={() => onSearchChange?.("")}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Email Search */}
      <div className="w-full md:w-[180px]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            className="pl-8 pr-8 h-9"
            value={email}
            onChange={(e) => onEmailChange?.(e.target.value)}
          />
          {email && (
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={() => onEmailChange?.("")}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Phone Search */}
      <div className="w-full md:w-[180px]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone..."
            className="pl-8 pr-8 h-9"
            value={phone}
            onChange={(e) => onPhoneChange?.(e.target.value)}
          />
          {phone && (
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={() => onPhoneChange?.("")}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Location Filter */}
      <Select value={location} onValueChange={onLocationChange} disabled={isLoadingRestaurants}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Location" />
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

      {/* User Type Filter */}
      <Select value={userType} onValueChange={onUserTypeChange}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="User Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {userRoles.map((role) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              {role.role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Status Filter */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[120px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="1">Active</SelectItem>
          <SelectItem value="0">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
