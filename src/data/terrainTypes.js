/**
 * Mars terrain classification based on USGS geological mapping
 * and NASA mission observations.
 * 
 * Source: USGS Astrogeology, NASA Mars Exploration Program
 * Note: These are simplified terrain categories for educational purposes.
 */

const terrainTypes = [
  {
    id: 'volcanic',
    name: 'Volcanic Terrain',
    description: 'Regions of volcanic origin, including shield volcanoes, lava flows, and volcanic plains. Tharsis and Elysium regions are major volcanic provinces.',
    characteristics: ['Basaltic rock', 'Lava tubes possible', 'Generally smooth flows', 'High elevation areas'],
    examples: ['Olympus Mons', 'Tharsis Montes', 'Elysium Mons'],
    hazardLevel: 'Moderate',
    color: '#c0392b',
  },
  {
    id: 'impact',
    name: 'Impact Craters',
    description: 'Circular depressions formed by meteorite impacts. Mars has tens of thousands of craters larger than 1 km. Some contain evidence of past water.',
    characteristics: ['Central peaks in larger craters', 'Ejecta blankets', 'Possible aqueous minerals', 'Variable terrain roughness'],
    examples: ['Gale Crater', 'Jezero Crater', 'Hellas Basin'],
    hazardLevel: 'Variable',
    color: '#8e44ad',
  },
  {
    id: 'canyon',
    name: 'Canyon Systems',
    description: 'Deep valleys and canyon networks. Valles Marineris is the most prominent, but Mars has many smaller canyon and channel systems.',
    characteristics: ['Steep walls', 'Layered rock exposures', 'Potential landslide zones', 'Possible past water flow'],
    examples: ['Valles Marineris', 'Noctis Labyrinthus', 'Coprates Chasma'],
    hazardLevel: 'High',
    color: '#d35400',
  },
  {
    id: 'plains',
    name: 'Plains & Lowlands',
    description: 'Relatively flat, low-elevation regions of Mars. The northern lowlands cover about one-third of the planet and may be an ancient ocean basin.',
    characteristics: ['Low elevation', 'Relatively smooth', 'Favorable for landing', 'Possible subsurface ice'],
    examples: ['Utopia Planitia', 'Chryse Planitia', 'Acidalia Planitia'],
    hazardLevel: 'Low',
    color: '#27ae60',
  },
  {
    id: 'polar',
    name: 'Polar Regions',
    description: 'Mars has permanent ice caps at both poles, composed of water ice and CO₂ ice. Seasonal changes cause dramatic frost and sublimation cycles.',
    characteristics: ['Water and CO₂ ice', 'Layered deposits', 'Extreme cold', 'Seasonal changes'],
    examples: ['Planum Boreum (North Pole)', 'Planum Australe (South Pole)'],
    hazardLevel: 'High',
    color: '#2980b9',
  },
  {
    id: 'dune',
    name: 'Dune Fields',
    description: 'Areas of wind-deposited sand dunes. Mars has extensive dune fields, some actively migrating. Bagnold Dunes in Gale Crater were studied by Curiosity.',
    characteristics: ['Fine sand particles', 'Active migration', 'Wind-shaped patterns', 'Challenging surface for rovers'],
    examples: ['Bagnold Dunes', 'Olympia Undae', 'Nili Patera dunes'],
    hazardLevel: 'Moderate',
    color: '#f39c12',
  },
];

export default terrainTypes;
