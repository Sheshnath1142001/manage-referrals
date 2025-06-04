
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";

interface StaffHeaderProps {
  onRefresh: () => void;
  onAdd: () => void;
}

export const StaffHeader = ({ onRefresh, onAdd }: StaffHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Staff Management</h1>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
          className="h-9 w-9 border border-gray-300"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button 
          size="sm"
          onClick={onAdd}
          className="bg-[#6E41E2] hover:bg-[#5835B0] text-white flex items-center gap-1"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Staff
        </Button>
      </div>
    </div>
  );
};
