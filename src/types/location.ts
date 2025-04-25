
export interface LocationResult {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface GeocodingResponse {
  results: LocationResult[];
  status: 'OK' | 'ZERO_RESULTS' | 'ERROR';
  error?: string;
}
