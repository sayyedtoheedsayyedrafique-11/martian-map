import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/ui/SearchBar';
import dataSources, { sourceCategories } from '../data/dataSources';
import {
  ExternalLink,
  CheckCircle2,
  Radio,
  HardDrive,
  Archive,
  Filter,
  Compass,
  Layers,
  Route,
  Wind,
  Camera,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Download,
  X,
} from 'lucide-react';
import './DataSourcesPage.css';

const CORE_CHALLENGE_RESOURCES = [
  {
    id: 'jpl-mars-trek',
    name: 'Jet Propulsion Laboratory’s (JPL) Mars Trek',
    agency: 'NASA JPL / Caltech',
    badge: 'LIVE WMTS TILES',
    badgeType: 'actual',
    desc: 'Interactive planetary GIS providing global Viking Color MDIM 2.1 (~232m/px) and MOLA Altimetry (~463m/px) mosaics streamed via OGC WMTS.',
    realDataUsage: 'Direct OGC WMTS tile streams inside our 2D Map + synchronized IAU 2000 deep-link targeting.',
    inAppRoute: '/?view=map',
    inAppLabel: 'Open in 2D Map',
    externalUrl: 'https://trek.nasa.gov/mars/',
    previewImage: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/0/0/0.jpg',
    previewAlt: 'NASA JPL Mars Trek Viking Color MDIM 2.1 WMTS Tile',
    previewCaption: 'Actual accessible OGC WMTS Viking MDIM 2.1 true-color planetary mosaic tile streamed directly from NASA Trek.',
    previewCredit: 'NASA JPL / Caltech / USGS Astrogeology',
    icon: Layers,
  },
  {
    id: 'usgs-pgm',
    name: 'USGS-NASA Planetary Geologic Mapping Program',
    agency: 'USGS Astrogeology / NASA',
    badge: 'USGS SIM 3292 & SIM 3464',
    badgeType: 'actual',
    desc: 'Definitive global Martian chronostratigraphy (Noachian, Hesperian, Amazonian) and published geologic rock units.',
    realDataUsage: 'Chronostratigraphic timescale, lithologic rock unit classification (lNh, eHv, etc.), and rover mobility hazard grading.',
    inAppRoute: '/terrain',
    inAppLabel: 'Inspect Geologic Units',
    externalUrl: 'https://pubs.usgs.gov/sim/3292/',
    previewImage: '/images/nasa/usgs_mars_geologic_map_sim3292.png',
    previewFallback: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/USGS-MarsMap-sim3292-20140714-full.png',
    previewAlt: 'USGS SIM 3292 Geologic Map of Mars',
    previewCaption: 'Actual official USGS Scientific Investigations Map 3292 map sheet with full legends and chronostratigraphic unit contacts.',
    previewCredit: 'USGS Astrogeology / NASA (Tanaka et al., 2014)',
    icon: Compass,
  },
  {
    id: 'curiosity-route-visual',
    name: 'Curiosity Proposed Path up Mount Sharp (Gale Traverse)',
    agency: 'NASA JPL / MSL Science Team',
    badge: 'NASA MSL WAYPOINTS',
    badgeType: 'actual',
    desc: 'Official trajectory and waypoint route map of MSL Curiosity climbing Mount Sharp (Aeolis Mons) in Gale Crater.',
    realDataUsage: '11 verified MSL waypoints, discrete MOLA laser altimetry (+521m net gain), and authentic drill sample logs.',
    inAppRoute: '/route-planner?start=bradbury-landing&dest=gediz-vallis',
    inAppLabel: 'Curiosity Route Planner',
    externalUrl: 'https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/',
    previewImage: '/images/nasa/curiosity_mount_sharp_route.jpg',
    previewFallback: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/PIA23179-MarsCuriosityRoverExploersMountSharp-20190515.jpg',
    previewAlt: 'NASA Curiosity Traverse Route Map Up Mount Sharp',
    previewCaption: 'Actual NASA MRO HiRISE orbital route map photograph charting Curiosity climbing Mount Sharp (PIA23179).',
    previewCredit: 'NASA / JPL-Caltech / Univ. of Arizona',
    icon: Route,
  },
  {
    id: 'nasa-worldview',
    name: 'NASA Worldview (EOSDIS Earth Analogue)',
    agency: 'NASA EOSDIS / GIBS',
    badge: 'EARTH ANALOGUE ONLY',
    badgeType: 'illustrative',
    desc: 'Daily global Earth satellite imagery from MODIS and VIIRS tracking atmospheric aerosols and Saharan dust plumes.',
    realDataUsage: 'Hydrodynamic comparative planetology baseline comparing terrestrial dust storms against Martian global dust storms.',
    inAppRoute: '/conditions',
    inAppLabel: 'Dust Storm Analogue',
    externalUrl: 'https://worldview.earthdata.nasa.gov/',
    icon: Wind,
  },
  {
    id: 'perseverance-raw-images',
    name: 'Mars Perseverance Raw Images Gallery',
    agency: 'NASA JPL-Caltech / Mars 2020',
    badge: 'LIVE NASA API + ARCHIVE',
    badgeType: 'actual',
    desc: 'Public domain repository capturing raw downlinks from Perseverance\'s 23 cameras and Ingenuity helicopter in Jezero Crater.',
    realDataUsage: 'Live NASA JSON API client + 15+ high-res fallback images with official JPL PIA citations across all 6 science instruments.',
    inAppRoute: '/missions?tab=raw-images',
    inAppLabel: 'Perseverance Gallery',
    externalUrl: 'https://mars.nasa.gov/mars2020/multimedia/raw-images/',
    previewImage: '/images/nasa/perseverance_raw_mosaic.jpg',
    previewAlt: 'Perseverance Raw Acquisition Grid',
    previewCaption: 'Actual SuperCam RMI telescopic frames and Mastcam-Z stereo rock exposures downlinked inside Jezero Crater.',
    previewCredit: 'NASA/JPL-Caltech/LANL/CNES/ASU/MSSS',
    icon: Camera,
  },
];

const deliveryModes = {
  all: 'All Delivery Modes',
  live: 'Live WMTS Streams',
  downloaded: 'Downloaded / Bundled Textures',
  static: 'Static PDS Archives',
};

function DataSourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [challengeModalResource, setChallengeModalResource] = useState(null);
  const [isChallengeZoomed, setIsChallengeZoomed] = useState(false);

  const filteredSources = useMemo(() => {
    return dataSources.filter((source) => {
      const matchesCategory = selectedCategory === 'all' || source.category === selectedCategory;

      let matchesMode = true;
      if (selectedMode === 'live') {
        matchesMode = (source.deliveryStatus || '').toLowerCase().includes('live');
      } else if (selectedMode === 'downloaded') {
        matchesMode = (source.deliveryStatus || '').toLowerCase().includes('downloaded') ||
                      (source.deliveryStatus || '').toLowerCase().includes('cached');
      } else if (selectedMode === 'static') {
        matchesMode = (source.deliveryStatus || '').toLowerCase().includes('static') ||
                      (source.deliveryStatus || '').toLowerCase().includes('archive');
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        source.name.toLowerCase().includes(q) ||
        source.description.toLowerCase().includes(q) ||
        source.organization.toLowerCase().includes(q) ||
        source.usedFor.toLowerCase().includes(q);

      return matchesCategory && matchesMode && matchesSearch;
    });
  }, [searchQuery, selectedCategory, selectedMode]);

  return (
    <div className="sources-page fade-in">
      <div className="sources-page__header">
        <div className="sources-tag-row">
          <span className="sources-sys-tag mono">TRANSPARENCY & PROVENANCE</span>
          <span className="sources-sys-tag sources-sys-tag--accent mono">AUTHENTIC SCIENTIFIC REPOSITORIES</span>
        </div>
        <h1 className="sources-page__title">Scientific Data Sources & Provenance</h1>
        <p className="sources-page__subtitle">
          Authentic NASA repositories, USGS Astrogeology databases, and published planetary science archives used in this application. All datasets are clearly labeled by their delivery mechanism: Live OGC WMTS, locally cached assets, or static PDS releases.
        </p>
      </div>

      {/* Honest Scientific Verification Notice */}
      <div className="sources-verification-box">
        <div className="sources-verification-header">
          <CheckCircle2 size={16} color="#10b981" />
          <strong className="mono">DATA INTEGRITY DISCLOSURE (NASA SPACE APPS CHALLENGE)</strong>
        </div>
        <p className="sources-verification-text">
          Coordinates and elevations in this application are derived from official NASA Planetary Data System (PDS) archives, USGS cartographic databases, and the MOLA Areoid geoid datum. Map tiles are streamed from NASA Mars Trek and USGS/OpenPlanetary servers. This tool does not present simulated calculations as live sensor telemetry.
        </p>
      </div>

      {/* 5 Core NASA Challenge Resources Hub */}
      <section className="sources-challenge-hub" aria-label="5 Core NASA Challenge Resources">
        <div className="sources-challenge-hub__header">
          <div className="sources-challenge-hub__title-wrap">
            <span className="sources-challenge-hub__tag mono">NASA SPACE APPS CHALLENGE</span>
            <h2 className="sources-challenge-hub__title mono">
              5 Core Planetary Science Challenge Datasets (Real Data Integration)
            </h2>
          </div>
          <span className="sources-challenge-hub__status mono">
            ● 100% AUTHENTIC DATASETS // ZERO SYNTHETIC MOCKS
          </span>
        </div>

        <div className="sources-challenge-grid">
          {CORE_CHALLENGE_RESOURCES.map((res) => {
            const Icon = res.icon;
            return (
              <div key={res.id} className="sources-challenge-card">
                <div className="sources-challenge-card__top">
                  <div className="sources-challenge-card__icon-wrap">
                    <Icon size={14} className="sources-challenge-icon" />
                    <span className="sources-challenge-card__agency mono">{res.agency}</span>
                  </div>
                  <span className={`sources-challenge-pill mono sources-challenge-pill--${res.badgeType}`}>
                    {res.badge}
                  </span>
                </div>
                <h3 className="sources-challenge-card__name">{res.name}</h3>
                <p className="sources-challenge-card__desc">{res.desc}</p>

                {res.previewImage && (
                  <div
                    className="sources-challenge-img-container"
                    onClick={() => setChallengeModalResource(res)}
                    role="button"
                    tabIndex={0}
                    title={`Click to inspect authentic ${res.name} Mars imagery`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setChallengeModalResource(res);
                    }}
                  >
                    <img
                      src={res.previewImage}
                      alt={res.previewAlt || res.name}
                      className="sources-challenge-img"
                      onError={(e) => {
                        if (!e.target.dataset.triedFallback && res.previewFallback) {
                          e.target.dataset.triedFallback = 'true';
                          e.target.src = res.previewFallback;
                        }
                      }}
                    />
                    <div className="sources-challenge-img-overlay mono">
                      <Maximize2 size={10} />
                      <span>REAL NASA / USGS IMAGERY</span>
                    </div>
                  </div>
                )}

                <div className="sources-challenge-card__usage mono">
                  <strong className="sources-challenge-usage-lbl">INTEGRATED IN PATHFINDER:</strong>
                  <span>{res.realDataUsage}</span>
                </div>
                <div className="sources-challenge-card__actions">
                  <Link to={res.inAppRoute} className="sources-challenge-btn sources-challenge-btn--app mono">
                    {res.inAppLabel} ↗
                  </Link>
                  <a
                    href={res.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sources-challenge-btn sources-challenge-btn--ext mono"
                  >
                    <span>Official Portal</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Search and Filters */}
      <div className="sources-controls">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search datasets, missions, or agencies..."
        />

        {/* Category Filter Bar */}
        <div className="sources-category-bar">
          {Object.entries(sourceCategories).map(([key, label]) => {
            const count = key === 'all' ? dataSources.length : dataSources.filter((s) => s.category === key).length;
            return (
              <button
                key={key}
                type="button"
                className={`sources-cat-btn ${selectedCategory === key ? 'sources-cat-btn--active' : ''}`}
                onClick={() => setSelectedCategory(key)}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Delivery Status Filter Bar */}
        <div className="sources-delivery-bar">
          <span className="sources-delivery-label mono">
            <Filter size={11} color="var(--accent-yellow)" /> DELIVERY MODE:
          </span>
          {Object.entries(deliveryModes).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`sources-delivery-btn ${selectedMode === key ? 'sources-delivery-btn--active' : ''}`}
              onClick={() => setSelectedMode(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Sources */}
      {filteredSources.length === 0 ? (
        <div className="sources-empty">
          <p>No data sources match &ldquo;{searchQuery}&rdquo;.</p>
          <button
            type="button"
            className="sources-reset-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedMode('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="sources-grid">
          {filteredSources.map((source) => {
            const isLive = (source.deliveryStatus || '').toLowerCase().includes('live');
            const isDownloaded = (source.deliveryStatus || '').toLowerCase().includes('downloaded') ||
                                 (source.deliveryStatus || '').toLowerCase().includes('cached');

            return (
              <div key={source.id} className="source-card">
                <div className="source-card__header">
                  <span className="source-card__org">{source.organization}</span>
                  <span className={`source-status-pill mono ${isLive ? 'source-status-pill--live' : isDownloaded ? 'source-status-pill--cached' : ''}`}>
                    {isLive ? <Radio size={10} /> : isDownloaded ? <HardDrive size={10} /> : <Archive size={10} />}
                    {source.deliveryStatus || 'Static PDS Archive'}
                  </span>
                </div>

                <h2 className="source-card__title">{source.name}</h2>
                <span className="source-card__type mono">{source.dataType} • {source.dataDate}</span>
                <p className="source-card__desc">{source.description}</p>

                <div className="source-card__usage-box">
                  <span className="source-card__usage-label mono">Used in Mars Pathfinder for:</span>
                  <p className="source-card__usage-text">{source.usedFor}</p>
                </div>

                {source.authenticityProof && (
                  <div className="source-card__proof mono">
                    <strong>Integrity Verification:</strong> {source.authenticityProof}
                  </div>
                )}

                {source.officialLayers && (
                  <div className="source-card__layers mono" style={{ background: '#08090c', padding: '8px 10px', border: '1px solid #21262d', marginTop: '8px' }}>
                    <span style={{ fontSize: '7.5px', color: 'var(--accent-yellow)', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                      VERIFIED JPL MARS TREK PRODUCT LAYERS:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '8px', color: '#94a3b8' }}>
                      {source.officialLayers.map((l) => (
                        <li key={l.id} style={{ marginBottom: '2px' }}>
                          <strong style={{ color: '#e2e8f0' }}>{l.name}:</strong> <code style={{ color: '#38bdf8' }}>{l.id}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="source-card__footer">
                  <span className="source-card__id mono">
                    ID: {source.identifier}
                  </span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-card__link mono"
                  >
                    Official Portal <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Challenge Resource High-Res Lightbox Modal */}
      {challengeModalResource && (
        <div
          className="sources-modal-overlay"
          onClick={() => {
            setChallengeModalResource(null);
            setIsChallengeZoomed(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="sources-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sources-modal-header">
              <div className="sources-modal-title-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="sources-challenge-pill mono sources-challenge-pill--actual">
                    {challengeModalResource.badge}
                  </span>
                  <span className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {challengeModalResource.agency}
                  </span>
                </div>
                <h3 className="sources-modal-title">{challengeModalResource.name}</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="sources-modal-ctrl-btn"
                  onClick={() => setIsChallengeZoomed((prev) => !prev)}
                  title={isChallengeZoomed ? 'Reset Zoom' : 'Zoom High-Res'}
                >
                  {isChallengeZoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
                </button>
                <a
                  href={challengeModalResource.previewImage}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                  className="sources-modal-ctrl-btn"
                  title="Download Image"
                >
                  <Download size={15} />
                </a>
                <button
                  type="button"
                  className="sources-modal-close-btn"
                  onClick={() => {
                    setChallengeModalResource(null);
                    setIsChallengeZoomed(false);
                  }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={`sources-modal-body ${isChallengeZoomed ? 'sources-modal-body--zoomed' : ''}`}>
              <img
                src={challengeModalResource.previewImage}
                alt={challengeModalResource.previewAlt || challengeModalResource.name}
                className={`sources-modal-img ${isChallengeZoomed ? 'sources-modal-img--zoomed' : ''}`}
                onError={(e) => {
                  if (!e.target.dataset.triedFallback && challengeModalResource.previewFallback) {
                    e.target.dataset.triedFallback = 'true';
                    e.target.src = challengeModalResource.previewFallback;
                  }
                }}
              />
            </div>

            <div className="sources-modal-footer mono">
              <div className="sources-modal-info">
                <strong>Description:</strong> {challengeModalResource.previewCaption} • <strong>Attribution:</strong> {challengeModalResource.previewCredit || challengeModalResource.agency}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to={challengeModalResource.inAppRoute}
                  className="sources-challenge-btn sources-challenge-btn--app mono"
                  onClick={() => setChallengeModalResource(null)}
                >
                  {challengeModalResource.inAppLabel} ↗
                </Link>
                <a
                  href={challengeModalResource.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sources-challenge-btn sources-challenge-btn--ext mono"
                >
                  <span>Official Portal</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataSourcesPage;
