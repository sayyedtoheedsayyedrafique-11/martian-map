import marsSurvivalLocations from './src/data/marsSurvivalLocations.js';
import marsSurvivalReadiness from './src/data/marsReadinessAssessment.js';
import marsGlossary from './src/data/marsGlossary.js';

console.log('=== MARS SURVIVAL SIMULATOR VERIFICATION TEST ===');

// 1. Location Selection Verification
console.log('\n1. Verifying Location Selection Catalog...');
const expectedLocs = ['jezero-crater', 'gale-crater', 'elysium-planitia', 'vastitas-borealis', 'olympus-mons', 'hellas-basin'];
expectedLocs.forEach((locId) => {
  const loc = marsSurvivalLocations.find((l) => l.id === locId);
  if (!loc) throw new Error(`Missing required research location: ${locId}`);
  console.log(`  ✓ Found site: ${loc.name} (${loc.measurementStatus})`);
});

// 2. Environmental Conditions Schema & Scientific Provenance
console.log('\n2. Verifying Environmental Conditions for Each Site...');
const requiredFactors = ['pressure', 'temperature', 'atmosphereComposition', 'radiation', 'waterAvailability'];

marsSurvivalLocations.forEach((loc) => {
  console.log(`Checking site: ${loc.name}`);
  if (!loc.coordinates || typeof loc.coordinates.lat !== 'number' || typeof loc.coordinates.lng !== 'number') {
    throw new Error(`${loc.id} has invalid coordinates`);
  }
  if (!loc.elevationFormatted) throw new Error(`${loc.id} missing elevation`);

  requiredFactors.forEach((factor) => {
    const data = loc.conditions[factor];
    if (!data) throw new Error(`${loc.id} missing condition: ${factor}`);

    // Must show value
    if (!data.value) throw new Error(`${loc.id} ${factor} missing value`);

    // Must identify source and observation period
    if (!data.source || !data.observationPeriod) {
      throw new Error(`${loc.id} ${factor} missing source or observation period`);
    }

    // Must distinguish actual measurements from general/modeled estimates
    if (!data.measurementType || !data.typeLabel) {
      throw new Error(`${loc.id} ${factor} missing measurementType / typeLabel`);
    }

    // If site has NO in-situ sensors, its conditions must NOT claim to be in-situ
    if (!loc.hasInSituSensors && data.measurementType === 'in-situ') {
      throw new Error(`${loc.id} has no in-situ sensors but claims in-situ measurement for ${factor}`);
    }
  });

  console.log(`  ✓ All 5 environmental factors verified with authentic source and observation period.`);
});

// 3. Survival Readiness Assessment Verification
console.log('\n3. Verifying Survival Readiness Assessment Matrix...');
marsSurvivalReadiness.forEach((item) => {
  if (!item.title || !item.category || !item.scientificEvidence || !item.evidenceCitation) {
    throw new Error(`Readiness item ${item.id} missing title or scientific evidence`);
  }
  if (!Array.isArray(item.requiredProtection) || item.requiredProtection.length === 0) {
    throw new Error(`Readiness item ${item.id} missing required protection systems`);
  }
  if (!Array.isArray(item.missingOrUncertainInfo) || item.missingOrUncertainInfo.length === 0) {
    throw new Error(`Readiness item ${item.id} missing missing/uncertain information`);
  }

  // Ensure no fake survival scores or claims of safe unassisted survival
  const text = JSON.stringify(item).toLowerCase();
  if (text.includes('100% survivable') || text.includes('safe without suit') || text.includes('survival score:')) {
    throw new Error(`Readiness item ${item.id} contains prohibited fake survival score or false safety claim!`);
  }
});
console.log(`  ✓ ${marsSurvivalReadiness.length} readiness challenges verified with evidence, life-support requirements, and uncertainties.`);

// 4. Scientific Terms Glossary Verification
console.log('\n4. Verifying Scientific Terms Glossary...');
const requiredTerms = ['Armstrong Limit', 'MOLA Areoid Datum', 'milliSievert (mSv)', 'Perchlorates', 'ISRU (In-Situ Resource Utilization)'];
requiredTerms.forEach((term) => {
  const entry = marsGlossary.find((g) => g.term.includes(term));
  if (!entry) throw new Error(`Missing glossary term: ${term}`);
  if (!entry.simpleExplanation || !entry.citation) {
    throw new Error(`Glossary term ${term} missing simple explanation or citation`);
  }
  console.log(`  ✓ Glossary term present: "${entry.term}"`);
});

console.log('\n>>> ALL MARS SURVIVAL SIMULATOR VERIFICATION TESTS PASSED SUCCESSFULLY! <<<\n');
