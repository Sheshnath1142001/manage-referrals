
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { restaurantsApi } from "@/services/api/restaurants";

interface CustomerGroupFiltersProps {
  statusFilter: string;
  restaurantFilter: string;
  onStatusFilterChange: (value: string) => void;
  onRestaurantFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function CustomerGroupFilters({
  statusFilter,
  restaurantFilter,
  onStatusFilterChange,
  onRestaurantFilterChange,
  onClearFilters,
}: CustomerGroupFiltersProps) {
  // Fetch restaurants for the filter
  const { data: restaurantsResponse } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => restaurantsApi.getRestaurants(),
  });

  const restaurants = Array.isArray(restaurantsResponse) 
    ? restaurantsResponse 
    : restaurantsResponse?.data || [];

  return (
    <div className="flex items-center gap-4">
      <div>
        <Select 
          value={statusFilter} 
          onValueChange={onStatusFilterChange}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Active</SelectItem>
            <SelectItem value="0">Inactive</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select 
          value={restaurantFilter} 
          onValueChange={onRestaurantFilterChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Restaurant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants</SelectItem>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {(statusFilter !== "1" || restaurantFilter !== "all") && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
