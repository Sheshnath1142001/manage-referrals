import { useState, useEffect, useCallback } from 'react';
import { Tag } from '../types';

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tags/popular?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get tags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const refreshTags = useCallback((limit?: number) => {
    fetchTags(limit);
  }, [fetchTags]);

  return {
    tags,
    error,
    loading,
    refreshTags
  };
};