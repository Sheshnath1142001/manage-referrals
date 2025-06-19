
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface CustomerFiltersProps {
  emailFilter: string;
  phoneFilter: string;
  statusFilter: string;
  onEmailFilterChange: (value: string) => void;
  onPhoneFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function CustomerFilters({
  emailFilter,
  phoneFilter,
  statusFilter,
  onEmailFilterChange,
  onPhoneFilterChange,
  onStatusFilterChange,
  onClearFilters,
}: CustomerFiltersProps) {
  const hasActiveFilters = emailFilter || phoneFilter || statusFilter !== "1";

  return (
    <div className="space-y-4">
      {/* Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email"
            value={emailFilter}
            onChange={(e) => onEmailFilterChange(e.target.value)}
            className="pl-8 w-full"
          />
        </div>

        <div className="relative w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone"
            value={phoneFilter}
            onChange={(e) => onPhoneFilterChange(e.target.value)}
            className="pl-8 w-full"
          />
        </div>

        <div className="w-full">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-muted-foreground"
            onClick={onClearFilters}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
