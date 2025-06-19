
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuestCustomerHeaderProps {
  onAddGuestCustomer: () => void;
  onRefresh: () => void;
}

export function GuestCustomerHeader({ onAddGuestCustomer, onRefresh }: GuestCustomerHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={onRefresh}
          size="sm"
          className="w-10 h-10 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button 
          variant="default"
          size="sm"
          onClick={onAddGuestCustomer}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Guest</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  );
}
