import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';

interface LocationSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onSearch?: (query: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { location, error, loading, refreshLocation } = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleUseCurrentLocation = () => {
    if (location) {
      onLocationSelect(location.latitude, location.longitude);
    } else {
      refreshLocation();
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Select Location</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Location</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Enter address or place"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={loading}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {loading ? 'Getting Location...' : 'Use Current Location'}
            </Button>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          {location && (
            <div className="text-sm text-muted-foreground">
              <p>Current Location:</p>
              <p>Latitude: {location.latitude.toFixed(6)}</p>
              <p>Longitude: {location.longitude.toFixed(6)}</p>
              {location.address && <p>Address: {location.address}</p>}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};