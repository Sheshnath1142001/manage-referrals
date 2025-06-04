
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ImportButtonProps {
  onImportCSV: () => void;
}

export const ImportButton = ({ onImportCSV }: ImportButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="h-9 w-9 border border-gray-300" 
      onClick={onImportCSV}
      title="Import CSV"
    >
      <Upload className="h-4 w-4" />
    </Button>
  );
};
