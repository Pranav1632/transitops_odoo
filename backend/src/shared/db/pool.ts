// Mock Database Pool for local testing and validation of Module B
class MockPoolClient {
  private inTransaction = false;

  async query(text: string, params: any[] = []) {
    const cleanedText = text.replace(/\s+/g, ' ').trim();

    // 1. Transaction statements
    if (cleanedText === 'BEGIN') {
      this.inTransaction = true;
      return { rows: [] };
    }
    if (cleanedText === 'COMMIT' || cleanedText === 'ROLLBACK') {
      this.inTransaction = false;
      return { rows: [] };
    }

    // 2. Eligibility Queries
    if (cleanedText.includes("FROM vehicles WHERE status = 'Available'")) {
      return { rows: mockVehicles.filter(v => v.status === 'Available') };
    }
    if (cleanedText.includes("FROM drivers WHERE status = 'Available'")) {
      const now = new Date();
      return {
        rows: mockDrivers.filter(d => d.status === 'Available' && new Date(d.license_expiry) > now)
      };
    }

    // 3. Trip creation capacity and availability checks
    if (cleanedText.includes('SELECT status, max_load_capacity, name FROM vehicles WHERE id = $1')) {
      const vehicleId = params[0];
      const vehicle = mockVehicles.find(v => v.id === vehicleId);
      return { rows: vehicle ? [vehicle] : [] };
    }
    if (cleanedText.includes('SELECT status, license_expiry, name FROM drivers WHERE id = $1')) {
      const driverId = params[0];
      const driver = mockDrivers.find(d => d.id === driverId);
      return { rows: driver ? [driver] : [] };
    }

    // 4. Create trip insert
    if (cleanedText.includes('INSERT INTO trips')) {
      const newTrip = {
        id: 'trip-new-uuid',
        source: params[0],
        destination: params[1],
        vehicle_id: params[2],
        driver_id: params[3],
        cargo_weight: params[4],
        planned_distance: params[5],
        actual_distance: null,
        fuel_consumed: null,
        revenue: null,
        status: 'Draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockTrips.push(newTrip);
      return { rows: [newTrip] };
    }

    // 5. Dispatch trip status update
    if (cleanedText.includes("status = 'Dispatched'") && cleanedText.includes("status = 'Draft'")) {
      const tripId = params[0];
      const trip = mockTrips.find(t => t.id === tripId);
      if (trip && trip.status === 'Draft') {
        trip.status = 'Dispatched';
        // Sync vehicle/driver status (trigger simulation)
        const v = mockVehicles.find(veh => veh.id === trip.vehicle_id);
        if (v) v.status = 'On Trip';
        const d = mockDrivers.find(drv => drv.id === trip.driver_id);
        if (d) d.status = 'On Trip';
        return { rows: [trip] };
      }
      return { rows: [] };
    }

    // 6. Complete trip status update
    if (cleanedText.includes("status = 'Completed'") && cleanedText.includes("status = 'Dispatched'")) {
      const tripId = params[0];
      const trip = mockTrips.find(t => t.id === tripId);
      if (trip && trip.status === 'Dispatched') {
        trip.status = 'Completed';
        trip.actual_distance = params[1];
        trip.fuel_consumed = params[2];
        trip.revenue = params[3];
        // Sync vehicle/driver status (trigger simulation)
        const v = mockVehicles.find(veh => veh.id === trip.vehicle_id);
        if (v) {
          v.status = 'Available';
          v.odometer = Number(v.odometer) + Number(params[1]);
        }
        const d = mockDrivers.find(drv => drv.id === trip.driver_id);
        if (d) d.status = 'Available';
        return { rows: [trip] };
      }
      return { rows: [] };
    }

    // 7. Cancel trip status update
    if (cleanedText.includes("status = 'Cancelled'")) {
      const tripId = params[0];
      const trip = mockTrips.find(t => t.id === tripId);
      if (trip && (trip.status === 'Draft' || trip.status === 'Dispatched')) {
        const oldStatus = trip.status;
        trip.status = 'Cancelled';
        if (oldStatus === 'Dispatched') {
          const v = mockVehicles.find(veh => veh.id === trip.vehicle_id);
          if (v) v.status = 'Available';
          const d = mockDrivers.find(drv => drv.id === trip.driver_id);
          if (d) d.status = 'Available';
        }
        return { rows: [trip] };
      }
      return { rows: [] };
    }

    // 8. General status checks
    if (cleanedText.includes('SELECT status FROM trips WHERE id = $1')) {
      const tripId = params[0];
      const trip = mockTrips.find(t => t.id === tripId);
      return { rows: trip ? [{ status: trip.status }] : [] };
    }
    if (cleanedText.includes('SELECT status, vehicle_id FROM trips WHERE id = $1')) {
      const tripId = params[0];
      const trip = mockTrips.find(t => t.id === tripId);
      return { rows: trip ? [{ status: trip.status, vehicle_id: trip.vehicle_id }] : [] };
    }

    // 9. Odometer update client query
    if (cleanedText.includes('UPDATE vehicles SET odometer = odometer + $2')) {
      return { rows: [] };
    }

    // 10. List trips and counts
    if (cleanedText.includes('COUNT(*) FROM trips')) {
      return { rows: [{ count: mockTrips.length.toString() }] };
    }
    if (cleanedText.includes('SELECT t.id, t.source, t.destination')) {
      const mapped = mockTrips.map(t => {
        const vehicle = mockVehicles.find(v => v.id === t.vehicle_id);
        const driver = mockDrivers.find(d => d.id === t.driver_id);
        return {
          ...t,
          vehicle_registration: vehicle?.registration_number || 'REG-MOCK',
          vehicle_name: vehicle?.name || 'Vehicle Mock',
          driver_name: driver?.name || 'Driver Mock'
        };
      });
      return { rows: mapped };
    }

    // 11. KPI count checks
    if (cleanedText === "SELECT COUNT(*) FROM trips WHERE status = 'Dispatched'") {
      const count = mockTrips.filter(t => t.status === 'Dispatched').length;
      return { rows: [{ count: count.toString() }] };
    }
    if (cleanedText === "SELECT COUNT(*) FROM trips WHERE status = 'Draft'") {
      const count = mockTrips.filter(t => t.status === 'Draft').length;
      return { rows: [{ count: count.toString() }] };
    }

    return { rows: [] };
  }

  release() {}
}

const mockVehicles = [
  { id: 'veh-1-uuid', registration_number: 'VAN-101', name: 'Sprinter Cargo Van', type: 'Van', max_load_capacity: 1000, odometer: 15000, status: 'Available' },
  { id: 'veh-2-uuid', registration_number: 'TRK-202', name: 'Heavy Duty Flatbed', type: 'Truck', max_load_capacity: 5000, odometer: 42000, status: 'Available' },
  { id: 'veh-3-uuid', registration_number: 'SHOP-99', name: 'Broken Truck', type: 'Truck', max_load_capacity: 5000, odometer: 88000, status: 'In Shop' }
];

const mockDrivers = [
  { id: 'drv-1-uuid', name: 'Jane Doe', license_number: 'LIC-JD-1', license_category: 'Class A', license_expiry: '2028-12-31', status: 'Available' },
  { id: 'drv-2-uuid', name: 'John Smith', license_number: 'LIC-JS-2', license_category: 'Class B', license_expiry: '2027-06-30', status: 'Available' },
  { id: 'drv-3-uuid', name: 'Expired Driver', license_number: 'LIC-EXP', license_category: 'Class B', license_expiry: '2025-01-01', status: 'Available' }
];

const mockTrips: any[] = [
  {
    id: 'trip-1-uuid',
    source: 'Factory A',
    destination: 'Depot B',
    vehicle_id: 'veh-1-uuid',
    driver_id: 'drv-1-uuid',
    cargo_weight: 400,
    planned_distance: 85,
    actual_distance: null,
    fuel_consumed: null,
    revenue: null,
    status: 'Draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const pool = {
  query: async (text: string, params: any[] = []) => {
    const client = new MockPoolClient();
    return client.query(text, params);
  },
  connect: async () => {
    return new MockPoolClient();
  }
};

export default pool;
