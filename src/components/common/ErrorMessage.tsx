
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string | null;
  onRetry: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="mb-4 p-4 border border-red-300 bg-red-50 rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h3 className="font-medium text-red-800">Error loading categories</h3>
      </div>
      <p className="text-red-700 mb-2">{message || "Failed to fetch modifier categories"}</p>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRetry}
        className="border-red-300 text-red-700 hover:bg-red-50"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );
};
