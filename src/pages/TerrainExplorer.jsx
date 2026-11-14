import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import JezeroTerrain3D from '../components/JezeroTerrain3D/JezeroTerrain3D';
import MarsMap from '../components/MarsMap/MarsMap';
import {
  MARS_ELEVATION_EXTREMES,
  MARS_TERRAIN_FEATURES,
  MARS_SURFACE_HAZARDS,
} from '../data/marsTerrainFeatures';
import terrainTypes, { USGS_CHRONOSTRATIGRAPHY, USGS_GEOLOGIC_UNITS } from '../data/terrainTypes';
import { formatCoordinates } from '../utils/helpers';
import {
  Mountain,
  Layers,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Compass,
  MapPin,
  Box,
  Activity,
} from 'lucide-react';
import './TerrainExplorer.css';

function TerrainExplorer() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(() => {
    if (tabParam === 'jezero' || tabParam === '3d' || tabParam === 'jezero-3d' || tabParam === 'jezero3d') {
      return 'jezero3d';
    }
    return 'jezero3d'; // Default to featured 3D Jezero DEM
  }); // 'jezero3d' | 'formations' | 'hazards' | 'classifications'
  const [selectedFeature, setSelectedFeature] = useState(MARS_TERRAIN_FEATURES[0]);
  const [selectedHazard, setSelectedHazard] = useState(MARS_SURFACE_HAZARDS[0]);
  const [filterType, setFilterType] = useState('all');

  const filteredFeatures = useMemo(() => {
    if (filterType === 'all') return MARS_TERRAIN_FEATURES;
    return MARS_TERRAIN_FEATURES.filter((f) => f.type === filterType);
  }, [filterType]);

  return (
    <div className="terrain-page fade-in">
      {/* Header */}
      <div className="terrain-header">
        <div className="terrain-header__title-area">
          <div className="terrain-tag-row">
            <span className="terrain-sys-tag mono">NASA MGS MOLA DATUM // AREOID 610.5 Pa</span>
            <span className="terrain-sys-tag mono" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              ● REAL DATA: USGS SIM 3292 & NASA MOLA
            </span>
            <span className="terrain-sys-tag terrain-sys-tag--accent mono">USGS ASTROGEOLOGY CTX DEM</span>
            <Link to="/data-explorer" className="terrain-sys-tag mono" style={{ textDecoration: 'none', color: 'var(--accent-yellow)', borderColor: 'var(--accent-yellow)' }}>
              &rarr; LAUNCH PDS / CTX DATA EXPLORER
            </Link>
          </div>
          <h1 className="terrain-header__title">Mars Terrain & Elevation Explorer</h1>
          <p className="terrain-header__desc">
            Explore authentic Martian topography including our flagship interactive 3D Jezero Crater elevation mesh (20m/px CTX DEM), planetary elevation extremes, and rover engineering traversability hazards.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="terrain-tab-bar">
          <button
            type="button"
            className={`terrain-tab-btn ${activeTab === 'jezero3d' ? 'terrain-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('jezero3d')}
          >
            <Box size={13} />
            <span>3D & 2D Jezero Crater DEM</span>
          </button>
          <button
            type="button"
            className={`terrain-tab-btn ${activeTab === 'formations' ? 'terrain-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('formations')}
          >
            <Mountain size={13} />
            <span>Planetary Formations ({MARS_TERRAIN_FEATURES.length})</span>
          </button>
          <button
            type="button"
            className={`terrain-tab-btn ${activeTab === 'hazards' ? 'terrain-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('hazards')}
          >
            <ShieldAlert size={13} />
            <span>Rover Hazards ({MARS_SURFACE_HAZARDS.length})</span>
          </button>
          <button
            type="button"
            className={`terrain-tab-btn ${activeTab === 'classifications' ? 'terrain-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('classifications')}
          >
            <Layers size={13} />
            <span>USGS Geologic Mapping (SIM 3292)</span>
          </button>
        </div>
      </div>

      {/* Altimetry Baseline HUD Strip */}
      <div className="terrain-datum-strip">
        <div className="terrain-datum-item">
          <span className="terrain-datum-label mono">MOLA ZERO DATUM DEFINITION</span>
          <span className="terrain-datum-val">610.5 Pa (Triple Point of H₂O)</span>
        </div>
        <div className="terrain-datum-item">
          <span className="terrain-datum-label mono">FLAGSHIP REGION</span>
          <span className="terrain-datum-val terrain-datum-val--high">
            Jezero Crater (-2,627m Basin to -513m Rim)
          </span>
        </div>
        <div className="terrain-datum-item">
          <span className="terrain-datum-label mono">PLANETARY RANGE</span>
          <span className="terrain-datum-val terrain-datum-val--low">
            Olympus (+21.2 km) to Hellas (-8.2 km)
          </span>
        </div>
        <div className="terrain-datum-item">
          <span className="terrain-datum-label mono">TOTAL PLANETARY RELIEF</span>
          <span className="terrain-datum-val mono">{MARS_ELEVATION_EXTREMES.totalReliefKm}</span>
        </div>
      </div>

      {/* TAB 0: FLAGSHIP 3D JEZERO CRATER ELEVATION VIEWER */}
      {activeTab === 'jezero3d' && (
        <div className="terrain-jezero-section">
          <div className="terrain-jezero-intro">
            <div className="terrain-jezero-intro-text">
              <span className="terrain-sec-badge mono">FEATURED 3D TERRAIN MODEL</span>
              <h2 className="terrain-jezero-title">Jezero Crater 3D Elevation Mesh (CTX DEM)</h2>
              <p className="terrain-jezero-subtitle">
                Rendered directly from genuine USGS Astrogeology and NASA Mars 2020 Context Camera (CTX) digital elevation data. Explore the western delta inlet where ancient river waters deposited clay sediments, the crater floor, Belva impact crater, and the breach canyon at Pliva Vallis.
              </p>
            </div>
            <div className="terrain-jezero-stats mono">
              <div className="terrain-stat-pill">
                <span>HORIZONTAL RES</span>
                <strong>20 m / px</strong>
              </div>
              <div className="terrain-stat-pill">
                <span>CRATER DIAMETER</span>
                <strong>45 km</strong>
              </div>
              <div className="terrain-stat-pill">
                <span>ELEVATION SPAN</span>
                <strong>2,929 meters</strong>
              </div>
            </div>
          </div>

          {/* 3D Jezero Terrain Viewer Component */}
          <JezeroTerrain3D height="720px" />

          {/* Geological Context Notes */}
          <div className="terrain-jezero-notes-grid">
            <div className="terrain-note-card">
              <h4 className="terrain-note-title">Western Delta Inflow (Neretva Vallis)</h4>
              <p className="terrain-note-body">
                Around 3.5 to 3.8 billion years ago (Noachian-Hesperian transition), a river system carved through the crater rim at Neretva Vallis, depositing a fan-shaped delta composed of mudstones and clay minerals capable of preserving biosignatures.
              </p>
            </div>
            <div className="terrain-note-card">
              <h4 className="terrain-note-title">Crater Floor & Séítah Formation</h4>
              <p className="terrain-note-body">
                The interior basin floor (-2,627 m MOLA) features igneous olivine-cumulate rocks and basaltic lava flows, later overlain by aqueous sediments and altered by multiple lake episodes before drying completely.
              </p>
            </div>
            <div className="terrain-note-card">
              <h4 className="terrain-note-title">Eastern Breach & Outflow (Pliva Vallis)</h4>
              <p className="terrain-note-body">
                Jezero is an &ldquo;open-basin lake&rdquo; with both an inlet and an outlet. When water levels exceeded the eastern rim capacity, lake waters overflowed through Pliva Vallis out toward the Isidis Planitia impact basin.
              </p>
            </div>
            <div className="terrain-note-card">
              <h4 className="terrain-note-title">USGS CTX DEM Altimetry Reference</h4>
              <p className="terrain-note-body">
                Heights are calibrated against the MGS MOLA Mars Areoid Datum (610.5 Pa atmospheric pressure reference). The 20m/pixel stereo Context Camera DEM exposes real 600m rim cliffs, sedimentary terraces, and secondary impact craters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: FORMATIONS & ELEVATION */}
      {activeTab === 'formations' && (
        <div className="terrain-content-layout">
          {/* List Column */}
          <div className="terrain-list-col">
            <div className="terrain-filter-chips">
              <button
                type="button"
                className={`terrain-chip ${filterType === 'all' ? 'terrain-chip--active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All ({MARS_TERRAIN_FEATURES.length})
              </button>
              <button
                type="button"
                className={`terrain-chip ${filterType === 'volcano' ? 'terrain-chip--active' : ''}`}
                onClick={() => setFilterType('volcano')}
              >
                Volcanoes
              </button>
              <button
                type="button"
                className={`terrain-chip ${filterType === 'canyon' ? 'terrain-chip--active' : ''}`}
                onClick={() => setFilterType('canyon')}
              >
                Canyons
              </button>
              <button
                type="button"
                className={`terrain-chip ${filterType === 'crater' ? 'terrain-chip--active' : ''}`}
                onClick={() => setFilterType('crater')}
              >
                Craters
              </button>
              <button
                type="button"
                className={`terrain-chip ${filterType === 'basin' ? 'terrain-chip--active' : ''}`}
                onClick={() => setFilterType('basin')}
              >
                Basins
              </button>
              <button
                type="button"
                className={`terrain-chip ${filterType === 'dune' ? 'terrain-chip--active' : ''}`}
                onClick={() => setFilterType('dune')}
              >
                Dune Fields
              </button>
            </div>

            <div className="terrain-feature-cards">
              {filteredFeatures.map((feat) => {
                const isSelected = selectedFeature?.id === feat.id;
                return (
                  <div
                    key={feat.id}
                    className={`terrain-feat-card ${isSelected ? 'terrain-feat-card--selected' : ''}`}
                    onClick={() => setSelectedFeature(feat)}
                  >
                    <div className="terrain-feat-card__header">
                      <span className="terrain-feat-cat mono">{feat.category}</span>
                      <span className="terrain-feat-elev mono">{feat.elevationLabel}</span>
                    </div>
                    <h3 className="terrain-feat-card__name">{feat.name}</h3>
                    <div className="terrain-feat-card__coords mono">
                      {formatCoordinates(feat.lat, feat.lng)}
                    </div>
                    <p className="terrain-feat-card__desc">{feat.description.slice(0, 95)}...</p>
                    <div className="terrain-feat-card__footer">
                      <span className="terrain-feat-relief mono">Relief: {feat.reliefKm} km</span>
                      <span className="terrain-feat-hazard">{feat.hazardRating.split(' (')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dossier Detail Column */}
          {selectedFeature && (
            <div className="terrain-detail-col">
              <div className="terrain-dossier-card">
                <div className="terrain-dossier-header">
                  <div>
                    <span className="terrain-dossier-badge mono">{selectedFeature.category}</span>
                    <h2 className="terrain-dossier-title">{selectedFeature.name}</h2>
                    <span className="terrain-dossier-coords mono">
                      {formatCoordinates(selectedFeature.lat, selectedFeature.lng)} • MOLA Datum
                    </span>
                  </div>
                </div>

                <div className="terrain-dossier-grid">
                  <div className="terrain-dossier-metric">
                    <span className="terrain-metric-key mono">MOLA ALTIMETRY ELEVATION</span>
                    <span className="terrain-metric-val mono">{selectedFeature.elevationLabel}</span>
                  </div>
                  <div className="terrain-dossier-metric">
                    <span className="terrain-metric-key mono">TOTAL RELIEF / DEPTH</span>
                    <span className="terrain-metric-val mono">{selectedFeature.reliefKm} km</span>
                  </div>
                  <div className="terrain-dossier-metric">
                    <span className="terrain-metric-key mono">SPAN / DIAMETER</span>
                    <span className="terrain-metric-val mono">~{selectedFeature.diameterKm} km</span>
                  </div>
                  <div className="terrain-dossier-metric">
                    <span className="terrain-metric-key mono">MAX SLOPE GRADE</span>
                    <span className="terrain-metric-val mono">{selectedFeature.slopeGradeMax}</span>
                  </div>
                  <div className="terrain-dossier-metric">
                    <span className="terrain-metric-key mono">GEOLOGICAL EPOCH</span>
                    <span className="terrain-metric-val">{selectedFeature.geologicalEra}</span>
                  </div>
                  <div className="terrain-dossier-metric">
                    <span className="terrain-metric-key mono">ROVER TRAVERSABILITY</span>
                    <span className="terrain-metric-val">{selectedFeature.traversability}</span>
                  </div>
                </div>

                <div className="terrain-dossier-block">
                  <h4 className="terrain-dossier-subhead">Geological Description</h4>
                  <p className="terrain-dossier-text">{selectedFeature.description}</p>
                </div>

                <div className="terrain-dossier-block terrain-dossier-block--callout">
                  <h4 className="terrain-dossier-subhead">
                    <CheckCircle2 size={13} color="var(--accent-yellow)" /> Scientific Significance
                  </h4>
                  <p className="terrain-dossier-text">{selectedFeature.scientificSignificance}</p>
                </div>

                <div className="terrain-dossier-actions">
                  {selectedFeature.id === 'jezero-crater-delta' && (
                    <button
                      type="button"
                      className="terrain-btn-primary"
                      onClick={() => setActiveTab('jezero3d')}
                    >
                      <Activity size={13} /> Launch 3D Jezero DEM
                    </button>
                  )}
                  <Link
                    to={`/?site=${selectedFeature.id}`}
                    className="terrain-btn-secondary"
                  >
                    <Compass size={13} /> View on 3D Globe & Map
                  </Link>
                  <a
                    href={selectedFeature.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="terrain-btn-secondary"
                  >
                    {selectedFeature.source} <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Context Surface Map Preview */}
              <div className="terrain-map-box">
                <div className="terrain-map-box__title mono">
                  <MapPin size={12} color="var(--accent-yellow)" /> CARTOGRAPHIC BASEMAP (MOLA SHADED RELIEF)
                </div>
                <MarsMap height="360px" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERIFIED SURFACE HAZARDS */}
      {activeTab === 'hazards' && (
        <div className="terrain-hazards-section">
          <div className="terrain-hazards-banner">
            <ShieldAlert size={20} color="var(--accent-yellow)" />
            <div>
              <strong>NASA ROVER MOBILITY STANDARDS & EMPIRICAL TERRAIN HAZARDS</strong>
              <p>
                All parameters below reflect verified engineering boundaries established during MER (Spirit & Opportunity), MSL (Curiosity), and Mars 2020 (Perseverance) surface operations.
              </p>
            </div>
          </div>

          <div className="terrain-hazards-grid">
            {MARS_SURFACE_HAZARDS.map((h) => {
              const isSelected = selectedHazard?.id === h.id;
              return (
                <div
                  key={h.id}
                  className={`terrain-hazard-card ${isSelected ? 'terrain-hazard-card--selected' : ''}`}
                  onClick={() => setSelectedHazard(h)}
                >
                  <div className="terrain-hazard-card__header">
                    <span className="terrain-hazard-cat mono">{h.category}</span>
                    <span className="terrain-hazard-sev mono">{h.severity}</span>
                  </div>
                  <h3 className="terrain-hazard-card__title">{h.name}</h3>

                  <div className="terrain-hazard-thresholds">
                    <div className="terrain-thresh terrain-thresh--safe">
                      <span className="terrain-thresh-label">SAFE:</span>
                      <span className="terrain-thresh-val">{h.safeThreshold}</span>
                    </div>
                    <div className="terrain-thresh terrain-thresh--warn">
                      <span className="terrain-thresh-label">CAUTION:</span>
                      <span className="terrain-thresh-val">{h.hazardousThreshold}</span>
                    </div>
                    <div className="terrain-thresh terrain-thresh--crit">
                      <span className="terrain-thresh-label">BARRIER:</span>
                      <span className="terrain-thresh-val">{h.impassableThreshold}</span>
                    </div>
                  </div>

                  <p className="terrain-hazard-impact">{h.engineeringImpact}</p>
                  <div className="terrain-hazard-source mono">
                    Dataset Source: {h.datasetSource}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: USGS PLANETARY GEOLOGIC MAPPING (SIM 3292) */}
      {activeTab === 'classifications' && (
        <div className="terrain-class-section">
          {/* USGS SIM 3292 Header Banner */}
          <div className="terrain-usgs-banner">
            <Layers size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong>USGS SCIENTIFIC INVESTIGATIONS MAP 3292 // PLANETARY GEOLOGIC MAPPING PROGRAM</strong>
                <span className="terrain-sys-tag mono" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)', padding: '1px 6px', fontSize: '8px' }}>
                  ● REAL DATA
                </span>
              </div>
              <p>
                Mars chronostratigraphic architecture and rock-stratigraphic units based on the official USGS global geological map (Tanaka, Skinner, Dohm, et al., 2014) sponsored by NASA. Defines the 3 major planetary eras and lithologic map units governing rover mobility.
              </p>
              <a
                href="https://pubs.usgs.gov/sim/3292/"
                target="_blank"
                rel="noopener noreferrer"
                className="terrain-usgs-link mono"
              >
                Access USGS SIM 3292 Official Map Repository <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Chronostratigraphic Eras Grid */}
          <h3 className="terrain-chrono-sec-title mono" style={{ fontSize: '11px', color: '#f0f6fc', marginBottom: '8px' }}>
            MARTIAN CHRONOSTRATIGRAPHIC TIME SCALE (USGS ASTRONOMICAL DATUM)
          </h3>
          <div className="terrain-chrono-grid">
            {USGS_CHRONOSTRATIGRAPHY.map((c) => (
              <div
                key={c.id}
                className="terrain-chrono-card"
                style={{ borderTop: `3px solid ${c.colorHex}` }}
              >
                <div className="terrain-chrono-head">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 className="terrain-chrono-name" style={{ color: c.colorHex }}>{c.period}</h4>
                      <span style={{ color: '#10b981', fontSize: '8px', fontWeight: 700 }} className="mono">● REAL DATA</span>
                    </div>
                    <span className="terrain-chrono-sub mono">{c.epochSpan} • Prefix: {c.mapCodePrefix}</span>
                  </div>
                  <span className="terrain-chrono-age mono">{c.ageRange}</span>
                </div>

                <p className="terrain-chrono-summary">{c.summary}</p>

                <div className="terrain-chrono-box mono">
                  <span className="terrain-chrono-lbl">CLIMATE DYNAMICS:</span>
                  <span className="terrain-chrono-val">{c.climaticConditions}</span>
                </div>

                <div className="terrain-chrono-box mono">
                  <span className="terrain-chrono-lbl">NOTABLE SITES:</span>
                  <span className="terrain-chrono-val">{c.notableFormations.join(' • ')}</span>
                </div>

                <div className="terrain-chrono-box mono">
                  <span className="terrain-chrono-lbl">ROVER MOBILITY PROFILE:</span>
                  <span className="terrain-chrono-val">{c.traversabilityProfile}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Verified USGS Geologic Map Units Table */}
          <h3 className="terrain-chrono-sec-title mono" style={{ fontSize: '11px', color: '#f0f6fc', marginBottom: '8px' }}>
            VERIFIED USGS MAP UNITS AT EXPLORATION SITES
          </h3>
          <div className="terrain-units-table-wrap">
            <table className="terrain-units-table mono">
              <thead>
                <tr>
                  <th>UNIT CODE</th>
                  <th>FORMATION / UNIT NAME</th>
                  <th>PERIOD</th>
                  <th>OCCURRENCE & SITES</th>
                  <th>LITHOLOGY</th>
                  <th>HAZARD GRADE</th>
                  <th>SURVIVAL & ISRU UTILITY</th>
                </tr>
              </thead>
              <tbody>
                {USGS_GEOLOGIC_UNITS.map((u) => (
                  <tr key={u.code}>
                    <td>
                      <span className="terrain-unit-code-badge" style={{ background: u.colorHex }}>
                        {u.code}
                      </span>
                    </td>
                    <td><strong style={{ color: '#f0f6fc' }}>{u.name}</strong></td>
                    <td>{u.period}</td>
                    <td>{u.occurrence}</td>
                    <td>{u.description}</td>
                    <td className="terrain-unit-hazard">{u.hazardGrade}</td>
                    <td style={{ color: '#38bdf8', fontSize: '8px' }}>{u.survivalRelevance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Morphological Terrain Classes */}
          <h3 className="terrain-chrono-sec-title mono" style={{ fontSize: '11px', color: '#f0f6fc', marginBottom: '8px' }}>
            SURFACE MORPHOLOGY & TERRAIN CLASSES
          </h3>
          <div className="terrain-class-grid">
            {terrainTypes.map((t) => (
              <div key={t.id} className="terrain-class-card">
                <div className="terrain-class-card__indicator" style={{ background: t.color }} />
                <div className="terrain-class-card__body">
                  <div className="terrain-class-header">
                    <h3 className="terrain-class-title">{t.name}</h3>
                    <span className="terrain-class-badge mono">Hazard: {t.hazardLevel} {t.usgsCode && `• ${t.usgsCode}`}</span>
                  </div>
                  <p className="terrain-class-desc">{t.description}</p>
                  <div className="terrain-class-tags">
                    {t.characteristics.map((c, i) => (
                      <span key={i} className="terrain-class-tag mono">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="terrain-class-examples">
                    <span className="terrain-ex-label mono">NOTABLE REGIONS:</span>
                    <span className="terrain-ex-vals">{t.examples.join(' • ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TerrainExplorer;
