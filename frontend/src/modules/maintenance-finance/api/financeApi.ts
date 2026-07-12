import apiClient from "@/shared/lib/apiClient";
import { 
  Vehicle, 
  Trip, 
  MaintenanceLog, 
  FuelLog, 
  Expense 
} from "@/shared/types/database.types";

export const financeApi = {
  // --- Vehicles (Read Only for Module C Forms) ---
  async getVehicles(): Promise<Vehicle[]> {
    const response = await apiClient.get<Vehicle[]>("/finance/vehicles");
    return response.data;
  },

  // --- Trips (Read Only for ROI/Fuel linking) ---
  async getTrips(): Promise<Trip[]> {
    const response = await apiClient.get<Trip[]>("/finance/trips");
    return response.data;
  },

  // --- Maintenance Logs ---
  async getMaintenanceLogs(): Promise<MaintenanceLog[]> {
    const response = await apiClient.get<MaintenanceLog[]>("/finance/maintenance");
    return response.data;
  },

  async createMaintenanceLog(data: Omit<MaintenanceLog, "id" | "created_at">): Promise<MaintenanceLog> {
    const response = await apiClient.post<MaintenanceLog>("/finance/maintenance", data);
    return response.data;
  },

  async closeMaintenanceLog(id: string, endDate: string): Promise<MaintenanceLog> {
    const response = await apiClient.put<MaintenanceLog>(`/finance/maintenance/${id}/close`, { endDate });
    return response.data;
  },

  // --- Fuel Logs ---
  async getFuelLogs(): Promise<FuelLog[]> {
    const response = await apiClient.get<FuelLog[]>("/finance/fuel");
    return response.data;
  },

  async createFuelLog(data: Omit<FuelLog, "id" | "created_at">): Promise<FuelLog> {
    const response = await apiClient.post<FuelLog>("/finance/fuel", data);
    return response.data;
  },

  // --- Expenses ---
  async getExpenses(): Promise<Expense[]> {
    const response = await apiClient.get<Expense[]>("/finance/expenses");
    return response.data;
  },

  async createExpense(data: Omit<Expense, "id" | "created_at">): Promise<Expense> {
    const response = await apiClient.post<Expense>("/finance/expenses", data);
    return response.data;
  },

  // --- Analytics Aggregates ---
  async getReports() {
    const response = await apiClient.get("/finance/analytics");
    return response.data;
  },
};
