
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GuestCustomerFiltersProps {
  emailFilter: string;
  phoneFilter: string;
  onEmailFilterChange: (value: string) => void;
  onPhoneFilterChange: (value: string) => void;
}

export function GuestCustomerFilters({
  emailFilter,
  phoneFilter,
  onEmailFilterChange,
  onPhoneFilterChange,
}: GuestCustomerFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      <div className="relative w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Email"
          value={emailFilter}
          onChange={(e) => onEmailFilterChange(e.target.value)}
          className="pl-8 w-full"
        />
      </div>
      <div className="relative w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Phone No."
          value={phoneFilter}
          onChange={(e) => onPhoneFilterChange(e.target.value)}
          className="pl-8 w-full"
        />
      </div>
    </div>
  );
}
