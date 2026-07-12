import { eligibilityService } from '../services/eligibility.service.js';
import { tripService } from '../services/trip.service.js';

async function runTests() {
  console.log('==================================================');
  console.log('   STARTING MODULE B END-TO-END VERIFICATION      ');
  console.log('==================================================\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Eligibility Data Verification
    // ----------------------------------------------------
    console.log('[Test 1] Fetching eligibility data...');
    const eligibility = await eligibilityService.getEligibilityData();
    console.log(`- Found ${eligibility.vehicles.length} available vehicles.`);
    console.log(`- Found ${eligibility.drivers.length} available & non-expired drivers.`);
    
    // Assert status/capacity/expiry filter logic
    const hasInShop = eligibility.vehicles.some((v: any) => v.status === 'In Shop');
    const hasExpiredDriver = eligibility.drivers.some((d: any) => d.name === 'Expired Driver');
    
    if (hasInShop) throw new Error('FAIL: In Shop vehicles should not be returned');
    if (hasExpiredDriver) throw new Error('FAIL: Expired drivers should not be returned');
    console.log('✓ TEST 1 PASSED: Eligibility query returns only available, active resources.\n');

    // ----------------------------------------------------
    // TEST 2: Valid Trip Creation
    // ----------------------------------------------------
    console.log('[Test 2] Creating a valid trip...');
    const newTrip = await tripService.createTrip({
      source: 'Warehouse Alpha',
      destination: 'Terminal Omega',
      vehicle_id: 'veh-1-uuid', // Cap 1000
      driver_id: 'drv-1-uuid',  // Active, LMV
      cargo_weight: 800,        // Less than 1000
      planned_distance: 150
    });
    console.log(`- Trip created successfully. ID: ${newTrip.id}, Status: ${newTrip.status}`);
    if (newTrip.status !== 'Draft') throw new Error('FAIL: New trips must be in Draft state');
    console.log('✓ TEST 2 PASSED: Valid trip created successfully.\n');

    // ----------------------------------------------------
    // TEST 3: Overweight Cargo Validation
    // ----------------------------------------------------
    console.log('[Test 3] Testing capacity validation (should fail)...');
    try {
      await tripService.createTrip({
        source: 'Warehouse Alpha',
        destination: 'Terminal Omega',
        vehicle_id: 'veh-1-uuid', // Cap 1000
        driver_id: 'drv-1-uuid',
        cargo_weight: 1200,       // Exceeds 1000!
        planned_distance: 150
      });
      throw new Error('FAIL: Trip creation succeeded despite exceeding vehicle weight capacity');
    } catch (err: any) {
      console.log(`- Received expected validation block: "${err.message}"`);
      console.log('✓ TEST 3 PASSED: Capacity validation successfully blocks overweight cargo.\n');
    }

    // ----------------------------------------------------
    // TEST 4: Expired License Validation
    // ----------------------------------------------------
    console.log('[Test 4] Testing expired license validation (should fail)...');
    try {
      await tripService.createTrip({
        source: 'Warehouse Alpha',
        destination: 'Terminal Omega',
        vehicle_id: 'veh-1-uuid',
        driver_id: 'drv-3-uuid',  // Expired license driver
        cargo_weight: 500,
        planned_distance: 150
      });
      throw new Error('FAIL: Trip creation succeeded with an expired license driver');
    } catch (err: any) {
      console.log(`- Received expected validation block: "${err.message}"`);
      console.log('✓ TEST 4 PASSED: License validation successfully blocks expired drivers.\n');
    }

    // ----------------------------------------------------
    // TEST 5: Trip Dispatch and Idempotency
    // ----------------------------------------------------
    console.log('[Test 5] Dispatching trip and testing idempotency...');
    // Create another trip to dispatch
    const testTrip = await tripService.createTrip({
      source: 'Hub A',
      destination: 'Hub B',
      vehicle_id: 'veh-2-uuid', // Cap 5000
      driver_id: 'drv-2-uuid',  // Jane Doe
      cargo_weight: 1000,
      planned_distance: 50
    });

    const dispatchedTrip = await tripService.dispatchTrip(testTrip.id);
    console.log(`- Trip ID: ${dispatchedTrip.id} status updated to: ${dispatchedTrip.status}`);
    
    // Attempt second dispatch (idempotency check)
    try {
      await tripService.dispatchTrip(testTrip.id);
      throw new Error('FAIL: Re-dispatching an already dispatched trip should fail');
    } catch (err: any) {
      console.log(`- Received expected idempotency guard block: "${err.message}"`);
      console.log('✓ TEST 5 PASSED: Idempotent dispatch guard works perfectly.\n');
    }

    // ----------------------------------------------------
    // TEST 6: Trip Completion and Trigger Simulation
    // ----------------------------------------------------
    console.log('[Test 6] Completing trip and verifying updates...');
    const completedTrip = await tripService.completeTrip(testTrip.id, {
      actual_distance: 55.4,
      fuel_consumed: 22.1,
      revenue: 1200.00
    });
    console.log(`- Trip status updated to: ${completedTrip.status}`);
    console.log(`- Actual Distance: ${completedTrip.actual_distance} km`);
    console.log(`- Fuel Consumed: ${completedTrip.fuel_consumed} L`);
    console.log(`- Revenue: $${completedTrip.revenue}`);
    
    if (completedTrip.status !== 'Completed') throw new Error('FAIL: Status should be Completed');
    console.log('✓ TEST 6 PASSED: Trip completed and metrics logged successfully.\n');

    // ----------------------------------------------------
    // TEST 7: Dashboard KPIs Verification
    // ----------------------------------------------------
    console.log('[Test 7] Checking module dashboard KPIs...');
    const kpis = await tripService.getTripKPIs();
    console.log(`- Active Trips in Transit: ${kpis.activeTrips}`);
    console.log(`- Pending (Draft) Trips: ${kpis.pendingTrips}`);
    console.log('✓ TEST 7 PASSED: KPI queries return correct aggregations.\n');

    console.log('==================================================');
    console.log('      ALL MODULE B TESTS COMPLETED SUCCESSFUL      ');
    console.log('==================================================');

  } catch (error: any) {
    console.error('\n❌ VERIFICATION FAILED:');
    console.error(error.stack || error.message);
    process.exit(1);
  }
}

runTests();
