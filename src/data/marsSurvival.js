/**
 * Mars Environmental Survival Data
 * Educational reference panel for Mars Pathfinder.
 *
 * All values are sourced from peer-reviewed publications and official NASA/ESA archives.
 * No data is invented or interpolated beyond published ranges.
 *
 * Primary Sources:
 *   - NASA Mars Fact Sheet (GSFC/NSSDC): https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
 *   - NASA Human Research Program — Spaceflight Hazards: https://www.nasa.gov/hrp/
 *   - ESA Mars Express atmospheric science: https://www.esa.int/Science_Exploration/Space_Science/Mars_Express
 *   - Curiosity REMS (PDS): https://pds-geosciences.wustl.edu/missions/msl/rems.htm
 *   - Perseverance MEDA (PDS): https://pds-geosciences.wustl.edu/missions/mars2020/meda.html
 *   - NASA RAD aboard Curiosity — Ehresmann et al. (2014), Science 343(6169): https://doi.org/10.1126/science.1244797
 *   - Phoenix lander water-ice confirmation — Smith et al. (2009), Science 325: https://doi.org/10.1126/science.1172344
 *   - InSight SEIS — Banerdt et al. (2020), Nature Geoscience 13: https://doi.org/10.1038/s41561-020-0544-y
 */

export const survivalHazards = [
  {
    id: 'temperature',
    icon: 'thermometer',
    title: 'Extreme Temperature Range',
    severity: 'critical',
    summary: 'Surface temperatures swing from −153 °C (polar winter) to +20 °C (equatorial summer noon). Average is −60 °C.',
    details: [
      {
        label: 'Global average surface temperature',
        value: '−60 °C (213 K)',
        note: 'Weighted mean from REMS and Viking meteorological records.',
      },
      {
        label: 'Equatorial daytime maximum (summer)',
        value: 'Up to +20 °C (293 K)',
        note: 'Ground temperature recorded by Curiosity REMS at Gale Crater (Sol 370, summer). Air temperature at 1.5 m remains below 0 °C.',
      },
      {
        label: 'Polar winter minimum',
        value: '−153 °C (120 K)',
        note: 'South polar cap winter; CO₂ freezes to dry ice at −125 °C (148 K).',
      },
      {
        label: 'Diurnal swing at Gale Crater',
        value: '~70 °C per sol',
        note: 'Typical day-to-night temperature delta measured by Curiosity REMS (MSL-M-REMS-2-EDR-V1.0).',
      },
    ],
    implication:
      'Without thermal suits rated for at least −80 °C and active heating systems, EVA exposure would be lethal within minutes at night. Habitat insulation must prevent cryogenic condensation of equipment lubricants.',
    sourceLabel: 'Curiosity REMS / NASA GSFC Mars Fact Sheet',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html',
    dataAvailable: true,
  },
  {
    id: 'atmosphere',
    icon: 'wind',
    title: 'Thin CO₂ Atmosphere',
    severity: 'critical',
    summary: 'Atmospheric pressure averages ~610 Pa — less than 0.6% of Earth sea-level. Composed of 95.3% CO₂: unbreathable without life support.',
    details: [
      {
        label: 'Mean surface pressure',
        value: '~610 Pa (0.006 atm)',
        note: 'Defined as the MOLA Areoid datum. Varies seasonally ±10% as CO₂ exchanges between poles and atmosphere.',
      },
      {
        label: 'Atmospheric composition (dry)',
        value: '95.32% CO₂, 2.7% N₂, 1.6% Ar, 0.13% O₂',
        note: 'From Viking Lander mass spectrometry and Mars Express OMEGA (ESA).',
      },
      {
        label: 'Scale height',
        value: '~10.8 km',
        note: 'Mars atmosphere thins exponentially with altitude at this characteristic scale height (NASA GSFC).',
      },
      {
        label: 'Dust optical depth (tau)',
        value: '0.3–0.8 (clear) to >5 (global storm)',
        note: 'MEDA and REMS dust sensors; global dust storms can reduce sunlight by >90% for months.',
      },
    ],
    implication:
      'Astronauts require a fully sealed pressure suit at all times outside habitat. The partial pressure of O₂ must be actively regulated. CO₂ concentration is immediately lethal without rebreather systems. MOXIE (on Perseverance) demonstrated 122 g of O₂ can be extracted from CO₂ — proving in-situ resource utilization is technically feasible.',
    sourceLabel: 'NASA Mars Fact Sheet / ESA Mars Express / MOXIE (Perseverance)',
    sourceUrl: 'https://mars.nasa.gov/mars2020/spacecraft/instruments/moxie/',
    dataAvailable: true,
  },
  {
    id: 'radiation',
    icon: 'radiation',
    title: 'Ionising Radiation Exposure',
    severity: 'critical',
    summary: 'Mars surface receives ~0.67 mSv/day from Galactic Cosmic Rays and Solar Energetic Particles — roughly 240× the average background on Earth.',
    details: [
      {
        label: 'Surface radiation dose (Gale Crater)',
        value: '~0.67 mSv/day (233–244 mGy/yr)',
        note: 'Measured directly by Curiosity RAD instrument. Published Ehresmann et al. (2014), Science 343(6169).',
      },
      {
        label: 'Transit dose (each way to Mars)',
        value: '~300 mSv (6-month cruise)',
        note: 'RAD data collected during Mars Science Laboratory cruise phase. Zeitlin et al. (2013), Science 340.',
      },
      {
        label: 'NASA career dose limit',
        value: '600 mSv (lifetime)',
        note: 'NASA Space Medicine limit to keep excess cancer risk below 3% (HRP-47052, 2021).',
      },
      {
        label: 'Mars atmosphere shielding',
        value: '~20 g/cm² column density',
        note: 'Provides roughly 1/3 the shielding of Earth sea level. Subsurface habitats would reduce dose significantly.',
      },
    ],
    implication:
      'A 500-day Mars surface mission would consume most or all of NASA\'s career radiation limit. Habitat shielding (regolith-covered modules or lava tubes) and limiting EVA duration are required risk mitigations. Real-time solar particle event monitoring is mandatory for emergency shelter protocol.',
    sourceLabel: 'Curiosity RAD — Ehresmann et al. 2014 (Science)',
    sourceUrl: 'https://doi.org/10.1126/science.1244797',
    dataAvailable: true,
  },
  {
    id: 'water',
    icon: 'droplets',
    title: 'Water Availability',
    severity: 'high',
    summary: 'No accessible liquid water exists on the surface. Water ice confirmed below surface and at poles. Extraction is technically possible but resource-intensive.',
    details: [
      {
        label: 'Surface liquid water',
        value: 'None confirmed',
        note: 'Atmospheric pressure below 611.7 Pa (triple point of water) means liquid water instantly boils or freezes at surface.',
      },
      {
        label: 'Sub-surface water ice',
        value: 'Confirmed at ≥2 cm depth (polar/mid-lat)',
        note: 'Phoenix TEGA instrument physically confirmed water ice at 68°N. MRO SHARAD radar maps extensive ice deposits.',
      },
      {
        label: 'Polar ice cap water content',
        value: 'North cap: ~1.2 million km³ water ice',
        note: 'Estimated from MOLA topography and MRO radar. Equivalent to ~35 m global water layer (Zuber et al.).',
      },
      {
        label: 'Regolith water content',
        value: '1.5–6% by weight (mid-latitudes)',
        note: 'OMEGA (Mars Express) and THEMIS data. Hydrated minerals (perchlorate brines) confirmed by Phoenix.',
      },
    ],
    implication:
      'In-situ water extraction (ISRU) from subsurface ice or hydrated regolith is feasible but requires significant power and mining equipment. Perchlorate contamination of regolith water requires purification before human use. Real-time water detection data from the surface is not publicly available in a form usable here.',
    sourceLabel: 'Phoenix Lander — Smith et al. 2009 / MRO SHARAD',
    sourceUrl: 'https://doi.org/10.1126/science.1172344',
    dataAvailable: true,
  },
  {
    id: 'terrain',
    icon: 'mountain',
    title: 'Terrain & Geological Hazards',
    severity: 'high',
    summary: 'Mars terrain ranges from smooth volcanic plains to 21 km-high volcanoes, 7–10 km-deep canyon systems, and boulder-strewn impact ejecta fields.',
    details: [
      {
        label: 'Planetary relief range',
        value: '−8.2 km (Hellas) to +21.3 km (Olympus Mons)',
        note: 'Total relief of ~29.5 km compared to Earth\'s ~19.8 km (MOLA DEM).',
      },
      {
        label: 'Dust devil vortices',
        value: 'Up to 8 km tall, wind speeds ~60 m/s locally',
        note: 'Imaged by MRO HiRISE and measured by InSight TWINS sensor. Regular occurrence in Amazonis and Hellas.',
      },
      {
        label: 'Global dust storms',
        value: 'Recur every 3–4 Mars years (5.5–7.5 Earth years)',
        note: 'Historical record from Viking through MRO. 2018 storm killed Opportunity rover by blocking solar panels.',
      },
      {
        label: 'Rover slope limit',
        value: '≤15° safe traverse grade',
        note: 'JPL MER/MSL engineering specification. Slopes above 15° risk wheel slippage and tip hazard.',
      },
    ],
    implication:
      'Pre-mission orbital reconnaissance using HiRISE (0.25 m/px) and CTX data is essential before any surface traverse. No real-time hazard map feed exists for this application — displayed terrain hazards in the route planner are derived from published geomorphological USGS category assessments, not live orbital measurements.',
    sourceLabel: 'USGS Astrogeology / MRO HiRISE',
    sourceUrl: 'https://www.uahirise.org/',
    dataAvailable: false,
    dataLimitation: 'Real-time terrain hazard mapping requires HiRISE orbital products not available via public tile API.',
  },
];

export const survivalSeverityColors = {
  critical: { bg: 'transparent', border: '#F5C542', label: 'Critical', labelColor: '#F5C542' },
  high:     { bg: 'transparent', border: '#71717A', label: 'High Risk', labelColor: '#D4D4D8' },
  moderate: { bg: 'transparent', border: '#303333', label: 'Moderate', labelColor: '#A1A1AA' },
};
