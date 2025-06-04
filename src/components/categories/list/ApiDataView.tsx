import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ApiDataViewProps {
  apiResponse: any;
  onHide: () => void;
}

export const ApiDataView = ({ apiResponse, onHide }: ApiDataViewProps) => {
  // Helper function to safely extract categories from API response
  const extractCategoriesFromResponse = () => {
    console.log("API Response in ApiDataView:", apiResponse);
    
    if (!apiResponse) return [];
    
    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }
    
    if (apiResponse.data && apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
      return apiResponse.data.data;
    }
    
    if (apiResponse.data && apiResponse.data.categories && Array.isArray(apiResponse.data.categories)) {
      return apiResponse.data.categories;
    }
    
    if (apiResponse.data && typeof apiResponse.data === 'object' && !Array.isArray(apiResponse.data)) {
      // Handle case where data is an object with category properties
      const categoryObjects = Object.values(apiResponse.data).filter(item => 
        item && typeof item === 'object' && ('category' in item || 'name' in item)
      );
      if (categoryObjects.length > 0) {
        return categoryObjects;
      }
    }
    
    return [];
  };

  const apiCategories = extractCategoriesFromResponse();

  return (
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">API Response Data</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onHide}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bg-white p-3 rounded border border-gray-200 overflow-auto max-h-60">
        <pre className="text-xs">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      </div>
      
      <div className="mt-3">
        <h4 className="text-xs font-medium mb-1">Extracted Categories ({apiCategories.length})</h4>
        <div className="bg-white p-3 rounded border border-gray-200 overflow-auto max-h-40">
          <pre className="text-xs">
            {JSON.stringify(apiCategories, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
