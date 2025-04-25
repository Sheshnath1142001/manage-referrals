import React, { useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from 'react-leaflet';
import { LocationSelector } from './LocationSelector';
import { LocationErrorBoundary } from './LocationErrorBoundary';
import { MapTools } from './MapTools';
import { SavedLocations } from './SavedLocations';
import { Card } from '@/components/ui/card';
import { useLocation } from '@/hooks/useLocation';
import { useGeocoding } from '@/hooks/useGeocoding';
import L from 'leaflet';
import { Search, MapPin, Save, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocationResult } from '@/types/location';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

interface LocationMapProps {
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  onLocationSelect,
  initialLocation,
  height = '400px'
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const mapRef = useRef<L.Map>(null);
  const { location } = useLocation();
  const { searchLocation, reverseGeocode, loading: geocodingLoading } = useGeocoding();

  const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    const address = await reverseGeocode(lat, lng);
    onLocationSelect?.(lat, lng, address?.address);
  }, [onLocationSelect, reverseGeocode]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const results = await searchLocation(searchQuery);
    setSearchResults(results);
    if (results.length > 0 && mapRef.current) {
      const { latitude, longitude } = results[0];
      mapRef.current.setView([latitude, longitude], 13);
    }
  }, [searchQuery, searchLocation]);

  const handleSaveDrawing = useCallback((data: any) => {
    console.log('Saved drawing:', data);
    // Implement saving drawing to backend or localStorage
  }, []);

  const handleClearDrawing = useCallback(() => {
    console.log('Cleared drawing');
  }, []);

  const handleSelectSavedLocation = useCallback((location: LocationResult) => {
    handleLocationSelect(location.latitude, location.longitude);
    setShowSavedLocations(false);
  }, [handleLocationSelect]);

  const handleDeleteSavedLocation = useCallback((id: string) => {
    console.log('Deleted location:', id);
  }, []);

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        handleLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <LocationErrorBoundary onRetry={() => window.location.reload()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" disabled={geocodingLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-2 mb-4">
              {searchResults.map((result) => (
                <Button
                  key={`${result.latitude}-${result.longitude}`}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleLocationSelect(result.latitude, result.longitude)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {result.address}
                </Button>
              ))}
            </div>
          )}

          <LocationSelector
            onLocationSelect={handleLocationSelect}
            onSearch={handleSearch}
          />

          <div className="mt-4 flex gap-2">
            <Dialog open={showSavedLocations} onOpenChange={setShowSavedLocations}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Layers className="h-4 w-4 mr-2" />
                  Saved Locations
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Saved Locations</DialogTitle>
                </DialogHeader>
                <SavedLocations
                  onSelectLocation={handleSelectSavedLocation}
                  onDeleteLocation={handleDeleteSavedLocation}
                />
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        <div style={{ height }} className="rounded-lg overflow-hidden relative">
          <MapContainer
            center={selectedLocation || [0, 0]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ZoomControl position="bottomright" />
            <MapEvents />
            <MapTools
              onSaveDrawing={handleSaveDrawing}
              onClearDrawing={handleClearDrawing}
            />
            {selectedLocation && (
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={createCustomIcon('#3b82f6')}
              >
                <Popup>
                  Selected Location<br />
                  Lat: {selectedLocation.lat.toFixed(6)}<br />
                  Lng: {selectedLocation.lng.toFixed(6)}
                </Popup>
              </Marker>
            )}
            {location && !selectedLocation && (
              <Marker
                position={[location.latitude, location.longitude]}
                icon={createCustomIcon('#10b981')}
              >
                <Popup>
                  Current Location<br />
                  Lat: {location.latitude.toFixed(6)}<br />
                  Lng: {location.longitude.toFixed(6)}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </LocationErrorBoundary>
  );
};