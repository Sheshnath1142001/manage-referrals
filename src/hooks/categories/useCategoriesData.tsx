import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Category } from '@/components/categories/CategoriesContext';

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [nameSearchTerm, setNameSearchTerm] = useState("");
  const [seqNoSearchTerm, setSeqNoSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  
  const apiStatusToComponentStatus = (apiStatus: number): "active" | "inactive" => {
    return apiStatus === 1 ? "active" : "inactive";
  };

  const componentStatusToApiStatus = (status: "all" | "active" | "inactive"): number | undefined => {
    if (status === "all") return undefined;
    return status === "active" ? 1 : 0;
  };

  const { error: apiError, refetch } = useQuery({
    queryKey: ['categories', currentPage, pageSize, statusFilter, nameSearchTerm, seqNoSearchTerm],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const isShowingAll = pageSize === 0 || pageSize === -1;
        const params: any = { 
          page: isShowingAll ? 1 : currentPage, // If showing all, always use page 1
          per_page: isShowingAll ? 99999 : pageSize // If pageSize is 0 or -1 (all), use 99999
        };
        
        // Only add status to params if it's not "all"
        const statusValue = componentStatusToApiStatus(statusFilter);
        if (statusValue !== undefined) {
          params.status = statusValue;
        }
        
        if (nameSearchTerm) {
          params.category_name = nameSearchTerm;
        }
        
        if (seqNoSearchTerm) {
          params.seq_no = seqNoSearchTerm;
        }
        
        
        const response = await categoriesApi.getCategories(params);
        
        setApiResponse(response); // Store the full API response
        
        // Process API data
        processApiResponse(response);
        
        return response;
      } catch (err) {
        
        toast({
          title: "Error",
          description: "Failed to load categories. Using fallback data.",
          variant: "destructive"
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    // Add these options to ensure the query runs properly
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true // Always refetch when component mounts
  });
  
  const processApiResponse = (apiData: any) => {
    if (!apiData) return;
    
    
    
    let total = 0;
    let categoriesData: any[] = [];
    
    // Handle different API response structures
    if (typeof apiData === 'object') {
      // Try to extract total items count
      if ('total' in apiData) {
        total = Number(apiData.total) || 0;
      } else if (apiData.data && 'total' in apiData.data) {
        total = Number(apiData.data.total) || 0;
      }
      
      // Try to extract categories array - handle all possible response structures
      if (Array.isArray(apiData.data)) {
        categoriesData = apiData.data;
      } else if (apiData.data && Array.isArray(apiData.data.categories)) {
        categoriesData = apiData.data.categories;
      } else if (Array.isArray(apiData)) {
        categoriesData = apiData;
        total = apiData.length;
      } else if (apiData.data && typeof apiData.data === 'object' && !Array.isArray(apiData.data)) {
        // Handle case where data is an object with category properties
        const categoryObjects = Object.values(apiData.data).filter(item => 
          item && typeof item === 'object' && ('category' in item || 'name' in item)
        );
        if (categoryObjects.length > 0) {
          categoriesData = categoryObjects;
        }
      }
      
      // If we still don't have categories, try to extract them from the root level
      if (categoriesData.length === 0 && 'categories' in apiData && Array.isArray(apiData.categories)) {
        categoriesData = apiData.categories;
      }
    }
    
    setTotalItems(total);
    
    if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0) {
      const transformedCategories = categoriesData.map((item: any) => ({
        id: item.id ? item.id.toString() : String(Math.random()),
        name: item.category || item.name || "Unknown",
        seqNo: item.seq_no || 0,
        status: apiStatusToComponentStatus(item.status),
        image: item.image || ''
      }));
      
      
      setCategories(transformedCategories);
    } else {
      
      // If API call succeeded but no categories, set empty
      setCategories([]);
      setTotalItems(0);
    }
  };

  return {
    categories,
    setCategories,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    statusFilter,
    setStatusFilter,
    nameSearchTerm,
    setNameSearchTerm,
    seqNoSearchTerm,
    setSeqNoSearchTerm,
    totalItems,
    setTotalItems,
    isLoading,
    setIsLoading,
    isDragging, 
    setIsDragging,
    apiError,
    refetch,
    apiResponse
  };
};
