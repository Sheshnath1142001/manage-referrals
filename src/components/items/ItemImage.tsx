import { useState, useEffect } from 'react';
import { Upload } from "lucide-react";
import axios from 'axios';

interface ItemImageProps {
  moduleId: string | number;
  className?: string;
}

export const ItemImage = ({ moduleId, className = "" }: ItemImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        // Get the auth token from localStorage
        const adminData = localStorage.getItem('Admin');
        let token = '';
        if (adminData) {
          const parsedData = JSON.parse(adminData);
          token = parsedData.token;
          if (!token) {
            throw new Error('No token found in admin data');
          }
        } else {
          throw new Error('No admin data found in localStorage');
        }

        // Fetch image data from attachments API
        const response = await axios.get('https://pratham-respos-testbe-v34.achyutlabs.cloud/api/attachments', {
          params: {
            module_type: 2,
            module_id: moduleId
          },
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Timezone': 'Asia/Calcutta'
          }
        });

        const attachments = response.data.attachment || [];
        if (attachments.length > 0 && attachments[0].upload_path) {
          setImageUrl(attachments[0].upload_path);
        }
      } catch (err) {
        console.error('Error fetching image:', err);
        setError(err instanceof Error ? err.message : 'Failed to load image');
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId) {
      fetchImage();
    }
  }, [moduleId]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <Upload className="h-8 w-8 text-gray-400" />
        <div className="text-sm text-gray-500 mt-2">
          {error || 'No image available'}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img 
        src={imageUrl} 
        alt="Item" 
        className="w-full h-full object-contain"
        onError={() => setError('Failed to load image')}
      />
    </div>
  );
}; 