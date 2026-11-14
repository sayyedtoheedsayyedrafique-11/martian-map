/**
 * Mars Environmental Survival Readiness Assessment
 * Educational assessment based on NASA Human Research Program (HRP), NASA Space Flight Human-System Standards (NASA-STD-3001),
 * and peer-reviewed bioastronautics literature.
 * 
 * Strict Ethical Directive:
 * - NO fake survival percentage scores (e.g. "82% survivable").
 * - NO claim that humans can survive unassisted at any Martian location.
 * - Mars is lethal to unassisted humans in under 60 seconds everywhere on the planet.
 */

export const marsSurvivalReadiness = [
  {
    id: 'hypobaric-pressure',
    title: 'Hypobaric Atmosphere & Armstrong Limit',
    category: 'Pressure & Atmosphere',
    severity: 'Lethal without full-pressure countermeasure',
    scientificEvidence:
      'In-situ barometers (Curiosity REMS, Perseverance MEDA, InSight APSS) demonstrate surface pressures of 685–950 Pa across lowlands and <100 Pa at high volcanic summits. This is ~85% to 99% below the human Armstrong Limit (6,300 Pa / 63 mbar).',
    evidenceCitation: 'Gómez-Elvira et al. (2012); Rodriguez-Manfredi et al. (2021)',
    requiredProtection: [
      'Full-body pressurized EVA space suit maintaining minimum 29.6 kPa (4.3 psi) pure O₂ or 56 kPa mixed gas to prevent ebullism and hypoxia.',
      'Hermetically sealed habitat structures maintaining 70.3 to 101.3 kPa cabin pressure.',
      'Decompression airlocks with automated nitrogen pre-breathe protocols to prevent decompression sickness (the bends).'
    ],
    missingOrUncertainInfo: [
      'Long-term micro-leak rates and material fatigue of composite inflatable habitat fabrics under severe diurnal pressure oscillations and UV weathering.',
      'Feasibility of mechanical counter-pressure (skintight elastic biosuits) under real-world abrasive dust conditions.'
    ]
  },
  {
    id: 'cryogenic-cold',
    title: 'Extreme Cryogenic Temperature Swings',
    category: 'Thermal Environment',
    severity: 'Lethal in minutes without active thermal control',
    scientificEvidence:
      'REMS and MEDA data prove diurnal temperature swings exceeding 70°C to 80°C every single sol, with nocturnal air temperatures plunging between -75°C and -100°C even at equatorial sites. Thermal conductivity of the thin CO₂ atmosphere is very low, but radiative cooling to black space is extreme.',
    evidenceCitation: 'Curiosity REMS Archive; Haberle et al. (2014)',
    requiredProtection: [
      'Active liquid cooling and ventilation garments (LCVG) integrated with resistance heating loops in EVA gloves and boots.',
      'Vacuum-insulated panels (VIPs) and multi-layer aerogel insulation inside habitat walls.',
      'Fission surface power (e.g., NASA Kilopower nuclear reactor) or large battery reserves dedicated to life-support heating throughout the 12-hour sub-zero Martian night.'
    ],
    missingOrUncertainInfo: [
      'Reliability of mechanical seals, hatch O-rings, and airlock valves subjected to 1,000+ diurnal thermal cycles from -100°C to +20°C.',
      'Subsurface regolith thermal conductivity variations across different Martian quadrangles.'
    ]
  },
  {
    id: 'ionizing-radiation',
    title: 'Unattenuated Galactic Cosmic Rays (GCR) & Solar Particle Events (SPE)',
    category: 'Radiation Dosimetry',
    severity: 'Chronic fatal cancer risk & acute radiation sickness',
    scientificEvidence:
      'Curiosity RAD directly recorded a persistent surface dose rate of 0.67 ± 0.05 mSv/sol (~245 mSv/year), equivalent to ~80× natural Earth background radiation. Mars possesses no intrinsic dipolar magnetic shield and an atmospheric column density of only ~20 g/cm².',
    evidenceCitation: 'Ehresmann et al., Science (2014); Hassler et al., Science (2014)',
    requiredProtection: [
      'Subsurface habitat placement under 2.5 to 3.0 meters of compacted Martian regolith, or inside natural lava tubes.',
      'Dedicated storm shelters lined with hydrogen-rich materials (water tanks, polyethylene, food stores) for crew refuge during emergency Solar Particle Events (SPEs).',
      'Real-time orbital and surface space weather warning dosimeters (linked to MAVEN and GOES relays).',
      'Strict limits on astronaut cumulative EVA hours over a 500-day surface expedition.'
    ],
    missingOrUncertainInfo: [
      'Biological effects of chronic low-dose high-Z and high-energy (HZE) cosmic ray ions on human brain neurogenesis, ocular lens cataracts, and cardiovascular integrity.',
      'Effectiveness of pharmaceutical radioprotectants and DNA repair antioxidants in deep space.'
    ]
  },
  {
    id: 'water-deprivation',
    title: 'Total Lack of Open Surface Liquid Water',
    category: 'Hydrology & ISRU',
    severity: 'Lethal in 3 to 5 days without closed-loop recycling or ISRU extraction',
    scientificEvidence:
      'Atmospheric pressure is below or near the water triple point (611.7 Pa). Surface liquid water cannot persist in stable open pools; it immediately boils, freezes, or evaporates. Soil water is chemically bound inside crystalline clays (1.5–3.0 wt%), while pure ice is restricted to polar permafrost (Phoenix) or buried glacial sheets beneath 1–2 meters of debris (SHARAD).',
    evidenceCitation: 'Smith et al. (2009); Leshin et al. (2013); Holt et al. (2008)',
    requiredProtection: [
      'Closed-loop Environmental Control and Life Support System (ECLSS) recycling >98% of all human metabolic wastewater, sweat, and urine (similar to ISS ECLSS).',
      'Excavation machinery and high-temperature thermal ovens (350°C–500°C) for baking hydrated minerals into potable steam.',
      'Chemical perchlorate wash units to remove carcinogenic chlorine salts prior to consumption.'
    ],
    missingOrUncertainInfo: [
      'Exact accessibility, depth profile, and chemical purity of buried glacial ice sheets in mid-latitude regions (30°–50° latitude).',
      'Power demands and mechanical wear rates for continuous permafrost drilling in cryogenic regolith.'
    ]
  },
  {
    id: 'toxic-dust-perchlorates',
    title: 'Fine Toxic Dust & Perchlorate Regolith Contamination',
    category: 'Toxicology & Mechanics',
    severity: 'Respiratory silicosis, thyroid endocrine disruption, and mechanical jamming',
    scientificEvidence:
      'Phoenix TEGA and Curiosity SAM confirmed 0.5% to 1.0% perchlorate salts (Mg(ClO₄)₂, Ca(ClO₄)₂) throughout Martian surface dust. Dust particles are extremely fine (<3 microns), jagged (due to lack of liquid water erosion), and electrostatically charged.',
    evidenceCitation: 'Hecht et al., Science (2009); Ming et al., Science (2014)',
    requiredProtection: [
      'Suitlock / suit-port docking architectures where spacesuits remain outside the habitat, preventing dust from ever entering the crew living quarters.',
      'High-efficiency particulate air (HEPA) filtration and electrostatic dust precipitators inside airlocks.',
      'Active dust mitigation coatings on solar arrays and mechanical joints.'
    ],
    missingOrUncertainInfo: [
      'Human toxicity thresholds for chronic low-level inhalation of Martian perchlorate-laced dust.',
      'Electrostatic charging behavior of fine dust during violent regional dust storms and dust devil encounters.'
    ]
  }
];

export default marsSurvivalReadiness;
