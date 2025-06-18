import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileUp, Plus, Search, X, Scan, Loader2 } from "lucide-react";
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
  barcodeSearch: string;
  setBarcodeSearch: (value: string) => void;
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
  barcodeSearch,
  setBarcodeSearch,
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
  
  // Local states to track if user is actively typing
  const [isSearching, setIsSearching] = useState(false);
  const [isBarcodeSearching, setIsBarcodeSearching] = useState(false);

  // Track when user starts/stops typing for search term
  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm]);

  // Track when user starts/stops typing for barcode search
  useEffect(() => {
    if (barcodeSearch) {
      setIsBarcodeSearching(true);
      const timer = setTimeout(() => {
        setIsBarcodeSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsBarcodeSearching(false);
    }
  }, [barcodeSearch]);
  
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
    <div className="mb-6">
      {/* Mobile and Desktop Layout */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
        {/* Search Filters - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          {/* Item Name Search */}
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block">Item Name</label>
            <div className="relative">
              {isSearching ? (
                <Loader2 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
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

          {/* Barcode Search */}
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block">Barcode</label>
            <div className="relative">
              {isBarcodeSearching ? (
                <Loader2 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <Scan className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder="Search Barcode"
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                className="pl-8 pr-8 w-full h-9 bg-white border border-gray-300"
              />
              {barcodeSearch && (
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setBarcodeSearch("")}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="w-full">
            <label className="text-xs text-gray-500 mb-1 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
                <SelectValue placeholder="Search Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Array.isArray(categories) ? categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.category}
                  </SelectItem>
                )): null}
              </SelectContent>
            </Select>
          </div>
          
          {/* Status Filter */}
          <div className="w-full">
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
        
        {/* Action Buttons */}
        <div className="flex items-end gap-2 justify-end lg:justify-start">
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            size="icon"
            disabled={isLoading}
            className="h-9 w-9 border border-gray-300 shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={handleImportCSV} 
            variant="outline" 
            size="icon"
            className="h-9 w-9 border border-gray-300 shrink-0"
            title="Import CSV"
          >
            <FileUp className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => {
              resetForm();
              setIsItemDialogOpen(true);
            }}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 flex items-center gap-2 h-9 rounded-md shrink-0"
            title="Add New"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

