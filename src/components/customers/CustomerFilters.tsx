
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
    <div className="flex items-center gap-2">
      <div className="relative w-[180px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email"
          value={emailFilter}
          onChange={(e) => onEmailFilterChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="relative w-[180px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by phone"
          value={phoneFilter}
          onChange={(e) => onPhoneFilterChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Active</SelectItem>
          <SelectItem value="0">Inactive</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-muted-foreground"
          onClick={onClearFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
