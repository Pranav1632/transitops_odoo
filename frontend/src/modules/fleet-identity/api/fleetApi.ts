import apiClient from '../../../shared/lib/apiClient';
import { CreateVehicleInput, UpdateVehicleInput, CreateDriverInput, UpdateDriverInput, SignupInput, LoginInput } from '@/shared/types/database.types';

export interface Vehicle {
  id: string;
  registration_number: string;
  name: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
  region?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  contact_number?: string | null;
  safety_score: number;
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
  created_at: string;
  updated_at: string;
}

export interface ListVehiclesResponse {
  data: Vehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ListDriversResponse {
  data: Driver[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth API
export const signupApi = async (data: SignupInput) => {
  const response = await apiClient.post('/fleet/auth/signup', data);
  return response.data;
};

export const loginApi = async (data: LoginInput) => {
  const response = await apiClient.post('/fleet/auth/login', data);
  return response.data;
};

export const logoutApi = async () => {
  const response = await apiClient.post('/fleet/auth/logout');
  return response.data;
};

// Vehicles API
export const getVehiclesApi = async (params?: { page?: number; limit?: number; status?: string; search?: string; region?: string }): Promise<ListVehiclesResponse> => {
  const response = await apiClient.get<ListVehiclesResponse>('/fleet/vehicles', { params });
  return response.data;
};

export const createVehicleApi = async (data: CreateVehicleInput): Promise<Vehicle> => {
  const response = await apiClient.post<{ data: Vehicle }>('/fleet/vehicles', data);
  return response.data.data;
};

export const updateVehicleApi = async (id: string, data: UpdateVehicleInput): Promise<Vehicle> => {
  const response = await apiClient.put<{ data: Vehicle }>(`/fleet/vehicles/${id}`, data);
  return response.data.data;
};

export const deleteVehicleApi = async (id: string) => {
  const response = await apiClient.delete(`/fleet/vehicles/${id}`);
  return response.data;
};

// Drivers API
export const getDriversApi = async (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<ListDriversResponse> => {
  const response = await apiClient.get<ListDriversResponse>('/fleet/drivers', { params });
  return response.data;
};

export const createDriverApi = async (data: CreateDriverInput): Promise<Driver> => {
  const response = await apiClient.post<{ data: Driver }>('/fleet/drivers', data);
  return response.data.data;
};

export const updateDriverApi = async (id: string, data: UpdateDriverInput): Promise<Driver> => {
  const response = await apiClient.put<{ data: Driver }>(`/fleet/drivers/${id}`, data);
  return response.data.data;
};

export const deleteDriverApi = async (id: string) => {
  const response = await apiClient.delete(`/fleet/drivers/${id}`);
  return response.data;
};

// Fleet KPIs
export const getFleetKpisApi = async () => {
  const response = await apiClient.get('/fleet/kpis');
  return response.data;
};

export const fleetApi = {
  getVehicles: getVehiclesApi,
  getDrivers: getDriversApi,
};
