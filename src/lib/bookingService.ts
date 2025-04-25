import api from './api';

export interface Booking {
  id?: string;
  foodTruckId: string;
  userId?: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  attendees: number;
  specialRequests?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price?: number;
  deposit?: number;
  isPaid?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingListResponse {
  items: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get bookings for a food truck (owner only)
export const getFoodTruckBookings = async (
  foodTruckId: string,
  params: { page?: number; limit?: number; status?: string } = {}
): Promise<BookingListResponse> => {
  const response = await api.get<BookingListResponse>(`/bookings/food-truck/${foodTruckId}`, { params });
  return response.data;
};

// Get user bookings
export const getUserBookings = async (
  params: { page?: number; limit?: number; status?: string } = {}
): Promise<BookingListResponse> => {
  const response = await api.get<BookingListResponse>('/bookings/user/me', { params });
  return response.data;
};

// Get a single booking by ID
export const getBookingById = async (id: string): Promise<Booking> => {
  const response = await api.get<Booking>(`/bookings/${id}`);
  return response.data;
};

// Create a new booking
export const createBooking = async (bookingData: Booking): Promise<Booking> => {
  const response = await api.post<Booking>('/bookings', bookingData);
  return response.data;
};

// Update a booking
export const updateBooking = async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
  const response = await api.put<Booking>(`/bookings/${id}`, bookingData);
  return response.data;
};

// Cancel a booking
export const cancelBooking = async (id: string, reason?: string): Promise<Booking> => {
  const response = await api.post<Booking>(`/bookings/${id}/cancel`, { reason });
  return response.data;
};

// Confirm a booking (owner only)
export const confirmBooking = async (id: string, price?: number): Promise<Booking> => {
  const response = await api.post<Booking>(`/bookings/${id}/confirm`, { price });
  return response.data;
};

// Check food truck availability
export const checkAvailability = async (
  foodTruckId: string,
  params: { date: string; startTime: string; endTime: string }
): Promise<{ available: boolean; conflictingBookings?: Booking[] }> => {
  const response = await api.get<{ available: boolean; conflictingBookings?: Booking[] }>(
    `/bookings/food-truck/${foodTruckId}/availability`,
    { params }
  );
  return response.data;
};