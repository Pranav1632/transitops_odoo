"use client";

import { useState, useEffect, useCallback } from "react";
import { financeApi } from "../api/financeApi";
import { 
  MaintenanceLog, 
  FuelLog, 
  Expense, 
  Vehicle, 
  Trip 
} from "@/shared/types/database.types";
import { toast } from "sonner";

// Define proper type for reports data
interface ReportsData {
  kpis: {
    totalRevenue: number;
    totalExpenses: number;
    totalFuelCost: number;
    totalMaintenanceCost: number;
    profitMargin: number;
    vehiclesCount: number;
    tripsCount: number;
    avgTripDistance: number;
    avgFuelEfficiency: number;
  };
  vehicleROIs: Array<{
    reg_number: string;
    model: string;
    revenue: number;
    total_costs: number;
    roi: number;
  }>;
  monthlyData: Array<{ month: string; Revenue: number; Expenses: number }>;
  costliestVehicles: Array<{ name: string; cost: number }>;
  topVehicles: Array<{ name: string; cost: number }>;
  monthlyRevenue: Array<{ month: string; Revenue: number; Expenses: number }>;
  monthlyExpenses: Array<{ month: string; cost: number }>;
}

export function useReports() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Analytics state
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);

  // Loadings
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [loadingFuel, setLoadingFuel] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchVehiclesAndTrips = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const [vList, tList] = await Promise.all([
        financeApi.getVehicles(),
        financeApi.getTrips()
      ]);
      setVehicles(vList);
      setTrips(tList);
    } catch (err) {
      toast.error("Failed to load vehicle data");
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  const fetchMaintenance = useCallback(async () => {
    setLoadingMaintenance(true);
    try {
      const data = await financeApi.getMaintenanceLogs();
      setMaintenanceLogs(data);
    } catch (err) {
      toast.error("Failed to load maintenance records");
    } finally {
      setLoadingMaintenance(false);
    }
  }, []);

  const fetchFuelLogs = useCallback(async () => {
    setLoadingFuel(true);
    try {
      const data = await financeApi.getFuelLogs();
      setFuelLogs(data);
    } catch (err) {
      toast.error("Failed to load fuel logs");
    } finally {
      setLoadingFuel(false);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const data = await financeApi.getExpenses();
      setExpenses(data);
    } catch (err) {
      toast.error("Failed to load expense records");
    } finally {
      setLoadingExpenses(false);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const data = await financeApi.getReports();
      setReportsData(data);
    } catch (err) {
      toast.error("Failed to compile financial aggregates");
    } finally {
      setLoadingReports(false);
    }
  }, []);

  // Actions
  const addMaintenanceLog = async (data: Omit<MaintenanceLog, "id" | "created_at">) => {
    try {
      const newLog = await financeApi.createMaintenanceLog(data);
      setMaintenanceLogs((prev) => [newLog, ...prev]);
      toast.success("Maintenance log created successfully!");
      // Refresh vehicles (to get In Shop status update) and reports
      fetchVehiclesAndTrips();
      fetchReports();
    } catch (err) {
      toast.error("Failed to create maintenance log");
    }
  };

  const closeMaintenance = async (id: string, endDate: string) => {
    try {
      const closedLog = await financeApi.closeMaintenanceLog(id, endDate);
      setMaintenanceLogs((prev) => 
        prev.map((log) => log.id === id ? closedLog : log)
      );
      toast.success("Maintenance service log closed");
      // Refresh vehicles (to restore Available status) and reports
      fetchVehiclesAndTrips();
      fetchReports();
    } catch (err) {
      toast.error("Failed to close maintenance log");
    }
  };

  const addFuelLog = async (data: Omit<FuelLog, "id" | "created_at">) => {
    try {
      const newLog = await financeApi.createFuelLog(data);
      setFuelLogs((prev) => [newLog, ...prev]);
      toast.success("Fuel transaction logged successfully");
      fetchReports();
    } catch (err) {
      toast.error("Failed to save fuel log");
    }
  };

  const addExpense = async (data: Omit<Expense, "id" | "created_at">) => {
    try {
      const newExpense = await financeApi.createExpense(data);
      setExpenses((prev) => [newExpense, ...prev]);
      toast.success("Expense logged successfully");
      fetchReports();
    } catch (err) {
      toast.error("Failed to save expense log");
    }
  };

  // Initial fetches
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchVehiclesAndTrips();
        await fetchMaintenance();
        await fetchFuelLogs();
        await fetchExpenses();
        await fetchReports();
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [fetchVehiclesAndTrips, fetchMaintenance, fetchFuelLogs, fetchExpenses, fetchReports]);

  return {
    vehicles,
    trips,
    maintenanceLogs,
    fuelLogs,
    expenses,
    reportsData,
    
    loadingVehicles,
    loadingMaintenance,
    loadingFuel,
    loadingExpenses,
    loadingReports,

    addMaintenanceLog,
    closeMaintenance,
    addFuelLog,
    addExpense,
    
    refreshAll: () => {
      fetchVehiclesAndTrips();
      fetchMaintenance();
      fetchFuelLogs();
      fetchExpenses();
      fetchReports();
    }
  };
}
