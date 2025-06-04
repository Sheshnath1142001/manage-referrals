import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaffFiltersProps {
  status: string;
  onStatusChange: (value: string) => void;
  onClearStatusFilter: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
}

export function StaffFilters({
  status,
  onStatusChange,
  onClearStatusFilter,
  search = "",
  onSearchChange
}: StaffFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-[300px]">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
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
      
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]">
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
