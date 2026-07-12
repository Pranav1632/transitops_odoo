import { 
  Vehicle, 
  Trip, 
  MaintenanceLog, 
  FuelLog, 
  Expense 
} from "@/shared/types/database.types";

// Seed Data helper
const SEED_VEHICLES: Vehicle[] = [
  { id: "v_ टाटा_01", registration_number: "MH-12-GQ-5524", model: "Tata Ultra 1518", status: "Available", acquisition_cost: 3200000, odometer: 42100, created_at: new Date().toISOString() },
  { id: "v_ benz_02", registration_number: "MH-12-RT-8841", model: "BharatBenz 2823R", status: "In Shop", acquisition_cost: 4500000, odometer: 18500, created_at: new Date().toISOString() },
  { id: "v_ eicher_03", registration_number: "MH-14-EU-3312", model: "Eicher Pro 3015", status: "On Trip", acquisition_cost: 2800000, odometer: 56300, created_at: new Date().toISOString() },
  { id: "v_ winger_04", registration_number: "MH-12-AB-9901", model: "Tata Winger 15S", status: "Retired", acquisition_cost: 1600000, odometer: 182400, created_at: new Date().toISOString() },
];

const SEED_TRIPS: Trip[] = [
  { id: "t_01", vehicle_id: "v_ टाटा_01", driver_id: "d_01", status: "Completed", revenue: 52000, actual_distance: 720, cargo_weight: 4500, planned_distance: 700, source: "Pune", destination: "Mumbai", created_at: "2026-07-02T10:00:00Z" },
  { id: "t_02", vehicle_id: "v_ eicher_03", driver_id: "d_02", status: "Completed", revenue: 45000, actual_distance: 650, cargo_weight: 3800, planned_distance: 650, source: "Pune", destination: "Nashik", created_at: "2026-07-05T08:00:00Z" },
  { id: "t_03", vehicle_id: "v_ benz_02", driver_id: "d_03", status: "Completed", revenue: 78000, actual_distance: 980, cargo_weight: 8000, planned_distance: 950, source: "Mumbai", destination: "Bengaluru", created_at: "2026-07-08T06:00:00Z" },
];

const SEED_MAINTENANCE: MaintenanceLog[] = [
  { id: "m_01", vehicle_id: "v_ टाटा_01", description: "Oil Change & General Service", cost: 8500, start_date: "2026-06-10", end_date: "2026-06-11", status: "Closed", created_at: "2026-06-10T09:00:00Z" },
  { id: "m_02", vehicle_id: "v_ benz_02", description: "Brake Pad Replacement & Air Filter", cost: 12000, start_date: "2026-07-11", end_date: null, status: "Active", created_at: "2026-07-11T14:30:00Z" },
];

const SEED_FUEL: FuelLog[] = [
  { id: "f_01", vehicle_id: "v_ टाटा_01", liters: 120, cost: 11400, date: "2026-07-02", trip_id: "t_01", created_at: "2026-07-02T12:00:00Z" },
  { id: "f_02", vehicle_id: "v_ eicher_03", liters: 150, cost: 14250, date: "2026-07-05", trip_id: "t_02", created_at: "2026-07-05T10:00:00Z" },
  { id: "f_03", vehicle_id: "v_ benz_02", liters: 200, cost: 19000, date: "2026-07-08", trip_id: "t_03", created_at: "2026-07-08T09:00:00Z" },
];

const SEED_EXPENSES: Expense[] = [
  { id: "e_01", vehicle_id: "v_ टाटा_01", type: "Toll", amount: 2400, date: "2026-07-02", trip_id: "t_01", created_at: "2026-07-02T12:05:00Z" },
  { id: "e_02", vehicle_id: "v_ eicher_03", type: "Permit", amount: 4500, date: "2026-07-03", trip_id: null, created_at: "2026-07-03T11:00:00Z" },
  { id: "e_03", vehicle_id: "v_ benz_02", type: "Toll", amount: 3200, date: "2026-07-08", trip_id: "t_03", created_at: "2026-07-08T09:05:00Z" },
  { id: "e_04", vehicle_id: "v_ winger_04", type: "Insurance", amount: 15000, date: "2026-06-15", trip_id: null, created_at: "2026-06-15T15:00:00Z" },
];

function getStore<T>(key: string, initial: T[]): T[] {
  if (typeof window === "undefined") return initial;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw);
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// Simulated latency to show skeleton screens
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

export const financeApi = {
  // --- Vehicles (Read Only for Module C Forms) ---
  async getVehicles(): Promise<Vehicle[]> {
    await delay(300);
    return getStore<Vehicle>("transitops_vehicles", SEED_VEHICLES);
  },

  // --- Trips (Read Only for ROI/Fuel linking) ---
  async getTrips(): Promise<Trip[]> {
    await delay(300);
    return getStore<Trip>("transitops_trips", SEED_TRIPS);
  },

  // --- Maintenance Logs ---
  async getMaintenanceLogs(): Promise<MaintenanceLog[]> {
    await delay(700);
    return getStore<MaintenanceLog>("transitops_maintenance_logs", SEED_MAINTENANCE);
  },

  async createMaintenanceLog(data: Omit<MaintenanceLog, "id" | "created_at">): Promise<MaintenanceLog> {
    await delay(600);
    const logs = getStore<MaintenanceLog>("transitops_maintenance_logs", SEED_MAINTENANCE);
    const vehicles = getStore<Vehicle>("transitops_vehicles", SEED_VEHICLES);

    const newLog: MaintenanceLog = {
      ...data,
      id: "m_" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setStore("transitops_maintenance_logs", logs);

    // TRIGGER logic: flips vehicle status to In Shop if maintenance is Active
    if (newLog.status === "Active") {
      const updatedVehicles = vehicles.map((v) => 
        v.id === newLog.vehicle_id ? { ...v, status: "In Shop" as const } : v
      );
      setStore("transitops_vehicles", updatedVehicles);
    }

    return newLog;
  },

  async closeMaintenanceLog(id: string, endDate: string): Promise<MaintenanceLog> {
    await delay(500);
    const logs = getStore<MaintenanceLog>("transitops_maintenance_logs", SEED_MAINTENANCE);
    const vehicles = getStore<Vehicle>("transitops_vehicles", SEED_VEHICLES);

    let updatedLog: MaintenanceLog | null = null;
    const updatedLogs = logs.map((log) => {
      if (log.id === id) {
        updatedLog = { ...log, status: "Closed" as const, end_date: endDate };
        return updatedLog;
      }
      return log;
    });

    if (!updatedLog) {
      throw new Error("Maintenance record not found");
    }

    setStore("transitops_maintenance_logs", updatedLogs);

    // TRIGGER logic: restores vehicle to Available (unless status is Retired)
    const logVal = updatedLog as MaintenanceLog;
    const updatedVehicles = vehicles.map((v) => {
      if (v.id === logVal.vehicle_id) {
        const nextStatus = v.status === "Retired" ? "Retired" : ("Available" as const);
        return { ...v, status: nextStatus };
      }
      return v;
    });
    setStore("transitops_vehicles", updatedVehicles);

    return updatedLog;
  },

  // --- Fuel Logs ---
  async getFuelLogs(): Promise<FuelLog[]> {
    await delay(600);
    return getStore<FuelLog>("transitops_fuel_logs", SEED_FUEL);
  },

  async createFuelLog(data: Omit<FuelLog, "id" | "created_at">): Promise<FuelLog> {
    await delay(500);
    const logs = getStore<FuelLog>("transitops_fuel_logs", SEED_FUEL);
    const newLog: FuelLog = {
      ...data,
      id: "f_" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setStore("transitops_fuel_logs", logs);
    return newLog;
  },

  // --- Expenses ---
  async getExpenses(): Promise<Expense[]> {
    await delay(600);
    return getStore<Expense>("transitops_expenses", SEED_EXPENSES);
  },

  async createExpense(data: Omit<Expense, "id" | "created_at">): Promise<Expense> {
    await delay(500);
    const list = getStore<Expense>("transitops_expenses", SEED_EXPENSES);
    const newExpense: Expense = {
      ...data,
      id: "e_" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };
    list.unshift(newExpense);
    setStore("transitops_expenses", list);
    return newExpense;
  },

  // --- Analytics Aggregates (RPC equivalents) ---
  async getReports() {
    await delay(800); // loading aggregates is slower query

    const vehicles = getStore<Vehicle>("transitops_vehicles", SEED_VEHICLES);
    const trips = getStore<Trip>("transitops_trips", SEED_TRIPS);
    const maintenance = getStore<MaintenanceLog>("transitops_maintenance_logs", SEED_MAINTENANCE);
    const fuel = getStore<FuelLog>("transitops_fuel_logs", SEED_FUEL);
    const expenses = getStore<Expense>("transitops_expenses", SEED_EXPENSES);

    // 1. Total Cost
    const totalFuelCost = fuel.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenseAmount;

    // 2. Fuel Efficiency = sum(trips.actual_distance) / sum(fuel.liters)
    const totalDistance = trips.reduce((sum, t) => sum + (t.actual_distance || 0), 0);
    const totalLiters = fuel.reduce((sum, f) => sum + f.liters, 0);
    const fuelEfficiency = totalLiters > 0 ? totalDistance / totalLiters : 0;

    // 3. Fleet Utilization % (mock time-windowed ratio)
    // Formula: (vehicles in On Trip + Available) / total vehicles
    const activeVehicles = vehicles.filter((v) => v.status === "Available" || v.status === "On Trip").length;
    const utilizationRate = vehicles.length > 0 ? (activeVehicles / vehicles.length) * 100 : 0;

    // 4. Vehicle ROI = (sum(trips.revenue) - (maintenance + fuel)) / acquisition_cost
    // Calculate overall fleet ROI
    const totalRevenue = trips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const totalAcquisitionCost = vehicles.reduce((sum, v) => sum + v.acquisition_cost, 0);
    const overallROI = totalAcquisitionCost > 0 
      ? ((totalRevenue - (totalFuelCost + totalMaintenanceCost)) / totalAcquisitionCost) * 100 
      : 0;

    // ROI per vehicle list for reporting
    const vehicleROIs = vehicles.map((v) => {
      const vTrips = trips.filter((t) => t.vehicle_id === v.id);
      const vMaint = maintenance.filter((m) => m.vehicle_id === v.id);
      const vFuel = fuel.filter((f) => f.vehicle_id === v.id);

      const rev = vTrips.reduce((s, t) => s + (t.revenue || 0), 0);
      const mCost = vMaint.reduce((s, m) => s + m.cost, 0);
      const fCost = vFuel.reduce((s, f) => s + f.cost, 0);

      const roi = v.acquisition_cost > 0 ? ((rev - (mCost + fCost)) / v.acquisition_cost) * 100 : 0;
      return {
        vehicle_id: v.id,
        reg_number: v.registration_number,
        model: v.model,
        revenue: rev,
        total_costs: mCost + fCost,
        roi: Number(roi.toFixed(2)),
      };
    });

    // 5. Costliest vehicles (sum of maintenance + fuel)
    const costliestVehicles = vehicles.map((v) => {
      const vMaint = maintenance.filter((m) => m.vehicle_id === v.id).reduce((s, m) => s + m.cost, 0);
      const vFuel = fuel.filter((f) => f.vehicle_id === v.id).reduce((s, f) => s + f.cost, 0);
      const vExp = expenses.filter((e) => e.vehicle_id === v.id).reduce((s, e) => s + e.amount, 0);
      return {
        name: `${v.model} (${v.registration_number})`,
        cost: vMaint + vFuel + vExp,
      };
    }).sort((a, b) => b.cost - a.cost).slice(0, 5);

    // 6. Monthly Revenues vs Expenses
    // We group by mock months from dates (assuming June and July 2026 based on seed)
    const monthlyData = [
      { month: "June 26", Revenue: 35000, Expenses: 23500 },
      { month: "July 26", Revenue: totalRevenue, Expenses: totalOperationalCost },
    ];

    return {
      kpis: {
        totalOperationalCost,
        fuelEfficiency: Number(fuelEfficiency.toFixed(2)),
        utilizationRate: Number(utilizationRate.toFixed(1)),
        overallROI: Number(overallROI.toFixed(2)),
      },
      monthlyData,
      costliestVehicles,
      vehicleROIs,
    };
  },
};
