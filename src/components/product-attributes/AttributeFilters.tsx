import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AttributeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onFilterChange: (value: string) => void;
}

export function AttributeFilters({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onFilterChange
}: AttributeFiltersProps) {
  // Handle input change and auto-filter
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="grid gap-3 mb-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <div className="w-auto min-w-[200px]">
        <label className="text-xs text-gray-500 mb-1 block">Attribute Name</label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by attribute name"
            value={searchTerm}
            onChange={handleSearchInputChange}
            className="pl-8 pr-8 h-9 bg-white border border-gray-300 w-full"
          />
          {searchTerm && (
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={onClearSearch}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="w-full sm:w-auto">
        <label className="text-xs text-gray-500 mb-1 block">Status</label>
        <Select onValueChange={onFilterChange} defaultValue="All">
          <SelectTrigger className="h-9 bg-white border border-gray-300 w-full sm:w-[130px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
