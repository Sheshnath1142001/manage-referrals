
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface RefreshButtonProps {
  onRefresh: () => void;
}

export const RefreshButton = ({ onRefresh }: RefreshButtonProps) => {
  const handleRefresh = () => {
    onRefresh();
    toast({
      title: "Refreshing data",
      description: "Fetching the latest modifier categories data."
    });
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="h-9 w-9 border border-gray-300" 
      onClick={handleRefresh}
      title="Refresh"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
};
