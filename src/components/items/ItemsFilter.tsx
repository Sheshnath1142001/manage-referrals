import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileUp, Plus, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { itemsApi } from "@/services/api";

interface Category {
  id: number;
  category: string;
  status: number;
}

interface ItemsFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  categories: Category[];
  isLoading: boolean;
  fetchItems: () => void;
  resetForm: () => void;
  setIsItemDialogOpen: (value: boolean) => void;
}

export const ItemsFilter = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  categories = [],
  isLoading,
  fetchItems,
  resetForm,
  setIsItemDialogOpen,
}: ItemsFilterProps) => {
  
  const handleRefresh = () => {
    fetchItems();
    
    toast({
      title: "Data Refreshed",
      description: "Items data has been refreshed successfully.",
    });
  };

  const handleImportCSV = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const csvFile = target.files?.[0];
      
      if (csvFile) {
        toast({
          title: "CSV Import Started",
          description: `Importing products from ${csvFile.name}`,
        });
        
        try {
          const formData = new FormData();
          formData.append('file', csvFile);
          
          await itemsApi.importItems(csvFile);
          
          toast({
            title: "CSV Import Complete",
            description: `Successfully imported products from ${csvFile.name}`,
          });
          
          // Refresh items after import
          fetchItems();
        } catch (error) {
          console.error("Import error:", error);
          toast({
            title: "Import Failed",
            description: "An error occurred while importing the CSV file.",
            variant: "destructive"
          });
        }
      }
    };
    
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  return (
    <div className="mb-6 flex justify-between flex-wrap gap-3">
      <div className="flex space-x-2 items-end flex-1 min-w-[300px]">
        <div className="w-auto min-w-[200px]">
          <label className="text-xs text-gray-500 mb-1 block">Item Name</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Item"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8 w-full h-9 bg-white border border-gray-300"
            />
            {searchTerm && (
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm("")}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="w-auto min-w-[180px]">
          <label className="text-xs text-gray-500 mb-1 block">Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
              <SelectValue placeholder="Search Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-auto min-w-[130px]">
          <label className="text-xs text-gray-500 mb-1 block">Status</label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <Button 
          onClick={handleRefresh}
          variant="outline" 
          size="icon"
          disabled={isLoading}
          className="h-9 w-9 border border-gray-300"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
        <Button 
          onClick={handleImportCSV} 
          variant="outline" 
          size="icon"
          className="h-9 w-9 border border-gray-300"
          title="Import CSV"
        >
          <FileUp className="h-4 w-4" />
        </Button>
        <Button 
          onClick={() => {
            resetForm();
            setIsItemDialogOpen(true);
          }}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 flex items-center gap-2 h-9 rounded-md"
          title="Add New"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </Button>
      </div>
    </div>
  );
};
