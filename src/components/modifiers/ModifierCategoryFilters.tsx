import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModifierCategories } from "./ModifierCategoriesContext";
import { modifierCategoriesApi } from "@/services/api/modifiers";
import { toast } from "@/components/ui/use-toast";
import Papa from 'papaparse';
import { useDebounce } from "@/hooks/useDebounce";
import { SearchInput } from "@/components/common/SearchInput";
import { NumberInput } from "@/components/common/NumberInput";
import { ModifierFilterActions } from "./filter-actions/ModifierFilterActions";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useNavigate } from "react-router-dom";

const ModifierCategoryFilters = () => {
  const navigate = useNavigate();
  const { 
    nameFilter, 
    setNameFilter, 
    seqNoFilter, 
    setSeqNoFilter, 
    statusFilter, 
    setStatusFilter,
    setDialogMode,
    setEditingCategory,
    setIsDialogOpen,
    fetchModifierCategories,
    isError,
    error,
    retryFetch
  } = useModifierCategories();

  const [nameTerm, setNameTerm] = useState(nameFilter);
  const [seqNoTerm, setSeqNoTerm] = useState(seqNoFilter);
  
  const debouncedNameTerm = useDebounce(nameTerm, 500);
  const debouncedSeqNoTerm = useDebounce(seqNoTerm, 500);

  useEffect(() => {
    setNameFilter(debouncedNameTerm);
  }, [debouncedNameTerm, setNameFilter]);

  useEffect(() => {
    setSeqNoFilter(debouncedSeqNoTerm);
  }, [debouncedSeqNoTerm, setSeqNoFilter]);

  const handleAddNew = () => {
    // Check if we have a valid auth token
    const adminData = localStorage.getItem('Admin');
    const token = adminData ? JSON.parse(adminData).token : localStorage.getItem('token');
    
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to add a new category.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    setEditingCategory(undefined);
    setDialogMode("ADD");
    setIsDialogOpen(true);
  };

  const handleImportCSV = () => {
    // Check if we have a valid auth token
    const adminData = localStorage.getItem('Admin');
    const token = adminData ? JSON.parse(adminData).token : localStorage.getItem('token');
    
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to import categories.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        toast({
          title: "CSV Import Started",
          description: `Processing ${file.name}`,
        });
        
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            try {
              const categoryData = {
                modifier_categories: results.data.map((row: any) => ({
                  modifier_category: row.modifier_category || row.name,
                  is_mandatory: row.is_mandatory === 'true' || row.is_mandatory === '1' ? 1 : 0,
                  is_single_select: row.is_single_select === 'true' || row.is_single_select === '1' ? 1 : 0,
                  seq_no: parseInt(row.seq_no || '0'),
                  min: row.min ? parseInt(row.min) : null,
                  max: row.max ? parseInt(row.max) : null,
                  status: row.status === 'Active' || row.status === '1' ? 1 : 0
                }))
              };
              
              await modifierCategoriesApi.importModifierCategories(categoryData);
              
              toast({
                title: "CSV Import Complete",
                description: `Successfully imported categories from ${file.name}`,
              });
              
              fetchModifierCategories();
            } catch (error) {
              console.error("Import error:", error);
              const errorMessage = (error as any)?.response?.data?.message || 
                                 (error as Error)?.message || 
                                 "An error occurred while importing the CSV file.";
              
              if ((error as any)?.response?.status === 401) {
                toast({
                  title: "Authentication Error",
                  description: "Your session has expired. Please log in again.",
                  variant: "destructive"
                });
                navigate('/login');
                return;
              }
              
              toast({
                title: "Import Failed",
                description: errorMessage,
                variant: "destructive"
              });
            }
          },
          error: (error) => {
            toast({
              title: "CSV Parse Failed",
              description: error.message,
              variant: "destructive"
            });
          }
        });
      }
    };
    
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  return (
    <>
      {isError && <ErrorMessage message={error} onRetry={retryFetch} />}

      <div className="mb-6 flex justify-between flex-wrap gap-3">
        <div className="flex space-x-2 items-end flex-1 min-w-[300px]">
          <SearchInput
            value={nameTerm}
            onChange={setNameTerm}
            placeholder="Search by name..."
            label="Category Name"
          />
          
          <NumberInput
            value={seqNoTerm}
            onChange={setSeqNoTerm}
            placeholder="Seq No..."
            label="Sequence No"
          />
          
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
        
        <ModifierFilterActions
          onRefresh={fetchModifierCategories}
          onImportCSV={handleImportCSV}
          onAddNew={handleAddNew}
        />
      </div>
    </>
  );
};

export default ModifierCategoryFilters;
