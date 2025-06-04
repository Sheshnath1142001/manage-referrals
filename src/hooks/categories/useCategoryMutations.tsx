import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();
  
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: FormData) => {
      console.log('Creating category with data:', Object.fromEntries(categoryData.entries()));
      return categoriesApi.createCategory(categoryData);
    },
    onSuccess: (response) => {
      console.log('Category created successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Failed to create category:', error);
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
    mutationFn: (categoryData: FormData) => {
      if (!categoryData) {
        return Promise.reject('Invalid data format');
      }
      const id = categoryData.get('id')?.toString() || '';
      if (!id) {
        return Promise.reject('Category ID is required for update');
      }
      
      console.log('Updating category with ID:', id, 'Data:', Object.fromEntries(categoryData.entries()));
      return categoriesApi.updateCategory(id, categoryData);
    },
    onSuccess: (response) => {
      console.log('Category updated successfully:', response);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Success",
        description: "Category updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Failed to update category:', error);
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
      console.error('Failed to update category sequence:', error);
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
      console.error('Failed to import categories:', error);
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
