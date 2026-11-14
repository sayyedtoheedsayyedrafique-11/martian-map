import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import marsMissions from '../../data/marsMissions';
import marsLocations, { locationTypes } from '../../data/marsLocations';
import { MARS_RAW_IMAGES } from '../../data/marsRawImages';
import {
  INSIGHT_MISSION_METADATA,
  MARS_INTERIOR_STRUCTURE,
  INSIGHT_MARSQUAKE_EVENTS,
} from '../../data/marsQuakeCatalog';
import MarsMap from '../MarsMap/MarsMap';
import PerseveranceRawGallery from '../RawImages/PerseveranceRawGallery';
import ClassificationBadge from '../ui/ClassificationBadge';
import { formatCoordinates } from '../../utils/helpers';
import {
  Rocket,
  GitCompare,
  MapPin,
  ExternalLink,
  Award,
  CheckCircle2,
  AlertCircle,
  Layers,
  RotateCcw,
  Sparkles,
  FileText,
  X,
  Compass,
  Route,
  Activity,
  Cpu,
  ShieldCheck,
  Camera,
  Navigation,
} from 'lucide-react';
import './MarsMissionIntelligence.css';

function MarsMissionIntelligence({ defaultMissionId = 'perseverance', initialMode = 'explorer' }) {
  const [selectedMissionId, setSelectedMissionId] = useState(defaultMissionId);
  const [activeTab, setActiveTab] = useState(initialMode); // 'explorer' | 'comparison' | 'map' | 'reliability'
  
  // Comparison state
  const [compareAId, setCompareAId] = useState('perseverance');
  const [compareBId, setCompareBId] = useState('curiosity');

  // Location connection & modal state
  const [activeDossierLocation, setActiveDossierLocation] = useState(null);
  const mapSectionRef = useRef(null);

  // Active mission resolution
  const selectedMission = useMemo(() => {
    return marsMissions.find((m) => m.id === selectedMissionId) || marsMissions[0];
  }, [selectedMissionId]);

  // Connect active mission to its actual marsLocations record
  const selectedLocation = useMemo(() => {
    const locId = selectedMission.primaryLocationId;
    return marsLocations.find((l) => l.id === locId) || marsLocations[0];
  }, [selectedMission]);

  // Comparison missions
  const compareMissionA = useMemo(() => {
    return marsMissions.find((m) => m.id === compareAId) || marsMissions[0];
  }, [compareAId]);

  const compareMissionB = useMemo(() => {
    return marsMissions.find((m) => m.id === compareBId) || marsMissions[1];
  }, [compareBId]);

  // Only rover/lander mission locations for focused map display
  const missionLocations = useMemo(() => {
    return marsLocations.filter((l) => ['rover', 'lander', 'helicopter'].includes(l.type));
  }, []);

  const handleSelectMission = (missionId) => {
    setSelectedMissionId(missionId);
  };

  const handleHighlightOnMap = (locId, shouldScroll = true) => {
    const targetLoc = marsLocations.find((l) => l.id === locId) || selectedLocation;
    if (targetLoc && shouldScroll) {
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSwapCompare = () => {
    setCompareAId(compareBId);
    setCompareBId(compareAId);
  };

  return (
    <div className="mmi-root fade-in">
      {/* Header & Overview */}
      <div className="mmi-header">
        <div className="mmi-tag-row">
          <span className="mmi-sys-tag mono">NASA PDS ARCHIVE // FLIGHT OPS</span>
          <span className="mmi-sys-tag mmi-sys-tag--accent mono">MARS MISSION INTELLIGENCE</span>
          <span className="mmi-sys-tag mono">IAU 2000 AREOGRAPHIC DATUM</span>
        </div>
        <h1 className="mmi-title">Mars Mission Intelligence</h1>
        <p className="mmi-desc">
          Official, verified intelligence on NASA Mars robotic missions. Explore mission objectives, verified
          scientific discoveries, flight instruments payload, and authentic surface landing coordinates linked to
          USGS & MOLA cartography.
        </p>

        {/* Navigation Tabs */}
        <div className="mmi-tabs">
          <button
            type="button"
            className={`mmi-tab-btn ${activeTab === 'explorer' ? 'mmi-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('explorer')}
          >
            <Rocket size={14} /> Mission Explorer & Details
          </button>
          <button
            type="button"
            className={`mmi-tab-btn ${activeTab === 'raw-images' ? 'mmi-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('raw-images')}
          >
            <Camera size={14} /> Perseverance Raw Images ({MARS_RAW_IMAGES.length})
          </button>
          <button
            type="button"
            className={`mmi-tab-btn ${activeTab === 'comparison' ? 'mmi-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            <GitCompare size={14} /> Mission Comparison Matrix
          </button>
          <button
            type="button"
            className={`mmi-tab-btn ${activeTab === 'map' ? 'mmi-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <MapPin size={14} /> Surface Landing Map
          </button>
          <button
            type="button"
            className={`mmi-tab-btn ${activeTab === 'reliability' ? 'mmi-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('reliability')}
          >
            <ShieldCheck size={14} /> Verification & Telemetry Notice
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: MISSION EXPLORER & DETAILS
          ========================================================================= */}
      {activeTab === 'explorer' && (
        <div className="mmi-dossier">
          {/* Mission Selector Grid */}
          <div className="mmi-mission-selector">
            <span className="mmi-selector-label mono">Verified NASA Mars Missions (Select to Inspect)</span>
            <div className="mmi-mission-grid">
              {marsMissions.map((mission) => {
                const isActive = mission.id === selectedMissionId;
                const isOperating = mission.statusCategory === 'active';
                return (
                  <button
                    key={mission.id}
                    type="button"
                    className={`mmi-mission-card ${isActive ? 'mmi-mission-card--active' : ''}`}
                    onClick={() => handleSelectMission(mission.id)}
                  >
                    <div className="mmi-card-top">
                      <h3 className="mmi-card-name">{mission.name}</h3>
                      <span
                        className={`mmi-status-pill ${
                          isOperating ? 'mmi-status-pill--active' : 'mmi-status-pill--completed'
                        }`}
                      >
                        <span className="mmi-status-dot" />
                        {mission.currentStatus}
                      </span>
                    </div>

                    <div className="mmi-card-type">{mission.roverOrLanderType}</div>

                    <div className="mmi-card-loc">
                      <MapPin size={12} />
                      <span>{mission.landingSiteName}</span>
                    </div>

                    <div className="mmi-card-meta mono">
                      Landed: {mission.landingDate}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Mission Detailed Dossier */}
          <div className="mmi-dossier-hero">
            <div className="mmi-dossier-header-row">
              <div className="mmi-dossier-title-group">
                <h2>{selectedMission.formalName}</h2>
                <div className="mmi-dossier-program mono">
                  {selectedMission.program} • {selectedMission.agency}
                </div>
              </div>

              <div className="mmi-dossier-actions">
                <button
                  type="button"
                  className="mmi-btn-primary"
                  onClick={() => handleHighlightOnMap(selectedMission.primaryLocationId, true)}
                >
                  <MapPin size={14} /> Highlight on Mars Map
                </button>
                <button
                  type="button"
                  className="mmi-btn-secondary"
                  onClick={() => setActiveDossierLocation(selectedLocation)}
                >
                  <FileText size={14} /> Open Location Details
                </button>
                <button
                  type="button"
                  className="mmi-btn-secondary"
                  onClick={() => {
                    setCompareAId(selectedMission.id);
                    setActiveTab('comparison');
                  }}
                >
                  <GitCompare size={14} /> Compare Mission
                </button>
                {selectedMission.id === 'perseverance' && (
                  <button
                    type="button"
                    className="mmi-btn-primary"
                    onClick={() => setActiveTab('raw-images')}
                  >
                    <Camera size={14} /> View Raw Images ({MARS_RAW_IMAGES.length})
                  </button>
                )}
                {selectedMission.id === 'curiosity' && (
                  <Link
                    to="/route-planner?start=bradbury-landing&dest=gediz-vallis"
                    className="mmi-btn-primary"
                    style={{ background: '#f59e0b', color: '#08090c' }}
                  >
                    <Navigation size={14} /> View Curiosity Route Map Visual
                  </Link>
                )}
              </div>
            </div>

            {/* Status Summary with Clearly Labeled Last-Updated Date */}
            <div className="mmi-status-banner">
              <Activity size={18} color="var(--accent-yellow)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="mmi-status-banner-text">
                <strong>Current Mission Status: {selectedMission.currentStatus}</strong> — {selectedMission.statusSummary}
                <div className="mmi-status-updated mono">
                  Verified Last-Updated Date: {selectedMission.statusLastUpdated} • {selectedMission.verificationBadge}
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="mmi-metric-strip mono">
              <div className="mmi-metric-item">
                <span className="mmi-metric-key">VEHICLE TYPE</span>
                <span className="mmi-metric-val">{selectedMission.vehicleClass}</span>
              </div>
              <div className="mmi-metric-item">
                <span className="mmi-metric-key">TOUCHDOWN DATE</span>
                <span className="mmi-metric-val">{selectedMission.landingDate}</span>
              </div>
              <div className="mmi-metric-item">
                <span className="mmi-metric-key">SURFACE LIFETIME</span>
                <span className="mmi-metric-val mmi-metric-val--accent">{selectedMission.surfaceOperatedSols}</span>
              </div>
              <div className="mmi-metric-item">
                <span className="mmi-metric-key">LANDING ELEVATION</span>
                <span className="mmi-metric-val">{selectedMission.elevationFormatted}</span>
              </div>
            </div>
          </div>

          {/* Interactive Landing Site Connection Card */}
          <div className="mmi-location-box">
            <div className="mmi-panel-header" style={{ paddingBottom: '6px', border: 'none' }}>
              <div className="mmi-panel-title">
                <MapPin className="mmi-panel-title-icon" size={16} />
                <span>Verified Landing Site Connection</span>
              </div>
              <span className="mmi-sys-tag mono">USGS / IAU AREOGRAPHIC FRAME</span>
            </div>

            <div className="mmi-location-coords-row">
              <div>
                <h4 className="mmi-location-name">{selectedMission.landingSiteName}</h4>
                <span className="mmi-card-type">{selectedMission.landingRegion}</span>
              </div>
              <div className="mmi-location-coords mono">
                {selectedMission.coordinates.latFormatted}, {selectedMission.coordinates.lngFormatted} • {selectedMission.elevationFormatted}
              </div>
            </div>

            <div className="mmi-location-actions">
              <button
                type="button"
                className="mmi-btn-primary"
                onClick={() => handleHighlightOnMap(selectedMission.primaryLocationId, true)}
              >
                <Compass size={13} /> Center on Embedded 2D Map
              </button>

              <button
                type="button"
                className="mmi-btn-secondary"
                onClick={() => setActiveDossierLocation(selectedLocation)}
              >
                <FileText size={13} /> View Full Geological Dossier
              </button>

              <Link
                to={`/?site=${selectedMission.primaryLocationId}`}
                className="mmi-btn-secondary"
              >
                <Layers size={13} /> Inspect in 3D Planetary Globe
              </Link>

              {selectedMission.id === 'curiosity' && (
                <>
                  <a
                    href="https://mars.nasa.gov/msl/mission/where-is-the-rover/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mmi-btn-secondary"
                  >
                    <ExternalLink size={13} /> Official NASA MSL Route Map
                  </a>
                  <a
                    href="https://trek.nasa.gov/mars/#v=0.1&x=137.4417&y=-4.5895&z=7&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mmi-btn-secondary"
                  >
                    <Compass size={13} /> Open in JPL Mars Trek
                  </a>
                </>
              )}
            </div>

            {/* Special Dual Landing Sites for Spirit and Opportunity */}
            {selectedMission.subRovers && (
              <div className="mmi-subrover-strip">
                <span className="mmi-selector-label mono" style={{ marginTop: '6px' }}>
                  Dual Rover Surface Landing Sites:
                </span>
                {selectedMission.subRovers.map((rover) => (
                  <div key={rover.id} className="mmi-subrover-card">
                    <div className="mmi-subrover-info">
                      <h4>{rover.name} — {rover.landingSiteName}</h4>
                      <p className="mono">
                        Coordinates: {rover.coordinates.latFormatted}, {rover.coordinates.lngFormatted} • {rover.elevationFormatted} • Landed: {rover.landingDate}
                      </p>
                      <p style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>
                        Key Discovery: {rover.keyFinding}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="mmi-btn-secondary"
                        onClick={() => {
                          const subLoc = marsLocations.find((l) => l.id === rover.landingLocationId);
                          if (subLoc) setActiveDossierLocation(subLoc);
                        }}
                      >
                        Inspect {rover.name}
                      </button>
                      <button
                        type="button"
                        className="mmi-btn-primary"
                        onClick={() => handleHighlightOnMap(rover.landingLocationId, true)}
                      >
                        Highlight
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-Side: Mission Objectives & Scientific Discoveries */}
          <div className="mmi-dossier-grid">
            {/* Mission Objectives */}
            <div className="mmi-panel">
              <div className="mmi-panel-header">
                <h3 className="mmi-panel-title">
                  <CheckCircle2 className="mmi-panel-title-icon" size={16} /> Mission Objectives
                </h3>
                <span className="mmi-sys-tag mono">NASA SCIENTIFIC GOALS</span>
              </div>
              <div className="mmi-list">
                {selectedMission.missionObjectives.map((obj, i) => (
                  <div key={i} className="mmi-list-item">
                    <span className="mmi-list-bullet">✦</span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific Discoveries */}
            <div className="mmi-panel">
              <div className="mmi-panel-header">
                <h3 className="mmi-panel-title">
                  <Award className="mmi-panel-title-icon" size={16} /> Scientific Discoveries & Milestones
                </h3>
                <span className="mmi-sys-tag mono">PDS VALIDATED</span>
              </div>
              <div className="mmi-list">
                {selectedMission.scientificDiscoveries.map((disc, i) => (
                  <div key={i} className="mmi-list-item">
                    <span className="mmi-list-bullet">★</span>
                    <span>{disc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scientific Instruments Payload Grid */}
          <div className="mmi-panel">
            <div className="mmi-panel-header">
              <h3 className="mmi-panel-title">
                <Cpu className="mmi-panel-title-icon" size={16} /> Scientific Instruments & Payload Suite ({selectedMission.scientificInstruments.length})
              </h3>
              <span className="mmi-sys-tag mono">AUTHENTIC SENSOR SPECIFICATIONS</span>
            </div>
            <div className="mmi-instruments-grid">
              {selectedMission.scientificInstruments.map((inst) => (
                <div key={inst.acronym} className="mmi-instrument-card">
                  <div className="mmi-instrument-top">
                    <span className="mmi-instrument-acronym mono">{inst.acronym}</span>
                    <span className="mmi-instrument-type mono">{inst.type}</span>
                  </div>
                  <div className="mmi-instrument-name">{inst.fullName}</div>
                  <div className="mmi-instrument-inst mono">{inst.institution}</div>
                  <p className="mmi-instrument-desc">{inst.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Exploration Achievements Grid */}
          <div className="mmi-panel">
            <div className="mmi-panel-header">
              <h3 className="mmi-panel-title">
                <Sparkles className="mmi-panel-title-icon" size={16} /> Exploration Achievements & Engineering Records
              </h3>
              <span className="mmi-sys-tag mono">HISTORICAL MILESTONES</span>
            </div>
            <div className="mmi-achieve-grid">
              {selectedMission.explorationAchievements.map((ach, i) => (
                <div key={i} className="mmi-achieve-card">
                  <span className="mmi-achieve-metric mono">{ach.metric}</span>
                  <span className="mmi-achieve-val mono">{ach.value}</span>
                  <p className="mmi-achieve-desc">{ach.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* InSight-Specific: Seismic Activity & Planetary Interior Structure Module */}
          {selectedMission.id === 'insight' && (
            <div className="mmi-panel" style={{ borderTop: '3px solid #ef4444' }}>
              <div className="mmi-panel-header">
                <div>
                  <h3 className="mmi-panel-title">
                    <Activity className="mmi-panel-title-icon" size={16} /> Seismic Activity & Interior Structure (NASA InSight / SEIS / IRIS)
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                    <ClassificationBadge type="actual" customLabel="ACTUAL SEISMIC TELEMETRY" size="sm" />
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      MQS Catalog V11 • IRIS Network Code: XB
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={INSIGHT_MISSION_METADATA.irisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mmi-btn-secondary mono"
                    style={{ fontSize: '0.74rem' }}
                  >
                    IRIS Data Center <ExternalLink size={10} />
                  </a>
                  <a
                    href={INSIGHT_MISSION_METADATA.pdsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mmi-btn-primary mono"
                    style={{ fontSize: '0.74rem' }}
                  >
                    PDS SEIS Archive <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              {/* Notable Marsquake Events List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {INSIGHT_MARSQUAKE_EVENTS.slice(0, 4).map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '12px',
                      borderLeft: `3px solid ${ev.magnitudeMw >= 4.5 ? '#ef4444' : ev.magnitudeMw >= 4.0 ? '#d97706' : '#38bdf8'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ color: '#f5f5f0', fontSize: '0.86rem' }}>Event {ev.id}</strong>
                      <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: ev.magnitudeMw >= 4.5 ? '#ef4444' : '#d97706' }}>
                        {ev.magnitudeFormatted}
                      </span>
                    </div>
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Sol {ev.sol} • {ev.type}
                    </div>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                      {ev.scientificImpact}
                    </p>
                    <div className="mono" style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                      Origin: {ev.sourceRegion} (~{ev.epicentralDistanceKm.toLocaleString()} km)
                    </div>
                  </div>
                ))}
              </div>

              {/* 3-Layer Interior Structure Summary */}
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <h4 style={{ color: 'var(--accent-amber)', fontSize: '0.82rem', margin: '0 0 8px 0' }} className="mono">
                  MARTIAN 3-LAYER INTERIOR STRUCTURE MODEL (KNAPMEYER-ENDRUN ET AL., SCIENCE 2021)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: '#f5f5f0' }}>1. Crust:</strong>
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {MARS_INTERIOR_STRUCTURE.crust.thicknessRange}
                    </div>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: '#38bdf8' }}>2. Mantle:</strong>
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {MARS_INTERIOR_STRUCTURE.mantle.thicknessRange}
                    </div>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: '#ef4444' }}>3. Core:</strong>
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      Radius: {MARS_INTERIOR_STRUCTURE.core.radiusKm}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Embedded Interactive 2D Mars Surface Map */}
          <div ref={mapSectionRef} className="mmi-map-section">
            <div className="mmi-map-header">
              <div className="mmi-map-heading-group">
                <h3>
                  <MapPin size={16} color="var(--accent-yellow)" style={{ display: 'inline', marginRight: '6px' }} />
                  Surface Cartography: {selectedMission.name} Landing Site
                </h3>
                <p>
                  Interactive Leaflet GIS map with NASA/USGS shaded relief basemap. Click markers to inspect landing sites.
                </p>
              </div>
              <div className="mmi-map-controls-row">
                <button
                  type="button"
                  className="mmi-btn-secondary"
                  onClick={() => handleHighlightOnMap(selectedMission.primaryLocationId, false)}
                >
                  <Compass size={13} /> Re-center {selectedMission.name}
                </button>
                <Link
                  to={`/?site=${selectedMission.primaryLocationId}`}
                  className="mmi-btn-primary"
                >
                  <Layers size={13} /> Launch 3D Globe View
                </Link>
              </div>
            </div>

            <div className="mmi-map-canvas-wrap">
              <MarsMap
                selectedLocation={selectedLocation}
                onLocationSelect={(loc) => {
                  setActiveDossierLocation(loc);
                }}
                filteredLocations={marsLocations}
                height="480px"
              />
            </div>
          </div>

          {/* Telemetry Transparency & Reliable Data Provenance Notice */}
          <div className="mmi-transparency-box">
            <div className="mmi-transparency-title">
              <ShieldCheck size={16} />
              <span>Reliable Data Provenance & Telemetry Transparency</span>
            </div>
            <p className="mmi-desc" style={{ fontSize: '13px' }}>
              {selectedMission.telemetryNotice.reasonUnavailable}
            </p>

            <div className="mmi-transparency-grid">
              <div className="mmi-transparency-col">
                <div className="mmi-transparency-col-title mmi-transparency-col-title--verified mono">
                  <CheckCircle2 size={13} /> Verified Authentic Data
                </div>
                <div className="mmi-transparency-list">
                  {selectedMission.telemetryNotice.verifiedDataPoints.map((item, i) => (
                    <div key={i} className="mmi-transparency-item">
                      <span style={{ color: '#10b981' }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mmi-transparency-col">
                <div className="mmi-transparency-col-title mmi-transparency-col-title--unavailable mono">
                  <AlertCircle size={13} /> Unavailable / Non-Invented Data
                </div>
                <div className="mmi-transparency-list">
                  {selectedMission.telemetryNotice.unavailableDataPoints.map((item, i) => (
                    <div key={i} className="mmi-transparency-item">
                      <span style={{ color: 'var(--text-muted)' }}>✕</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Source Citations */}
            <div className="mmi-sources-list">
              <span className="mmi-selector-label mono" style={{ alignSelf: 'center' }}>Official Sources:</span>
              {selectedMission.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mmi-source-chip mono"
                >
                  <ExternalLink size={12} />
                  <span>{src.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MISSION COMPARISON MATRIX
          ========================================================================= */}
      {activeTab === 'comparison' && (
        <div className="mmi-compare-tool">
          {/* Comparison Controls */}
          <div className="mmi-compare-controls">
            <div className="mmi-select-pair">
              <div className="mmi-select-group">
                <label className="mmi-select-label mono" htmlFor="compare-a-select">Mission A (Primary)</label>
                <select
                  id="compare-a-select"
                  className="mmi-select mono"
                  value={compareAId}
                  onChange={(e) => setCompareAId(e.target.value)}
                >
                  {marsMissions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.roverOrLanderType.split('(')[0].trim()})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="mmi-swap-btn"
                onClick={handleSwapCompare}
                title="Swap Mission A and B"
                aria-label="Swap Mission A and B"
              >
                <RotateCcw size={14} />
              </button>

              <div className="mmi-select-group">
                <label className="mmi-select-label mono" htmlFor="compare-b-select">Mission B (Comparison)</label>
                <select
                  id="compare-b-select"
                  className="mmi-select mono"
                  value={compareBId}
                  onChange={(e) => setCompareBId(e.target.value)}
                >
                  {marsMissions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.roverOrLanderType.split('(')[0].trim()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mmi-preset-row">
              <span className="mmi-preset-label mono">Presets:</span>
              <button
                type="button"
                className="mmi-preset-btn mono"
                onClick={() => {
                  setCompareAId('perseverance');
                  setCompareBId('curiosity');
                }}
              >
                Perseverance vs Curiosity
              </button>
              <button
                type="button"
                className="mmi-preset-btn mono"
                onClick={() => {
                  setCompareAId('perseverance');
                  setCompareBId('insight');
                }}
              >
                Perseverance vs InSight
              </button>
              <button
                type="button"
                className="mmi-preset-btn mono"
                onClick={() => {
                  setCompareAId('curiosity');
                  setCompareBId('spirit-opportunity');
                }}
              >
                Curiosity vs Spirit & Opp
              </button>
            </div>
          </div>

          {/* Comparison Matrix Breakdown */}
          <div className="mmi-compare-matrix">
            {/* Section 1: Overview & Status */}
            <div className="mmi-compare-section">
              <div className="mmi-compare-section-title">
                <Rocket size={14} /> 1. Mission Overview & Status
              </div>
              <div className="mmi-compare-cols">
                <div className="mmi-compare-col">
                  <div className="mmi-compare-col-header">
                    <h4 className="mmi-compare-mission-title">{compareMissionA.name}</h4>
                    <span className="mmi-compare-mission-sub mono">{compareMissionA.formalName}</span>
                  </div>
                  <div className="mmi-metric-strip mono" style={{ border: 'none', padding: 0 }}>
                    <div className="mmi-metric-item">
                      <span className="mmi-metric-key">VEHICLE TYPE</span>
                      <span className="mmi-metric-val">{compareMissionA.roverOrLanderType}</span>
                    </div>
                    <div className="mmi-metric-item">
                      <span className="mmi-metric-key">CURRENT STATUS</span>
                      <span className="mmi-metric-val mmi-metric-val--accent">{compareMissionA.currentStatus}</span>
                    </div>
                    <div className="mmi-metric-item">
                      <span className="mmi-metric-key">TOUCHDOWN DATE</span>
                      <span className="mmi-metric-val">{compareMissionA.landingDate}</span>
                    </div>
                    <div className="mmi-metric-item">
                      <span className="mmi-metric-key">SURFACE LIFETIME</span>
                      <span className="mmi-metric-val">{compareMissionA.surfaceOperatedSols}</span>
                    </div>
                    <div className="mmi-metric-item">
                      <span className="mmi-metric-key">STATUS LAST UPDATED</span>
                      <span className="mmi-metric-val">{compareMissionA.statusLastUpdated}</span>
                    </div>
                  </div>
                </div>

                <div className="mmi-compare-col">
                  <div className="mmi-compare-col-header">
                    <h4 className="mmi-compare-mission-title">{compareMissionB.name}</h4>
                    <span className="mmi-compare-mission-sub mono">{compareMissionB.formalName}</span>
                  </div>
                  <div className="mmi-metric-strip mono" style={{ border: 'none', padding: 0 }}>
                    <div className="mmi-metric-item">
                      <span className="mmi-metric-key">VEHICLE TYPE</span>
                      <span className="mmi-metric-val">{compareMissionB.roverOrLanderType}</span>
                    </div>
                    <div className="mmi-metric-item">
                      <span className="mmi-metric-key">CURRENT STATUS</span>
                      <span className="mmi-metric-val mmi-metric-val--accent">{compareMissionB.currentStatus}</span>
                    </div>
                    <div className="mmi-metric-item">
                      <span className="mmi-metric-key">TOUCHDOWN DATE</span>
                      <span className="mmi-metric-val">{compareMissionB.landingDate}</span>
                    </div>
                    <div className="mmi-metric-item">
                      <span className="mmi-metric-key">SURFACE LIFETIME</span>
                      <span className="mmi-metric-val">{compareMissionB.surfaceOperatedSols}</span>
                    </div>
                    <div className="mmi-metric-item">
                      <span className="mmi-metric-key">STATUS LAST UPDATED</span>
                      <span className="mmi-metric-val">{compareMissionB.statusLastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Landing Locations & Geological Context */}
            <div className="mmi-compare-section">
              <div className="mmi-compare-section-title">
                <MapPin size={14} /> 2. Landing Locations & Topographic Context
              </div>
              <div className="mmi-compare-cols">
                <div className="mmi-compare-col">
                  <div className="mmi-location-coords-row">
                    <div>
                      <h4 className="mmi-location-name">{compareMissionA.landingSiteName}</h4>
                      <span className="mmi-card-type">{compareMissionA.landingRegion}</span>
                    </div>
                    <span className="mmi-location-coords mono">
                      {compareMissionA.coordinates.latFormatted}, {compareMissionA.coordinates.lngFormatted}
                    </span>
                  </div>
                  <div className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Elevation: {compareMissionA.elevationFormatted}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="mmi-btn-primary"
                      onClick={() => {
                        setSelectedMissionId(compareMissionA.id);
                        handleHighlightOnMap(compareMissionA.primaryLocationId, true);
                        setActiveTab('explorer');
                      }}
                    >
                      Inspect Location
                    </button>
                  </div>
                </div>

                <div className="mmi-compare-col">
                  <div className="mmi-location-coords-row">
                    <div>
                      <h4 className="mmi-location-name">{compareMissionB.landingSiteName}</h4>
                      <span className="mmi-card-type">{compareMissionB.landingRegion}</span>
                    </div>
                    <span className="mmi-location-coords mono">
                      {compareMissionB.coordinates.latFormatted}, {compareMissionB.coordinates.lngFormatted}
                    </span>
                  </div>
                  <div className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Elevation: {compareMissionB.elevationFormatted}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="mmi-btn-primary"
                      onClick={() => {
                        setSelectedMissionId(compareMissionB.id);
                        handleHighlightOnMap(compareMissionB.primaryLocationId, true);
                        setActiveTab('explorer');
                      }}
                    >
                      Inspect Location
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Mission Objectives Comparison */}
            <div className="mmi-compare-section">
              <div className="mmi-compare-section-title">
                <CheckCircle2 size={14} /> 3. Mission Objectives Comparison
              </div>
              <div className="mmi-compare-cols">
                <div className="mmi-compare-col">
                  <h5 className="mono" style={{ color: 'var(--accent-yellow)', fontSize: '12px' }}>
                    {compareMissionA.name} Objectives
                  </h5>
                  <div className="mmi-list">
                    {compareMissionA.missionObjectives.map((obj, i) => (
                      <div key={i} className="mmi-list-item">
                        <span className="mmi-list-bullet">✦</span>
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mmi-compare-col">
                  <h5 className="mono" style={{ color: 'var(--accent-yellow)', fontSize: '12px' }}>
                    {compareMissionB.name} Objectives
                  </h5>
                  <div className="mmi-list">
                    {compareMissionB.missionObjectives.map((obj, i) => (
                      <div key={i} className="mmi-list-item">
                        <span className="mmi-list-bullet">✦</span>
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Scientific Instruments Comparison */}
            <div className="mmi-compare-section">
              <div className="mmi-compare-section-title">
                <Cpu size={14} /> 4. Scientific Instruments & Payloads
              </div>
              <div className="mmi-compare-cols">
                <div className="mmi-compare-col">
                  <h5 className="mono" style={{ color: 'var(--accent-yellow)', fontSize: '12px' }}>
                    {compareMissionA.name} Payload Suite ({compareMissionA.scientificInstruments.length})
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {compareMissionA.scientificInstruments.map((inst) => (
                      <div key={inst.acronym} style={{ background: 'var(--bg-primary)', padding: '8px 10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="mono" style={{ fontWeight: 700, color: 'var(--accent-yellow)' }}>{inst.acronym}</span>
                          <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inst.type}</span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{inst.fullName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{inst.purpose}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mmi-compare-col">
                  <h5 className="mono" style={{ color: 'var(--accent-yellow)', fontSize: '12px' }}>
                    {compareMissionB.name} Payload Suite ({compareMissionB.scientificInstruments.length})
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {compareMissionB.scientificInstruments.map((inst) => (
                      <div key={inst.acronym} style={{ background: 'var(--bg-primary)', padding: '8px 10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="mono" style={{ fontWeight: 700, color: 'var(--accent-yellow)' }}>{inst.acronym}</span>
                          <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{inst.type}</span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{inst.fullName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{inst.purpose}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Exploration Achievements Comparison */}
            <div className="mmi-compare-section">
              <div className="mmi-compare-section-title">
                <Sparkles size={14} /> 5. Exploration Achievements & Records
              </div>
              <div className="mmi-compare-cols">
                <div className="mmi-compare-col">
                  <h5 className="mono" style={{ color: 'var(--accent-yellow)', fontSize: '12px' }}>
                    {compareMissionA.name} Achievements
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {compareMissionA.explorationAchievements.map((ach, i) => (
                      <div key={i} style={{ background: 'var(--bg-primary)', padding: '8px 10px', border: '1px solid var(--border-color)' }}>
                        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ach.metric}</div>
                        <div className="mono" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-yellow)' }}>{ach.value}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{ach.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mmi-compare-col">
                  <h5 className="mono" style={{ color: 'var(--accent-yellow)', fontSize: '12px' }}>
                    {compareMissionB.name} Achievements
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {compareMissionB.explorationAchievements.map((ach, i) => (
                      <div key={i} style={{ background: 'var(--bg-primary)', padding: '8px 10px', border: '1px solid var(--border-color)' }}>
                        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ach.metric}</div>
                        <div className="mono" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-yellow)' }}>{ach.value}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{ach.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SURFACE LANDING MAP
          ========================================================================= */}
      {activeTab === 'map' && (
        <div className="mmi-map-section">
          <div className="mmi-map-header">
            <div className="mmi-map-heading-group">
              <h3>
                <MapPin size={16} color="var(--accent-yellow)" style={{ display: 'inline', marginRight: '6px' }} />
                Planetary Surface Landing Map
              </h3>
              <p>
                Authentic USGS Astrogeology and NASA Viking/MOLA basemaps. Click any rover marker to open its mission details.
              </p>
            </div>
            <div className="mmi-map-controls-row">
              {marsMissions.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`mmi-btn-secondary mono ${
                    selectedMissionId === m.id ? 'mmi-tab-btn--active' : ''
                  }`}
                  onClick={() => {
                    setSelectedMissionId(m.id);
                    handleHighlightOnMap(m.primaryLocationId, false);
                  }}
                >
                  {m.name.replace('NASA ', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="mmi-map-canvas-wrap" style={{ height: '560px' }}>
            <MarsMap
              selectedLocation={selectedLocation}
              onLocationSelect={(loc) => {
                setActiveDossierLocation(loc);
                // Also select matching mission if one matches
                const matchingMission = marsMissions.find(
                  (m) => m.primaryLocationId === loc.id || (m.pairedLocationIds && m.pairedLocationIds.includes(loc.id))
                );
                if (matchingMission) {
                  setSelectedMissionId(matchingMission.id);
                }
              }}
              filteredLocations={missionLocations}
              height="560px"
            />
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: VERIFICATION & TELEMETRY NOTICE
          ========================================================================= */}
      {activeTab === 'reliability' && (
        <div className="mmi-transparency-box">
          <div className="mmi-transparency-title">
            <ShieldCheck size={18} />
            <span style={{ fontSize: '18px' }}>NASA Mars Mission Data Verification & Reliability Report</span>
          </div>
          <p className="mmi-desc">
            The Mars Mission Intelligence module strictly operates on NASA Planetary Data System (PDS) peer-reviewed
            archives and verified JPL mission bulletins. No speculative telemetry or simulated real-time coordinates are
            fabricated.
          </p>

          <div className="mmi-transparency-grid" style={{ marginTop: '10px' }}>
            <div className="mmi-transparency-col">
              <div className="mmi-transparency-col-title mmi-transparency-col-title--verified mono" style={{ fontSize: '14px' }}>
                <CheckCircle2 size={16} /> Verified Planetary Datasets
              </div>
              <div className="mmi-transparency-list" style={{ gap: '10px' }}>
                <div className="mmi-transparency-item">
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                  <div>
                    <strong>Perseverance Landing & Traverse:</strong> Octavia E. Butler landing coordinates (18.4447° N, 77.4508° E)
                    and Jezero fan delta waypoints are verified by NASA MRO HiRISE orbital imagery and PDS Geosciences Node Release 68.
                  </div>
                </div>
                <div className="mmi-transparency-item">
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                  <div>
                    <strong>Curiosity Gale Crater Traverse:</strong> Bradbury landing coordinates (-4.5895° S, 137.4417° E)
                    and 32.5+ km Mount Sharp ascent route are verified through cumulative PDS archives (Sols 1–4200).
                  </div>
                </div>
                <div className="mmi-transparency-item">
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                  <div>
                    <strong>InSight Geophysics Archive:</strong> Elysium Planitia landing site (4.5024° N, 135.6234° E)
                    and 1,319+ seismic events cataloged by CNES/IPGP and NASA PDS.
                  </div>
                </div>
                <div className="mmi-transparency-item">
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                  <div>
                    <strong>Spirit & Opportunity Surface Records:</strong> Gusev Crater (-14.5718° S, 175.4785° E) and Meridiani
                    Planum (-1.9462° S, -5.5266° W) records sealed in historical PDS archives following official mission conclusions.
                  </div>
                </div>
              </div>
            </div>

            <div className="mmi-transparency-col">
              <div className="mmi-transparency-col-title mmi-transparency-col-title--unavailable mono" style={{ fontSize: '14px' }}>
                <AlertCircle size={16} /> Data Specifically Unavailable (Physical Constraints)
              </div>
              <div className="mmi-transparency-list" style={{ gap: '10px' }}>
                <div className="mmi-transparency-item">
                  <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>✕</span>
                  <div>
                    <strong>Real-time GPS Tracking:</strong> Mars does not possess a Global Positioning System (GPS) satellite
                    constellation. Rovers determine location through visual odometry and orbital image tie-pointing.
                  </div>
                </div>
                <div className="mmi-transparency-item">
                  <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>✕</span>
                  <div>
                    <strong>Zero-Latency Telemetry:</strong> Radio signals traveling at the speed of light require between 3 and 22
                    minutes one-way between Mars and Earth, governed by orbital alignment. Real-time sub-second interaction is physically impossible.
                  </div>
                </div>
                <div className="mmi-transparency-item">
                  <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>✕</span>
                  <div>
                    <strong>Post-Retirement Status:</strong> Telemetry for InSight (Dec 2022), Opportunity (Feb 2019), and Spirit (May 2011)
                    permanently ceased due to power exhaustion. Positions are documented as final resting monuments.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: NASA PERSEVERANCE RAW IMAGES GALLERY
          ========================================================================= */}
      {activeTab === 'raw-images' && (
        <div style={{ marginTop: '16px' }}>
          <PerseveranceRawGallery />
        </div>
      )}

      {/* =========================================================================
          LOCATION DOSSIER MODAL (Opens when user clicks "Open Location Details")
          ========================================================================= */}
      {activeDossierLocation && (
        <div className="mmi-modal-backdrop" onClick={() => setActiveDossierLocation(null)}>
          <div className="mmi-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="mmi-modal-header">
              <div>
                <span className="mmi-sys-tag mono" style={{ marginBottom: '4px', display: 'inline-block' }}>
                  {locationTypes[activeDossierLocation.type]?.label || activeDossierLocation.type} • {activeDossierLocation.status}
                </span>
                <h3 className="mmi-modal-title">{activeDossierLocation.name}</h3>
              </div>
              <button
                type="button"
                className="mmi-modal-close-btn"
                onClick={() => setActiveDossierLocation(null)}
                aria-label="Close location dossier"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mmi-modal-body">
              <p className="mmi-desc" style={{ color: 'var(--text-primary)' }}>
                {activeDossierLocation.description}
              </p>

              {activeDossierLocation.notableDiscovery && (
                <div className="mmi-status-banner" style={{ background: 'rgba(245, 197, 66, 0.08)' }}>
                  <Award size={18} color="var(--accent-yellow)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--accent-yellow)' }}>Verified Scientific Finding:</strong>
                    <div style={{ color: 'var(--text-primary)', marginTop: '2px', fontSize: '13px' }}>
                      {activeDossierLocation.notableDiscovery}
                    </div>
                  </div>
                </div>
              )}

              {/* Areographic Metadata Grid */}
              <div className="mmi-modal-meta-grid mono">
                <div>
                  <span className="mmi-metric-key">AREOGRAPHIC COORDINATES</span>
                  <div className="mmi-metric-val mmi-metric-val--accent">
                    {formatCoordinates(activeDossierLocation.lat, activeDossierLocation.lng)}
                  </div>
                </div>
                <div>
                  <span className="mmi-metric-key">MOLA AREOID ELEVATION</span>
                  <div className="mmi-metric-val">{activeDossierLocation.elevation || 'Documented'}</div>
                </div>
                <div>
                  <span className="mmi-metric-key">TERRAIN CLASSIFICATION</span>
                  <div className="mmi-metric-val">{activeDossierLocation.terrainLabel || activeDossierLocation.terrainType}</div>
                </div>
                <div>
                  <span className="mmi-metric-key">CATALOG ID</span>
                  <div className="mmi-metric-val">{activeDossierLocation.catalogId || 'USGS / IAU'}</div>
                </div>
                <div>
                  <span className="mmi-metric-key">TOUCHDOWN / EPOCH</span>
                  <div className="mmi-metric-val">{activeDossierLocation.landingDate || activeDossierLocation.geologicalEra}</div>
                </div>
                <div>
                  <span className="mmi-metric-key">PDS ARCHIVE REF</span>
                  <div className="mmi-metric-val">{activeDossierLocation.pdsReference || 'NASA PDS Geosciences'}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mmi-modal-actions">
                <Link
                  to={`/?site=${activeDossierLocation.id}`}
                  className="mmi-btn-primary"
                  onClick={() => setActiveDossierLocation(null)}
                >
                  <Layers size={13} /> Open in 3D Planetary Globe
                </Link>

                <Link
                  to={`/route-planner?start=${activeDossierLocation.id}`}
                  className="mmi-btn-secondary"
                  onClick={() => setActiveDossierLocation(null)}
                >
                  <Route size={13} /> Route Planner Origin
                </Link>

                {activeDossierLocation.sourceUrl && (
                  <a
                    href={activeDossierLocation.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mmi-btn-secondary"
                  >
                    <ExternalLink size={13} /> {activeDossierLocation.source || 'NASA Source'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarsMissionIntelligence;
