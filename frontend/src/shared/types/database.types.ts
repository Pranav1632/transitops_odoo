export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: "Fleet Manager" | "Dispatcher" | "Safety Officer" | "Financial Analyst";
          name: string;
          created_at: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          registration_number: string;
          model: string;
          status: "Available" | "On Trip" | "In Shop" | "Retired";
          acquisition_cost: number;
          odometer: number;
          created_at: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          name: string;
          license_number: string;
          license_expiry: string;
          status: "Available" | "On Trip" | "Off Duty" | "Suspended";
          created_at: string;
        };
      };
      trips: {
        Row: {
          id: string;
          vehicle_id: string;
          driver_id: string;
          status: "Draft" | "Dispatched" | "Completed" | "Cancelled";
          revenue: number | null;
          actual_distance: number | null;
          cargo_weight: number;
          planned_distance: number;
          source: string;
          destination: string;
          created_at: string;
        };
      };
      maintenance_logs: {
        Row: {
          id: string;
          vehicle_id: string;
          description: string;
          cost: number;
          start_date: string;
          end_date: string | null;
          status: "Active" | "Closed";
          created_at: string;
        };
      };
      fuel_logs: {
        Row: {
          id: string;
          vehicle_id: string;
          liters: number;
          cost: number;
          date: string;
          trip_id: string | null;
          created_at: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          vehicle_id: string;
          type: "Toll" | "Permit" | "Insurance" | "Fine" | "Other";
          amount: number;
          date: string;
          trip_id: string | null;
          created_at: string;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
export type Driver = Database["public"]["Tables"]["drivers"]["Row"] & {
  license_category: string;
  contact_number?: string | null;
  safety_score: number;
  updated_at: string;
};
export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type MaintenanceLog = Database["public"]["Tables"]["maintenance_logs"]["Row"];
export type FuelLog = Database["public"]["Tables"]["fuel_logs"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];

// Input types for create/update operations
export type CreateVehicleInput = Omit<Vehicle, "id" | "created_at" | "updated_at">;
export type UpdateVehicleInput = Partial<CreateVehicleInput>;
export type CreateDriverInput = Omit<Driver, "id" | "created_at" | "updated_at">;
export type UpdateDriverInput = Partial<CreateDriverInput>;

// Auth types
export type SignupInput = {
  email: string;
  password: string;
  fullName: string;
  role: "fleet_manager" | "dispatcher" | "safety_officer" | "financial_analyst";
};

export type LoginInput = {
  email: string;
  password: string;
};

// Pick types defined as minimal column definitions
export type EligibleVehicle = Pick<Vehicle, "id" | "registration_number" | "model" | "status" | "odometer">;
export type EligibleDriver = Pick<Driver, "id" | "name" | "license_expiry" | "status">;
export type VehicleForReporting = Pick<Vehicle, "id" | "registration_number" | "model" | "acquisition_cost">;
