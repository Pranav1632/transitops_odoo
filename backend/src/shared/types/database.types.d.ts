export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    full_name: string;
                    role: Database['public']['Enums']['app_role'];
                    created_at: string;
                };
                Insert: {
                    id: string;
                    full_name: string;
                    role: Database['public']['Enums']['app_role'];
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    role?: Database['public']['Enums']['app_role'];
                    created_at?: string;
                };
            };
            vehicles: {
                Row: {
                    id: string;
                    registration_number: string;
                    name: string;
                    type: string;
                    max_load_capacity: number;
                    odometer: number;
                    acquisition_cost: number;
                    status: Database['public']['Enums']['vehicle_status'];
                    region: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    registration_number: string;
                    name: string;
                    type: string;
                    max_load_capacity: number;
                    odometer?: number;
                    acquisition_cost?: number;
                    status?: Database['public']['Enums']['vehicle_status'];
                    region?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    registration_number?: string;
                    name?: string;
                    type?: string;
                    max_load_capacity?: number;
                    odometer?: number;
                    acquisition_cost?: number;
                    status?: Database['public']['Enums']['vehicle_status'];
                    region?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            drivers: {
                Row: {
                    id: string;
                    name: string;
                    license_number: string;
                    license_category: string;
                    license_expiry: string;
                    contact_number: string | null;
                    safety_score: number;
                    status: Database['public']['Enums']['driver_status'];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    license_number: string;
                    license_category: string;
                    license_expiry: string;
                    contact_number?: string | null;
                    safety_score?: number;
                    status?: Database['public']['Enums']['driver_status'];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    license_number?: string;
                    license_category?: string;
                    license_expiry?: string;
                    contact_number?: string | null;
                    safety_score?: number;
                    status?: Database['public']['Enums']['driver_status'];
                    created_at?: string;
                    updated_at?: string;
                };
            };
            trips: {
                Row: {
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
                    status: Database['public']['Enums']['trip_status'];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    source: string;
                    destination: string;
                    vehicle_id: string;
                    driver_id: string;
                    cargo_weight: number;
                    planned_distance: number;
                    actual_distance?: number | null;
                    fuel_consumed?: number | null;
                    revenue?: number | null;
                    status?: Database['public']['Enums']['trip_status'];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    source?: string;
                    destination?: string;
                    vehicle_id?: string;
                    driver_id?: string;
                    cargo_weight?: number;
                    planned_distance?: number;
                    actual_distance?: number | null;
                    fuel_consumed?: number | null;
                    revenue?: number | null;
                    status?: Database['public']['Enums']['trip_status'];
                    created_at?: string;
                    updated_at?: string;
                };
            };
            maintenance_logs: {
                Row: {
                    id: string;
                    vehicle_id: string;
                    description: string;
                    cost: number;
                    status: Database['public']['Enums']['maintenance_status'];
                    service_date: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    vehicle_id: string;
                    description: string;
                    cost?: number;
                    status?: Database['public']['Enums']['maintenance_status'];
                    service_date?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    vehicle_id?: string;
                    description?: string;
                    cost?: number;
                    status?: Database['public']['Enums']['maintenance_status'];
                    service_date?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            fuel_logs: {
                Row: {
                    id: string;
                    vehicle_id: string;
                    trip_id: string | null;
                    liters: number;
                    cost: number;
                    log_date: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    vehicle_id: string;
                    trip_id?: string | null;
                    liters: number;
                    cost?: number;
                    log_date?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    vehicle_id?: string;
                    trip_id?: string | null;
                    liters?: number;
                    cost?: number;
                    log_date?: string;
                    created_at?: string;
                };
            };
            expenses: {
                Row: {
                    id: string;
                    vehicle_id: string;
                    trip_id: string | null;
                    type: string;
                    amount: number;
                    expense_date: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    vehicle_id: string;
                    trip_id?: string | null;
                    type: string;
                    amount?: number;
                    expense_date?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    vehicle_id?: string;
                    trip_id?: string | null;
                    type?: string;
                    amount?: number;
                    expense_date?: string;
                    created_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            vehicle_operational_cost: {
                Args: {
                    v_id: string;
                };
                Returns: number;
            };
        };
        Enums: {
            vehicle_status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
            driver_status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
            trip_status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
            maintenance_status: 'Active' | 'Closed';
            app_role: 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';
        };
    };
}
export type EligibleVehicle = Pick<Database['public']['Tables']['vehicles']['Row'], 'id' | 'registration_number' | 'name' | 'type' | 'max_load_capacity' | 'status'>;
export type EligibleDriver = Pick<Database['public']['Tables']['drivers']['Row'], 'id' | 'name' | 'license_number' | 'license_category' | 'license_expiry' | 'status'>;
export type VehicleForReporting = Pick<Database['public']['Tables']['vehicles']['Row'], 'id' | 'registration_number' | 'name' | 'odometer' | 'acquisition_cost'>;
//# sourceMappingURL=database.types.d.ts.map