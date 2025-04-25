
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash, MapPin } from 'lucide-react';
import { LocationResult } from '@/types/location';

interface SavedLocationsProps {
  onSelectLocation: (location: LocationResult) => void;
  onDeleteLocation: (id: string) => void;
}

export const SavedLocations: React.FC<SavedLocationsProps> = ({
  onSelectLocation,
  onDeleteLocation
}) => {
  // Use dummy data instead of fetching from API
  const [savedLocations] = useState<Array<LocationResult & { id: string }>>([
    {
      id: "1",
      latitude: 37.7749,
      longitude: -122.4194,
      address: "123 Market St, San Francisco, CA",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105"
    },
    {
      id: "2",
      latitude: 34.0522,
      longitude: -118.2437,
      address: "456 Main St, Los Angeles, CA",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90012"
    }
  ]);

  return (
    <div className="space-y-2">
      {savedLocations.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No saved locations found
        </div>
      ) : (
        savedLocations.map((location) => (
          <div
            key={location.id}
            className="flex items-center justify-between border p-3 rounded-md"
          >
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">{location.address}</div>
                <div className="text-xs text-muted-foreground">
                  {location.city}, {location.state} {location.postalCode}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectLocation(location)}
              >
                Use
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDeleteLocation(location.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
