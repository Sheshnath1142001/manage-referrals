
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
    console.log('Making API request to /attachments with params:', params);
    
    try {
      const response = await api.get('/attachments', { params });
      console.log('Attachments API raw response:', response);
      
      // Return the response data
      return response;
    } catch (error) {
      console.error('Attachments API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Return empty response if error
      return { attachment: [] };
    }
  },
  
  uploadAttachment: async (formData: FormData) => {
    console.log('Uploading attachment...');
    
    try {
      const response = await api.post('/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response);
      return response;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
  
  deleteAttachment: async (id: string) => {
    console.log('Deleting attachment:', id);
    
    try {
      const response = await api.delete(`/attachments/${id}`);
      console.log('Delete response:', response);
      return response;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
};
