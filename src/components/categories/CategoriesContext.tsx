
import { createContext, useContext, ReactNode } from 'react';

export interface Category {
  id: string;
  name: string;
  seqNo: number;
  status: "active" | "inactive";
  image?: string;
}

interface CategoriesContextType {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (status: "all" | "active" | "inactive") => void;
  nameSearchTerm: string;
  setNameSearchTerm: (term: string) => void;
  seqNoSearchTerm: string;
  setSeqNoSearchTerm: (term: string) => void;
  totalItems: number;
  setTotalItems: (total: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  refetch: () => void;
  apiError: any;
  apiResponse: any;
  
  // Define drag-and-drop properties with proper types
  draggedCategory: Category | null;
  dragOverCategory: Category | null;
  handleDragStart: (category: Category) => void;
  handleDragOver: (e: React.DragEvent, category: Category) => void;
  handleDragLeave: () => void;
  handleDrop: (category: Category) => void;
}

export const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children, value }: { children: ReactNode, value: CategoriesContextType }) => {
  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
