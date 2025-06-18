import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { ModifierCategory } from "@/types/modifiers";
import { modifierCategoriesApi, RawModifierCategoryResponse, ModifierCategoriesApiResponse } from "@/services/api/modifiers";
import { toast } from "@/components/ui/use-toast";

interface ModifierCategoriesContextType {
  modifierCategories: ModifierCategory[];
  setModifierCategories: (categories: ModifierCategory[] | ((prevState: ModifierCategory[]) => ModifierCategory[])) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalItems: number;
  setTotalItems: (total: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  nameFilter: string;
  setNameFilter: (filter: string) => void;
  seqNoFilter: string;
  setSeqNoFilter: (filter: string) => void;
  statusFilter: "Active" | "Inactive" | "all";
  setStatusFilter: (status: "Active" | "Inactive" | "all") => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  editingCategory: ModifierCategory | undefined;
  setEditingCategory: (category: ModifierCategory | undefined) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  dialogMode: "ADD" | "EDIT" | "VIEW";
  setDialogMode: (mode: "ADD" | "EDIT" | "VIEW") => void;
  fetchModifierCategories: () => Promise<void>;
  handleFormSubmit: (category: ModifierCategory) => Promise<void>;
  isError: boolean;
  error: string | null;
  retryFetch: () => Promise<void>;
}

export const ModifierCategoriesContext = createContext<ModifierCategoriesContextType | undefined>(undefined);

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1500; // 1.5 seconds

export const ModifierCategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [modifierCategories, setModifierCategories] = useState<ModifierCategory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const [nameFilter, setNameFilter] = useState("");
  const [seqNoFilter, setSeqNoFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Active" | "Inactive" | "all">("Active");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ModifierCategory | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<"ADD" | "EDIT" | "VIEW">("ADD");
  
  const [isDragging, setIsDragging] = useState(false);

  const fetchModifierCategories = useCallback(async (shouldResetRetry = true) => {
    if (shouldResetRetry) {
      setRetryCount(0);
    }
    
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        per_page: pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
        modifier_category: nameFilter || undefined,
        seq_no: seqNoFilter || undefined
      };

      
      const response = await modifierCategoriesApi.getModifierCategories(params);
      
      
      let categoriesData: RawModifierCategoryResponse[] = [];
      
      if (response && response.modifier_categories && Array.isArray(response.modifier_categories)) {
        categoriesData = response.modifier_categories;
      } else {
        
        throw new Error("Received invalid data format from the server");
      }
      
      
      
      const formattedCategories = categoriesData.map((item: RawModifierCategoryResponse) => {
        
        
        let categoryStatus: "Active" | "Inactive";
        if (
          item.status === 1 || 
          String(item.status) === "1" || 
          Number(item.status) === 1 ||
          String(item.status).toLowerCase() === "active"
        ) {
          categoryStatus = "Active";
        } else {
          categoryStatus = "Inactive";
        }
        
        return {
          id: String(item.id),
          name: item.modifier_category || '',
          seqNo: item.seq_no || 0,
          max: item.max !== undefined ? item.max : null,
          status: categoryStatus,
          isMandatory: Boolean(item.is_mandatory),
          isSingleSelect: Boolean(item.is_single_select)
        };
      });
      
      
      setModifierCategories(formattedCategories);
      
      const total = response.total || formattedCategories.length;
      setTotalItems(total);
      setRetryCount(0);
    } catch (error) {
      
      setIsError(true);
      
      const errorMessage = (error as any)?.response?.data?.message || (error as Error)?.message || "Failed to fetch categories";
      setError(errorMessage);
      
      const errorStatus = (error as any)?.response?.status;
      if (errorStatus !== 401) {
        toast({
          title: "Failed to fetch categories",
          description: errorMessage,
          variant: "destructive"
        });
        
        if (retryCount < MAX_RETRY_COUNT) {
          const nextRetryCount = retryCount + 1;
          setRetryCount(nextRetryCount);
          
          toast({
            title: "Retrying...",
            description: `Attempt ${nextRetryCount} of ${MAX_RETRY_COUNT}`,
          });
          
          setTimeout(() => {
            fetchModifierCategories(false);
          }, RETRY_DELAY * nextRetryCount);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, nameFilter, seqNoFilter, retryCount]);

  const retryFetch = useCallback(() => {
    setRetryCount(0);
    return fetchModifierCategories();
  }, [fetchModifierCategories]);

  const handleFormSubmit = async (category: ModifierCategory) => {
    
    setIsLoading(true);
    try {
      const categoryData = {
        modifier_category: category.name,
        is_mandatory: category.isMandatory ? 1 : 0,
        is_single_select: category.isSingleSelect ? 1 : 0,
        status: category.status === "Active" ? 1 : 0,
        max: category.max,
        min: null
      };
      
      

      // Get the auth token
      const adminData = localStorage.getItem('Admin');
      const token = adminData ? JSON.parse(adminData).token : localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No auth token found. Please log in again.');
      }

      if (editingCategory) {
        
        await modifierCategoriesApi.updateModifierCategory(editingCategory.id, categoryData);
        toast({
          title: "Category Updated",
          description: `${category.name} has been updated successfully.`
        });
      } else {
        
        const response = await modifierCategoriesApi.createModifierCategory(categoryData);
        
        toast({
          title: "Category Added",
          description: `${category.name} has been added successfully.`
        });
      }
      
      
      await fetchModifierCategories();
      
      setIsDialogOpen(false);
    } catch (error) {
      
      const errorMessage = (error as any)?.response?.data?.message || 
                          (error as any)?.message || 
                          "Failed to save category";
      
      console.error('Detailed error:', {
        response: (error as any)?.response,
        message: (error as any)?.message,
        stack: (error as any)?.stack
      });
      
      if ((error as any)?.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModifierCategories();
  }, [currentPage, pageSize, statusFilter, nameFilter, seqNoFilter, fetchModifierCategories]);

  const value = {
    modifierCategories,
    setModifierCategories,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    setTotalItems,
    isLoading,
    setIsLoading,
    nameFilter,
    setNameFilter,
    seqNoFilter,
    setSeqNoFilter,
    statusFilter,
    setStatusFilter,
    isDragging,
    setIsDragging,
    editingCategory,
    setEditingCategory,
    isDialogOpen,
    setIsDialogOpen,
    dialogMode,
    setDialogMode,
    fetchModifierCategories,
    handleFormSubmit,
    isError,
    error,
    retryFetch
  };

  return (
    <ModifierCategoriesContext.Provider value={value}>
      {children}
    </ModifierCategoriesContext.Provider>
  );
};

export const useModifierCategories = () => {
  const context = useContext(ModifierCategoriesContext);
  if (!context) {
    throw new Error('useModifierCategories must be used within a ModifierCategoriesProvider');
  }
  return context;
};
