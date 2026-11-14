/**
 * terrainTypes.js — Martian Terrain & USGS Chronostratigraphic Architecture
 * 
 * Sources:
 * - USGS Scientific Investigations Map 3292 (SIM 3292): "Geologic Map of Mars" (Tanaka et al., 2014)
 *   https://pubs.usgs.gov/sim/3292/
 * - USGS Astrogeology Planetary Geologic Mapping (PGM) Program:
 *   https://astrogeology.usgs.gov/research/planetary-geologic-mapping
 * - NASA Mars Exploration Program (MEP):
 *   https://mars.nasa.gov/
 */

// Official Chronostratigraphic Eras of Mars based on USGS SIM 3292 (Tanaka et al. 2014)
export const USGS_CHRONOSTRATIGRAPHY = [
  {
    id: 'noachian',
    period: 'Noachian Period',
    epochSpan: 'Early, Middle, and Late Noachian',
    ageRange: '~4.10 Ga to ~3.71 Ga',
    mapCodePrefix: 'N (eN, mN, lN)',
    colorHex: '#b48a58',
    usgsMapColor: 'Warm Earth Ochre',
    summary: 'The ancient water-rich epoch of Martian history characterized by intense meteorite bombardment, valley network drainage, and open-basin paleolakes.',
    climaticConditions: 'Relatively dense CO₂-H₂O atmosphere; active hydrological precipitation/runoff; neutral-to-alkaline pH water enabling smectite clay formation.',
    notableFormations: ['Jezero Crater western delta', 'Gale Crater floor mudstones', 'Noachis Terra highlands', 'Nili Fossae megabreccia'],
    traversabilityProfile: 'Rugged highlands with boulder fields and crater ejecta; high relief gradients requiring AutoNav hazard avoidance.',
    sourceUrl: 'https://pubs.usgs.gov/sim/3292/',
    verified: true,
  },
  {
    id: 'hesperian',
    period: 'Hesperian Period',
    epochSpan: 'Early and Late Hesperian',
    ageRange: '~3.71 Ga to ~3.00 Ga',
    mapCodePrefix: 'H (eH, lH)',
    colorHex: '#6d8c6b',
    usgsMapColor: 'Olive Sage Green',
    summary: 'Epoch of planetary transition marked by voluminous flood volcanism, catastrophic megafloods carving outflow channels, and atmospheric loss.',
    climaticConditions: 'Global cooling and atmospheric stripping; volcanic SO₂ outgassing producing acidic conditions that deposited vast hydrated sulfates (kieserite, gypsum).',
    notableFormations: ['Hesperia Planum ridged plains', 'Kasei Valles outflow channel', 'Syrtis Major volcanic shields', 'Meridiani Planum sulfate bedrock'],
    traversabilityProfile: 'Broad basaltic volcanic plains with localized wrinkle ridges; generally favorable for long-range wheeled traverse.',
    sourceUrl: 'https://pubs.usgs.gov/sim/3292/',
    verified: true,
  },
  {
    id: 'amazonian',
    period: 'Amazonian Period',
    epochSpan: 'Early, Middle, and Late Amazonian',
    ageRange: '~3.00 Ga to Present Day',
    mapCodePrefix: 'A (eA, mA, lA)',
    colorHex: '#7395aa',
    usgsMapColor: 'Slate Arctic Blue',
    summary: 'The ongoing, hyper-arid desert era spanning the last three billion years of Mars. Dominated by eolian wind erosion, dust storms, and polar ice deposition.',
    climaticConditions: 'Ultra-thin atmosphere (~610 Pa); cold, dry, oxidizing surface chemistry; pervasive ferric oxide (Fe₂O₃) dust mantle and perchlorate salts.',
    notableFormations: ['Olympus Mons & Tharsis calderas', 'Planum Boreum polar layered deposits', 'Medusae Fossae formation', 'Active Bagnold dune fields'],
    traversabilityProfile: 'Variable: flat volcanic plains and ice-cemented regolith offer low resistance, while loose basaltic sand dunes present severe wheel-trap hazards.',
    sourceUrl: 'https://pubs.usgs.gov/sim/3292/',
    verified: true,
  },
];

// Verified USGS SIM 3292 Geologic Units found at active exploration sites
export const USGS_GEOLOGIC_UNITS = [
  {
    code: 'lNh',
    name: 'Late Noachian Highland Unit',
    period: 'Noachian',
    colorHex: '#a07850',
    type: 'Cratered Highland Bedrock',
    occurrence: 'Southern highlands, rims of Jezero and Gale Craters',
    description: 'Densely cratered terrain cut by branched valley networks. Composed of impact breccias and smectite clay-rich sedimentary interbeds.',
    hazardGrade: 'Moderate to High (Steep rim scarps & boulder fields)',
    sourceUrl: 'https://pubs.usgs.gov/sim/3292/',
  },
  {
    code: 'eHv',
    name: 'Early Hesperian Volcanic Unit',
    period: 'Hesperian',
    colorHex: '#5e8562',
    type: 'Flood Basalt Plains',
    occurrence: 'Hesperia Planum, Syrtis Major, floor of Jezero Crater',
    description: 'Extensive sheet lavas displaying prominent compressional wrinkle ridges. Predominantly basaltic with high olivine cumulate content.',
    hazardGrade: 'Low to Moderate (Smooth surface interrupted by ridge scarps)',
    sourceUrl: 'https://pubs.usgs.gov/sim/3292/',
  },
  {
    code: 'Hch',
    name: 'Hesperian Channel Material',
    period: 'Hesperian',
    colorHex: '#7c9a72',
    type: 'Catastrophic Outflow Deposit',
    occurrence: 'Ares Vallis, Tiu Vallis, Neretva Vallis',
    description: 'Scoured channel floors, streamlined teardrop islands, and coarse boulder conglomerates deposited by high-velocity liquid outburst events.',
    hazardGrade: 'High (Channel scarps, dry gorges, and imbricated boulders)',
    sourceUrl: 'https://pubs.usgs.gov/sim/3292/',
  },
  {
    code: 'eAv',
    name: 'Early Amazonian Volcanic Construct Unit',
    period: 'Amazonian',
    colorHex: '#6b899e',
    type: 'Shield Volcano Construct',
    occurrence: 'Olympus Mons, Ascraeus Mons, Pavonis Mons, Arsia Mons',
    description: 'Massive basaltic shield volcanic flows with low flank slopes (4°–8°) surrounded by steep basal scarps rising up to 8 km above the plains.',
    hazardGrade: 'Critical (Basal cliffs and collapsed caldera chasms)',
    sourceUrl: 'https://pubs.usgs.gov/sim/3292/',
  },
  {
    code: 'lAed',
    name: 'Late Amazonian Eolian Dune Unit',
    period: 'Amazonian',
    colorHex: '#84a5b8',
    type: 'Active Sand Dunes & Ripples',
    occurrence: 'Bagnold Dunes (Gale), Séítah (Jezero), Olympia Undae',
    description: 'Unconsolidated, wind-blown basaltic sand dunes with active slip faces. Dunes migrate up to 1 meter per Earth year under prevailing winds.',
    hazardGrade: 'Critical Mobility Hazard (Severe wheel slip and sinkage)',
    sourceUrl: 'https://pubs.usgs.gov/sim/3292/',
  },
  {
    code: 'lAp',
    name: 'Late Amazonian Polar Layered Deposit Unit',
    period: 'Amazonian',
    colorHex: '#a3bfcc',
    type: 'Glacial Ice & Dust Stratigraphy',
    occurrence: 'Planum Boreum (North Pole), Planum Australe (South Pole)',
    description: 'Finely layered strata of water ice, seasonal CO₂ dry ice frost, and trapped atmospheric dust recording Mars\' orbital obliquity cycles.',
    hazardGrade: 'Extreme Environmental Hazard (Sub-freezing temperatures to -153°C)',
    sourceUrl: 'https://pubs.usgs.gov/sim/3292/',
  },
];

// Existing base terrain types preserved for backwards compatibility
const terrainTypes = [
  {
    id: 'volcanic',
    name: 'Volcanic Terrain',
    description: 'Regions of volcanic origin, including shield volcanoes, lava flows, and volcanic plains. Tharsis and Elysium regions are major volcanic provinces.',
    characteristics: ['Basaltic rock', 'Lava tubes possible', 'Generally smooth flows', 'High elevation areas'],
    examples: ['Olympus Mons', 'Tharsis Montes', 'Elysium Mons'],
    hazardLevel: 'Moderate',
    color: '#c0392b',
    usgsCode: 'eAv / eHv',
  },
  {
    id: 'impact',
    name: 'Impact Craters',
    description: 'Circular depressions formed by meteorite impacts. Mars has tens of thousands of craters larger than 1 km. Some contain evidence of past water.',
    characteristics: ['Central peaks in larger craters', 'Ejecta blankets', 'Possible aqueous minerals', 'Variable terrain roughness'],
    examples: ['Gale Crater', 'Jezero Crater', 'Hellas Basin'],
    hazardLevel: 'Variable',
    color: '#8e44ad',
    usgsCode: 'lNh / mNh',
  },
  {
    id: 'canyon',
    name: 'Canyon Systems',
    description: 'Deep valleys and canyon networks. Valles Marineris is the most prominent, but Mars has many smaller canyon and channel systems.',
    characteristics: ['Steep walls', 'Layered rock exposures', 'Potential landslide zones', 'Possible past water flow'],
    examples: ['Valles Marineris', 'Noctis Labyrinthus', 'Coprates Chasma'],
    hazardLevel: 'High',
    color: '#d35400',
    usgsCode: 'Hch',
  },
  {
    id: 'plains',
    name: 'Plains & Lowlands',
    description: 'Relatively flat, low-elevation regions of Mars. The northern lowlands cover about one-third of the planet and may be an ancient ocean basin.',
    characteristics: ['Low elevation', 'Relatively smooth', 'Favorable for landing', 'Possible subsurface ice'],
    examples: ['Utopia Planitia', 'Chryse Planitia', 'Acidalia Planitia'],
    hazardLevel: 'Low',
    color: '#27ae60',
    usgsCode: 'eHl / mAl',
  },
  {
    id: 'polar',
    name: 'Polar Regions',
    description: 'Mars has permanent ice caps at both poles, composed of water ice and CO₂ ice. Seasonal changes cause dramatic frost and sublimation cycles.',
    characteristics: ['Water and CO₂ ice', 'Layered deposits', 'Extreme cold', 'Seasonal changes'],
    examples: ['Planum Boreum (North Pole)', 'Planum Australe (South Pole)'],
    hazardLevel: 'High',
    color: '#2980b9',
    usgsCode: 'lAp',
  },
  {
    id: 'dune',
    name: 'Dune Fields',
    description: 'Areas of wind-deposited sand dunes. Mars has extensive dune fields, some actively migrating. Bagnold Dunes in Gale Crater were studied by Curiosity.',
    characteristics: ['Fine sand particles', 'Active migration', 'Wind-shaped patterns', 'Challenging surface for rovers'],
    examples: ['Bagnold Dunes', 'Olympia Undae', 'Nili Patera dunes'],
    hazardLevel: 'Moderate',
    color: '#f39c12',
    usgsCode: 'lAed',
  },
];

export default terrainTypes;
