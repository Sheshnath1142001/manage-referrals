
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface CustomerGroupHeaderProps {
  onAddNew: () => void;
  onRefresh?: () => void;
}

export const CustomerGroupHeader = ({ onAddNew, onRefresh }: CustomerGroupHeaderProps) => {
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
        onClick={onAddNew}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Customer Group
      </Button>
    </div>
  );
};
