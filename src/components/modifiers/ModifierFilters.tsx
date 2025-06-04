
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, RefreshCw, Upload, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ModifierFiltersProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  seqNoFilter: string;
  setSeqNoFilter: (value: string) => void;
  statusFilter: "Active" | "Inactive" | "all";
  setStatusFilter: (value: "Active" | "Inactive" | "all") => void;
  modifierCategories: string[];
  handleRefresh: () => void;
  handleImportCSV: () => void;
  handleAddNew: () => void;
}

const ModifierFilters = ({
  nameFilter,
  setNameFilter,
  categoryFilter,
  setCategoryFilter,
  seqNoFilter,
  setSeqNoFilter,
  statusFilter,
  setStatusFilter,
  modifierCategories,
  handleRefresh,
  handleImportCSV,
  handleAddNew,
}: ModifierFiltersProps) => {
  return (
    <div className="mb-6 flex justify-between flex-wrap gap-3">
      <div className="flex space-x-2 items-end flex-1 min-w-[300px]">
        <div className="w-auto min-w-[200px]">
          <label className="text-xs text-gray-500 mb-1 block">Modifier Name</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-8 pr-8 w-full h-9 bg-white border border-gray-300"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
            {nameFilter && (
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={() => setNameFilter("")}
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
              value={seqNoFilter}
              onChange={(e) => setSeqNoFilter(e.target.value)}
              type="number"
            />
            {seqNoFilter && (
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={() => setSeqNoFilter("")}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="w-auto min-w-[150px]">
          <label className="text-xs text-gray-500 mb-1 block">Category</label>
          <Select 
            value={categoryFilter} 
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger className="w-[180px] h-9 bg-white border border-gray-300">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All Categories</SelectItem>
              {modifierCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-auto min-w-[120px]">
          <label className="text-xs text-gray-500 mb-1 block">Status</label>
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as "Active" | "Inactive" | "all")}
          >
            <SelectTrigger className="w-[130px] h-9 bg-white border border-gray-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 border border-gray-300" 
          onClick={handleRefresh}
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 border border-gray-300" 
          onClick={handleImportCSV}
          title="Import CSV"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 border border-gray-300" 
          onClick={handleAddNew}
          title="Add New"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ModifierFilters;
