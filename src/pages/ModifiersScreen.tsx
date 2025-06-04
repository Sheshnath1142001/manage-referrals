import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { modifiersApi } from "@/services/api/modifiers";
import { Modifier } from "@/types/modifiers";
import AddEditModifierDialog from "@/components/AddEditModifierDialog";
import ModifierFilters from "@/components/modifiers/ModifierFilters";
import ModifierTable from "@/components/modifiers/ModifierTable";

const ModifiersScreen = () => {
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [seqNoFilter, setSeqNoFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Active" | "Inactive" | "all">("Active");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState<Modifier | undefined>(undefined);
  const [modifierCategories, setModifierCategories] = useState<string[]>([]);
  const [modifierCategoriesMap, setModifierCategoriesMap] = useState<Record<string, number>>({});

  const fetchModifiers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: pageSize,
        category: categoryFilter || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        name: nameFilter || undefined,
        seq_no: seqNoFilter || undefined
      };

      console.log("Fetching modifiers with params:", params);
      const response = await modifiersApi.getModifiers(params);
      console.log("API response:", response);
      
      if (!response.modifiers) {
        console.error("API response doesn't contain modifiers array:", response);
        setModifiers([]);
        setTotalItems(0);
        return;
      }
      
      const formattedModifiers = response.modifiers.map((item: ModifierResponse) => {
        let status: "Active" | "Inactive";
        
        if (typeof item.status === 'number') {
          status = item.status === 1 ? "Active" : "Inactive";
        } else if (typeof item.status === 'string') {
          status = item.status === "1" || item.status.toLowerCase() === "active" 
            ? "Active" 
            : "Inactive";
        } else {
          status = "Inactive";
        }
        
        return {
          id: String(item.id),
          name: item.modifier || item.name || "",
          seqNo: item.seq_no || 0,
          category: item.modifier_categories?.modifier_category || "",
          categoryId: item.modifier_categories?.id || item.modifier_category_id,
          status
        };
      });
      
      setModifiers(formattedModifiers);
      setTotalItems(response.total || formattedModifiers.length);
      
      const categoriesMap: Record<string, number> = {};
      const categories = new Set<string>();
      
      formattedModifiers.forEach(modifier => {
        if (modifier.category) {
          categories.add(modifier.category);
          
          if (modifier.categoryId) {
            categoriesMap[modifier.category] = typeof modifier.categoryId === 'string' 
              ? parseInt(modifier.categoryId, 10) 
              : modifier.categoryId as number;
          }
        }
      });
      
      setModifierCategories(Array.from(categories));
      setModifierCategoriesMap(categoriesMap);
    } catch (error) {
      console.error("Error fetching modifiers:", error);
      
      const errorStatus = (error as any)?.response?.status;
      if (errorStatus !== 401) {
        toast({
          title: "Failed to fetch modifiers",
          description: "Could not retrieve modifiers. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, categoryFilter, statusFilter, nameFilter, seqNoFilter]);

  useEffect(() => {
    fetchModifiers();
  }, [fetchModifiers]);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(modifiers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const newSeqNo = result.destination.index + 1;

    try {
      const categoryId = reorderedItem.categoryId ? 
        (typeof reorderedItem.categoryId === 'string' ? 
          parseInt(reorderedItem.categoryId as string, 10) : reorderedItem.categoryId) : 
        null;
      
      if (!categoryId) {
        throw new Error('Missing category ID for the modifier');
      }

      await modifiersApi.updateModifierSeqNo(
        reorderedItem.id,
        newSeqNo,
        categoryId as number
      );

      const updatedItems = items.map((item, index) => ({
        ...item,
        seqNo: index + 1
      }));
      setModifiers(updatedItems);

      toast({
        title: "Sequence Updated",
        description: "Modifier sequence has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating sequence:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update modifier sequence.",
        variant: "destructive"
      });
      fetchModifiers();
    }
  };

  const handleRefresh = () => {
    fetchModifiers();
    toast({
      title: "Refreshing data",
      description: "Fetching the latest modifiers data."
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
      const file = target.files?.[0];
      
      if (file) {
        toast({
          title: "CSV Import Started",
          description: `Importing modifiers from ${file.name}`,
        });
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          await modifiersApi.importModifiers(formData);
          
          toast({
            title: "CSV Import Complete",
            description: `Successfully imported modifiers from ${file.name}`,
          });
          
          fetchModifiers();
        } catch (error) {
          console.error("Import error:", error);
          toast({
            title: "Import Failed",
            description: "An error occurred while importing the CSV file."
          });
        }
      }
    };
    
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const handleAddNew = () => {
    setEditingModifier(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (modifier: Modifier) => {
    setEditingModifier(modifier);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (modifier: Modifier, categoryId?: number) => {
    setIsLoading(true);
    try {
      const modifierData = {
        modifier: modifier.name,
        modifier_category_id: categoryId || 1,
        status: modifier.status === "Active" ? 1 : 0
      };

      if (editingModifier) {
        await modifiersApi.updateModifier(editingModifier.id, modifierData);
        toast({
          title: "Modifier Updated",
          description: `${modifier.name} has been updated successfully.`
        });
      } else {
        await modifiersApi.createModifier(modifierData);
        toast({
          title: "Modifier Added",
          description: `${modifier.name} has been added successfully.`
        });
      }
      
      fetchModifiers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving modifier:", error);
      toast({
        title: "Error",
        description: "Failed to save modifier.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <ModifierFilters
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        seqNoFilter={seqNoFilter}
        setSeqNoFilter={setSeqNoFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        modifierCategories={modifierCategories}
        handleRefresh={handleRefresh}
        handleImportCSV={handleImportCSV}
        handleAddNew={handleAddNew}
      />

      <ModifierTable
        modifiers={modifiers}
        isLoading={isLoading}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onDragEnd={onDragEnd}
        onEdit={handleEdit}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <AddEditModifierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingModifier}
        categories={modifierCategories}
        categoriesMap={modifierCategoriesMap}
        isSubmitting={isLoading}
      />
    </div>
  );
};

export default ModifiersScreen;
