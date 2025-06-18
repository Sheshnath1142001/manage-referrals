import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();
  
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: FormData) => {
      // ✅ FIXED: Don't convert FormData to object - it destroys file data
      // Instead, log FormData contents properly for debugging
      
      for (const [key, value] of categoryData.entries()) {
        if (value instanceof File) {
          
        } else {
          
        }
      }
      
      return categoriesApi.createCategory(categoryData);
    },
    onSuccess: (response) => {
      
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category created successfully.",
      });
    },
    onError: (error: any) => {
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (categoryData: { id: string; category: string; status: string }) => {
      if (!categoryData) {
        return Promise.reject('Invalid data format');
      }
      const { id, ...data } = categoryData;
      if (!id) {
        return Promise.reject('Category ID is required for update');
      }
      
      
      return categoriesApi.updateCategory(id, data);
    },
    onSuccess: (response) => {
      
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully.",
      });
    },
    onError: (error: any) => {
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const updateCategorySequenceMutation = useMutation({
    mutationFn: (data: { id: string | number, seqNo: number, name: string }) => 
      categoriesApi.updateCategorySequence(data.id, data.seqNo, data.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Sequence Updated",
        description: "Category order has been updated successfully."
      });
    },
    onError: (error) => {
      
      toast({
        title: "Error",
        description: "Failed to update category order. Please try again.",
        variant: "destructive"
      });
    }
  });

  const importCategoryMutation = useMutation({
    mutationFn: (formData: FormData) => categoriesApi.importCategory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Import Success",
        description: "Categories imported successfully."
      });
    },
    onError: (error) => {
      
      toast({
        title: "Error",
        description: "Failed to import categories. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    updateCategorySequenceMutation,
    importCategoryMutation
  };
};