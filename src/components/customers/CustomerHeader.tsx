
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerHeaderProps {
  onAddCustomer: () => void;
  onRefresh: () => void;
}

export function CustomerHeader({ onAddCustomer, onRefresh }: CustomerHeaderProps) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="refresh" 
        onClick={onRefresh}
        size="sm"
      >
        <RefreshCw className="h-4 w-4 mr-1" /> Refresh
      </Button>
      <Button 
        variant="add"
        size="sm"
        onClick={onAddCustomer}
      >
        <Plus className="h-4 w-4 mr-1" /> Add Customer
      </Button>
    </div>
  );
}
