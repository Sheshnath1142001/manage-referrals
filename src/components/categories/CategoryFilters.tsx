import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Plus, Search, X } from "lucide-react";
import { useCategories } from './CategoriesContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface CategoryFiltersProps {
  onAddNew: () => void;
  onImportCSV: () => void;
  onRefresh: () => void;
}

export const CategoryFilters = ({ onAddNew, onImportCSV, onRefresh }: CategoryFiltersProps) => {
  const { 
    statusFilter, 
    setStatusFilter, 
    setCurrentPage,
    setNameSearchTerm,
    setSeqNoSearchTerm,
    refetch,
  } = useCategories();

  const [categoryName, setCategoryName] = useState("");
  const [seqNo, setSeqNo] = useState("");

  const handleStatusFilterChange = (newStatus: "all" | "active" | "inactive") => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  useEffect(() => {
    setNameSearchTerm(categoryName);
    setCurrentPage(1);
  }, [categoryName, setNameSearchTerm, setCurrentPage]);

  useEffect(() => {
    setSeqNoSearchTerm(seqNo);
    setCurrentPage(1);
  }, [seqNo, setSeqNoSearchTerm, setCurrentPage]);

  // Clear category name and apply filter
  const handleClearCategoryName = () => {
    setCategoryName("");
    setNameSearchTerm("");
    setCurrentPage(1);
    // Force refetch after a short delay to ensure state is updated
    setTimeout(() => refetch(), 50);
  };

  // Clear sequence number and apply filter
  const handleClearSeqNo = () => {
    setSeqNo("");
    setSeqNoSearchTerm("");
    setCurrentPage(1);
    // Force refetch after a short delay to ensure state is updated
    setTimeout(() => refetch(), 50);
  };

  return (
    <div className="mb-6 flex justify-between flex-wrap gap-3">
      <div className="flex space-x-2 items-end flex-1 min-w-[300px]">
        <div className="w-auto min-w-[200px]">
          <label className="text-xs text-gray-500 mb-1 block">Category Name</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-8 pr-8 w-full h-9 bg-white border border-gray-300"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            {categoryName && (
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={handleClearCategoryName}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="w-auto min-w-[120px]">
          <label className="text-xs text-gray-500 mb-1 block">Sequence No</label>
          <div className="relative">
            <Input
              placeholder="Seq No..."
              className="w-full pr-8 h-9 bg-white border border-gray-300"
              value={seqNo}
              onChange={(e) => setSeqNo(e.target.value)}
              type="number"
            />
            {seqNo && (
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={handleClearSeqNo}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="w-auto min-w-[120px]">
          <label className="text-xs text-gray-500 mb-1 block">Status</label>
          <Select 
            value={statusFilter} 
            onValueChange={(value) => handleStatusFilterChange(value as "all" | "active" | "inactive")}
          >
            <SelectTrigger className="w-[130px] h-9 bg-white border border-gray-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 border border-gray-300" 
          onClick={onRefresh}
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 border border-gray-300" 
          onClick={onImportCSV}
          title="Import CSV"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button 
          onClick={onAddNew}
          className="bg-[#6E41E2] hover:bg-[#5835B0] text-white px-4 py-2 flex items-center gap-2 h-9 rounded-md"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>
    </div>
  );
};
