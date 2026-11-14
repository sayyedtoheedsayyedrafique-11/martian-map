/**
 * Mars Mission Intelligence Dataset
 * Verified datasets from NASA JPL Mars Exploration Program, NASA Planetary Data System (PDS),
 * and NASA Science Mission Directorate.
 * 
 * Strict Reliability Disclosures:
 * - Status dates are pegged to verified PDS archives and official NASA mission status bulletins.
 * - Live real-time GPS coordinates DO NOT exist on Mars (interplanetary radio signals carry a
 *   one-way speed-of-light delay between 3 and 22 minutes; position data is relayed via Mars
 *   orbital relays such as MRO, Odyssey, and MAVEN through the Deep Space Network).
 * - All landing coordinates are IAU 2000 Areographic coordinates referenced to MOLA Areoid.
 */

export const marsMissions = [
  {
    id: 'perseverance',
    name: 'NASA Perseverance',
    formalName: 'Mars 2020 Astrobiology Mission (Perseverance Rover)',
    program: 'NASA Mars Exploration Program',
    agency: 'NASA / JPL-Caltech',
    roverOrLanderType: 'Heavy Astrobiology Rover (with Ingenuity Helicopter Scout)',
    vehicleClass: 'Rover',
    landingSiteName: 'Jezero Crater (Octavia E. Butler Landing)',
    landingRegion: 'Syrtis Major Quadrangle / Nili Fossae',
    primaryLocationId: 'perseverance',
    pairedLocationIds: ['perseverance', 'ingenuity'],
    coordinates: {
      lat: 18.4447,
      lng: 77.4508,
      latFormatted: '18.4447° N',
      lngFormatted: '77.4508° E',
    },
    elevationMeters: -2500,
    elevationFormatted: '-2,500 m (MOLA Areoid)',
    launchDate: 'July 30, 2020',
    landingDate: 'February 18, 2021',
    surfaceOperatedSols: '1,300+ Sols (Active Ongoing Mission)',
    currentStatus: 'Active',
    statusCategory: 'active',
    statusSummary: 'Actively exploring the Jezero Crater ancient river delta. Caching hermetically sealed sample tubes, conducting mineralogical analyses, and validating ISRU atmospheric processing.',
    statusLastUpdated: 'October 2024 (NASA PDS Release 68 / JPL Ops Bulletin)',
    verificationBadge: 'NASA PDS Verified & Actively Monitored',
    
    // What is authentic vs what is unavailable
    telemetryNotice: {
      isLivePositionAvailable: false,
      reasonUnavailable: 'Interplanetary light latency (3–22 min) and scheduled Deep Space Network downlinks prevent instantaneous real-time GPS tracking. Position coordinates reflect the validated landing site and PDS-archived traverse route.',
      verifiedDataPoints: [
        'Landing site coordinates verified via NASA MRO HiRISE orbital imagery',
        'Rock core sample catalog logged in NASA PDS Geosciences node',
        'Atmospheric data cross-calibrated via MEDA instrument sensors',
        'MOXIE oxygen synthesis amounts physically measured and reported by JPL'
      ],
      unavailableDataPoints: [
        'Real-time sub-second GPS live beacon (Mars has no GPS constellation)',
        'Continuous high-definition live video broadcast to Earth',
        'Real-time battery and motor micro-telemetry outside scheduled DSN passes'
      ]
    },

    missionObjectives: [
      'Identify past habitable environments capable of having supported microbial life in Jezero Crater.',
      'Seek biosignatures (potential signs of past ancient microbial life) within preserved lacustrine rock records.',
      'Collect, hermetically seal, and cache a diverse set of rock cores and regolith samples for future retrieval by the NASA-ESA Mars Sample Return campaign.',
      'Test in-situ resource utilization (ISRU) technologies, specifically extracting breathable molecular oxygen from the Martian CO₂ atmosphere (MOXIE).',
      'Characterize environmental dynamics (dust storm cycles, wind, radiation) to prepare for future human exploration missions.'
    ],

    scientificDiscoveries: [
      'Confirmed that Jezero Crater once harbored a sustained, deep open-basin lake fed by an energetic river system ~3.7 billion years ago.',
      'Discovered diverse organic carbonaceous compounds inside sedimentary delta rocks using SHERLOC and PIXL.',
      'Successfully generated 122 grams of 98% pure oxygen from Martian carbon dioxide through the MOXIE instrument over 16 experimental runs.',
      'Discovered igneous rocks on the crater floor formed from magma cooling or ancient volcanic lakes, allowing precise radiometric age dating.',
      'Recorded the first authentic Martian acoustic audio using SuperCam and entry microphones, measuring the atmospheric speed of sound (~240 m/s).'
    ],

    scientificInstruments: [
      {
        acronym: 'Mastcam-Z',
        fullName: 'Mast Camera Zoom',
        type: 'Multispectral Stereoscopic Imager',
        institution: 'Arizona State University / Malin Space Science Systems',
        purpose: 'Provides 3D stereo imagery, zoom capability, and multispectral mineralogy mapping across the rover traverse.'
      },
      {
        acronym: 'SuperCam',
        fullName: 'SuperCam Remote Chemical & Mineralogy Suite',
        type: 'Laser-Induced Breakdown Spectroscopy (LIBS) & Raman',
        institution: 'Los Alamos National Lab / CNES (France)',
        purpose: 'Fires infrared laser pulses to vaporize microscopic rock targets up to 7 m away to determine chemical elemental makeup and records sound.'
      },
      {
        acronym: 'PIXL',
        fullName: 'Planetary Instrument for X-ray Lithochemistry',
        type: 'Micro-focus X-ray Fluorescence Spectrometer',
        institution: 'NASA Jet Propulsion Laboratory',
        purpose: 'Measures fine-scale elemental chemistry of rock surfaces at sub-millimeter scales to detect potential chemical biosignatures.'
      },
      {
        acronym: 'SHERLOC',
        fullName: 'Scanning Habitable Environments with Raman & Luminescence for Organics & Chemicals',
        type: 'Deep-UV Raman & Fluorescence Spectrometer',
        institution: 'NASA Jet Propulsion Laboratory',
        purpose: 'Detects minerals and organic carbon molecules using a 248.6 nm deep-ultraviolet laser coupled with WATSON high-res context imaging.'
      },
      {
        acronym: 'MOXIE',
        fullName: 'Mars Oxygen ISRU Experiment',
        type: 'Solid Oxide Electrolysis Demonstration',
        institution: 'Massachusetts Institute of Technology (MIT) / JPL',
        purpose: 'Electrochemically splits atmospheric CO₂ at 800°C into oxygen and carbon monoxide to prove oxygen production for fuel and life support.'
      },
      {
        acronym: 'MEDA',
        fullName: 'Mars Environmental Dynamics Analyzer',
        type: 'Atmospheric & Meteorological Station',
        institution: 'Centro de Astrobiología (CSIC/INTA, Spain)',
        purpose: 'Provides continuous recordings of wind speed/direction, pressure, relative humidity, air temperature, ground temperature, and solar radiation.'
      },
      {
        acronym: 'RIMFAX',
        fullName: 'Radar Imager for Mars\' Subsurface Experiment',
        type: 'Ground-Penetrating Radar',
        institution: 'University of Oslo / FFI (Norway)',
        purpose: 'Probes geological strata down to 10+ meters beneath the rover wheels with high-frequency radar pulses.'
      }
    ],

    explorationAchievements: [
      { metric: 'Surface Distance', value: '29.3+ km', detail: 'Traversed across Jezero Crater floor, western delta fan, and crater rim.' },
      { metric: 'Sample Tubes Cached', value: '25+ hermetically sealed', detail: 'Includes rock cores, regolith, atmospheric sample, and witness tubes stored at Three Forks and on board.' },
      { metric: 'Oxygen Produced (MOXIE)', value: '122 grams O₂', detail: 'Proven technology readiness level 7 across diverse seasons, day and night.' },
      { metric: 'Autonomous Navigation', value: 'AutoNav System', detail: 'Drives autonomously up to 200–300 meters per sol using dedicated vision compute chips.' },
      { metric: 'Aerial Scout Pairing', value: 'Ingenuity Helicopter', detail: 'Supported and accompanied 72 flights of the first aircraft on another planet.' }
    ],

    sources: [
      { title: 'NASA Mars 2020 Mission Home', url: 'https://mars.nasa.gov/mars2020/', type: 'Official Mission Portal' },
      { title: 'NASA PDS Geosciences Node (Mars 2020)', url: 'https://pds-geosciences.wustl.edu/missions/mars2020/', type: 'Peer-Reviewed Scientific Data Archive' },
      { title: 'NASA JPL Perseverance Science Reports', url: 'https://mars.nasa.gov/mars2020/mission/science/overview/', type: 'Technical Mission Documentation' }
    ]
  },

  {
    id: 'curiosity',
    name: 'NASA Curiosity',
    formalName: 'Mars Science Laboratory (Curiosity Rover / MSL)',
    program: 'NASA Mars Exploration Program',
    agency: 'NASA / JPL-Caltech',
    roverOrLanderType: 'Nuclear-Powered Analytical Rover (RTG)',
    vehicleClass: 'Rover',
    landingSiteName: 'Gale Crater (Bradbury Landing)',
    landingRegion: 'Aeolis Palus / Mount Sharp (Aeolis Mons)',
    primaryLocationId: 'curiosity',
    pairedLocationIds: ['curiosity'],
    coordinates: {
      lat: -4.5895,
      lng: 137.4417,
      latFormatted: '4.5895° S',
      lngFormatted: '137.4417° E',
    },
    elevationMeters: -4500,
    elevationFormatted: '-4,500 m (MOLA Areoid)',
    launchDate: 'November 26, 2011',
    landingDate: 'August 6, 2012',
    surfaceOperatedSols: '4,300+ Sols (Active Ongoing Mission)',
    currentStatus: 'Active',
    statusCategory: 'active',
    statusSummary: 'Continuously ascending Mount Sharp (Aeolis Mons) inside Gale Crater. Currently interrogating the sulfate-bearing unit to understand how Mars transitioned from wet to dry.',
    statusLastUpdated: 'October 2024 (NASA PDS Cumulative Archive Sols 1–4200)',
    verificationBadge: 'NASA PDS Verified & Actively Monitored',

    telemetryNotice: {
      isLivePositionAvailable: false,
      reasonUnavailable: 'Interplanetary light transmission delay (approx. 14 minutes average) and deep space downlink queues. Surface coordinates represent validated PDS-archived traverse positions.',
      verifiedDataPoints: [
        'Rover wheel traverse and drill holes cataloged in NASA PDS Geosciences Node',
        'SAM chemical gas chromatograph readings validated by scientific teams',
        'Surface radiation dosimetry recorded continuously by RAD sensor suite',
        'Daily ambient temperature and atmospheric pressure verified by REMS'
      ],
      unavailableDataPoints: [
        'Instantaneous sub-meter live GPS beacon',
        'Continuous unbuffered video feed to public web endpoints',
        'Unverified real-time wheel wear sensor readouts prior to engineering scrubbing'
      ]
    },

    missionObjectives: [
      'Assess the biological potential of Gale Crater: determine whether the landing region ever hosted micro-environments capable of supporting life.',
      'Characterize the geology and geochemical composition of the sedimentary rock layers forming Mount Sharp.',
      'Investigate planetary planetary processes that have shaped Mars\' atmosphere and climate over billions of years.',
      'Measure the wide spectrum of surface radiation (galactic cosmic rays, solar energetic particles) to determine safety thresholds for human astronauts.'
    ],

    scientificDiscoveries: [
      'Proved that ancient Gale Crater had persistent freshwater lake and stream environments with neutral pH, low salinity, and all major elements essential for microbial life (C, H, N, O, P, S).',
      'Discovered diverse indigenous organic molecules (chlorobenzene, sulfur-containing organics, aliphatic chains) preserved in 3.5-billion-year-old mudstones.',
      'Detected cyclical seasonal variations in background atmospheric methane concentrations, with sporadic localized spikes up to 21 ppb.',
      'Discovered evidence of ancient catastrophic megafloods with gigantic ripple marks and imbricated boulders inside Gale.',
      'Quantified the surface radiation environment over a full 11-year solar cycle with the RAD instrument, providing foundational safety data for future human expeditions.'
    ],

    scientificInstruments: [
      {
        acronym: 'SAM',
        fullName: 'Sample Analysis at Mars',
        type: 'Mass Spectrometer, Gas Chromatograph & Tunable Laser Spectrometer',
        institution: 'NASA Goddard Space Flight Center (GSFC)',
        purpose: 'Analyzes volatile compounds, carbon organics, and stable isotope ratios of drilled rock samples and atmospheric gas.'
      },
      {
        acronym: 'CheMin',
        fullName: 'Chemistry and Mineralogy X-ray Diffraction / Fluorescence',
        type: 'X-ray Powder Diffractometer',
        institution: 'NASA Ames Research Center',
        purpose: 'Identifies and quantifies specific mineral crystalline phases (clays, sulfates, pyroxenes) in pulverized Martian rock.'
      },
      {
        acronym: 'ChemCam',
        fullName: 'Chemistry and Camera Suite',
        type: 'Laser-Induced Breakdown Spectrometer (LIBS) & RMI',
        institution: 'Los Alamos National Lab / IRAP (France)',
        purpose: 'Fires high-powered laser pulses at rocks up to 7 m away and analyzes the light spectrum of the resulting vaporized plasma plume.'
      },
      {
        acronym: 'Mastcam',
        fullName: 'Mast Camera System',
        type: 'Color Stereo Camera Pair (34mm & 100mm)',
        institution: 'Malin Space Science Systems (MSSS)',
        purpose: 'Takes high-definition true-color scientific panoramas and multispectral terrain imaging.'
      },
      {
        acronym: 'RAD',
        fullName: 'Radiation Assessment Detector',
        type: 'Energetic Particle Dosimeter',
        institution: 'Southwest Research Institute (SwRI) / Christian-Albrechts-Universität (Germany)',
        purpose: 'Measures high-energy cosmic rays, protons, neutrons, and gamma radiation at the surface.'
      },
      {
        acronym: 'REMS',
        fullName: 'Rover Environmental Monitoring Station',
        type: 'Meteorological Suite',
        institution: 'Centro de Astrobiología (CAB, Spain)',
        purpose: 'Monitors ambient atmospheric pressure, ground temperature, air temperature, wind velocity, and relative humidity.'
      },
      {
        acronym: 'APXS',
        fullName: 'Alpha Particle X-ray Spectrometer',
        type: 'Contact Alpha & X-ray Spectrometer',
        institution: 'Canadian Space Agency (CSA) / University of Guelph',
        purpose: 'Contact sensor determining elemental chemistry of soils and rocks using curium-244 radioactive source.'
      },
      {
        acronym: 'MAHLI',
        fullName: 'Mars Hand Lens Imager',
        type: 'Microscopic Arm Camera',
        institution: 'Malin Space Science Systems',
        purpose: 'Microscopic color camera mounted on the robotic arm capable of resolving details smaller than the width of a human hair.'
      }
    ],

    explorationAchievements: [
      { metric: 'Surface Traverse', value: '32.5+ km', detail: 'Ascended over 800 vertical meters up Mount Sharp through mudstone, hematite ridge, and clay-sulfate transitions.' },
      { metric: 'Operational Longevity', value: '12+ Earth Years', detail: 'Designed for a 687-day prime mission; operating continuously since August 2012 powered by an MMRTG.' },
      { metric: 'Drill Samples Completed', value: '40+ Core Holes', detail: 'Drilled deep into sedimentary bedrock to extract powdered samples for SAM and CheMin wet labs.' },
      { metric: 'Images Returned', value: '1,100,000+ Raw Images', detail: 'Delivered unprecedented visual and multispectral cartography of Gale Crater.' },
      { metric: 'Solar Cycle Dosimetry', value: 'Full Solar Cycle', detail: 'Continuous radiation benchmark spanning Solar Cycle 24 and Solar Cycle 25.' }
    ],

    sources: [
      { title: 'NASA Mars Science Laboratory Portal', url: 'https://mars.nasa.gov/msl/', type: 'Official Mission Portal' },
      { title: 'NASA PDS MSL Science Archive', url: 'https://pds-geosciences.wustl.edu/missions/msl/', type: 'Peer-Reviewed Scientific Data Archive' },
      { title: 'JPL Mars Science Laboratory Specs', url: 'https://www.jpl.nasa.gov/missions/mars-science-laboratory-curiosity-rover-msl', type: 'Technical Mission Documentation' }
    ]
  },

  {
    id: 'insight',
    name: 'NASA InSight',
    formalName: 'Interior Exploration using Seismic Investigations, Geodesy and Heat Transport (InSight Lander)',
    program: 'NASA Discovery Program',
    agency: 'NASA / CNES / DLR / JPL',
    roverOrLanderType: 'Stationary Geophysical Lander',
    vehicleClass: 'Lander',
    landingSiteName: 'Elysium Planitia ("Homestead Hollow")',
    landingRegion: 'Elysium Quadrangle / Cerberus Fossae Vicinity',
    primaryLocationId: 'insight',
    pairedLocationIds: ['insight'],
    coordinates: {
      lat: 4.5024,
      lng: 135.6234,
      latFormatted: '4.5024° N',
      lngFormatted: '135.6234° E',
    },
    elevationMeters: -2613,
    elevationFormatted: '-2,613 m (MOLA Areoid)',
    launchDate: 'May 5, 2018',
    landingDate: 'November 26, 2018',
    surfaceOperatedSols: '1,445 Sols (Mission Concluded)',
    currentStatus: 'Mission Complete (Retired)',
    statusCategory: 'completed',
    statusSummary: 'Concluded official science operations on December 21, 2022 after heavy dust layers on its twin 2.2-meter solar panels reduced electrical output below the operational threshold. Transmitted 4 full years of groundbreaking geophysical telemetry.',
    statusLastUpdated: 'December 2022 (Mission Retirement Announcement) / 2023 Final PDS Release',
    verificationBadge: 'NASA Mission Complete • Historical PDS Archive Sealed',

    telemetryNotice: {
      isLivePositionAvailable: false,
      reasonUnavailable: 'Lander retired; telemetry transmission concluded in December 2022. Coordinates represent the verified permanent surface landing site in Elysium Planitia.',
      verifiedDataPoints: [
        'Complete seismic catalog of 1,319+ marsquakes preserved in IRIS and NASA PDS',
        'Landing site validated down to centimeter scale by MRO HiRISE cameras',
        'Crust thickness, mantle gradient, and core radius published in Science and Nature',
        'Meteorite impact seismic fingerprints correlated with newly formed craters'
      ],
      unavailableDataPoints: [
        'Active telemetry downlinks (spacecraft permanently powered down)',
        'Live weather or seismic feeds (instruments dormant since Sol 1445)',
        'Direct subsurface heat flow thermal equilibrium (HP3 mole deployment was impeded by cohesive duricrust)'
      ]
    },

    missionObjectives: [
      'Determine the thickness and layering of the Martian crust from surface to mantle.',
      'Investigate the composition, temperature, and physical state of the Martian mantle.',
      'Measure the precise size, state (liquid vs solid), and density of Mars\' metallic core.',
      'Determine the present rate of Martian seismic activity (marsquake frequency, magnitudes, and focal mechanisms).',
      'Measure the rate of meteorite impacts striking the Martian surface.'
    ],

    scientificDiscoveries: [
      'Discovered that Mars possesses a liquid iron-nickel-light-element core with a radius of 1,830 ± 40 km, occupying roughly half the planet\'s radius.',
      'Determined that Mars\' crust is on average 24 to 72 km thick and divided into either two or three distinct sub-layers.',
      'Identified Cerberus Fossae as a geologically active extensional fault system responsible for the majority of detected deep marsquakes.',
      'Recorded the largest seismic tremor on another planet: a magnitude 4.7 quake (event S1222a on May 4, 2022) lasting over 6 hours.',
      'Successfully detected seismic waves from high-velocity meteorite strikes, allowing NASA\'s Mars Reconnaissance Orbiter to locate newly formed impact craters surrounded by fresh water-ice ejecta.'
    ],

    scientificInstruments: [
      {
        acronym: 'SEIS',
        fullName: 'Seismic Experiment for Interior Structure',
        type: 'Ultra-Sensitive Broadband & Short-Period Seismometer',
        institution: 'CNES (France) / IPGP / Imperial College / ETH Zurich',
        purpose: 'Placed directly onto the surface under a thermal shield to measure microscopic ground vibrations down to the atomic scale.'
      },
      {
        acronym: 'HP3',
        fullName: 'Heat Flow and Physical Properties Package ("The Mole")',
        type: 'Subsurface Heat Probe',
        institution: 'DLR (German Aerospace Center)',
        purpose: 'Designed to self-hammer up to 5 meters underground to measure thermal conductivity and interior heat budget.'
      },
      {
        acronym: 'RISE',
        fullName: 'Rotation and Interior Structure Experiment',
        type: 'X-band Radio Science Transponder',
        institution: 'JPL / Royal Observatory of Belgium',
        purpose: 'Used Doppler shifts in radio signals with Earth to measure the wobble (precession and nutation) of Mars\' rotation axis.'
      },
      {
        acronym: 'TWINS',
        fullName: 'Temperature and Winds for InSight',
        type: 'Environmental Weather Sensors',
        institution: 'Centro de Astrobiología (CAB, Spain)',
        purpose: 'Monitored surface wind speed and air temperature to isolate environmental noise from seismic measurements.'
      },
      {
        acronym: 'IDC / ICC',
        fullName: 'Instrument Deployment & Context Cameras',
        type: 'Color Engineering & Science Cameras',
        institution: 'JPL',
        purpose: 'Documented instrument placement on the surface and monitored atmospheric dust optical depth (tau).'
      }
    ],

    explorationAchievements: [
      { metric: 'Marsquakes Recorded', value: '1,319+ Events', detail: 'Uncovered a dynamic, seismically active planet spanning magnitudes from 1.0 to 4.7.' },
      { metric: 'Mission Duration', value: '1,445 Sols (4 Years)', detail: 'More than doubled its initial primary mission requirement of one Mars year (708 sols).' },
      { metric: 'Core Mapping', value: 'Liquid Core Defined', detail: 'First direct measurement of a terrestrial planet\'s core size outside of Earth and the Moon.' },
      { metric: 'Impact Localization', value: 'Orbital Verification', detail: 'Coordinated seismic detection with MRO HiRISE to visually confirm new cratering events.' },
      { metric: 'Atmospheric Infrasound', value: 'Meteor Shockwaves', detail: 'Recorded atmospheric acoustic shockwaves generated by hypervelocity meteor entry.' }
    ],

    sources: [
      { title: 'NASA InSight Mission Home', url: 'https://mars.nasa.gov/insight/', type: 'Official Mission Portal' },
      { title: 'NASA PDS Geosciences Node (InSight Archive)', url: 'https://pds-geosciences.wustl.edu/missions/insight/', type: 'Peer-Reviewed Scientific Data Archive' },
      { title: 'IPGP SEIS Science Portal', url: 'https://www.seis-insight.eu/en/', type: 'Lead Instrument Consortium' }
    ]
  },

  {
    id: 'spirit-opportunity',
    name: 'NASA Spirit and Opportunity',
    formalName: 'Mars Exploration Rover Project (MER-A Spirit & MER-B Opportunity)',
    program: 'NASA Mars Exploration Program',
    agency: 'NASA / JPL-Caltech',
    roverOrLanderType: 'Twin Solar-Powered Geologist Rovers',
    vehicleClass: 'Dual Rover Program',
    landingSiteName: 'Spirit: Gusev Crater | Opportunity: Meridiani Planum',
    landingRegion: 'Spirit: Aeolis Quadrangle | Opportunity: Margaritifer Sinus Quadrangle',
    primaryLocationId: 'opportunity',
    pairedLocationIds: ['spirit', 'opportunity'],
    coordinates: {
      lat: -1.9462, // Opportunity primary; Spirit is -14.5718
      lng: -5.5266, // Opportunity primary; Spirit is 175.4785
      latFormatted: 'Opp: 1.9462° S | Spi: 14.5718° S',
      lngFormatted: 'Opp: 5.5266° W | Spi: 175.4785° E',
    },
    elevationMeters: -1800,
    elevationFormatted: 'Opp: -1,800 m | Spi: -1,900 m (MOLA Areoid)',
    launchDate: 'Spirit: June 10, 2003 | Opportunity: July 7, 2003',
    landingDate: 'Spirit: January 4, 2004 | Opportunity: January 25, 2004',
    surfaceOperatedSols: 'Spirit: 2,210 Sols | Opportunity: 5,111 Sols',
    currentStatus: 'Mission Complete (Retired)',
    statusCategory: 'completed',
    statusSummary: 'Both rovers completed legendary surface campaigns that revolutionized planetary science. Spirit concluded on May 25, 2011 after 6 years of exploration; Opportunity concluded on February 13, 2019 after 14.7 years and setting the all-time off-Earth driving record of 45.16 km.',
    statusLastUpdated: 'Spirit: 2011 Final PDS Archive | Opportunity: February 2019 Mission Conclusion Statement',
    verificationBadge: 'NASA Mission Complete • Historical PDS Archive Sealed',

    telemetryNotice: {
      isLivePositionAvailable: false,
      reasonUnavailable: 'Missions concluded in 2011 (Spirit) and 2019 (Opportunity). Both rovers rest permanently at their final surface resting places (Spirit at "Troy" in Gusev Crater; Opportunity on the rim of Endeavour Crater at Perseverance Valley).',
      verifiedDataPoints: [
        'Complete traverse tracks and wheel odometry cataloged in NASA PDS',
        'APXS and Mössbauer mineral chemical compositions validated across 100+ rock targets',
        'HiRISE orbital verification images tracking both rover chassis on the surface',
        '45.16 km total odometry confirmed by JPL Navigation and Telemetry teams'
      ],
      unavailableDataPoints: [
        'Active telemetry or power subsystem status (both vehicles decommissioned)',
        'Current dust thickness or physical integrity of vehicles',
        'Live optical panoramas or atmospheric opacity monitoring'
      ]
    },

    missionObjectives: [
      'Search for and characterize a wide variety of rocks and soils that hold clues to past water activity ("Follow the Water" strategy).',
      'Determine the spatial distribution and composition of minerals containing water or formed in aqueous conditions (such as hematite, sulfates, and clays).',
      'Determine the geological processes that formed the local terrain and assess if the environments were ever conducive to life.',
      'Calibrate and validate Mars orbital observations from instruments like MGS TES and Mars Odyssey THEMIS.',
      'Evaluate environmental conditions (corrosion, dust deposition, ultraviolet radiation) for future robotic and human exploration.'
    ],

    scientificDiscoveries: [
      'Opportunity discovered millimeter-scale spherical hematite concretions nicknamed "blueberries" in Eagle Crater, proving ancient standing liquid groundwater.',
      'Opportunity identified the mineral jarosite (a hydrated iron sulfate) at Meridiani Planum, providing undeniable chemical evidence of an ancient acidic lake or playa environment.',
      'Spirit discovered near-pure silica deposits (>90% SiO₂) at "Home Plate" in Gusev Crater when a jammed front wheel churned up bright white subsoil, proving ancient hot springs or hydrothermal fumaroles.',
      'Opportunity discovered ancient neutral-pH water chemistry preserved in smectite clay minerals at Endeavour Crater (Esperance rock), proving a non-acidic, habitable aqueous era.',
      'Spirit documented explosive volcanism interactions with water and survived severe dust storms by catching dust-devil cleaning events on its solar panels.'
    ],

    scientificInstruments: [
      {
        acronym: 'Pancam',
        fullName: 'Panoramic Camera',
        type: 'High-Resolution Multispectral Stereo Camera Pair',
        institution: 'Cornell University / JPL',
        purpose: 'Mounted atop a 1.5 m mast, provided 360-degree color panoramas with 8 color filters per eye for mineralogy and geology context.'
      },
      {
        acronym: 'Mini-TES',
        fullName: 'Miniature Thermal Emission Spectrometer',
        type: 'Infrared Spectrometer',
        institution: 'Arizona State University',
        purpose: 'Analyzed infrared thermal emission spectra of rocks and atmosphere from afar, identifying minerals from distances up to hundreds of meters.'
      },
      {
        acronym: 'Mössbauer',
        fullName: 'MIMOS II Mössbauer Spectrometer',
        type: 'Iron Mineralogy Sensor',
        institution: 'Johannes Gutenberg University Mainz (Germany)',
        purpose: 'Placed in direct contact with rocks to investigate the oxidation state and magnetic phases of iron-bearing minerals (e.g. hematite, jarosite).'
      },
      {
        acronym: 'APXS',
        fullName: 'Alpha Particle X-ray Spectrometer',
        type: 'Elemental Chemistry Sensor',
        institution: 'Max Planck Institute for Chemistry (Germany)',
        purpose: 'Determined bulk elemental composition of rocks and soils using curium-244 radiation.'
      },
      {
        acronym: 'MI',
        fullName: 'Microscopic Imager',
        type: 'Arm-Mounted High-Resolution Macro Camera',
        institution: 'USGS Astrogeology Science Center',
        purpose: 'Produced extreme close-up images of rock textures, sand grains, and spherules with ~30 microns/pixel resolution.'
      },
      {
        acronym: 'RAT',
        fullName: 'Rock Abrasion Tool',
        type: 'Diamond-Tipped Diamond Grinder',
        institution: 'Honeybee Robotics',
        purpose: 'Ground away outer weathered rock rinds up to 5 mm deep to expose pristine interior mineral surfaces for scientific analysis.'
      }
    ],

    explorationAchievements: [
      { metric: 'Opportunity Traverse', value: '45.16 km (28.06 mi)', detail: 'All-time off-Earth driving record across any planetary body. Completed first Martian marathon.' },
      { metric: 'Spirit Traverse', value: '7.73 km (4.8 mi)', detail: 'Climbed Husband Hill in the Columbia Hills, conquering a 100-meter-tall Martian summit.' },
      { metric: 'Opportunity Lifetime', value: '5,111 Sols (14.7 Years)', detail: 'Exceeded 90-sol design lifetime by a factor of 55x; operated through hundreds of dust storms.' },
      { metric: 'Spirit Lifetime', value: '2,210 Sols (6 Years)', detail: 'Exceeded planned mission by 24x; explored Gusev basalt plains, Columbia Hills, and Home Plate.' },
      { metric: 'Total Images Returned', value: '342,000+ Raw Images', detail: 'Returned 217,000+ images from Opportunity and 125,000+ images from Spirit to Earth.' }
    ],

    sources: [
      { title: 'NASA Mars Exploration Rovers Portal', url: 'https://mars.nasa.gov/mer/', type: 'Official Mission Portal' },
      { title: 'NASA PDS Geosciences Node (MER Archive)', url: 'https://pds-geosciences.wustl.edu/missions/mer/', type: 'Peer-Reviewed Scientific Data Archive' },
      { title: 'JPL MER Mission Summary & Epilogue', url: 'https://www.jpl.nasa.gov/missions/mars-exploration-rover-opportunity-mer', type: 'Technical Mission Documentation' }
    ],

    // Sub-rovers for individual selection
    subRovers: [
      {
        id: 'spirit',
        name: 'Spirit (MER-A)',
        landingLocationId: 'spirit',
        landingSiteName: 'Gusev Crater (Columbia Memorial Station)',
        coordinates: { lat: -14.5718, lng: 175.4785, latFormatted: '14.5718° S', lngFormatted: '175.4785° E' },
        elevationFormatted: '-1,900 m (MOLA Areoid)',
        surfaceSols: '2,210 Sols',
        traverseKm: '7.73 km',
        landingDate: 'January 4, 2004',
        finalContact: 'March 22, 2010 (Declared ended May 25, 2011)',
        keyFinding: 'Hydrothermal pure silica hot springs at Home Plate.'
      },
      {
        id: 'opportunity',
        name: 'Opportunity (MER-B)',
        landingLocationId: 'opportunity',
        landingSiteName: 'Meridiani Planum (Challenger Memorial Station)',
        coordinates: { lat: -1.9462, lng: -5.5266, latFormatted: '1.9462° S', lngFormatted: '5.5266° W' },
        elevationFormatted: '-1,800 m (MOLA Areoid)',
        surfaceSols: '5,111 Sols',
        traverseKm: '45.16 km',
        landingDate: 'January 25, 2004',
        finalContact: 'June 10, 2018 (Declared ended Feb 13, 2019)',
        keyFinding: 'Hematite blueberries & jarosite indicating ancient acidic groundwater and standing water.'
      }
    ]
  }
];

export default marsMissions;
