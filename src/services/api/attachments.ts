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
    const response = await api.get('/attachments', { params });
    return response;
  },
  
  uploadAttachment: async (formData: FormData) => {
    const response = await api.post('/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
  
  deleteAttachment: async (id: string) => {
    const response = await api.delete(`/attachments/${id}`);
    return response;
  }
}; 