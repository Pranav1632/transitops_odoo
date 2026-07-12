import { Request, Response } from 'express';
import { getOrSetCache } from '../../../shared/redis/client';
import { pool } from '../../../shared/db/pool';

/**
 * Retrieves KPI aggregates for the fleet dashboard.
 * Caches results in Redis under the key 'fleet:kpis' for 30s.
 */
export async function getFleetKpis(req: Request, res: Response) {
  try {
    const kpis = await getOrSetCache('fleet:kpis', 30, async () => {
      // 1. Active Vehicles count (status = 'On Trip')
      const activeResult = await pool.query(
        "SELECT COALESCE(count(*)::int, 0) as count FROM vehicles WHERE status = 'On Trip'"
      );

      // 2. Available Vehicles count (status = 'Available')
      const availableResult = await pool.query(
        "SELECT COALESCE(count(*)::int, 0) as count FROM vehicles WHERE status = 'Available'"
      );

      // 3. Vehicles in Maintenance count (status = 'In Shop')
      const maintenanceResult = await pool.query(
        "SELECT COALESCE(count(*)::int, 0) as count FROM vehicles WHERE status = 'In Shop'"
      );

      // 4. Drivers On Duty count (status IN ('Available', 'On Trip'))
      const driversResult = await pool.query(
        "SELECT COALESCE(count(*)::int, 0) as count FROM drivers WHERE status IN ('Available', 'On Trip')"
      );

      return {
        activeVehicles: activeResult.rows[0].count,
        availableVehicles: availableResult.rows[0].count,
        vehiclesInMaintenance: maintenanceResult.rows[0].count,
        driversOnDuty: driversResult.rows[0].count,
      };
    });

    return res.status(200).json(kpis);
  } catch (error) {
    console.error('Error fetching fleet KPIs:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
