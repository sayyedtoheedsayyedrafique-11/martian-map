import { useState, useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Route,
  Layers,
  Thermometer,
  ShieldAlert,
  Camera,
  ExternalLink,
  ChevronRight,
  Maximize2,
  X,
  ArrowUp,
} from 'lucide-react';
import MarsLogo from '../components/ui/MarsLogo';
import './LandingPage.css';

// Genuine NASA & USGS Datasets and Photography
const REAL_NASA_ASSETS = [
  {
    id: 'jezero-geologic-map',
    categoryLabel: 'USGS Geologic Map',
    title: 'USGS SIM 3464: Jezero Crater Geologic Map',
    desc: 'Official USGS 1:75,000-scale planetary landing site map for NASA Mars 2020 Perseverance. Delineates Jezero delta units, crater floor lithologies, and the exploration ellipse.',
    imageSrc: '/images/nasa/usgs_jezero_geologic_map_sim3464.png',
    sourceOrg: 'USGS Astrogeology / NASA Mars 2020',
    resolution: '1:75,000 cartographic scale',
    officialUrl: 'https://pubs.usgs.gov/sim/3464/',
    coverage: '18.1°N–18.7°N, 77.2°E–77.7°E',
  },
  {
    id: 'curiosity-route-map',
    categoryLabel: 'Rover Traverse Map',
    title: 'NASA Curiosity Mount Sharp Traverse Corridor',
    desc: 'Empirical route map of NASA MSL Curiosity ascending Mount Sharp in Gale Crater, detailing Bradbury Landing, Yellowknife Bay, and Vera Rubin Ridge across 300m+ of vertical relief.',
    imageSrc: '/images/nasa/curiosity_mount_sharp_route.jpg',
    sourceOrg: 'NASA / JPL-Caltech / MSSS',
    resolution: 'High-Resolution Orbital Mosaic',
    officialUrl: 'https://mars.nasa.gov/msl/mission/where-is-the-rover/',
    coverage: 'Gale Crater (4.58°S–4.77°S, 137.35°E–137.45°E)',
  },
  {
    id: 'perseverance-surface-mosaic',
    categoryLabel: 'In-Situ Mars Photo',
    title: 'Perseverance Rover Jezero Basin Surface Panorama',
    desc: 'Genuine raw surface mosaic acquired on Mars by the Mars 2020 Perseverance camera suite, showing local boulder fields, sedimentary stratigraphy, and the Western Delta scarp.',
    imageSrc: '/images/nasa/perseverance_raw_mosaic.jpg',
    sourceOrg: 'NASA / JPL-Caltech / ASU / MSSS',
    resolution: 'Sub-millimeter in-situ spatial fidelity',
    officialUrl: 'https://mars.nasa.gov/mars2020/multimedia/raw-images/',
    coverage: 'Octavia E. Butler Landing Site (18.4447°N, 77.4508°E)',
  },
  {
    id: 'mars-mola-global',
    categoryLabel: 'Orbital Cartography',
    title: 'NASA Mars Trek MOLA Altimetry & Global Orthomosaic',
    desc: 'Mars Orbiter Laser Altimeter (MOLA) geoid reference datum defining Martian zero elevation at 610.5 Pa, combined with Viking MDIM 2.1 color basemap tiles.',
    imageSrc: '/textures/jezero_elevation_scientific.jpg',
    sourceOrg: 'NASA JPL / GSFC / OpenPlanetary',
    resolution: '463 m/px global altimetry geoid',
    officialUrl: 'https://trek.nasa.gov/mars/',
    coverage: 'Global Martian Datum (IAU 2000 Sphere, R = 3,389.5 km)',
  },
];

// Verified Active Working Modules
const CORE_FEATURES = [
  {
    icon: Globe,
    title: 'Interactive 2D & 3D Cartography',
    desc: 'Equirectangular MOLA and Viking basemaps with real-time areographic cursor coordinate tracking (Lat/Lon HUD) and 3D planetary globe.',
    link: '/explore',
    linkText: 'Open Surface Map',
  },
  {
    icon: Route,
    title: 'Dual-Route Trajectory Planner',
    desc: 'Calculates spherical geodesic paths, performs bilinear DEM slope profiling, and evaluates direct routes against low-slope bypasses (>15° hazard limit).',
    link: '/route-planner',
    linkText: 'Plan Rover Route',
  },
  {
    icon: Layers,
    title: 'Jezero Crater 3D Elevation Mesh',
    desc: 'WebGL digital elevation model driven by authentic USGS CTX 20m/px DEM matrix with scientific altimetry color scale and exaggeration controls.',
    link: '/terrain',
    linkText: 'Explore 3D Terrain',
  },
  {
    icon: Thermometer,
    title: 'Surface Meteorology & Telemetry',
    desc: 'In-situ sensor telemetry from Curiosity REMS, Perseverance MEDA, and InSight TWINS, with atmospheric composition and diurnal swings.',
    link: '/conditions',
    linkText: 'View Surface Conditions',
  },
  {
    icon: Camera,
    title: 'Mission Intelligence & Raw Imagery',
    desc: 'Mission profiles for Perseverance, Curiosity, InSight, and Spirit/Opportunity, paired with verified raw image archives across operational rover cameras.',
    link: '/missions',
    linkText: 'Inspect Missions',
  },
  {
    icon: ShieldAlert,
    title: 'Survival Consumables Model',
    desc: 'Consumable budget modeling grounded in NASA-STD-3001 spaceflight standards: oxygen depletion, water recycling, and caloric requirements.',
    link: '/survival',
    linkText: 'Launch Simulator',
  },
];

// Official Scientific Provenance Sources
const DATA_SOURCES = [
  {
    name: 'NASA Planetary Data System (PDS)',
    org: 'NASA / Washington University in St. Louis',
    desc: 'Primary scientific archive for NASA planetary missions, orbital observations, and calibrated instrument datasets.',
    url: 'https://oderest.rsl.wustl.edu/',
  },
  {
    name: 'USGS Planetary Geologic Mapping (PGM)',
    org: 'USGS Astrogeology Science Center',
    desc: 'Authoritative quadrangle geologic maps (SIM 3464 and SIM 3292) classifying Martian chronostratigraphy and surface morphology.',
    url: 'https://astrogeology.usgs.gov/',
  },
  {
    name: 'NASA JPL Mars Trek',
    org: 'NASA JPL / Solar System Treks Project',
    desc: 'Standardized planetary map tile services delivering MOLA altimetry geoid basemaps and Viking MDIM 2.1 color orthomosaics.',
    url: 'https://trek.nasa.gov/mars/',
  },
  {
    name: 'University of Arizona HiRISE',
    org: 'Lunar & Planetary Laboratory / NASA MRO',
    desc: 'High-resolution imaging science experiment datasets and digital terrain models for Jezero Crater and regional rover corridors.',
    url: 'https://www.uahirise.org/',
  },
];

function LandingPage() {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const headingId = useId();

  // Scroll reveal observer for natural, cinematic viewport entrances
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '100px 0px 100px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="landing-page" aria-labelledby={headingId}>
      {/* --------------------------------------------------------------------
          1. HERO SECTION (Cinematic Camera Zoom & Natural Solar Movement)
          -------------------------------------------------------------------- */}
      <section className="landing-section landing-section--hero" aria-label="Mars Pathfinder Introduction">
        <div className="landing-hero">
          {/* Authentic Mars surface photography with slow cinematic camera drift */}
          <div className="landing-hero__bg" aria-hidden="true" />

          {/* Natural Martian lighting and shadow drift */}
          <div className="landing-hero__lighting" aria-hidden="true" />

          <div className="landing-hero__content">
            <h1 id={headingId} className="landing-hero__title hero-enter hero-enter--1">
              MARS <span className="landing-hero__title-accent">PATHFINDER</span>
            </h1>

            <p className="landing-hero__subtitle hero-enter hero-enter--2">
              Interplanetary Survival Guide: Martian Map
            </p>

            <p className="landing-hero__description hero-enter hero-enter--3">
              A planetary GIS and traversal analysis platform for exploring Martian topography,
              analyzing surface geology, and planning safer rover routes using verified NASA and USGS orbital data.
            </p>

            <div className="landing-hero__cta-group hero-enter hero-enter--4">
              <Link to="/explore" className="landing-btn landing-btn--primary">
                <span>Explore Mars</span>
                <Globe size={18} className="landing-btn__icon" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          2. ABOUT THE PROJECT SECTION (Gentle Dual-Column Reveal)
          -------------------------------------------------------------------- */}
      <section id="about" className="landing-section" aria-label="About the Project">
        <div className="landing-container">
          <div className="landing-section-header reveal-on-scroll">
            <h2 className="landing-section-title">About the Project</h2>
            <p className="landing-section-subtitle">
              Supporting planetary exploration through verified cartography and terrain-aware route planning.
            </p>
          </div>

          <div className="landing-about-grid">
            <div className="landing-about-text reveal-on-scroll reveal-from-left">
              <p className="landing-lead">
                Mars presents extreme operational challenges: hypobaric atmospheric pressure,
                cryogenic thermal swings, and rugged topography where steep slopes risk rover immobilisation or rollover.
              </p>
              <p className="landing-para">
                Extensive planetary datasets—including MOLA laser altimetry, Context Camera (CTX)
                digital elevation models, and USGS chronostratigraphic maps—are often isolated within specialized
                scientific archives.
              </p>
              <p className="landing-para">
                <strong>Mars Pathfinder</strong> bridges these archives into an accessible, interactive platform.
                Users can explore Martian surface features, evaluate continuous slope hazards (&gt;15° threshold),
                and model rover traversal paths with empirical elevation data.
              </p>
            </div>

            <div className="landing-about-preview reveal-on-scroll reveal-from-right">
              <div className="landing-about-preview__media">
                <img
                  src="/images/nasa/usgs_jezero_geologic_map_sim3464.png"
                  alt="USGS SIM 3464 Geologic Map of Jezero Crater"
                  loading="lazy"
                />
              </div>
              <span className="landing-preview-caption">
                USGS SIM 3464 — Jezero Crater Exploration Ellipse & Geological Units
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          3. KEY WORKING FEATURES SECTION (Staggered Card Entrances)
          -------------------------------------------------------------------- */}
      <section id="features" className="landing-section" aria-label="Working Application Features">
        <div className="landing-container">
          <div className="landing-section-header reveal-on-scroll">
            <h2 className="landing-section-title">Key Features</h2>
            <p className="landing-section-subtitle">
              Operational tools and analysis modules implemented in Mars Pathfinder.
            </p>
          </div>

          <div className="landing-features-grid">
            {CORE_FEATURES.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="landing-feature-card reveal-on-scroll"
                  style={{ '--stagger-delay': `${idx * 0.08}s` }}
                >
                  <div className="landing-feature-icon">
                    <IconComp size={20} />
                  </div>

                  <h3 className="landing-feature-title">{feat.title}</h3>
                  <p className="landing-feature-desc">{feat.desc}</p>

                  <Link to={feat.link} className="landing-feature-link">
                    <span>{feat.linkText}</span>
                    <ChevronRight size={14} className="landing-feature-link__icon" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          4. REAL NASA DATA & IMAGE GALLERY SECTION (Authentic Photography Zoom)
          -------------------------------------------------------------------- */}
      <section id="nasa-data" className="landing-section" aria-label="Real NASA Photography and Datasets">
        <div className="landing-container">
          <div className="landing-section-header reveal-on-scroll">
            <h2 className="landing-section-title">Verified NASA & USGS Data</h2>
            <p className="landing-section-subtitle">
              Genuine orbital observations, cartographic publications, and in-situ rover photography.
            </p>
          </div>

          <div className="landing-gallery-grid">
            {REAL_NASA_ASSETS.map((asset, idx) => {
              const isLoaded = loadedImages[asset.id];
              return (
                <article
                  key={asset.id}
                  className="landing-gallery-item reveal-on-scroll"
                  style={{ '--stagger-delay': `${idx * 0.1}s` }}
                >
                  <div
                    className={`landing-gallery-media-wrapper ${!isLoaded ? 'img-skeleton' : ''}`}
                    onClick={() => setSelectedAsset(asset)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedAsset(asset)}
                    title="Click to view details and scientific metadata"
                  >
                    <img
                      src={asset.imageSrc}
                      alt={asset.title}
                      loading="lazy"
                      onLoad={() => handleImageLoad(asset.id)}
                      style={{ opacity: isLoaded ? 1 : 0 }}
                    />
                    <span className="landing-gallery-tag">{asset.categoryLabel}</span>
                    <div className="landing-gallery-zoom-hint">
                      <Maximize2 size={13} />
                      <span>Inspect</span>
                    </div>
                  </div>

                  <div className="landing-gallery-body">
                    <h3 className="landing-gallery-title">{asset.title}</h3>
                    <p className="landing-gallery-desc">{asset.desc}</p>
                    <div className="landing-gallery-meta">
                      <span className="landing-gallery-meta-source">{asset.sourceOrg}</span>
                      <span>{asset.resolution}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. OFFICIAL DATA SOURCE CREDITS SECTION
          -------------------------------------------------------------------- */}
      <section id="data-sources" className="landing-section" aria-label="Official Data Sources">
        <div className="landing-container">
          <div className="landing-section-header reveal-on-scroll">
            <h2 className="landing-section-title">Data Sources & Credits</h2>
            <p className="landing-section-subtitle">
              Every data layer, elevation raster, coordinate datum, and sensor metric is directly attributed to official repositories.
            </p>
          </div>

          <div className="landing-sources-grid">
            {DATA_SOURCES.map((source, idx) => (
              <div
                key={source.name}
                className="landing-source-card reveal-on-scroll"
                style={{ '--stagger-delay': `${idx * 0.08}s` }}
              >
                <span className="landing-source-org">{source.org}</span>
                <h3 className="landing-source-title">{source.name}</h3>
                <p className="landing-source-desc">{source.desc}</p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-source-link"
                >
                  <span>Official Portal</span>
                  <ExternalLink size={12} className="landing-source-link__icon" />
                </a>
              </div>
            ))}
          </div>

          <div className="landing-sources-footer-cta reveal-on-scroll">
            <Link to="/data-sources" className="landing-btn landing-btn--outline">
              <span>View Full Data Sources Registry</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          6. SIMPLE FOOTER
          -------------------------------------------------------------------- */}
      <footer className="landing-footer" aria-label="Mars Pathfinder Footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            {/* Brand Column */}
            <div className="landing-footer-brand">
              <div className="landing-footer-logo-row">
                <MarsLogo size={22} />
                <span className="landing-footer-title">MARS PATHFINDER</span>
              </div>
              <p className="landing-footer-desc">
                Planetary exploration workstation developed for the NASA Space Apps Challenge under
                the theme &ldquo;Interplanetary Survival Guide: Martian Map&rdquo;.
              </p>
              <p className="landing-footer-credits">
                Scientific data courtesy of NASA, USGS Astrogeology, JPL-Caltech, and ESA.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="landing-footer-links-group">
              <h3 className="landing-footer-heading">Navigation</h3>
              <ul className="landing-footer-links">
                <li><Link to="/explore" className="landing-footer-link">Mars Surface Explorer</Link></li>
                <li><Link to="/route-planner" className="landing-footer-link">Rover Route Planner</Link></li>
                <li><Link to="/terrain" className="landing-footer-link">Jezero 3D Elevation</Link></li>
                <li><Link to="/conditions" className="landing-footer-link">Surface Conditions</Link></li>
                <li><Link to="/missions" className="landing-footer-link">Mission Profiles</Link></li>
                <li><Link to="/data-sources" className="landing-footer-link">Data Sources Registry</Link></li>
              </ul>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <span className="landing-footer-copyright">
              &copy; 2026 Mars Pathfinder &bull; NASA Space Apps Challenge
            </span>
            <button
              onClick={scrollToTop}
              className="landing-footer-back-to-top"
              aria-label="Back to top of landing page"
            >
              <span>Back to Top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </footer>

      {/* --------------------------------------------------------------------
          IMAGE INSPECTION MODAL
          -------------------------------------------------------------------- */}
      {selectedAsset && (
        <div
          className="landing-modal-overlay"
          onClick={() => setSelectedAsset(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="landing-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="landing-modal-close"
              onClick={() => setSelectedAsset(null)}
              aria-label="Close image inspection"
            >
              <X size={18} />
            </button>

            <div className="landing-modal-img-container">
              <img
                src={selectedAsset.imageSrc}
                alt={selectedAsset.title}
              />
            </div>

            <div className="landing-modal-body">
              <span className="landing-modal-category">
                {selectedAsset.categoryLabel}
              </span>
              <h3 className="landing-modal-title">{selectedAsset.title}</h3>
              <p className="landing-modal-desc">{selectedAsset.desc}</p>

              <div className="landing-modal-meta-grid">
                <div className="landing-modal-meta-item">
                  <span className="landing-modal-meta-label">Source Organization</span>
                  <span className="landing-modal-meta-val">{selectedAsset.sourceOrg}</span>
                </div>
                <div className="landing-modal-meta-item">
                  <span className="landing-modal-meta-label">Resolution / Scale</span>
                  <span className="landing-modal-meta-val">{selectedAsset.resolution}</span>
                </div>
                <div className="landing-modal-meta-item">
                  <span className="landing-modal-meta-label">Spatial Footprint</span>
                  <span className="landing-modal-meta-val">{selectedAsset.coverage}</span>
                </div>
              </div>

              <div className="landing-modal-actions">
                <a
                  href={selectedAsset.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="landing-btn landing-btn--primary"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <span>Open Official Publication</span>
                  <ExternalLink size={13} />
                </a>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="landing-btn landing-btn--secondary"
                  style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;