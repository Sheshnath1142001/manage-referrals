
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modifiersApi, modifierCategoriesApi } from '@/services/api/modifiers';
import { toast } from '@/hooks/use-toast';

export const useModifiersData = () => {
  const queryClient = useQueryClient();

  // Modifiers queries
  const getModifiers = (params: any) => {
    return useQuery({
      queryKey: ['modifiers', params],
      queryFn: () => modifiersApi.getModifiers(params),
    });
  };

  // Modifier mutations
  const createModifierMutation = useMutation({
    mutationFn: (data: FormData) => modifiersApi.createModifier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      toast({
        title: 'Success',
        description: 'Modifier has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const updateModifierMutation = useMutation({
    mutationFn: (data: FormData) => modifiersApi.updateModifier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      toast({
        title: 'Success',
        description: 'Modifier has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const updateModifierSequenceMutation = useMutation({
    mutationFn: ({ id, seqNo }: { id: string; seqNo: number }) => 
      modifiersApi.updateModifierSequence(id, seqNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      toast({
        title: 'Success',
        description: 'Modifier sequence has been updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const importModifiersMutation = useMutation({
    mutationFn: (data: FormData) => modifiersApi.importModifiers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifiers'] });
      toast({
        title: 'Success',
        description: 'Modifiers have been imported successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  // Modifier Categories queries
  const getModifierCategories = (params: any) => {
    return useQuery({
      queryKey: ['modifier-categories', params],
      queryFn: () => modifierCategoriesApi.getModifierCategories(params),
    });
  };

  // Modifier Categories mutations
  const createModifierCategoryMutation = useMutation({
    mutationFn: (data: FormData) => modifierCategoriesApi.createModifierCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifier-categories'] });
      toast({
        title: 'Success',
        description: 'Modifier category has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const updateModifierCategoryMutation = useMutation({
    mutationFn: (data: FormData) => modifierCategoriesApi.updateModifierCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifier-categories'] });
      toast({
        title: 'Success',
        description: 'Modifier category has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const updateModifierCategorySequenceMutation = useMutation({
    mutationFn: ({ id, seqNo }: { id: string; seqNo: number }) => 
      modifierCategoriesApi.updateModifierCategorySequence(id, seqNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifier-categories'] });
      toast({
        title: 'Success',
        description: 'Modifier category sequence has been updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const importModifierCategoriesMutation = useMutation({
    mutationFn: (data: FormData) => modifierCategoriesApi.importModifierCategories(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifier-categories'] });
      toast({
        title: 'Success',
        description: 'Modifier categories have been imported successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  // Restaurant Product Modifiers
  const getRestaurantProductModifiers = (params: any) => {
    return useQuery({
      queryKey: ['restaurant-product-modifiers', params],
      queryFn: () => modifiersApi.getRestaurantProductModifiers(params),
    });
  };

  const addRestaurantProductModifierMutation = useMutation({
    mutationFn: (data: FormData) => modifiersApi.addRestaurantProductModifier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-product-modifiers'] });
      toast({
        title: 'Success',
        description: 'Restaurant product modifier has been added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const updateRestaurantProductModifierMutation = useMutation({
    mutationFn: (data: FormData) => modifiersApi.updateRestaurantProductModifier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-product-modifiers'] });
      toast({
        title: 'Success',
        description: 'Restaurant product modifier has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const addMultipleRestaurantProductModifiersMutation = useMutation({
    mutationFn: (data: any) => modifiersApi.addMultipleRestaurantProductModifiers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-product-modifiers'] });
      toast({
        title: 'Success',
        description: 'Restaurant product modifiers have been added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  return {
    // Modifiers
    getModifiers,
    createModifierMutation,
    updateModifierMutation,
    updateModifierSequenceMutation,
    importModifiersMutation,
    
    // Modifier Categories
    getModifierCategories,
    createModifierCategoryMutation,
    updateModifierCategoryMutation,
    updateModifierCategorySequenceMutation,
    importModifierCategoriesMutation,
    
    // Restaurant Product Modifiers
    getRestaurantProductModifiers,
    addRestaurantProductModifierMutation,
    updateRestaurantProductModifierMutation,
    addMultipleRestaurantProductModifiersMutation,
  };
};
