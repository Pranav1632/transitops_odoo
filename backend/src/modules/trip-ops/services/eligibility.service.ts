import pool from '../../../shared/db/pool.js';

export interface EligibleVehicle {
  id: string;
  registration_number: string;
  name: string;
  type: string;
  max_load_capacity: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
}

export interface EligibleDriver {
  id: string;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string; // date string
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
}

export class EligibilityService {
  /**
   * Retrieves all vehicles that are currently 'Available'
   */
  async getEligibleVehicles(): Promise<EligibleVehicle[]> {
    const query = `
      SELECT id, registration_number, name, type, max_load_capacity, status
      FROM vehicles
      WHERE status = 'Available'
      ORDER BY name ASC
    `;
    const result = await pool.query(query);
    // Explicitly parse capacity to number if database returns it as string (numeric type in pg)
    return result.rows.map((row: any) => ({
      ...row,
      max_load_capacity: Number(row.max_load_capacity)
    }));
  }

  /**
   * Retrieves all drivers that are currently 'Available' and whose licenses are not expired
   */
  async getEligibleDrivers(): Promise<EligibleDriver[]> {
    const query = `
      SELECT id, name, license_number, license_category, license_expiry::text, status
      FROM drivers
      WHERE status = 'Available'
        AND license_expiry > CURRENT_DATE
      ORDER BY name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Fetch both vehicles and drivers concurrently
   */
  async getEligibilityData() {
    const [vehicles, drivers] = await Promise.all([
      this.getEligibleVehicles(),
      this.getEligibleDrivers()
    ]);
    return { vehicles, drivers };
  }
}

export const eligibilityService = new EligibilityService();
