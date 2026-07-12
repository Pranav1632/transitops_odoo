import apiClient from '../../../shared/lib/apiClient';

export interface EligibleVehicle {
  id: string;
  registration_number: string;
  name: string;
  type: string;
  max_load_capacity: number;
  status: string;
}

export interface EligibleDriver {
  id: string;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  status: string;
}

export interface EligibilityData {
  vehicles: EligibleVehicle[];
  drivers: EligibleDriver[];
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight: number;
  planned_distance: number;
  actual_distance: number | null;
  fuel_consumed: number | null;
  revenue: number | null;
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at: string;
  vehicle_registration?: string;
  vehicle_name?: string;
  driver_name?: string;
}

export interface ListTripsResponse {
  success: boolean;
  trips: Trip[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateTripInput {
  source: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight: number;
  planned_distance: number;
}

export interface CompleteTripInput {
  actual_distance: number;
  fuel_consumed: number;
  revenue: number;
}

export interface TripKPIs {
  activeTrips: number;
  pendingTrips: number;
}

export const tripApi = {
  getEligibility: async (): Promise<EligibilityData> => {
    const response = await apiClient.get<{ success: boolean; data: EligibilityData }>('/trips/eligibility');
    return response.data.data;
  },

  getTrips: async (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<ListTripsResponse> => {
    const response = await apiClient.get<ListTripsResponse>('/trips', { params });
    return response.data;
  },

  createTrip: async (data: CreateTripInput): Promise<Trip> => {
    const response = await apiClient.post<{ success: boolean; data: Trip }>('/trips', data);
    return response.data.data;
  },

  dispatchTrip: async (id: string): Promise<Trip> => {
    const response = await apiClient.patch<{ success: boolean; data: Trip }>(`/trips/${id}/dispatch`);
    return response.data.data;
  },

  completeTrip: async (id: string, data: CompleteTripInput): Promise<Trip> => {
    const response = await apiClient.patch<{ success: boolean; data: Trip }>(`/trips/${id}/complete`, data);
    return response.data.data;
  },

  cancelTrip: async (id: string): Promise<Trip> => {
    const response = await apiClient.patch<{ success: boolean; data: Trip }>(`/trips/${id}/cancel`);
    return response.data.data;
  },

  getKPIs: async (): Promise<TripKPIs> => {
    const response = await apiClient.get<{ success: boolean; data: TripKPIs }>('/trips/kpis');
    return response.data.data;
  }
};
export default tripApi;
