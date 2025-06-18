
import { api } from './client';

export interface Attachment {
  id: string;
  attachment_type: number;
  module_type: number;
  module_id: string;
  original_file_name: string;
  extension: string;
  upload_path: string;
  mime_type: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  deleted_by: string | null;
  deleted_at: string | null;
  storage_type: number;
  is_featured: number;
}

export interface AttachmentResponse {
  attachment: Attachment[];
}

export const attachmentsApi = {
  getAttachments: async (params: {
    module_type: number;
    module_id: string | number;
  }): Promise<AttachmentResponse> => {
    try {
      const response = await api.get('/attachments', { params });
      
      // Return the response data directly
      return response.data || response;
    } catch (error: any) {
      // Return empty response if error
      return { attachment: [] };
    }
  },
  
  uploadAttachment: async (formData: FormData) => {
    try {
      const response = await api.post('/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  deleteAttachment: async (id: string) => {
    try {
      const response = await api.delete(`/attachments/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete multiple attachments in a single request (preferred for deal image removal)
  deleteAttachments: async (params: { attachment_ids: (string | number)[]; module_type: string | number; module_id: string | number; }) => {
    try {
      const response = await api.delete('/attachments', {
        data: params,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

