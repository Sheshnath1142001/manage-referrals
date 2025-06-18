import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerDisplayApi, CustomerDisplayFile } from '@/services/api/customerDisplay';
import { toast } from '@/components/ui/use-toast';

export const useCustomerDisplayFiles = () => {
  const queryClient = useQueryClient();

  // Fetch files
  const {
    data: files = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['customerDisplayFiles'],
    queryFn: () => customerDisplayApi.getFiles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) => customerDisplayApi.uploadFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerDisplayFiles'] });
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to upload file',
        variant: 'destructive',
        duration: 2000,
      });
    },
  });

  // Batch upload files mutation
  const uploadFilesBatchMutation = useMutation({
    mutationFn: (formData: FormData) => customerDisplayApi.uploadFilesBatch(formData),
    onSuccess: (response, formData) => {
      queryClient.invalidateQueries({ queryKey: ['customerDisplayFiles'] });
      
      // Get file count from FormData
      const fileCount = formData.getAll('files[]').length;
      const fileText = fileCount === 1 ? 'file' : 'files';
      
      toast({
        title: 'Upload Successful!',
        description: `${fileCount} ${fileText} uploaded successfully and are now available in your customer display.`,
        duration: 2000,
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred while uploading files';
      
      toast({
        title: 'Upload Failed',
        description: errorMessage + '. Please check your files and try again.',
        variant: 'destructive',
        duration: 2000,
      });
    },
  });

  // Delete files mutation (batch delete)
  const deleteFilesMutation = useMutation({
    mutationFn: (fileIds: number[]) => customerDisplayApi.deleteFiles(fileIds),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['customerDisplayFiles'] });
      toast({
        title: 'Success',
        description: response.message || 'Files deleted successfully',
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete files',
        variant: 'destructive',
        duration: 2000,
      });
    },
    onSettled: () => {
      // This will be called whether success or error, to clean up loading state
    },
  });

  // Update file mutation
  const updateFileMutation = useMutation({
    mutationFn: ({ fileId, data }: { fileId: number; data: Partial<CustomerDisplayFile> }) =>
      customerDisplayApi.updateFile(fileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerDisplayFiles'] });
      toast({
        title: 'Success',
        description: 'File updated successfully',
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update file',
        variant: 'destructive',
        duration: 2000,
      });
    },
  });

  return {
    files,
    isLoading,
    error,
    refetch,
    uploadFile: uploadFileMutation.mutate,
    uploadFilesBatch: uploadFilesBatchMutation.mutateAsync,
    deleteFiles: deleteFilesMutation.mutateAsync,
    isUploading: uploadFileMutation.isPending,
    isBatchUploading: uploadFilesBatchMutation.isPending,
    isDeleting: deleteFilesMutation.isPending,
  };
};
