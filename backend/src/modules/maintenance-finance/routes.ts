import { Router } from 'express';
import { pool } from '../../shared/db/pool';

const router = Router();

// Run startup database validation/migration to ensure start_date and end_date columns exist in maintenance_logs
async function ensureSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'maintenance_logs' AND column_name = 'start_date'
    `);
    if (res.rowCount === 0) {
      console.log('Migrating maintenance_logs to add start_date and end_date columns...');
      await pool.query(`
        ALTER TABLE maintenance_logs 
        ADD COLUMN start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        ADD COLUMN end_date DATE;
      `);
      console.log('Database migrated successfully (start_date/end_date added).');
    }
  } catch (err) {
    console.error('Error validating or migrating maintenance_logs schema:', err);
  }
}
ensureSchema();

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', module: 'maintenance-finance' });
});

router.get('/test', (req, res) => {
  res.json({ message: 'test success' });
});


// --- Vehicles ---
router.get('/vehicles', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, registration_number, name as model, status, 
             COALESCE(odometer, 0)::float as odometer, 
             COALESCE(acquisition_cost, 0)::float as acquisition_cost, 
             created_at 
      FROM vehicles
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// --- Trips ---
router.get('/trips', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, vehicle_id, driver_id, status, 
             COALESCE(revenue, 0)::float as revenue, 
             COALESCE(actual_distance, 0)::float as actual_distance, 
             cargo_weight::float as cargo_weight, 
             planned_distance::float as planned_distance, 
             source, destination, created_at 
      FROM trips
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// --- Maintenance Logs ---
router.get('/maintenance', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, vehicle_id, description, 
             cost::float as cost, 
             status, start_date, end_date, created_at 
      FROM maintenance_logs 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/maintenance', async (req, res, next) => {
  const { vehicle_id, description, cost, status, start_date, end_date } = req.body;
  try {
    await pool.query('BEGIN');

    const result = await pool.query(`
      INSERT INTO maintenance_logs (vehicle_id, description, cost, status, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, vehicle_id, description, cost::float as cost, status, start_date, end_date, created_at
    `, [vehicle_id, description, cost, status, start_date, end_date]);

    const newLog = result.rows[0];

    // Trigger: update vehicle status to "In Shop" if maintenance status is Active
    if (status === 'Active') {
      await pool.query(`
        UPDATE vehicles 
        SET status = 'In Shop' 
        WHERE id = $1
      `, [vehicle_id]);
    }

    await pool.query('COMMIT');
    res.status(201).json(newLog);
  } catch (error) {
    await pool.query('ROLLBACK');
    next(error);
  }
});

router.put('/maintenance/:id/close', async (req, res, next) => {
  const { id } = req.params;
  const { endDate } = req.body;
  try {
    await pool.query('BEGIN');

    const selectLog = await pool.query(`
      SELECT vehicle_id FROM maintenance_logs WHERE id = $1
    `, [id]);

    if (selectLog.rowCount === 0) {
      await pool.query('ROLLBACK');
      res.status(404).json({ error: 'Maintenance record not found' });
      return;
    }

    const vehicleId = selectLog.rows[0].vehicle_id;

    const result = await pool.query(`
      UPDATE maintenance_logs 
      SET status = 'Closed', end_date = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING id, vehicle_id, description, cost::float as cost, status, start_date, end_date, created_at
    `, [endDate, id]);

    const updatedLog = result.rows[0];

    // Trigger: update vehicle status back to "Available" unless it is "Retired"
    await pool.query(`
      UPDATE vehicles 
      SET status = 'Available' 
      WHERE id = $1 AND status != 'Retired'
    `, [vehicleId]);

    await pool.query('COMMIT');
    res.json(updatedLog);
  } catch (error) {
    await pool.query('ROLLBACK');
    next(error);
  }
});

// --- Fuel Logs ---
router.get('/fuel', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, vehicle_id, trip_id, 
             liters::float as liters, 
             cost::float as cost, 
             log_date as date, created_at 
      FROM fuel_logs 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/fuel', async (req, res, next) => {
  const { vehicle_id, trip_id, liters, cost, date } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, log_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, vehicle_id, trip_id, liters::float as liters, cost::float as cost, log_date as date, created_at
    `, [vehicle_id, trip_id || null, liters, cost, date]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// --- Expenses ---
router.get('/expenses', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, vehicle_id, trip_id, type, 
             amount::float as amount, 
             expense_date as date, created_at 
      FROM expenses 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/expenses', async (req, res, next) => {
  const { vehicle_id, trip_id, type, amount, date } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO expenses (vehicle_id, trip_id, type, amount, expense_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, vehicle_id, trip_id, type, amount::float as amount, expense_date as date, created_at
    `, [vehicle_id, trip_id || null, type, amount, date]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// --- Analytics Aggregates ---
router.get('/analytics', async (req, res, next) => {
  try {
    // 1. Fetch raw datasets
    const vehiclesRes = await pool.query(`
      SELECT id, registration_number, name as model, status, acquisition_cost::float as acquisition_cost 
      FROM vehicles
    `);
    const tripsRes = await pool.query(`
      SELECT id, vehicle_id, COALESCE(revenue, 0)::float as revenue, COALESCE(actual_distance, 0)::float as actual_distance 
      FROM trips
    `);
    const maintenanceRes = await pool.query(`
      SELECT id, vehicle_id, cost::float as cost 
      FROM maintenance_logs
    `);
    const fuelRes = await pool.query(`
      SELECT id, vehicle_id, liters::float as liters, cost::float as cost 
      FROM fuel_logs
    `);
    const expensesRes = await pool.query(`
      SELECT id, vehicle_id, amount::float as amount 
      FROM expenses
    `);

    const vehicles = vehiclesRes.rows;
    const trips = tripsRes.rows;
    const maintenance = maintenanceRes.rows;
    const fuel = fuelRes.rows;
    const expenses = expensesRes.rows;

    // 2. Calculations
    const totalFuelCost = fuel.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenseAmount;

    const totalDistance = trips.reduce((sum, t) => sum + (t.actual_distance || 0), 0);
    const totalLiters = fuel.reduce((sum, f) => sum + f.liters, 0);
    const fuelEfficiency = totalLiters > 0 ? totalDistance / totalLiters : 0;

    const activeVehicles = vehicles.filter((v) => v.status === 'Available' || v.status === 'On Trip').length;
    const utilizationRate = vehicles.length > 0 ? (activeVehicles / vehicles.length) * 100 : 0;

    const totalRevenue = trips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const totalAcquisitionCost = vehicles.reduce((sum, v) => sum + v.acquisition_cost, 0);
    const overallROI = totalAcquisitionCost > 0
      ? ((totalRevenue - (totalFuelCost + totalMaintenanceCost)) / totalAcquisitionCost) * 100
      : 0;

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

    const costliestVehicles = vehicles.map((v) => {
      const vMaint = maintenance.filter((m) => m.vehicle_id === v.id).reduce((s, m) => s + m.cost, 0);
      const vFuel = fuel.filter((f) => f.vehicle_id === v.id).reduce((s, f) => s + f.cost, 0);
      const vExp = expenses.filter((e) => e.vehicle_id === v.id).reduce((s, e) => s + e.amount, 0);
      return {
        name: `${v.model} (${v.registration_number})`,
        cost: vMaint + vFuel + vExp,
      };
    }).sort((a, b) => b.cost - a.cost).slice(0, 5);

    const monthlyData = [
      { month: 'June 26', Revenue: 35000, Expenses: 23500 },
      { month: 'July 26', Revenue: totalRevenue, Expenses: totalOperationalCost },
    ];

    res.json({
      kpis: {
        totalOperationalCost,
        fuelEfficiency: Number(fuelEfficiency.toFixed(2)),
        utilizationRate: Number(utilizationRate.toFixed(1)),
        overallROI: Number(overallROI.toFixed(2)),
      },
      monthlyData,
      costliestVehicles,
      vehicleROIs,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
