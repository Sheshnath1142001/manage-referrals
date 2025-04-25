import api from './api';
import { FoodTruck } from './foodTruckService';

export interface Location {
  id?: string;
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface LocationListResponse {
  items: Location[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get locations for a food truck
export const getLocations = async (foodTruckId: string, params: { page?: number; limit?: number; isActive?: boolean } = {}): Promise<LocationListResponse> => {
  const response = await api.get<LocationListResponse>(`/locations/food-truck/${foodTruckId}`, { params });
  return response.data;
};

// Get a single location by ID
export const getLocationById = async (id: string): Promise<Location> => {
  const response = await api.get<Location>(`/locations/${id}`);
  return response.data;
};

// Create a new location
export const createLocation = async (foodTruckId: string, locationData: Location): Promise<Location> => {
  const response = await api.post<Location>(`/locations/food-truck/${foodTruckId}`, locationData);
  return response.data;
};

// Update a location
export const updateLocation = async (id: string, locationData: Partial<Location>): Promise<Location> => {
  const response = await api.put<Location>(`/locations/${id}`, locationData);
  return response.data;
};

// Delete a location
export const deleteLocation = async (id: string): Promise<void> => {
  await api.delete(`/locations/${id}`);
};

// Location accuracy types
type LocationAccuracy = 'precise' | 'city' | 'country' | 'default';
type LocationSource = 'browser' | 'ip' | 'manual' | 'default';

interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: LocationAccuracy;
  source: LocationSource;
  message?: string;
  timestamp?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface LocationHistory {
  locations: LocationResult[];
  lastUpdated: number;
}

// Default locations for different fallback levels
const DEFAULT_LOCATIONS: Record<LocationAccuracy, LocationResult> = {
  precise: {
    latitude: -37.8136,
    longitude: 144.9631,
    accuracy: 'precise',
    source: 'default',
    message: 'Using precise default location',
    timestamp: Date.now(),
    address: 'Melbourne CBD',
    city: 'Melbourne',
    state: 'Victoria',
    country: 'Australia',
    postalCode: '3000'
  },
  city: {
    latitude: -37.8136,
    longitude: 144.9631,
    accuracy: 'city',
    source: 'default',
    message: 'Using city-level default location',
    timestamp: Date.now(),
    city: 'Melbourne',
    state: 'Victoria',
    country: 'Australia'
  },
  country: {
    latitude: -25.2744,
    longitude: 133.7751,
    accuracy: 'country',
    source: 'default',
    message: 'Using country-level default location',
    timestamp: Date.now(),
    country: 'Australia'
  },
  default: {
    latitude: -25.2744,
    longitude: 133.7751,
    accuracy: 'default',
    source: 'default',
    message: 'Using global default location',
    timestamp: Date.now(),
    country: 'Australia'
  }
};

// Cache for location results
const locationCache = {
  get: (key: string): LocationResult | null => {
    const cached = localStorage.getItem(`location_${key}`);
    if (!cached) return null;
    const result = JSON.parse(cached);
    // Check if cache is still valid (5 minutes)
    if (Date.now() - (result.timestamp || 0) > 300000) {
      localStorage.removeItem(`location_${key}`);
      return null;
    }
    return result;
  },
  set: (key: string, value: LocationResult): void => {
    localStorage.setItem(`location_${key}`, JSON.stringify({
      ...value,
      timestamp: Date.now()
    }));
  }
};

// Location history management
const locationHistory = {
  get: (): LocationHistory => {
    const history = localStorage.getItem('location_history');
    return history ? JSON.parse(history) : { locations: [], lastUpdated: 0 };
  },
  add: (location: LocationResult): void => {
    const history = locationHistory.get();
    // Keep only last 10 locations
    const locations = [location, ...history.locations].slice(0, 10);
    localStorage.setItem('location_history', JSON.stringify({
      locations,
      lastUpdated: Date.now()
    }));
  },
  clear: (): void => {
    localStorage.removeItem('location_history');
  }
};

// Calculate distance between two points in kilometers
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

// Get address from coordinates using reverse geocoding
const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<Partial<LocationResult>> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    return {
      address: data.display_name,
      city: data.address?.city || data.address?.town,
      state: data.address?.state,
      country: data.address?.country,
      postalCode: data.address?.postcode
    };
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return {};
  }
};

// Step 1: HTML5 Geolocation API
const getBrowserLocation = async (): Promise<LocationResult> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const address = await getAddressFromCoordinates(
          position.coords.latitude,
          position.coords.longitude
        );

        const result: LocationResult = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: 'precise',
          source: 'browser',
          message: 'Precise location obtained from your device',
          timestamp: Date.now(),
          ...address
        };

        locationCache.set('browser', result);
        locationHistory.add(result);
        resolve(result);
      },
      (error) => {
        console.warn('Browser geolocation failed:', error.message);
        reject(error);
      },
      options
    );
  });
};

// Step 2: IP-based Geolocation
const getIPLocation = async (): Promise<LocationResult> => {
  try {
    const services = [
      'https://ipapi.co/json/',
      'https://ipwho.is/',
      'https://ipinfo.io/json'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();

        if (data.latitude && data.longitude) {
          const address = await getAddressFromCoordinates(
            data.latitude,
            data.longitude
          );

          const result: LocationResult = {
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: 'city',
            source: 'ip',
            message: 'Location obtained from your IP address',
            timestamp: Date.now(),
            ...address
          };

          locationCache.set('ip', result);
          locationHistory.add(result);
          return result;
        }
      } catch (error) {
        console.warn(`IP geolocation service ${service} failed:`, error);
        continue;
      }
    }

    throw new Error('All IP geolocation services failed');
  } catch (error) {
    throw new Error('IP-based location failed');
  }
};

// Step 3: Country-level fallback
const getCountryLocation = async (): Promise<LocationResult> => {
  try {
    const response = await fetch('https://ipapi.co/country/');
    const countryCode = await response.text();

    const countryCoordinates: Record<string, LocationResult> = {
      'AU': {
        ...DEFAULT_LOCATIONS.country,
        message: 'Using Australian default location',
        timestamp: Date.now(),
        country: 'Australia'
      },
      'US': {
        latitude: 37.0902,
        longitude: -95.7129,
        accuracy: 'country',
        source: 'default',
        message: 'Using United States default location',
        timestamp: Date.now(),
        country: 'United States'
      },
      'GB': {
        latitude: 55.3781,
        longitude: -3.4360,
        accuracy: 'country',
        source: 'default',
        message: 'Using United Kingdom default location',
        timestamp: Date.now(),
        country: 'United Kingdom'
      }
    };

    const result = countryCoordinates[countryCode] || DEFAULT_LOCATIONS.country;
    locationCache.set(`country_${countryCode}`, result);
    locationHistory.add(result);
    return result;
  } catch (error) {
    console.warn('Country detection failed:', error);
    return DEFAULT_LOCATIONS.country;
  }
};

// Manual location input
export const setManualLocation = async (
  latitude: number,
  longitude: number
): Promise<LocationResult> => {
  const address = await getAddressFromCoordinates(latitude, longitude);

  const result: LocationResult = {
    latitude,
    longitude,
    accuracy: 'precise',
    source: 'manual',
    message: 'Location set manually',
    timestamp: Date.now(),
    ...address
  };

  locationCache.set('manual', result);
  locationHistory.add(result);
  return result;
};

// Get location history
export const getLocationHistory = (): LocationResult[] => {
  return locationHistory.get().locations;
};

// Clear location history
export const clearLocationHistory = (): void => {
  locationHistory.clear();
};

export const getCurrentLocation = async (): Promise<LocationResult> => {
  // Check cache first
  const cached = locationCache.get('browser') ||
                 locationCache.get('ip') ||
                 locationCache.get('manual');
  if (cached) {
    return cached;
  }

  try {
    // Step 1: Try HTML5 Geolocation
    return await getBrowserLocation();
  } catch (browserError) {
    console.warn('Browser geolocation failed, trying IP-based location');

    try {
      // Step 2: Try IP-based Geolocation
      return await getIPLocation();
    } catch (ipError) {
      console.warn('IP-based location failed, trying country detection');

      try {
        // Step 3: Try Country-level detection
        return await getCountryLocation();
      } catch (countryError) {
        console.warn('All location methods failed, using default location');

        // Step 4: Final fallback to default location
        return DEFAULT_LOCATIONS.default;
      }
    }
  }
};

export interface LocationQueryParams {
  lat: number;
  lng: number;
  distance?: number;
  limit?: number;
}

interface LocationResponse {
  items: FoodTruck[];
  total: number;
}

// Extended country coordinates with more countries
const COUNTRY_COORDINATES: Record<string, LocationResult> = {
  'AU': {
    latitude: -25.2744,
    longitude: 133.7751,
    accuracy: 'country',
    source: 'default',
    message: 'Using Australian default location',
    timestamp: Date.now(),
    country: 'Australia'
  },
  'US': {
    latitude: 37.0902,
    longitude: -95.7129,
    accuracy: 'country',
    source: 'default',
    message: 'Using United States default location',
    timestamp: Date.now(),
    country: 'United States'
  },
  'GB': {
    latitude: 55.3781,
    longitude: -3.4360,
    accuracy: 'country',
    source: 'default',
    message: 'Using United Kingdom default location',
    timestamp: Date.now(),
    country: 'United Kingdom'
  },
  'CA': {
    latitude: 56.1304,
    longitude: -106.3468,
    accuracy: 'country',
    source: 'default',
    message: 'Using Canadian default location',
    timestamp: Date.now(),
    country: 'Canada'
  },
  'NZ': {
    latitude: -40.9006,
    longitude: 174.8860,
    accuracy: 'country',
    source: 'default',
    message: 'Using New Zealand default location',
    timestamp: Date.now(),
    country: 'New Zealand'
  },
  'IN': {
    latitude: 20.5937,
    longitude: 78.9629,
    accuracy: 'country',
    source: 'default',
    message: 'Using Indian default location',
    timestamp: Date.now(),
    country: 'India'
  },
  'JP': {
    latitude: 36.2048,
    longitude: 138.2529,
    accuracy: 'country',
    source: 'default',
    message: 'Using Japanese default location',
    timestamp: Date.now(),
    country: 'Japan'
  },
  'DE': {
    latitude: 51.1657,
    longitude: 10.4515,
    accuracy: 'country',
    source: 'default',
    message: 'Using German default location',
    timestamp: Date.now(),
    country: 'Germany'
  },
  'FR': {
    latitude: 46.2276,
    longitude: 2.2137,
    accuracy: 'country',
    source: 'default',
    message: 'Using French default location',
    timestamp: Date.now(),
    country: 'France'
  },
  'IT': {
    latitude: 41.8719,
    longitude: 12.5674,
    accuracy: 'country',
    source: 'default',
    message: 'Using Italian default location',
    timestamp: Date.now(),
    country: 'Italy'
  },
  'BR': {
    latitude: -14.2350,
    longitude: -51.9253,
    accuracy: 'country',
    source: 'default',
    message: 'Using Brazilian default location',
    timestamp: Date.now(),
    country: 'Brazil'
  },
  'MX': {
    latitude: 23.6345,
    longitude: -102.5528,
    accuracy: 'country',
    source: 'default',
    message: 'Using Mexican default location',
    timestamp: Date.now(),
    country: 'Mexico'
  },
  'ES': {
    latitude: 40.4637,
    longitude: -3.7492,
    accuracy: 'country',
    source: 'default',
    message: 'Using Spanish default location',
    timestamp: Date.now(),
    country: 'Spain'
  },
  'PT': {
    latitude: 39.3999,
    longitude: -8.2245,
    accuracy: 'country',
    source: 'default',
    message: 'Using Portuguese default location',
    timestamp: Date.now(),
    country: 'Portugal'
  },
  'NL': {
    latitude: 52.1326,
    longitude: 5.2913,
    accuracy: 'country',
    source: 'default',
    message: 'Using Dutch default location',
    timestamp: Date.now(),
    country: 'Netherlands'
  },
  'SE': {
    latitude: 60.1282,
    longitude: 18.6435,
    accuracy: 'country',
    source: 'default',
    message: 'Using Swedish default location',
    timestamp: Date.now(),
    country: 'Sweden'
  },
  'NO': {
    latitude: 60.4720,
    longitude: 8.4689,
    accuracy: 'country',
    source: 'default',
    message: 'Using Norwegian default location',
    timestamp: Date.now(),
    country: 'Norway'
  },
  'DK': {
    latitude: 56.2639,
    longitude: 9.5018,
    accuracy: 'country',
    source: 'default',
    message: 'Using Danish default location',
    timestamp: Date.now(),
    country: 'Denmark'
  },
  'FI': {
    latitude: 61.9241,
    longitude: 25.7482,
    accuracy: 'country',
    source: 'default',
    message: 'Using Finnish default location',
    timestamp: Date.now(),
    country: 'Finland'
  },
  'CH': {
    latitude: 46.8182,
    longitude: 8.2275,
    accuracy: 'country',
    source: 'default',
    message: 'Using Swiss default location',
    timestamp: Date.now(),
    country: 'Switzerland'
  },
  'AT': {
    latitude: 47.5162,
    longitude: 14.5501,
    accuracy: 'country',
    source: 'default',
    message: 'Using Austrian default location',
    timestamp: Date.now(),
    country: 'Austria'
  },
  'BE': {
    latitude: 50.5039,
    longitude: 4.4699,
    accuracy: 'country',
    source: 'default',
    message: 'Using Belgian default location',
    timestamp: Date.now(),
    country: 'Belgium'
  },
  'IE': {
    latitude: 53.4129,
    longitude: -8.2439,
    accuracy: 'country',
    source: 'default',
    message: 'Using Irish default location',
    timestamp: Date.now(),
    country: 'Ireland'
  },
  'PL': {
    latitude: 51.9194,
    longitude: 19.1451,
    accuracy: 'country',
    source: 'default',
    message: 'Using Polish default location',
    timestamp: Date.now(),
    country: 'Poland'
  },
  'CZ': {
    latitude: 49.8175,
    longitude: 15.4730,
    accuracy: 'country',
    source: 'default',
    message: 'Using Czech default location',
    timestamp: Date.now(),
    country: 'Czech Republic'
  },
  'HU': {
    latitude: 47.1625,
    longitude: 19.5033,
    accuracy: 'country',
    source: 'default',
    message: 'Using Hungarian default location',
    timestamp: Date.now(),
    country: 'Hungary'
  },
  'RO': {
    latitude: 45.9432,
    longitude: 24.9668,
    accuracy: 'country',
    source: 'default',
    message: 'Using Romanian default location',
    timestamp: Date.now(),
    country: 'Romania'
  },
  'GR': {
    latitude: 39.0742,
    longitude: 21.8243,
    accuracy: 'country',
    source: 'default',
    message: 'Using Greek default location',
    timestamp: Date.now(),
    country: 'Greece'
  },
  'TR': {
    latitude: 38.9637,
    longitude: 35.2433,
    accuracy: 'country',
    source: 'default',
    message: 'Using Turkish default location',
    timestamp: Date.now(),
    country: 'Turkey'
  }
};

// Cache for food truck results
const foodTruckCache = new Map<string, {
  data: LocationResponse;
  timestamp: number;
}>();

// Clear cache after 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Location search interface
interface LocationSearchResult {
  display_name: string;
  lat: number;
  lon: number;
  address: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// OpenStreetMap API response type
interface OpenStreetMapResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

// Cache for search results
const searchCache = new Map<string, LocationSearchResult[]>();

// Search for locations by query with caching
export const searchLocations = async (
  query: string,
  options: {
    country?: string;
    city?: string;
    limit?: number;
  } = {}
): Promise<LocationSearchResult[]> => {
  const cacheKey = `${query}-${options.country}-${options.city}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const params = new URLSearchParams({
      format: 'json',
      q: query,
      limit: (options.limit || 5).toString()
    });

    if (options.country) params.append('countrycodes', options.country);
    if (options.city) params.append('city', options.city);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`
    );
    const data = await response.json() as OpenStreetMapResult[];

    const results = data.map(result => ({
      display_name: result.display_name,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      address: {
        city: result.address?.city || result.address?.town,
        state: result.address?.state,
        country: result.address?.country,
        postcode: result.address?.postcode
      }
    }));

    // Cache results for 1 hour
    searchCache.set(cacheKey, results);
    setTimeout(() => searchCache.delete(cacheKey), 3600000);

    return results;
  } catch (error) {
    console.error('Location search failed:', error);
    return [];
  }
};

// Sort food trucks by multiple criteria
export const sortFoodTrucks = (
  trucks: FoodTruck[],
  userLat: number,
  userLng: number,
  options: {
    sortBy?: 'distance' | 'rating' | 'name' | 'price' | 'popularity' | 'newest' | 'avgReviewScore' | 'priceRange';
    ascending?: boolean;
  } = {}
): FoodTruck[] => {
  const { sortBy = 'distance', ascending = true } = options;

  return [...trucks].sort((a, b) => {
    if (sortBy === 'distance') {
      const distanceA = calculateDistance(
        userLat,
        userLng,
        a.location.latitude,
        a.location.longitude
      );
      const distanceB = calculateDistance(
        userLat,
        userLng,
        b.location.latitude,
        b.location.longitude
      );
      return ascending ? distanceA - distanceB : distanceB - distanceA;
    } else if (sortBy === 'rating') {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ascending ? ratingA - ratingB : ratingB - ratingA;
    } else if (sortBy === 'price') {
      const priceA = a.menuItems?.[0]?.price || 0;
      const priceB = b.menuItems?.[0]?.price || 0;
      return ascending ? priceA - priceB : priceB - priceA;
    } else if (sortBy === 'priceRange') {
      const rangeA = Math.max(...(a.menuItems?.map(item => item.price) || [0]));
      const rangeB = Math.max(...(b.menuItems?.map(item => item.price) || [0]));
      return ascending ? rangeA - rangeB : rangeB - rangeA;
    } else if (sortBy === 'popularity') {
      const popularityA = a.reviewCount || 0;
      const popularityB = b.reviewCount || 0;
      return ascending ? popularityA - popularityB : popularityB - popularityA;
    } else if (sortBy === 'avgReviewScore') {
      const scoreA = a.reviews?.reduce((sum, review) => sum + review.rating, 0) / (a.reviews?.length || 1) || 0;
      const scoreB = b.reviews?.reduce((sum, review) => sum + review.rating, 0) / (b.reviews?.length || 1) || 0;
      return ascending ? scoreA - scoreB : scoreB - scoreA;
    } else if (sortBy === 'newest') {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    } else {
      // Sort by name
      return ascending
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
  });
};

// Filter food trucks by distance
export const filterFoodTrucksByDistance = (
  trucks: FoodTruck[],
  userLat: number,
  userLng: number,
  maxDistance: number
): FoodTruck[] => {
  return trucks.filter(truck => {
    const distance = calculateDistance(
      userLat,
      userLng,
      truck.location.latitude,
      truck.location.longitude
    );
    return distance <= maxDistance;
  });
};

// Get nearby food trucks with enhanced options and caching
export const getNearbyFoodTrucks = async (
  params: LocationQueryParams & {
    sortBy?: 'distance' | 'rating' | 'name' | 'price' | 'popularity' | 'newest' | 'avgReviewScore' | 'priceRange';
    ascending?: boolean;
    maxDistance?: number;
    minRating?: number;
    maxPrice?: number;
    minPrice?: number;
    tags?: string[];
    cuisine?: string[];
    dietaryRestrictions?: string[];
    openNow?: boolean;
    hasDelivery?: boolean;
    hasTakeout?: boolean;
    hasReservations?: boolean;
    hasParking?: boolean;
    hasWifi?: boolean;
    hasOutdoorSeating?: boolean;
    acceptsCreditCards?: boolean;
    acceptsCashOnly?: boolean;
    isWheelchairAccessible?: boolean;
  }
): Promise<LocationResponse> => {
  try {
    // Create cache key from parameters
    const cacheKey = JSON.stringify(params);
    const cached = foodTruckCache.get(cacheKey);

    // Return cached data if it's still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Validate required parameters
    if (params.lat === undefined || params.lng === undefined) {
      throw new Error('Latitude and longitude are required');
    }

    // Validate latitude range (-90 to 90)
    if (params.lat < -90 || params.lat > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }

    // Validate longitude range (-180 to 180)
    if (params.lng < -180 || params.lng > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }

    // Set default values if not provided
    const queryParams = {
      lat: params.lat,
      lng: params.lng,
      distance: params.distance || 10,
      limit: params.limit || 20,
      minRating: params.minRating,
      maxPrice: params.maxPrice,
      minPrice: params.minPrice,
      tags: params.tags?.join(','),
      cuisine: params.cuisine?.join(','),
      dietaryRestrictions: params.dietaryRestrictions?.join(','),
      openNow: params.openNow,
      hasDelivery: params.hasDelivery,
      hasTakeout: params.hasTakeout,
      hasReservations: params.hasReservations,
      hasParking: params.hasParking,
      hasWifi: params.hasWifi,
      hasOutdoorSeating: params.hasOutdoorSeating,
      acceptsCreditCards: params.acceptsCreditCards,
      acceptsCashOnly: params.acceptsCashOnly,
      isWheelchairAccessible: params.isWheelchairAccessible
    };

    const response = await api.get<LocationResponse>('/locations/nearby', {
      params: queryParams
    });

    let trucks = response.data.items;

    // Apply distance filtering if specified
    if (params.maxDistance) {
      trucks = filterFoodTrucksByDistance(
        trucks,
        params.lat,
        params.lng,
        params.maxDistance
      );
    }

    // Sort trucks based on criteria
    if (params.sortBy) {
      trucks = sortFoodTrucks(trucks, params.lat, params.lng, {
        sortBy: params.sortBy,
        ascending: params.ascending
      });
    }

    const result = {
      items: trucks,
      total: trucks.length
    };

    // Cache the result
    foodTruckCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching nearby food trucks:', error.message);
    } else {
      console.error('Error fetching nearby food trucks:', error);
    }
    throw error;
  }
};

// Clear food truck cache
export const clearFoodTruckCache = (): void => {
  foodTruckCache.clear();
};