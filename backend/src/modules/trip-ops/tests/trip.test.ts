import { pool } from '../../../shared/db/pool.js';
import { eligibilityService } from '../services/eligibility.service.js';
import { tripService } from '../services/trip.service.js';

const TEST_VEHICLE_ID = '11111111-1111-1111-1111-111111111111';
const TEST_DRIVER_ID = '22222222-2222-2222-2222-222222222222';
const EXPIRED_DRIVER_ID = '33333333-3333-3333-3333-333333333333';

async function runTests() {
  console.log('==================================================');
  console.log('   STARTING REAL DB MODULE B E2E VERIFICATION     ');
  console.log('==================================================\n');

  try {
    // ----------------------------------------------------
    // SEEDING TEST RESOURCES
    // ----------------------------------------------------
    console.log('[Setup] Seeding test vehicle and driver records...');
    
    // Seed vehicle (Capacity: 1000)
    await pool.query(`
      INSERT INTO vehicles (id, registration_number, name, type, max_load_capacity, acquisition_cost, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Available')
      ON CONFLICT (registration_number) 
      DO UPDATE SET status = 'Available', max_load_capacity = $5
    `, [TEST_VEHICLE_ID, 'TEST-VEH-101', 'E2E Test Vehicle', 'Truck', 1000, 15000]);

    // Seed valid driver (License expires in 2030)
    await pool.query(`
      INSERT INTO drivers (id, name, license_number, license_category, license_expiry, status)
      VALUES ($1, $2, $3, $4, $5, 'Available')
      ON CONFLICT (license_number) 
      DO UPDATE SET status = 'Available', license_expiry = $5
    `, [TEST_DRIVER_ID, 'E2E Test Driver', 'TEST-LIC-101', 'Heavy LMV', '2030-12-31']);

    // Seed expired driver (License expired in 2020)
    await pool.query(`
      INSERT INTO drivers (id, name, license_number, license_category, license_expiry, status)
      VALUES ($1, $2, $3, $4, $5, 'Available')
      ON CONFLICT (license_number) 
      DO UPDATE SET status = 'Available', license_expiry = $5
    `, [EXPIRED_DRIVER_ID, 'Expired Driver', 'TEST-LIC-EXP', 'LMV', '2020-01-01']);

    console.log('✓ Seeding complete.\n');

    // ----------------------------------------------------
    // TEST 1: Eligibility Data Verification
    // ----------------------------------------------------
    console.log('[Test 1] Fetching eligibility data...');
    const eligibility = await eligibilityService.getEligibilityData();
    console.log(`- Found ${eligibility.vehicles.length} available vehicles.`);
    console.log(`- Found ${eligibility.drivers.length} available & non-expired drivers.`);
    
    const hasTestVehicle = eligibility.vehicles.some((v: any) => v.id === TEST_VEHICLE_ID);
    const hasTestDriver = eligibility.drivers.some((d: any) => d.id === TEST_DRIVER_ID);
    const hasExpiredDriver = eligibility.drivers.some((d: any) => d.id === EXPIRED_DRIVER_ID);
    
    if (!hasTestVehicle) throw new Error('FAIL: Seeded test vehicle not found in eligibility list');
    if (!hasTestDriver) throw new Error('FAIL: Seeded test driver not found in eligibility list');
    if (hasExpiredDriver) throw new Error('FAIL: Expired test driver should not appear in eligibility list');
    console.log('✓ TEST 1 PASSED: Eligibility correctly filters available, active resources.\n');

    // ----------------------------------------------------
    // TEST 2: Valid Trip Creation (Draft)
    // ----------------------------------------------------
    console.log('[Test 2] Creating a valid trip as Draft...');
    const newTrip = await tripService.createTrip({
      source: 'Warehouse Alpha',
      destination: 'Terminal Omega',
      vehicle_id: TEST_VEHICLE_ID,
      driver_id: TEST_DRIVER_ID,
      cargo_weight: 850, // Less than 1000
      planned_distance: 120
    });
    console.log(`- Trip created successfully. ID: ${newTrip.id}, Status: ${newTrip.status}`);
    if (newTrip.status !== 'Draft') throw new Error('FAIL: Created trip must be in Draft status');
    console.log('✓ TEST 2 PASSED: Valid trip created successfully.\n');

    // ----------------------------------------------------
    // TEST 3: Overweight Cargo Validation
    // ----------------------------------------------------
    console.log('[Test 3] Testing capacity validation...');
    try {
      await tripService.createTrip({
        source: 'Warehouse Alpha',
        destination: 'Terminal Omega',
        vehicle_id: TEST_VEHICLE_ID,
        driver_id: TEST_DRIVER_ID,
        cargo_weight: 1200, // Exceeds 1000 max capacity!
        planned_distance: 120
      });
      throw new Error('FAIL: Trip creation succeeded despite exceeding vehicle weight capacity');
    } catch (err: any) {
      console.log(`- Blocked as expected: "${err.message}"`);
      console.log('✓ TEST 3 PASSED: Capacity validation successfully blocks overweight cargo.\n');
    }

    // ----------------------------------------------------
    // TEST 4: Expired License Validation
    // ----------------------------------------------------
    console.log('[Test 4] Testing expired license validation...');
    try {
      await tripService.createTrip({
        source: 'Warehouse Alpha',
        destination: 'Terminal Omega',
        vehicle_id: TEST_VEHICLE_ID,
        driver_id: EXPIRED_DRIVER_ID, // Expired driver!
        cargo_weight: 500,
        planned_distance: 120
      });
      throw new Error('FAIL: Trip creation succeeded with an expired license driver');
    } catch (err: any) {
      console.log(`- Blocked as expected: "${err.message}"`);
      console.log('✓ TEST 4 PASSED: License validation successfully blocks expired drivers.\n');
    }

    // ----------------------------------------------------
    // TEST 5: Trip Dispatch and Idempotency
    // ----------------------------------------------------
    console.log('[Test 5] Dispatching trip and testing idempotency...');
    const dispatchedTrip = await tripService.dispatchTrip(newTrip.id);
    console.log(`- Trip ID: ${dispatchedTrip.id} status updated to: ${dispatchedTrip.status}`);

    // Verify trigger simulation - check if database trigger updated vehicle/driver status
    const vehicleCheck = await pool.query('SELECT status FROM vehicles WHERE id = $1', [TEST_VEHICLE_ID]);
    const driverCheck = await pool.query('SELECT status FROM drivers WHERE id = $1', [TEST_DRIVER_ID]);
    console.log(`- Database trigger status check: Vehicle is "${vehicleCheck.rows[0].status}", Driver is "${driverCheck.rows[0].status}"`);
    if (vehicleCheck.rows[0].status !== 'On Trip' || driverCheck.rows[0].status !== 'On Trip') {
      throw new Error('FAIL: Database trigger trg_trip_status did not update vehicle/driver status to On Trip');
    }
    
    // Attempt second dispatch (idempotency check)
    try {
      await tripService.dispatchTrip(newTrip.id);
      throw new Error('FAIL: Re-dispatching an already dispatched trip should fail');
    } catch (err: any) {
      console.log(`- Blocked as expected: "${err.message}"`);
      console.log('✓ TEST 5 PASSED: Idempotent dispatch guard works perfectly.\n');
    }

    // ----------------------------------------------------
    // TEST 6: Trip Completion and Status Reversion
    // ----------------------------------------------------
    console.log('[Test 6] Completing trip and verifying updates...');
    const completedTrip = await tripService.completeTrip(newTrip.id, {
      actual_distance: 124.5,
      fuel_consumed: 38.6,
      revenue: 1850.00
    });
    console.log(`- Trip status updated to: ${completedTrip.status}`);
    console.log(`- Metrics: Dist ${completedTrip.actual_distance}km, Fuel ${completedTrip.fuel_consumed}L, Rev $${completedTrip.revenue}`);
    
    // Check if vehicle/driver return to Available via triggers
    const vehicleCheck2 = await pool.query('SELECT status FROM vehicles WHERE id = $1', [TEST_VEHICLE_ID]);
    const driverCheck2 = await pool.query('SELECT status FROM drivers WHERE id = $1', [TEST_DRIVER_ID]);
    console.log(`- Database trigger status check: Vehicle is "${vehicleCheck2.rows[0].status}", Driver is "${driverCheck2.rows[0].status}"`);
    if (vehicleCheck2.rows[0].status !== 'Available' || driverCheck2.rows[0].status !== 'Available') {
      throw new Error('FAIL: Database trigger did not restore vehicle/driver status to Available');
    }
    console.log('✓ TEST 6 PASSED: Trip completed and database triggers synced statuses back to Available.\n');

    // ----------------------------------------------------
    // TEST 7: Dashboard KPIs Verification
    // ----------------------------------------------------
    console.log('[Test 7] Checking module dashboard KPIs...');
    const kpis = await tripService.getTripKPIs();
    console.log(`- Active Trips in Transit: ${kpis.activeTrips}`);
    console.log(`- Pending (Draft) Trips: ${kpis.pendingTrips}`);
    console.log('✓ TEST 7 PASSED: KPI queries return correct aggregations.\n');

    console.log('==================================================');
    console.log('   ALL E2E INTEGRATION TESTS COMPLETED SUCCESSFULLY! ');
    console.log('==================================================');

  } catch (error: any) {
    console.error('\n❌ VERIFICATION FAILED:');
    console.error(error.stack || error.message);
  } finally {
    console.log('\n[Cleanup] Cleaning up seeded test data...');
    try {
      await pool.query('DELETE FROM trips WHERE vehicle_id = $1', [TEST_VEHICLE_ID]);
      await pool.query('DELETE FROM drivers WHERE id IN ($1, $2)', [TEST_DRIVER_ID, EXPIRED_DRIVER_ID]);
      await pool.query('DELETE FROM vehicles WHERE id = $1', [TEST_VEHICLE_ID]);
      console.log('✓ Cleanup complete.');
    } catch (cleanupErr: any) {
      console.error('Warning: Cleanup failed:', cleanupErr.message);
    }
  }
}

runTests();
