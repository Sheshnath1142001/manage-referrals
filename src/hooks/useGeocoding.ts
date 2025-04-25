import { useState, useCallback } from 'react';
import { LocationResult } from '@/types/location';

export const useGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocation = useCallback(async (query: string): Promise<LocationResult[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/geocoding/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search location');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search location');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<LocationResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/geocoding/reverse?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        throw new Error('Failed to get address');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get address');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchLocation,
    reverseGeocode,
    loading,
    error
  };
};