
import { useState, useCallback } from 'react';
import { LocationResult } from '../types/location';

export const useGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocation = useCallback(async (query: string): Promise<LocationResult[]> => {
    setLoading(true);
    setError(null);
    try {
      // Use dummy data instead of API call
      const dummyLocations: LocationResult[] = [
        {
          latitude: 37.7749, 
          longitude: -122.4194,
          address: "123 Market St, San Francisco",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "USA"
        },
        {
          latitude: 37.3382, 
          longitude: -121.8863,
          address: "456 First St, San Jose",
          city: "San Jose",
          state: "CA",
          postalCode: "95113",
          country: "USA"
        }
      ];
      
      // Filter by query to simulate search
      return dummyLocations.filter(loc => 
        loc.address?.toLowerCase().includes(query.toLowerCase()) || 
        loc.city?.toLowerCase().includes(query.toLowerCase())
      );
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
      // Use dummy data instead of API call
      const dummyLocation: LocationResult = {
        latitude: lat,
        longitude: lng,
        address: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        country: "USA"
      };
      
      return dummyLocation;
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
