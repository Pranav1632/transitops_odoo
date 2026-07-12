import { apiClient } from '../../../shared/lib/apiClient';

// --- Authentication ---
export async function signupApi(data: any) {
  const response = await apiClient.post('/fleet/auth/signup', data);
  return response.data;
}

export async function loginApi(data: any) {
  const response = await apiClient.post('/fleet/auth/login', data);
  return response.data;
}

export async function logoutApi() {
  const response = await apiClient.post('/fleet/auth/logout');
  return response.data;
}

// --- Vehicles CRUD ---
export async function getVehiclesApi(params: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  region?: string;
  search?: string;
}) {
  const response = await apiClient.get('/fleet/vehicles', { params });
  return response.data;
}

export async function getVehicleApi(id: string) {
  const response = await apiClient.get(`/fleet/vehicles/${id}`);
  return response.data;
}

export async function createVehicleApi(data: any) {
  const response = await apiClient.post('/fleet/vehicles', data);
  return response.data;
}

export async function updateVehicleApi(id: string, data: any) {
  const response = await apiClient.put(`/fleet/vehicles/${id}`, data);
  return response.data;
}

export async function deleteVehicleApi(id: string) {
  const response = await apiClient.delete(`/fleet/vehicles/${id}`);
  return response.data;
}

// --- Drivers CRUD ---
export async function getDriversApi(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const response = await apiClient.get('/fleet/drivers', { params });
  return response.data;
}

export async function getDriverApi(id: string) {
  const response = await apiClient.get(`/fleet/drivers/${id}`);
  return response.data;
}

export async function createDriverApi(data: any) {
  const response = await apiClient.post('/fleet/drivers', data);
  return response.data;
}

export async function updateDriverApi(id: string, data: any) {
  const response = await apiClient.put(`/fleet/drivers/${id}`, data);
  return response.data;
}

export async function deleteDriverApi(id: string) {
  const response = await apiClient.delete(`/fleet/drivers/${id}`);
  return response.data;
}

// --- KPI Metrics ---
export async function getFleetKpisApi() {
  const response = await apiClient.get('/fleet/kpis');
  return response.data;
}
