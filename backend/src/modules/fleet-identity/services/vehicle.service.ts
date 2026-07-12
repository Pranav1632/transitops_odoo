import { pool } from '../../../shared/db/pool';

export interface VehicleFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  region?: string;
  search?: string;
}

export async function getVehicles(filters: VehicleFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (filters.type) {
    conditions.push(`type = $${paramIdx++}`);
    params.push(filters.type);
  }

  if (filters.status) {
    conditions.push(`status = $${paramIdx++}`);
    params.push(filters.status);
  }

  if (filters.region) {
    conditions.push(`region = $${paramIdx++}`);
    params.push(filters.region);
  }

  if (filters.search) {
    conditions.push(`(registration_number ILIKE $${paramIdx++} OR name ILIKE $${paramIdx++})`);
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern);
    params.push(searchPattern);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 1. Get total count
  const countQuery = `SELECT count(*) FROM vehicles ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count, 10);

  // 2. Fetch paginated data
  const dataQuery = `
    SELECT * FROM vehicles 
    ${whereClause} 
    ORDER BY created_at DESC 
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `;
  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  return {
    data: dataResult.rows,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getVehicleById(id: string) {
  const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

export async function createVehicle(data: {
  registration_number: string;
  name: string;
  type: string;
  max_load_capacity: number;
  odometer?: number | undefined;
  acquisition_cost?: number | undefined;
  status?: string | undefined;
  region?: string | null | undefined;
}) {
  const query = `
    INSERT INTO vehicles (
      registration_number, name, type, max_load_capacity, 
      odometer, acquisition_cost, status, region
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const params = [
    data.registration_number.toUpperCase(),
    data.name,
    data.type,
    data.max_load_capacity,
    data.odometer || 0,
    data.acquisition_cost || 0,
    data.status || 'Available',
    data.region || null,
  ];

  try {
    const result = await pool.query(query, params);
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('UNIQUE_VIOLATION: A vehicle with this registration number already exists');
    }
    throw error;
  }
}

export async function updateVehicle(id: string, data: {
  registration_number: string;
  name: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: string;
  region: string | null;
}) {
  const query = `
    UPDATE vehicles 
    SET registration_number = $1, name = $2, type = $3, max_load_capacity = $4,
        odometer = $5, acquisition_cost = $6, status = $7, region = $8,
        updated_at = NOW()
    WHERE id = $9
    RETURNING *
  `;
  const params = [
    data.registration_number.toUpperCase(),
    data.name,
    data.type,
    data.max_load_capacity,
    data.odometer,
    data.acquisition_cost,
    data.status,
    data.region,
    id,
  ];

  try {
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('UNIQUE_VIOLATION: A vehicle with this registration number already exists');
    }
    throw error;
  }
}

export async function deleteVehicle(id: string) {
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  } catch (error: any) {
    if (error.code === '23503') {
      throw new Error('FOREIGN_KEY_VIOLATION: Cannot delete vehicle as it has associated trips or logs');
    }
    throw error;
  }
}
