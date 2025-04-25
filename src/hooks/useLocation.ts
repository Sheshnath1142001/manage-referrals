
import { useState, useEffect, useCallback } from 'react';
import { LocationResult } from '../types/location';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use dummy data instead of API call
      const dummyLocation: LocationResult = {
        latitude: 37.7749,
        longitude: -122.4194,
        address: "123 Market St",
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        country: "USA"
      };
      
      setLocation(dummyLocation);
      setLocationName("San Francisco, CA");
      
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
    locationName,
    error,
    loading,
    refreshLocation
  };
};
