
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
    <div className="flex items-center gap-2">
      <div className="relative w-[180px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Email"
          value={emailFilter}
          onChange={(e) => onEmailFilterChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="relative w-[180px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Phone No."
          value={phoneFilter}
          onChange={(e) => onPhoneFilterChange(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
