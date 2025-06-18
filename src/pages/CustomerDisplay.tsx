import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useCustomerDisplayFiles } from '@/hooks/useCustomerDisplayFiles';
import { CustomerDisplayFilesList } from '@/components/customer-display/CustomerDisplayFilesList';
import { CustomerDisplayFileDialog } from '@/components/customer-display/CustomerDisplayFileDialog';
import { CustomerDisplayFile } from '@/services/api/customerDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface FileEntry {
  id: string;
  file?: File;
  fileName: string;
  aspectRatio: number;
  group: number;
  previewUrl?: string;
}

const CustomerDisplay = () => {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CustomerDisplayFile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  const {
    files,
    isLoading,
    error,
    refetch,
    uploadFile,
    uploadFilesBatch,
    deleteFiles,
    isUploading,
    isBatchUploading,
    isDeleting,
  } = useCustomerDisplayFiles();

  // Custom delete function that tracks specific file being deleted
  const handleDeleteWithTracking = async (fileIds: number[]) => {
    if (fileIds.length === 1) {
      setDeletingFileId(fileIds[0]);
    }
    try {
      await deleteFiles(fileIds);
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleView = (file: CustomerDisplayFile) => {
    setSelectedFile(file);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (fileIds: number[]) => {
    setFilesToDelete(fileIds);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteWithTracking(filesToDelete);
    setIsDeleteDialogOpen(false);
    setFilesToDelete([]);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setFilesToDelete([]);
  };

  const handleFileSubmit = async (fileEntries: FileEntry[]) => {
    if (fileEntries.length === 0) return;
    
    try {
      // Create batch FormData according to API format
      const formData = new FormData();
      
      fileEntries.forEach((entry) => {
        if (entry.file) {
          // Add files as arrays - files[]
          formData.append('files[]', entry.file);
          // Add metadata as arrays
          formData.append('group_id[]', entry.group.toString());
          formData.append('aspect_ratio_id[]', entry.aspectRatio.toString());
          formData.append('file_name[]', entry.fileName);
          // Determine file type from file
          const fileType = entry.file.type.startsWith('image/') ? 'image' : 'video';
          formData.append('file_type[]', fileType);
        }
      });
      
      // Upload files and wait for result
      await uploadFilesBatch(formData);
      
      // Only close dialog on successful upload
      setIsFileDialogOpen(false);
    } catch (error) {
      // Error handling is already done in the mutation onError callback
      // Form will remain open so user can retry or make corrections
      
    }
  };

  const handleCloseViewDialog = () => {
    setSelectedFile(null);
    setIsViewDialogOpen(false);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load files</h3>
          <p className="text-gray-500 mb-4">There was an error loading the customer display files.</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Customer Display</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage your customer display images and videos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} ${isLoading ? '' : 'sm:mr-2'}`} />
            <span className="ml-2 sm:ml-0">Refresh</span>
          </Button>
          <Button 
            variant="default" 
            onClick={() => setIsFileDialogOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Files
          </Button>
        </div>
      </div>
      
      <CustomerDisplayFilesList
        files={files}
        isLoading={isLoading}
        onView={handleView}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deletingFileId={deletingFileId}
      />
      
      <CustomerDisplayFileDialog 
        isOpen={isFileDialogOpen}
        onClose={() => setIsFileDialogOpen(false)}
        onSubmit={handleFileSubmit}
        isSubmitting={isBatchUploading}
      />

      {/* View File Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={handleCloseViewDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">View File</DialogTitle>
          </DialogHeader>
          
          {selectedFile && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedFile.file_path}
                  alt={selectedFile.file_name}
                  className="w-full max-h-[40vh] sm:max-h-96 object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">File Name:</span>
                  <p className="text-gray-600 break-words">{selectedFile.file_name}</p>
                </div>
                <div>
                  <span className="font-medium">Aspect Ratio:</span>
                  <p className="text-gray-600">{selectedFile.aspect_ratios.aspect_ratio}</p>
                </div>
                <div>
                  <span className="font-medium">File Type:</span>
                  <p className="text-gray-600 capitalize">{selectedFile.file_type}</p>
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span>
                  <p className="text-gray-600">
                    {new Date(selectedFile.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-medium">Groups:</span>
                  <p className="text-gray-600 break-words">
                    {selectedFile.customer_display_group_otm.length > 0
                      ? selectedFile.customer_display_group_otm
                          .map((group) => group.customer_display_group_types.type)
                          .join(', ')
                      : 'No groups assigned'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={handleCancelDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              {filesToDelete.length === 1 
                ? 'Are you sure you want to delete this file? This action cannot be undone.' 
                : `Are you sure you want to delete ${filesToDelete.length} files? This action cannot be undone.`
              }
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelDelete}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDisplay;
