import marsMissions from './src/data/marsMissions.js';
import marsLocations from './src/data/marsLocations.js';
import { MARS_RAW_IMAGES, PERSEVERANCE_CAMERAS } from './src/data/marsRawImages.js';

console.log('--- MARS MISSION INTELLIGENCE VERIFICATION TEST ---');

// 1. Verify all 4 required missions exist
const requiredMissionIds = ['perseverance', 'curiosity', 'insight', 'spirit-opportunity'];
console.log('1. Checking required missions...');
requiredMissionIds.forEach((id) => {
  const mission = marsMissions.find((m) => m.id === id);
  if (!mission) {
    throw new Error(`Missing required mission: ${id}`);
  }
  console.log(`  ✓ Mission found: ${mission.name} (${mission.roverOrLanderType})`);
});

// 2. Verify all mission details fields
console.log('\n2. Verifying mission details schema for each mission...');
marsMissions.forEach((mission) => {
  console.log(`Checking mission: ${mission.name}`);
  
  // Mission Name
  if (!mission.name || !mission.formalName) throw new Error(`${mission.id} missing name`);
  
  // Rover or Lander type
  if (!mission.roverOrLanderType || !mission.vehicleClass) throw new Error(`${mission.id} missing type`);
  
  // Landing location
  if (!mission.landingSiteName || !mission.coordinates || typeof mission.coordinates.lat !== 'number' || typeof mission.coordinates.lng !== 'number') {
    throw new Error(`${mission.id} missing valid landing location or coordinates`);
  }
  
  // Landing date
  if (!mission.landingDate) throw new Error(`${mission.id} missing landing date`);
  
  // Mission objectives
  if (!Array.isArray(mission.missionObjectives) || mission.missionObjectives.length === 0) {
    throw new Error(`${mission.id} missing mission objectives`);
  }
  
  // Scientific discoveries
  if (!Array.isArray(mission.scientificDiscoveries) || mission.scientificDiscoveries.length === 0) {
    throw new Error(`${mission.id} missing scientific discoveries`);
  }
  
  // Current mission status & last-updated date
  if (!mission.currentStatus || !mission.statusLastUpdated) {
    throw new Error(`${mission.id} missing current status or last-updated date`);
  }
  
  // Scientific instruments
  if (!Array.isArray(mission.scientificInstruments) || mission.scientificInstruments.length === 0) {
    throw new Error(`${mission.id} missing scientific instruments`);
  }

  // Exploration achievements
  if (!Array.isArray(mission.explorationAchievements) || mission.explorationAchievements.length === 0) {
    throw new Error(`${mission.id} missing exploration achievements`);
  }

  // Source links
  if (!Array.isArray(mission.sources) || mission.sources.length === 0) {
    throw new Error(`${mission.id} missing source links`);
  }

  // Telemetry transparency notice
  if (!mission.telemetryNotice || !Array.isArray(mission.telemetryNotice.verifiedDataPoints) || !Array.isArray(mission.telemetryNotice.unavailableDataPoints)) {
    throw new Error(`${mission.id} missing telemetry notice or verified/unavailable disclosures`);
  }

  console.log(`  ✓ Schema complete: ${mission.missionObjectives.length} objectives, ${mission.scientificDiscoveries.length} discoveries, ${mission.scientificInstruments.length} instruments, ${mission.explorationAchievements.length} achievements.`);
});

// 3. Verify Interactive Location Connection with marsLocations.js
console.log('\n3. Verifying connection to marsLocations.js...');
marsMissions.forEach((mission) => {
  const linkedLocation = marsLocations.find((l) => l.id === mission.primaryLocationId);
  if (!linkedLocation) {
    throw new Error(`Failed to find primaryLocationId "${mission.primaryLocationId}" in marsLocations.js for mission "${mission.name}"`);
  }
  console.log(`  ✓ Linked: ${mission.name} -> Location: "${linkedLocation.name}" (Lat: ${linkedLocation.lat}, Lng: ${linkedLocation.lng})`);

  // Check sub-rovers if present (e.g. Spirit and Opportunity)
  if (mission.subRovers) {
    mission.subRovers.forEach((sub) => {
      const subLoc = marsLocations.find((l) => l.id === sub.landingLocationId);
      if (!subLoc) {
        throw new Error(`Failed to find sub-rover location "${sub.landingLocationId}" in marsLocations.js`);
      }
      console.log(`    ✓ Sub-rover linked: ${sub.name} -> "${subLoc.name}" (Lat: ${subLoc.lat}, Lng: ${subLoc.lng})`);
    });
  }
});

// 4. Verify Mission Comparison Pairings
console.log('\n4. Verifying Mission Comparison combinations...');
const pairs = [
  ['perseverance', 'curiosity'],
  ['perseverance', 'insight'],
  ['curiosity', 'spirit-opportunity'],
  ['insight', 'spirit-opportunity']
];
pairs.forEach(([idA, idB]) => {
  const mA = marsMissions.find((m) => m.id === idA);
  const mB = marsMissions.find((m) => m.id === idB);
  if (!mA || !mB) throw new Error(`Pair comparison missing mission: ${idA} vs ${idB}`);
  console.log(`  ✓ Can compare [${mA.name}] vs [${mB.name}]:`);
  console.log(`    - Objectives: ${mA.missionObjectives.length} vs ${mB.missionObjectives.length}`);
  console.log(`    - Locations: "${mA.landingSiteName}" vs "${mB.landingSiteName}"`);
  console.log(`    - Instruments: ${mA.scientificInstruments.length} vs ${mB.scientificInstruments.length}`);
  console.log(`    - Achievements: ${mA.explorationAchievements.length} vs ${mB.explorationAchievements.length}`);
});

console.log('\n5. Verifying NASA Mars 2020 Perseverance Raw Images Catalog...');
console.log(`  Found ${MARS_RAW_IMAGES.length} curated raw images across ${PERSEVERANCE_CAMERAS.length - 1} camera instruments.`);
MARS_RAW_IMAGES.forEach((img) => {
  if (!img.id || typeof img.sol !== 'number' || !img.camera || !img.imageUrl) {
    throw new Error(`Invalid raw image record: ${img.id}`);
  }
  if (!img.sourceUrl || !img.sourceUrl.startsWith('https://')) {
    throw new Error(`Raw image missing verified NASA HTTPS URL: ${img.id}`);
  }
  console.log(`  ✓ Sol ${img.sol} [${img.camera}]: "${img.title}" — ${img.credit}`);
});

console.log('\n>>> ALL MARS MISSION INTELLIGENCE VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
