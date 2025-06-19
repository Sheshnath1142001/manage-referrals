
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
    <div className="space-y-4">
      {/* Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <div className="w-full">
          <Select 
            value={statusFilter} 
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full">
          <Select 
            value={restaurantFilter} 
            onValueChange={onRestaurantFilterChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Restaurant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Restaurants</SelectItem>
              {Array.isArray(restaurants) && restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
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
    </div>
  );
}
