import { useState, useEffect, useCallback } from 'react';
import { tagsService } from '@/services/api/items/tags';
import { useToast } from '@/components/ui/use-toast';

export interface Tag {
  id: string;
  tag: string;
  restaurant_id: number;
  created_at: string;
  updated_at: string;
}

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tagsService.getTags({
        page: currentPage,
        per_page: pageSize
      });
      
      setTags(response.tags || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: "Error",
        description: "Failed to load tags. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, toast]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const deleteTag = async (id: string) => {
    try {
      await tagsService.deleteTag(id);
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    tags,
    search,
    setSearch,
    currentPage,
    pageSize,
    total,
    isLoading,
    handlePageChange,
    handlePageSizeChange,
    fetchTags,
    deleteTag
  };
}; 