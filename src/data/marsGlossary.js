/**
 * Simple, accessible explanations for scientific terms used in the Mars Survival Simulator.
 * Based on NASA Human Research Program, Planetary Data System, and IAU definitions.
 */

export const marsGlossary = [
  {
    term: 'Armstrong Limit',
    symbol: '6,300 Pa (63 mbar)',
    category: 'Human Physiology',
    simpleExplanation:
      'The atmospheric pressure threshold where water boils at normal human body temperature (37 °C / 98.6 °F). On Mars (where air pressure is only 600 to 950 Pa), unpressurized human bodily fluids, saliva, and moisture in the lungs would boil instantly at body heat. A pressurized space suit is mandatory.',
    citation: 'NASA Flight Surgeon Guidelines / Bioastronautics Data Book',
  },
  {
    term: 'MOLA Areoid Datum',
    symbol: '0 m Elevation Datum',
    category: 'Cartography & Geodesy',
    simpleExplanation:
      'Because Mars has no oceans, scientists defined "sea level" (0 meters elevation) using laser altimetry (MOLA) where the average atmospheric pressure equals 610.5 Pascals — the exact "triple point of water" where ice, liquid, and vapor can theoretically coexist.',
    citation: 'Smith et al., NASA Goddard Space Flight Center',
  },
  {
    term: 'milliSievert (mSv)',
    symbol: 'mSv',
    category: 'Radiation Dosimetry',
    simpleExplanation:
      'A unit measuring biological damage caused by ionizing radiation on human living tissue. An average person on Earth absorbs ~3 mSv per year from natural background radiation. An astronaut on the Martian surface at Gale Crater absorbs ~245 mSv per year (over 80 times higher).',
    citation: 'Curiosity RAD / NASA Human Research Program',
  },
  {
    term: 'Galactic Cosmic Rays (GCR)',
    symbol: 'GCR',
    category: 'Astrophysics',
    simpleExplanation:
      'High-energy atomic nuclei (protons, iron ions) accelerated to near light-speed by distant supernova explosions outside our solar system. Because Mars lacks a global protective magnetic field and has a very thin atmosphere, GCRs penetrate straight to the surface and through spacesuits, creating lifetime cancer and cognitive risks.',
    citation: 'Zeitlin et al., Science 340 (2013)',
  },
  {
    term: 'Solar Particle Event (SPE)',
    symbol: 'SPE / Solar Flare',
    category: 'Space Weather',
    simpleExplanation:
      'Violent eruptions of charged protons and ions from the Sun during intense solar flares or coronal mass ejections (CMEs). While sporadic, an unshielded astronaut caught during a major SPE could receive a lethal radiation dose (several Sieverts) within hours, requiring immediate storm shelters.',
    citation: 'NASA Space Radiation Analysis Group (SRAG)',
  },
  {
    term: 'Perchlorates',
    symbol: 'ClO₄⁻',
    category: 'Chemistry & Regolith Toxicity',
    simpleExplanation:
      'Naturally occurring chlorine-oxygen salts pervasive throughout Martian soil (0.5% to 1.0% by weight). Perchlorates act as an antifreeze that lowers the freezing point of water, but they are toxic to humans, disrupting thyroid hormone regulation and causing lung damage if inhaled as dust.',
    citation: 'Phoenix TEGA / NASA Astrobiology Institute',
  },
  {
    term: 'Optical Depth (Tau / τ)',
    symbol: 'τ',
    category: 'Atmospheric Physics',
    simpleExplanation:
      'A scientific measurement of how much sunlight is blocked by airborne dust in the Martian atmosphere. Low tau (~0.3) means crisp, clear skies. High tau (>3.0 to 8.0) indicates dense planet-encircling dust storms that block over 90% to 99% of sunlight, crippling solar-powered landers.',
    citation: 'Perseverance MEDA / Curiosity REMS',
  },
  {
    term: 'ISRU (In-Situ Resource Utilization)',
    symbol: 'ISRU',
    category: 'Space Engineering',
    simpleExplanation:
      'The practice of harvesting and manufacturing essential consumables (such as breathable oxygen, drinking water, and rocket fuel) directly from local planetary resources instead of carrying everything from Earth. Example: Perseverance\'s MOXIE instrument splits Martian CO₂ into O₂.',
    citation: 'NASA Space Technology Mission Directorate',
  },
  {
    term: 'ECLSS',
    symbol: 'Life Support',
    category: 'Spacecraft Architecture',
    simpleExplanation:
      'Environmental Control and Life Support System: the integrated network of hardware that pressurizes habitats, removes carbon dioxide, generates oxygen, regulates temperature and humidity, and recycles wastewater to keep humans alive.',
    citation: 'NASA Marshall Space Flight Center',
  },
  {
    term: 'Scale Height (H ≈ 10.8 km)',
    symbol: 'H',
    category: 'Planetary Aeronomy',
    simpleExplanation:
      'The vertical distance over which atmospheric pressure decreases by a factor of e (~2.718). On Earth, scale height is ~8.5 km; on Mars, due to lower gravity, it is ~10.8 km. This formula lets scientists accurately calculate air pressure at any mountain peak or deep basin.',
    citation: 'NASA GSFC Mars Fact Sheet',
  },
];

export default marsGlossary;
