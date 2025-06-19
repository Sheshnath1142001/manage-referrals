
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, RefreshCw, Plus } from "lucide-react";

interface AttributeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  onRefresh?: () => void;
  onAddNew?: () => void;
}

export function AttributeFilters({
  searchTerm,
  onSearchChange,
  onFilterChange,
  onSearch,
  onClearSearch,
  onRefresh,
  onAddNew,
}: AttributeFiltersProps) {
  const [filterValue, setFilterValue] = useState("All");

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    onFilterChange(value);
  };

  return (
    <div className="space-y-4">
      {/* Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attributes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 w-full"
          />
          {searchTerm && (
            <button 
              className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={onClearSearch}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="w-full">
          <Select value={filterValue} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
        <div className="flex gap-2 justify-end">
          {onRefresh && (
            <Button 
              variant="outline" 
              onClick={onRefresh}
              size="sm"
              className="w-10 h-10 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          {onAddNew && (
            <Button 
              variant="default"
              size="sm"
              onClick={onAddNew}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Attribute</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
