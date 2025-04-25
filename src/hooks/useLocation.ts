import { useState, useEffect, useCallback } from 'react';
import { LocationResult } from '../lib/locationService';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/location/current');
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }

      const data = await response.json();
      setLocation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const refreshLocation = useCallback(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    location,
    error,
    loading,
    refreshLocation
  };
};
