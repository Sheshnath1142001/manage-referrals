import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Search, Star, ChevronDown, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { searchFoodTrucks, SearchParams } from "@/lib/searchService";
import { getPopularTags } from "@/lib/tagService";
import { getCuisineTypes } from "@/lib/searchService";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Extract search params
  const query = searchParams.get("q") || "";
  const initialCuisineType = searchParams.get("cuisineType") || "";
  const initialDistance = Number(searchParams.get("distance")) || 10;

  // Local state for filters
  const [cuisineType, setCuisineType] = useState(initialCuisineType);
  const [distance, setDistance] = useState(initialDistance);
  const [openNow, setOpenNow] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Get user's location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Showing results without location filtering.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  // Prepare search parameters
  const buildSearchParams = (): SearchParams => {
    const params: SearchParams = {
      query,
      page: 1,
      limit: 20,
    };

    if (cuisineType) params.cuisineType = cuisineType;
    if (selectedTags.length > 0) params.tags = selectedTags;
    if (userLocation) {
      params.lat = userLocation.lat;
      params.lng = userLocation.lng;
      params.distance = distance;
      params.sortBy = 'distance';
    } else {
      params.sortBy = 'rating';
    }

    return params;
  };

  // Fetch search results
  const {
    data: searchResults,
    isLoading: searchLoading,
    refetch,
  } = useQuery({
    queryKey: ['searchResults', query, cuisineType, distance, selectedTags, userLocation],
    queryFn: () => searchFoodTrucks(buildSearchParams()),
    enabled: !!query,
  });

  // Fetch cuisine types
  const { data: cuisineTypes = [] } = useQuery({
    queryKey: ['cuisineTypes'],
    queryFn: () => getCuisineTypes(),
  });

  // Fetch popular tags
  const { data: popularTags = [] } = useQuery({
    queryKey: ['popularTags'],
    queryFn: () => getPopularTags(10),
  });

  // Apply filters
  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);

    if (cuisineType) {
      newParams.set("cuisineType", cuisineType);
    } else {
      newParams.delete("cuisineType");
    }

    if (distance !== 10) {
      newParams.set("distance", distance.toString());
    } else {
      newParams.delete("distance");
    }

    setSearchParams(newParams);
    refetch();
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setCuisineType("");
    setDistance(10);
    setOpenNow(false);
    setSelectedTags([]);

    const newParams = new URLSearchParams();
    if (query) newParams.set("q", query);
    setSearchParams(newParams);

    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={query}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) {
                  newParams.set("q", e.target.value);
                } else {
                  newParams.delete("q");
                }
                setSearchParams(newParams);
              }}
              placeholder="Search food trucks..."
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFiltersVisible(!filtersVisible)}
            className="flex items-center whitespace-nowrap"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${filtersVisible ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Filters */}
        {filtersVisible && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cuisine type filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Cuisine Type</label>
                <select
                  value={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                >
                  <option value="">All Cuisines</option>
                  {cuisineTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Distance filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Distance: {distance} {distance === 1 ? 'mile' : 'miles'}
                </label>
                <Slider
                  value={[distance]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={(values) => setDistance(values[0])}
                  disabled={!userLocation}
                />
                {!userLocation && (
                  <p className="text-xs text-gray-500 mt-1">Enable location to use distance filter</p>
                )}
              </div>

              {/* Open now filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Open Now</label>
                <div className="flex items-center">
                  <Switch
                    checked={openNow}
                    onCheckedChange={setOpenNow}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {openNow ? 'Show only open food trucks' : 'Show all food trucks'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedTags.includes(tag.id) ? "bg-food-orange hover:bg-food-orange/90" : ""
                    }`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name} {tag.count && `(${tag.count})`}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
              <Button onClick={applyFilters} className="bg-food-orange hover:bg-food-orange/90">
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active filters */}
        {(cuisineType || selectedTags.length > 0 || distance !== 10) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium">Active filters:</span>
            {cuisineType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {cuisineType}
                <button
                  onClick={() => {
                    setCuisineType("");
                    applyFilters();
                  }}
                  className="ml-1 hover:text-gray-700"
                >
                  ✕
                </button>
              </Badge>
            )}
            {distance !== 10 && userLocation && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Within {distance} {distance === 1 ? 'mile' : 'miles'}
                <button
                  onClick={() => {
                    setDistance(10);
                    applyFilters();
                  }}
                  className="ml-1 hover:text-gray-700"
                >
                  ✕
                </button>
              </Badge>
            )}
            {selectedTags.map((tagId) => {
              const tag = popularTags.find(t => t.id === tagId);
              return tag ? (
                <Badge key={tagId} variant="secondary" className="flex items-center gap-1">
                  {tag.name}
                  <button
                    onClick={() => {
                      toggleTag(tagId);
                      applyFilters();
                    }}
                    className="ml-1 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </Badge>
              ) : null;
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Search result count */}
        {searchResults && (
          <h2 className="text-xl font-semibold">
            {searchResults.total} {searchResults.total === 1 ? 'result' : 'results'} for "{query}"
          </h2>
        )}
      </div>

      {/* Search results */}
      {searchLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-food-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : searchResults && searchResults.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.items.map((truck) => (
            <Link key={truck.id} to={`/food-trucks/${truck.id}`}>
              <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                <div className="relative h-40">
                  <img
                    src={truck.image || "https://placehold.co/600x400?text=No+Image"}
                    alt={truck.name}
                    className="w-full h-full object-cover"
                  />
                  {truck.tags && truck.tags.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white/80 text-gray-800">
                        {truck.tags[0].name}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate">{truck.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-food-yellow text-food-yellow mr-1" />
                      <span className="text-sm font-medium">{truck.averageRating?.toFixed(1) || "New"}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{truck.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {truck.locations && truck.locations.length > 0 ? (
                      <span className="truncate">{truck.locations[0].address}</span>
                    ) : (
                      <span className="italic">No location available</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No food trucks found matching your search criteria.</p>
          <Button onClick={resetFilters} className="bg-food-orange hover:bg-food-orange/90">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Enter a search term to find food trucks.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
