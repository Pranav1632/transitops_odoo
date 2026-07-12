import { pool } from '../../../shared/db/pool.js';
import { getIO } from '../../../shared/socket/io.js';
import type { CreateTripInput, CompleteTripInput } from '../validators/validators.js';

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
}

export class TripService {
  /**
   * Helper to emit socket events for real-time live board updates
   */
  private emitStatusChange(trip: any) {
    try {
      const io = getIO();
      if (io) {
        io.emit('trip_status_updated', trip);
      }
    } catch (error) {
      // Fail-safe logging if Socket.io is not fully initialized or configured by Phase 0
      console.warn('Socket emit failed, continuing execution:', error);
    }
  }

  /**
   * Create a new trip in 'Draft' state
   * Enforces server-side checks for cargo weight and vehicle/driver availability
   */
  async createTrip(data: CreateTripInput): Promise<Trip> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch and validate vehicle capacity and availability
      const vehicleRes = await client.query(
        'SELECT status, max_load_capacity, name FROM vehicles WHERE id = $1 FOR UPDATE',
        [data.vehicle_id]
      );
      if (vehicleRes.rows.length === 0) {
        throw new Error('Vehicle not found');
      }
      const vehicle = vehicleRes.rows[0];
      if (vehicle.status !== 'Available') {
        throw new Error(`Vehicle "${vehicle.name}" is currently ${vehicle.status} and not available`);
      }
      if (Number(data.cargo_weight) > Number(vehicle.max_load_capacity)) {
        throw new Error(
          `Cargo weight (${data.cargo_weight}kg) exceeds vehicle max capacity (${vehicle.max_load_capacity}kg)`
        );
      }

      // 2. Fetch and validate driver availability and license expiry
      const driverRes = await client.query(
        'SELECT status, license_expiry, name FROM drivers WHERE id = $1 FOR UPDATE',
        [data.driver_id]
      );
      if (driverRes.rows.length === 0) {
        throw new Error('Driver not found');
      }
      const driver = driverRes.rows[0];
      if (driver.status !== 'Available') {
        throw new Error(`Driver "${driver.name}" is currently ${driver.status} and not available`);
      }
      const expiryDate = new Date(driver.license_expiry);
      if (expiryDate <= new Date()) {
        throw new Error(`Driver "${driver.name}" cannot be assigned because their license has expired`);
      }

      // 3. Create trip in Draft state
      const insertQuery = `
        INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'Draft')
        RETURNING *
      `;
      const tripRes = await client.query(insertQuery, [
        data.source,
        data.destination,
        data.vehicle_id,
        data.driver_id,
        data.cargo_weight,
        data.planned_distance
      ]);

      await client.query('COMMIT');
      const newTrip = tripRes.rows[0];
      this.emitStatusChange(newTrip);
      return newTrip;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Dispatch a trip (Draft -> Dispatched)
   * Idempotent check ensures current status is 'Draft'
   */
  async dispatchTrip(id: string): Promise<Trip> {
    const query = `
      UPDATE trips
      SET status = 'Dispatched', updated_at = NOW()
      WHERE id = $1 AND status = 'Draft'
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      // Check if trip exists and what the current status is
      const checkRes = await pool.query('SELECT status FROM trips WHERE id = $1', [id]);
      if (checkRes.rows.length === 0) {
        throw new Error('Trip not found');
      }
      const currentStatus = checkRes.rows[0].status;
      if (currentStatus === 'Dispatched') {
        throw new Error('Trip is already dispatched');
      }
      throw new Error(`Cannot dispatch trip. Current status is "${currentStatus}"`);
    }

    const updatedTrip = result.rows[0];
    this.emitStatusChange(updatedTrip);
    return updatedTrip;
  }

  /**
   * Complete a trip (Dispatched -> Completed)
   * Idempotent check ensures current status is 'Dispatched'
   */
  async completeTrip(id: string, data: CompleteTripInput): Promise<Trip> {
    // 1. Fetch the trip to check current odometer if needed, and verify status
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const tripRes = await client.query(
        'SELECT status, vehicle_id FROM trips WHERE id = $1 FOR UPDATE',
        [id]
      );
      if (tripRes.rows.length === 0) {
        throw new Error('Trip not found');
      }
      const trip = tripRes.rows[0];
      if (trip.status !== 'Dispatched') {
        if (trip.status === 'Completed') {
          throw new Error('Trip is already completed');
        }
        throw new Error(`Cannot complete trip. Current status is "${trip.status}"`);
      }

      // 2. Update trip metrics and transition status to 'Completed'
      const updateTripQuery = `
        UPDATE trips
        SET status = 'Completed',
            actual_distance = $2,
            fuel_consumed = $3,
            revenue = $4,
            updated_at = NOW()
        WHERE id = $1 AND status = 'Dispatched'
        RETURNING *
      `;
      const updateRes = await client.query(updateTripQuery, [
        id,
        data.actual_distance,
        data.fuel_consumed,
        data.revenue
      ]);

      await client.query('COMMIT');
      const completedTrip = updateRes.rows[0];
      this.emitStatusChange(completedTrip);
      return completedTrip;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cancel a trip (Draft or Dispatched -> Cancelled)
   * Idempotent check ensures current status is Draft or Dispatched
   */
  async cancelTrip(id: string): Promise<Trip> {
    const query = `
      UPDATE trips
      SET status = 'Cancelled', updated_at = NOW()
      WHERE id = $1 AND status IN ('Draft', 'Dispatched')
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      const checkRes = await pool.query('SELECT status FROM trips WHERE id = $1', [id]);
      if (checkRes.rows.length === 0) {
        throw new Error('Trip not found');
      }
      const currentStatus = checkRes.rows[0].status;
      if (currentStatus === 'Cancelled') {
        throw new Error('Trip is already cancelled');
      }
      throw new Error(`Cannot cancel trip. Current status is "${currentStatus}"`);
    }

    const cancelledTrip = result.rows[0];
    this.emitStatusChange(cancelledTrip);
    return cancelledTrip;
  }

  /**
   * Paginated list of trips with status and search filters
   */
  async listTrips(filters: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 10));
    const offset = (page - 1) * limit;

    const queryParams: any[] = [];
    let countQuery = `
      SELECT COUNT(*)
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      WHERE 1=1
    `;

    let dataQuery = `
      SELECT 
        t.id, 
        t.source, 
        t.destination, 
        t.cargo_weight::float as cargo_weight, 
        t.planned_distance::float as planned_distance, 
        t.actual_distance::float as actual_distance, 
        t.fuel_consumed::float as fuel_consumed, 
        t.revenue::float as revenue, 
        t.status, 
        t.created_at, 
        t.updated_at,
        t.vehicle_id,
        t.driver_id,
        v.registration_number as vehicle_registration,
        v.name as vehicle_name,
        d.name as driver_name
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      WHERE 1=1
    `;

    // Filter by status
    if (filters.status) {
      queryParams.push(filters.status);
      const paramPlaceholder = `$${queryParams.length}`;
      countQuery += ` AND t.status = ${paramPlaceholder}`;
      dataQuery += ` AND t.status = ${paramPlaceholder}`;
    }

    // Filter by search string (source, destination, vehicle registration, driver name)
    if (filters.search) {
      queryParams.push(`%${filters.search}%`);
      const paramPlaceholder = `$${queryParams.length}`;
      const searchFilter = ` AND (
        t.source ILIKE ${paramPlaceholder} OR 
        t.destination ILIKE ${paramPlaceholder} OR 
        v.registration_number ILIKE ${paramPlaceholder} OR 
        d.name ILIKE ${paramPlaceholder}
      )`;
      countQuery += searchFilter;
      dataQuery += searchFilter;
    }

    // Get total count
    const countResult = await pool.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated data
    queryParams.push(limit, offset);
    const limitPlaceholder = `$${queryParams.length - 1}`;
    const offsetPlaceholder = `$${queryParams.length}`;
    dataQuery += ` ORDER BY t.created_at DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`;

    const dataResult = await pool.query(dataQuery, queryParams);

    return {
      trips: dataResult.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    };
  }

  /**
   * Retrieves dashboard KPIs owned by Module B
   */
  async getTripKPIs() {
    const activeTripsQuery = `SELECT COUNT(*) FROM trips WHERE status = 'Dispatched'`;
    const pendingTripsQuery = `SELECT COUNT(*) FROM trips WHERE status = 'Draft'`;

    const [activeRes, pendingRes] = await Promise.all([
      pool.query(activeTripsQuery),
      pool.query(pendingTripsQuery)
    ]);

    return {
      activeTrips: parseInt(activeRes.rows[0].count, 10),
      pendingTrips: parseInt(pendingRes.rows[0].count, 10)
    };
  }
}

export const tripService = new TripService();
