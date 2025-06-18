import { api } from './client';

// Types based on the API response
export interface AspectRatio {
  id: number;
  aspect_ratio: string;
}

export interface CustomerDisplayGroupType {
  id: number;
  type: string;
}

export interface CustomerDisplayGroupOtm {
  group_id: number;
  customer_display_group_types: CustomerDisplayGroupType;
}

export interface CustomerDisplayFile {
  id: number;
  file_name: string;
  file_path: string;
  aspect_ratios: AspectRatio;
  file_type: string;
  storage_type: number;
  uploaded_at: string;
  uploaded_by: string;
  customer_display_group_otm: CustomerDisplayGroupOtm[];
}

export interface CustomerDisplayFilesResponse {
  files: CustomerDisplayFile[];
}

// Additional API response types
export interface AspectRatioOption {
  id: number;
  aspect_ratio: string;
}

export interface GroupType {
  id: number;
  type: string;
  restaurant_id: number;
  files_count: number;
  self_checkout_file_count: number;
  customer_display_file_count: number;
}

// API endpoints
export const customerDisplayApi = {
  // Get list of customer display files
  getFiles: (): Promise<CustomerDisplayFile[]> => {
    return api.get('/customer-display/files/list');
  },

  // Upload customer display file
  uploadFile: (formData: FormData): Promise<CustomerDisplayFile> => {
    return api.post('/customer-display/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Batch upload customer display files
  uploadFilesBatch: (formData: FormData): Promise<{message: string}> => {
    return api.post('/customer-display/files/create-batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete customer display files (batch delete)
  deleteFiles: (fileIds: number[]): Promise<{message: string}> => {
    return api.delete('/customer-display/files/delete-batch', {
      data: { fileIds }
    });
  },

  // Update customer display file
  updateFile: (fileId: number, data: Partial<CustomerDisplayFile>): Promise<CustomerDisplayFile> => {
    return api.put(`/customer-display/files/${fileId}`, data);
  },

  // Get aspect ratios
  getAspectRatios: (): Promise<AspectRatioOption[]> => {
    return api.get('/aspect-ratios');
  },

  // Get customer display group types
  getGroupTypes: (): Promise<GroupType[]> => {
    return api.get('/customer-display/group-types');
  },
};