// test-route-service.js — Verification test for marsRouteService
import {
  haversineDistanceKm,
  calculateAzimuth,
  JEZERO_LANDMARKS,
  MOBILITY_MODELS,
  calculateRouteComparison,
} from './src/services/marsRouteService.js';

console.log('--- MARS ROUTE PLANNER SERVICE VERIFICATION TEST ---');

async function run() {
  console.log('\n1. Verifying Haversine distance and azimuth calculations on Mars spheroid (R = 3,389.5 km)...');
  // Equator 1 degree lon separation = 2 * PI * 3389.5 / 360 = 59.16 km
  const dist1Deg = haversineDistanceKm(0, 0, 0, 1);
  console.log(`  1° equatorial distance: ${dist1Deg.toFixed(2)} km (expected ~59.16 km)`);
  if (Math.abs(dist1Deg - 59.16) > 0.1) {
    throw new Error(`Distance computation error: got ${dist1Deg}`);
  }
  console.log('  ✓ Great-circle Haversine formula verified.');

  const az = calculateAzimuth(0, 0, 10, 0);
  console.log(`  Northward azimuth: ${az.degrees}° (${az.cardinal})`);
  if (az.degrees !== 0 || az.cardinal !== 'N') {
    throw new Error(`Azimuth calculation error: got ${az.degrees}`);
  }
  console.log('  ✓ Forward tangent azimuth verified.');

  console.log('\n2. Verifying Jezero Landmark Catalog...');
  console.log(`  Found ${JEZERO_LANDMARKS.length} curated Jezero Crater landmarks.`);
  JEZERO_LANDMARKS.forEach((l) => {
    if (typeof l.lat !== 'number' || typeof l.lng !== 'number' || typeof l.elevationMeters !== 'number') {
      throw new Error(`Invalid landmark entry: ${l.id}`);
    }
    console.log(`  ✓ ${l.name}: (${l.lat}°N, ${l.lng}°E, ${l.elevationMeters}m MOLA)`);
  });

  console.log('\n3. Verifying Dual-Route Comparison Engine (Jezero CTX DEM)...');
  const start = JEZERO_LANDMARKS[0]; // Octavia Butler Landing
  const dest = JEZERO_LANDMARKS[1];  // Delta Front
  console.log(`  Comparing routes: [${start.name}] -> [${dest.name}]`);

  const comparison = await calculateRouteComparison(start, dest);
  console.log('  Straight-line distance:', comparison.straightDistKm, 'km');
  console.log('  Route A (Direct) distance:', comparison.routeA.totalDistKm, 'km');
  console.log('  Route A max slope:', comparison.routeA.maxSlopeDeg, '°');
  console.log('  Route B (Low-Slope) distance:', comparison.routeB.totalDistKm, 'km');
  console.log('  Route B max slope:', comparison.routeB.maxSlopeDeg, '°');
  console.log('  Preferred Option:', comparison.preferredOption);
  console.log('  Rationale:', comparison.comparisonRationale);

  if (!comparison.routeA.waypoints || comparison.routeA.waypoints.length < 2) {
    throw new Error('Missing Route A waypoints');
  }
  if (!comparison.routeB.waypoints || comparison.routeB.waypoints.length < 2) {
    throw new Error('Missing Route B waypoints');
  }

  console.log('\n>>> ALL MARS ROUTE PLANNER TESTS PASSED SUCCESSFULLY! <<<\n');
}

run().catch((err) => {
  console.error('Route test failed:', err);
  process.exit(1);
});
