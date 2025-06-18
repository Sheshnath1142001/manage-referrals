import React from 'react';
import { CustomerDisplayFile } from '@/services/api/customerDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface CustomerDisplayFilesListProps {
  files: CustomerDisplayFile[];
  isLoading: boolean;
  onView: (file: CustomerDisplayFile) => void;
  onDelete: (fileIds: number[]) => void;
  isDeleting: boolean;
  deletingFileId?: number | null;
}

export const CustomerDisplayFilesList: React.FC<CustomerDisplayFilesListProps> = ({
  files,
  isLoading,
  onView,
  onDelete,
  isDeleting,
  deletingFileId,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="w-full h-32 sm:h-40 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
        <p className="text-gray-500">Upload your first customer display file to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative">
            <img
              src={file.file_path}
              alt={file.file_name}
              className="w-full h-32 sm:h-40 object-cover"
              style={{ aspectRatio: file.aspect_ratios.aspect_ratio.replace(':', '/') }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-black/50 text-white text-xs">
                {file.aspect_ratios.aspect_ratio}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-3 sm:p-4">
            <h3 className="font-medium text-gray-900 mb-2 truncate text-sm sm:text-base" title={file.file_name}>
              {file.file_name}
            </h3>
            
            <div className="space-y-2 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{format(new Date(file.uploaded_at), 'MMM d, yyyy')}</span>
              </div>
              
              <div className="truncate">
                <span className="font-medium">Type:</span> <span className="capitalize">{file.file_type}</span>
              </div>
              
              {file.customer_display_group_otm.length > 0 && (
                <div className="truncate">
                  <span className="font-medium">Groups:</span>{' '}
                  <span title={file.customer_display_group_otm
                    .map((group) => group.customer_display_group_types.type)
                    .join(', ')}>
                    {file.customer_display_group_otm
                      .map((group) => group.customer_display_group_types.type)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(file)}
                className="h-8 flex-1 sm:w-8 sm:flex-initial sm:p-0"
              >
                <Eye className="h-4 w-4" />
                <span className="ml-1 sm:hidden">View</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete([file.id])}
                disabled={deletingFileId === file.id}
                className="h-8 flex-1 sm:w-8 sm:flex-initial sm:p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {deletingFileId === file.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="ml-1 sm:hidden">{deletingFileId === file.id ? 'Deleting...' : 'Delete'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};