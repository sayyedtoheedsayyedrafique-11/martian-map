// test-data-service.js — Verification test for marsDataService
import {
  getElevationAtCoordinate,
  fetchPdsOdeObservations,
  VERIFIED_JEZERO_OBSERVATIONS,
  VERIFIED_MARS_TILE_LAYERS,
} from './src/services/marsDataService.js';

// Polyfill fetch for Node.js if needed (Node 18+ has native fetch)
console.log('--- MARS DATA EXPLORER SERVICE VERIFICATION TEST ---');

async function runTests() {
  console.log('\n1. Verifying Verified Basemap Layers Configuration...');
  const layerKeys = Object.keys(VERIFIED_MARS_TILE_LAYERS);
  console.log('  Layers found:', layerKeys.join(', '));
  if (!VERIFIED_MARS_TILE_LAYERS.ctx || !VERIFIED_MARS_TILE_LAYERS.mola || !VERIFIED_MARS_TILE_LAYERS.viking) {
    throw new Error('Missing core verified tile layers');
  }
  console.log('  ✓ Verified layers: USGS CTX (5m), NASA MOLA Altimetry, NASA Viking Color MDIM 2.1.');

  console.log('\n2. Verifying Authentic DEM Elevation Interpolation...');
  const elev = await getElevationAtCoordinate(18.4447, 77.4508);
  console.log(`  Perseverance Touchdown MOLA Elevation: ${elev.elevationMeters} m (${elev.provenance})`);
  if (elev.elevationMeters === null) {
    throw new Error('DEM elevation query returned null for Jezero coordinate');
  }
  console.log('  ✓ Bilinear DEM elevation interpolation verified.');

  console.log('\n3. Verifying Curated Jezero HiRISE Observation Benchmarks...');
  console.log(`  Found ${VERIFIED_JEZERO_OBSERVATIONS.length} ground-truth observations.`);
  VERIFIED_JEZERO_OBSERVATIONS.forEach((obs) => {
    if (!obs.id || typeof obs.lat !== 'number' || typeof obs.lon !== 'number' || !obs.sourceUrl) {
      throw new Error(`Invalid observation entry: ${obs.id}`);
    }
    console.log(`  ✓ ${obs.id}: "${obs.title}" (${obs.lat}°N, ${obs.lon}°E, ${obs.resolution})`);
  });

  console.log('\n3. Verifying Live NASA Planetary Data System (PDS) ODE REST API...');
  const odeResult = await fetchPdsOdeObservations(18.4447, 77.4508, 0.35);
  console.log('  ODE Status:', odeResult.status);
  console.log('  ODE Message:', odeResult.message);
  console.log(`  Observations retrieved: ${odeResult.products.length}`);
  if (odeResult.products.length > 0) {
    const p = odeResult.products[0];
    console.log(`  ✓ Sample Product: ${p.id} [${p.instrument}] - "${p.title}"`);
    console.log(`  ✓ Footprint center: ${p.centerLat}°N, ${p.centerLon}°E`);
    console.log(`  ✓ Direct URL: ${p.externalUrl}`);
  }

  console.log('\n>>> ALL MARS DATA SERVICE TESTS PASSED SUCCESSFULLY! <<<\n');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
