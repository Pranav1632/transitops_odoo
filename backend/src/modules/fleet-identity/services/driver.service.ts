import { pool } from '../../../shared/db/pool';

export interface DriverFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// Expiry calculations helper
function mapDriverExpiry(driver: any) {
  if (!driver) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(driver.license_expiry);
  const timeDiff = expiryDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return {
    ...driver,
    is_expired: daysDiff < 0,
    days_until_expiry: daysDiff,
  };
}

export async function getDrivers(filters: DriverFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (filters.status) {
    conditions.push(`status = $${paramIdx++}`);
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push(`(name ILIKE $${paramIdx++} OR license_number ILIKE $${paramIdx++})`);
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern);
    params.push(searchPattern);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 1. Get total count
  const countQuery = `SELECT count(*) FROM drivers ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count, 10);

  // 2. Fetch paginated data
  const dataQuery = `
    SELECT * FROM drivers 
    ${whereClause} 
    ORDER BY created_at DESC 
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `;
  const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

  // Map expiry properties
  const drivers = dataResult.rows.map(mapDriverExpiry);

  return {
    data: drivers,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getDriverById(id: string) {
  const result = await pool.query('SELECT * FROM drivers WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return null;
  }
  return mapDriverExpiry(result.rows[0]);
}

export async function createDriver(data: {
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  contact_number?: string | null | undefined;
  safety_score?: number | undefined;
  status?: string | undefined;
}) {
  const query = `
    INSERT INTO drivers (
      name, license_number, license_category, license_expiry, 
      contact_number, safety_score, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const params = [
    data.name,
    data.license_number.toUpperCase(),
    data.license_category,
    data.license_expiry,
    data.contact_number || null,
    data.safety_score !== undefined ? data.safety_score : 100,
    data.status || 'Available',
  ];

  try {
    const result = await pool.query(query, params);
    return mapDriverExpiry(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('UNIQUE_VIOLATION: A driver with this license number already exists');
    }
    throw error;
  }
}

export async function updateDriver(id: string, data: {
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  contact_number: string | null;
  safety_score: number;
  status: string;
}) {
  const query = `
    UPDATE drivers 
    SET name = $1, license_number = $2, license_category = $3, license_expiry = $4,
        contact_number = $5, safety_score = $6, status = $7, updated_at = NOW()
    WHERE id = $8
    RETURNING *
  `;
  const params = [
    data.name,
    data.license_number.toUpperCase(),
    data.license_category,
    data.license_expiry,
    data.contact_number,
    data.safety_score,
    data.status,
    id,
  ];

  try {
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return null;
    }
    return mapDriverExpiry(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('UNIQUE_VIOLATION: A driver with this license number already exists');
    }
    throw error;
  }
}

export async function deleteDriver(id: string) {
  try {
    const result = await pool.query('DELETE FROM drivers WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  } catch (error: any) {
    if (error.code === '23503') {
      throw new Error('FOREIGN_KEY_VIOLATION: Cannot delete driver as they have associated trips or records');
    }
    throw error;
  }
}
