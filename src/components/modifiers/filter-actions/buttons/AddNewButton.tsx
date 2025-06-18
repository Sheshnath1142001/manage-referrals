import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddNewButtonProps {
  onAddNew: () => void;
}

export const AddNewButton = ({ onAddNew }: AddNewButtonProps) => {
  return (
    <Button 
      size="sm" 
      className="bg-[#1E293B] hover:bg-[#0f172a] text-white flex items-center gap-1 cursor-pointer transition-colors duration-200 ease-in-out"
      onClick={onAddNew}
      type="button"
    >
      <Plus className="h-4 w-4 mr-1" />
      Add New
    </Button>
  );
};
