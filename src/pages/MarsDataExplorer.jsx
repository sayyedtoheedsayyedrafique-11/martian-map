import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import * as L_Module from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getElevationAtCoordinate,
  fetchPdsOdeObservations,
  VERIFIED_JEZERO_OBSERVATIONS,
  VERIFIED_MARS_TILE_LAYERS,
} from '../services/marsDataService';
import marsLocations from '../data/marsLocations';
import { formatCoordinates } from '../utils/helpers';
import {
  Database,
  Crosshair,
  ExternalLink,
  Layers,
  RotateCcw,
  Camera,
  Compass,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Info,
  Maximize2,
  Eye,
  FileText,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import './MarsDataExplorer.css';

const L = L_Module?.default || L_Module;

// Clean SVG pin icons for map markers
function createObservationIcon(isGroundTruth = false, isSelected = false) {
  try {
    const pinColor = isSelected ? '#F5C542' : isGroundTruth ? '#38bdf8' : '#e2e8f0';
    const glyphFill = '#080909';
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" width="26" height="34">
        <path d="M14 1C7.9 1 3 5.9 3 12c0 8.5 11 23 11 23s11-14.5 11-23c0-6.1-4.9-11-11-11z" fill="${pinColor}" stroke="#080909" stroke-width="1.5"/>
        <circle cx="14" cy="12" r="5" fill="${glyphFill}"/>
        <circle cx="14" cy="12" r="2.2" fill="${pinColor}"/>
      </svg>
    `;

    return L.divIcon({
      html: svg,
      className: 'mde-pin-icon',
      iconSize: [26, 34],
      iconAnchor: [13, 34],
      popupAnchor: [0, -34],
    });
  } catch (err) {
    return undefined;
  }
}

function createReticleIcon() {
  try {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="10" fill="none" stroke="#F5C542" stroke-width="2" stroke-dasharray="3,2"/>
        <line x1="16" y1="2" x2="16" y2="10" stroke="#F5C542" stroke-width="2"/>
        <line x1="16" y1="22" x2="16" y2="30" stroke="#F5C542" stroke-width="2"/>
        <line x1="2" y1="16" x2="10" y2="16" stroke="#F5C542" stroke-width="2"/>
        <line x1="22" y1="16" x2="30" y2="16" stroke="#F5C542" stroke-width="2"/>
        <circle cx="16" cy="16" r="2" fill="#F5C542"/>
      </svg>
    `;
    return L.divIcon({
      html: svg,
      className: 'mde-reticle-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  } catch (err) {
    return undefined;
  }
}

// Map event listener for clicks and mouse moves
function MapEventsListener({ onMapClick, onMouseMove }) {
  useMapEvents({
    click(e) {
      if (onMapClick && e?.latlng) {
        onMapClick(e.latlng);
      }
    },
    mousemove(e) {
      if (onMouseMove && e?.latlng) {
        onMouseMove(e.latlng);
      }
    },
  });
  return null;
}

// Controller to smoothly fly to coordinates or reset
function MapNavigationController({ targetView }) {
  const map = useMap();
  useEffect(() => {
    if (targetView && map) {
      try {
        map.flyTo([targetView.lat, targetView.lng], targetView.zoom, {
          duration: 1.1,
        });
      } catch (err) {
        console.warn('Map navigation failed:', err);
      }
    }
  }, [targetView, map]);
  return null;
}

// Dynamic Scale Tracker for Mars (Radius = 3389.5 km)
function MapScaleTracker({ onScaleUpdate }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const compute = () => {
      const zoom = map.getZoom();
      const center = map.getCenter();
      const latRad = (Math.abs(center.lat) * Math.PI) / 180;
      const circumKm = 2 * Math.PI * 3389.5 * Math.cos(latRad);
      const kmPerPx = Math.max(0.001, circumKm / (256 * Math.pow(2, zoom)));

      const targetPx = 90;
      const rawDistanceKm = kmPerPx * targetPx;
      const niceDistances = [0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2000];
      let bestDist = niceDistances[0];
      for (const d of niceDistances) {
        if (rawDistanceKm >= d * 0.7) {
          bestDist = d;
        }
      }
      const actualBarPx = Math.round(bestDist / kmPerPx);

      onScaleUpdate({
        kmPerPx: kmPerPx < 1 ? kmPerPx.toFixed(3) : kmPerPx.toFixed(1),
        scaleBarKm: bestDist < 1 ? `${Math.round(bestDist * 1000)} m` : `${bestDist} km`,
        scaleBarPx: Math.max(35, Math.min(140, actualBarPx)),
      });
    };

    compute();
    map.on('zoomend', compute);
    map.on('moveend', compute);
    return () => {
      map.off('zoomend', compute);
      map.off('moveend', compute);
    };
  }, [map, onScaleUpdate]);

  return null;
}

// Preset scientific regions of interest (ROI)
const ROI_PRESETS = [
  {
    id: 'jezero-delta',
    label: 'Jezero Western Delta',
    lat: 18.4447,
    lng: 77.4508,
    zoom: 7,
    desc: 'Perseverance landing ellipse, ancient river mouth & clay mudstones',
  },
  {
    id: 'kodiak-butte',
    label: 'Kodiak Butte',
    lat: 18.4230,
    lng: 77.3480,
    zoom: 8,
    desc: 'Isolated fluvial delta remnant exhibiting layered strata',
  },
  {
    id: 'belva-crater',
    label: 'Belva Crater (0.9 km)',
    lat: 18.4800,
    lng: 77.3700,
    zoom: 8,
    desc: 'Impact crater exposing subsurface delta stratigraphy',
  },
  {
    id: 'neretva-vallis',
    label: 'Neretva Vallis Inflow',
    lat: 18.8565,
    lng: 77.5185,
    zoom: 7,
    desc: 'Breached rim canyon where paleofloods entered the lake basin',
  },
  {
    id: 'gale-crater',
    label: 'Gale Crater (Curiosity)',
    lat: -4.5895,
    lng: 137.4417,
    zoom: 6,
    desc: 'Mount Sharp (Aeolis Mons) central sedimentary peak',
  },
  {
    id: 'olympus-mons',
    label: 'Olympus Mons Caldera',
    lat: 18.65,
    lng: -133.8,
    zoom: 4,
    desc: 'Solar system’s largest shield volcano summit (+21.3 km)',
  },
  {
    id: 'global-mars',
    label: 'Global Mars Datum',
    lat: 0,
    lng: 0,
    zoom: 2,
    desc: 'Global areographic coordinate frame and MOLA zero datum',
  },
];

export default function MarsDataExplorer() {
  const [activeLayerKey, setActiveLayerKey] = useState('ctx');
  const [cursorCoords, setCursorCoords] = useState({ lat: 18.4447, lng: 77.4508 });
  const [targetView, setTargetView] = useState({ lat: 18.4447, lng: 77.4508, zoom: 6 });
  const [showGroundTruthPins, setShowGroundTruthPins] = useState(true);

  // Selected surface target state
  const [selectedTarget, setSelectedTarget] = useState({
    name: 'Octavia E. Butler Landing Site (Jezero Crater)',
    lat: 18.4447,
    lng: 77.4508,
    elevationInfo: null,
    isManualClick: false,
  });

  // Elevation and PDS ODE states
  const [elevationResult, setElevationResult] = useState(null);
  const [isElevationLoading, setIsElevationLoading] = useState(false);

  const [odeResult, setOdeResult] = useState({
    products: [],
    status: 'IDLE',
    message: '',
  });
  const [isOdeLoading, setIsOdeLoading] = useState(false);

  // Selected image preview modal
  const [activeImageModal, setActiveImageModal] = useState(null);

  // Tile loading states
  const [isTilesLoading, setIsTilesLoading] = useState(true);
  const [tileLoadError, setTileLoadError] = useState(false);

  // Scale bar
  const [scaleInfo, setScaleInfo] = useState({
    kmPerPx: '1.2',
    scaleBarKm: '25 km',
    scaleBarPx: 80,
  });

  const activeLayer = VERIFIED_MARS_TILE_LAYERS[activeLayerKey] || VERIFIED_MARS_TILE_LAYERS.ctx;

  // Query elevation when selected target changes
  useEffect(() => {
    let isCancelled = false;
    setIsElevationLoading(true);

    getElevationAtCoordinate(selectedTarget.lat, selectedTarget.lng)
      .then((res) => {
        if (!isCancelled) {
          setElevationResult(res);
          setIsElevationLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Elevation query failed:', err);
          setIsElevationLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedTarget.lat, selectedTarget.lng]);

  // Query live NASA PDS ODE when selected target changes
  const queryPdsOde = useCallback(async (lat, lng) => {
    setIsOdeLoading(true);
    setOdeResult({ products: [], status: 'QUERYING', message: 'Querying NASA Planetary Data System (PDS) Orbital Data Explorer...' });

    const result = await fetchPdsOdeObservations(lat, lng, 0.30);
    setOdeResult(result);
    setIsOdeLoading(false);
  }, []);

  useEffect(() => {
    queryPdsOde(selectedTarget.lat, selectedTarget.lng);
  }, [selectedTarget.lat, selectedTarget.lng, queryPdsOde]);

  // Handle map click
  const handleMapClick = (latlng) => {
    const lat = Math.round(latlng.lat * 10000) / 10000;
    const lng = Math.round(latlng.lng * 10000) / 10000;

    setSelectedTarget({
      name: `Areographic Target (${formatCoordinates(lat, lng)})`,
      lat,
      lng,
      isManualClick: true,
    });
  };

  // Jump to ROI Preset
  const handleSelectRoi = (roi) => {
    setTargetView({ lat: roi.lat, lng: roi.lng, zoom: roi.zoom });
    setSelectedTarget({
      name: roi.label,
      lat: roi.lat,
      lng: roi.lng,
      isManualClick: false,
    });
  };

  // Select verified HiRISE target
  const handleSelectHiRiseTarget = (obs) => {
    setTargetView({ lat: obs.lat, lng: obs.lon, zoom: 8 });
    setSelectedTarget({
      name: `${obs.title} (${obs.id})`,
      lat: obs.lat,
      lng: obs.lon,
      isManualClick: false,
      groundTruthObservation: obs,
    });
  };

  return (
    <div className="mde-container fade-in">
      {/* Workstation Header */}
      <div className="mde-header">
        <div className="mde-header__left">
          <div className="mde-tag-strip mono">
            <span className="mde-tag mde-tag--accent">NASA PDS // USGS ASTROGEOLOGY</span>
            <span className="mde-tag">LIVE ODE REST API [CORS *]</span>
            <span className="mde-tag">MOLA AREOID DATUM 610.5 Pa</span>
          </div>
          <h1 className="mde-title">
            <Database size={20} className="mde-title-icon" />
            Mars Scientific Data Explorer
          </h1>
          <p className="mde-subtitle">
            Direct spatial inspection across the Jezero Crater region and the Martian surface. Combines high-resolution 5.0m Context Camera (CTX) mosaics, laser altimetry (MOLA), and live NASA PDS Orbital Data Explorer queries for genuine MRO HiRISE observations.
          </p>
        </div>

        {/* Live Service Status */}
        <div className="mde-status-box mono">
          <div className="mde-status-row">
            <span className="mde-status-dot mde-status-dot--green" />
            <span>ODE REST API: ACTIVE</span>
          </div>
          <div className="mde-status-row">
            <span className="mde-status-dot mde-status-dot--green" />
            <span>USGS CTX WMTS: STREAMING (5m/px)</span>
          </div>
          <div className="mde-status-row">
            <span className="mde-status-dot mde-status-dot--green" />
            <span>MOLA DATUM: 610.5 Pa</span>
          </div>
        </div>
      </div>

      {/* ROI Preset Selector Bar */}
      <div className="mde-roi-bar">
        <span className="mde-roi-label mono">
          <Crosshair size={12} /> SCIENTIFIC TARGETS:
        </span>
        <div className="mde-roi-buttons">
          {ROI_PRESETS.map((roi) => {
            const isActive = Math.abs(selectedTarget.lat - roi.lat) < 0.05 && Math.abs(selectedTarget.lng - roi.lng) < 0.05;
            return (
              <button
                key={roi.id}
                type="button"
                className={`mde-roi-btn ${isActive ? 'mde-roi-btn--active' : ''}`}
                onClick={() => handleSelectRoi(roi)}
                title={roi.desc}
              >
                {roi.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="mde-workspace">
        {/* Left Column: Interactive Map */}
        <div className="mde-map-panel">
          {/* Map Controls Toolbar */}
          <div className="mde-map-toolbar">
            <div className="mde-layer-group">
              <span className="mde-toolbar-label mono">
                <Layers size={13} /> BASEMAP:
              </span>
              <div className="mde-toolbar-buttons">
                {Object.values(VERIFIED_MARS_TILE_LAYERS).map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    className={`mde-toolbar-btn ${activeLayerKey === layer.id ? 'mde-toolbar-btn--active' : ''}`}
                    onClick={() => {
                      setActiveLayerKey(layer.id);
                      setIsTilesLoading(true);
                      setTileLoadError(false);
                    }}
                    title={`${layer.name} (${layer.resolution})`}
                  >
                    {layer.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="mde-toggle-group">
              <label className="mde-checkbox-label mono">
                <input
                  type="checkbox"
                  checked={showGroundTruthPins}
                  onChange={(e) => setShowGroundTruthPins(e.target.checked)}
                />
                HiRISE Target Pins ({VERIFIED_JEZERO_OBSERVATIONS.length})
              </label>

              <button
                type="button"
                className="mde-toolbar-btn mde-reset-btn"
                onClick={() => handleSelectRoi(ROI_PRESETS[0])}
                title="Reset view to Jezero Western Delta"
              >
                <RotateCcw size={12} /> Jezero Core
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div className="mde-canvas-wrapper">
            {isTilesLoading && (
              <div className="mde-map-loading-indicator mono">
                <span className="mde-spinner" />
                <span>STREAMING SCIENTIFIC TILES: {activeLayer.shortLabel}...</span>
              </div>
            )}

            <MapContainer
              center={[targetView.lat, targetView.lng]}
              zoom={targetView.zoom}
              minZoom={1}
              maxZoom={12}
              className="mde-leaflet-map"
              worldCopyJump={false}
              maxBounds={[[-85, -180], [85, 180]]}
            >
              <MapNavigationController targetView={targetView} />
              <MapEventsListener
                onMapClick={handleMapClick}
                onMouseMove={setCursorCoords}
              />
              <MapScaleTracker onScaleUpdate={setScaleInfo} />

              {/* Genuine GIS Tile Layer */}
              <TileLayer
                key={`layer-${activeLayer.id}`}
                url={activeLayer.url}
                attribution={activeLayer.attribution}
                noWrap={true}
                maxNativeZoom={activeLayer.maxNativeZoom || 8}
                maxZoom={12}
                eventHandlers={{
                  loading: () => setIsTilesLoading(true),
                  load: () => setIsTilesLoading(false),
                  tileload: () => setIsTilesLoading(false),
                  tileerror: () => {
                    setIsTilesLoading(false);
                    setTileLoadError(true);
                  },
                }}
              />

              {/* Click Reticle Marker */}
              <Marker
                position={[selectedTarget.lat, selectedTarget.lng]}
                icon={createReticleIcon()}
                interactive={false}
              />

              {/* Curated Ground-Truth HiRISE Observations */}
              {showGroundTruthPins &&
                VERIFIED_JEZERO_OBSERVATIONS.map((obs) => {
                  const isSelected = Math.abs(selectedTarget.lat - obs.lat) < 0.001 && Math.abs(selectedTarget.lng - obs.lon) < 0.001;
                  return (
                    <Marker
                      key={obs.id}
                      position={[obs.lat, obs.lon]}
                      icon={createObservationIcon(true, isSelected)}
                      eventHandlers={{
                        click: () => handleSelectHiRiseTarget(obs),
                      }}
                    >
                      <Popup>
                        <div className="mde-popup-card">
                          <span className="mde-popup-tag mono">NASA MRO HiRISE</span>
                          <h4 className="mde-popup-title">{obs.title}</h4>
                          <div className="mde-popup-meta mono">
                            <span>ID: {obs.id}</span>
                            <span>RES: {obs.resolution}</span>
                            <span>MOLA: {obs.elevationMeters} m</span>
                          </div>
                          <p className="mde-popup-desc">{obs.description}</p>
                          <div className="mde-popup-actions">
                            <button
                              type="button"
                              className="mde-popup-btn"
                              onClick={() => handleSelectHiRiseTarget(obs)}
                            >
                              Inspect Target Dossier
                            </button>
                            {obs.browseImage && (
                              <button
                                type="button"
                                className="mde-popup-btn mde-popup-btn--ghost"
                                onClick={() => setActiveImageModal(obs)}
                              >
                                View Browse Image
                              </button>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>

            {/* Map HUD Overlays */}
            <div className="mde-hud-bottom mono">
              <div className="mde-hud-chip">
                <span className="mde-hud-key">CURSOR:</span>
                <span className="mde-hud-val">{formatCoordinates(cursorCoords.lat, cursorCoords.lng)}</span>
              </div>
              <div className="mde-hud-chip">
                <span className="mde-hud-key">ACTIVE BASEMAP:</span>
                <span className="mde-hud-val">{activeLayer.name}</span>
              </div>
              <div className="mde-hud-chip mde-hud-scale-chip">
                <span className="mde-hud-key">SCALE:</span>
                <div
                  className="mde-hud-scale-bar"
                  style={{ width: `${scaleInfo.scaleBarPx}px` }}
                />
                <span className="mde-hud-val">{scaleInfo.scaleBarKm}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scientific Target Inspector Workstation */}
        <div className="mde-inspector-panel">
          {/* Target Header */}
          <div className="mde-inspector-header">
            <div className="mde-target-pill mono">
              <Crosshair size={12} color="var(--accent-yellow)" />
              <span>SELECTED AREOGRAPHIC COORDINATE</span>
            </div>
            <h2 className="mde-inspector-title">{selectedTarget.name}</h2>
            <div className="mde-coord-display mono">
              <span className="mde-coord-val">{formatCoordinates(selectedTarget.lat, selectedTarget.lng)}</span>
              <span className="mde-coord-sub">
                ({selectedTarget.lat.toFixed(5)}°N, {selectedTarget.lng.toFixed(5)}°E)
              </span>
            </div>
          </div>

          {/* Elevation Specification Block */}
          <div className="mde-spec-card">
            <div className="mde-spec-card__header mono">
              <span>ELEVATION & TOPOGRAPHY</span>
              <span className="mde-spec-badge">
                {elevationResult?.isInsideJezeroDem ? 'USGS 20m CTX DEM' : 'GLOBAL MOLA GRID'}
              </span>
            </div>

            <div className="mde-elev-row">
              <div className="mde-elev-stat">
                <span className="mde-elev-label mono">AREOID ELEVATION (610.5 Pa)</span>
                <span className="mde-elev-number mono">
                  {isElevationLoading ? (
                    'Calculating...'
                  ) : elevationResult?.elevationMeters !== null && elevationResult?.elevationMeters !== undefined ? (
                    `${elevationResult.elevationMeters > 0 ? '+' : ''}${elevationResult.elevationMeters.toLocaleString()} m`
                  ) : (
                    'Outside 20m Footprint'
                  )}
                </span>
              </div>

              <div className="mde-elev-meta mono">
                <div className="mde-meta-item">
                  <span className="mde-meta-k">DATASET:</span>
                  <span className="mde-meta-v">{elevationResult?.dataset || 'Loading...'}</span>
                </div>
                <div className="mde-meta-item">
                  <span className="mde-meta-k">INSTRUMENT:</span>
                  <span className="mde-meta-v">{elevationResult?.instrument || 'Loading...'}</span>
                </div>
                <div className="mde-meta-item">
                  <span className="mde-meta-k">RESOLUTION:</span>
                  <span className="mde-meta-v">{elevationResult?.resolution || 'Loading...'}</span>
                </div>
                <div className="mde-meta-item">
                  <span className="mde-meta-k">METHODOLOGY:</span>
                  <span className="mde-meta-v" style={{ color: elevationResult?.isInsideJezeroDem ? '#10b981' : '#f59e0b' }}>
                    {elevationResult?.dataType || 'Processing...'}
                  </span>
                </div>
              </div>
            </div>

            {elevationResult?.accuracyNote && (
              <p className="mde-accuracy-note mono">{elevationResult.accuracyNote}</p>
            )}
          </div>

          {/* Live NASA PDS Orbital Data Explorer (ODE) Observations */}
          <div className="mde-spec-card">
            <div className="mde-spec-card__header mono">
              <span>NASA PDS ORBITAL DATA EXPLORER (MRO HiRISE)</span>
              <button
                type="button"
                className="mde-refresh-btn"
                onClick={() => queryPdsOde(selectedTarget.lat, selectedTarget.lng)}
                title="Re-query Washington University PDS ODE REST API"
              >
                <RefreshCw size={11} className={isOdeLoading ? 'mde-spin' : ''} /> RE-QUERY
              </button>
            </div>

            {isOdeLoading && (
              <div className="mde-ode-loading mono">
                <span className="mde-spinner" />
                <span>Interrogating Washington University PDS ODE index...</span>
              </div>
            )}

            {!isOdeLoading && odeResult.status === 'SUCCESS' && odeResult.products.length > 0 && (
              <div className="mde-products-list">
                <div className="mde-products-summary mono">
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>Found {odeResult.products.length} verified HiRISE observation(s) overlapping coordinate</span>
                </div>
                {odeResult.products.map((p) => (
                  <div key={p.id} className="mde-product-row">
                    <div className="mde-product-top">
                      <span className="mde-product-id mono">{p.id}</span>
                      <span className="mde-product-instr mono">{p.instrument}</span>
                    </div>
                    <div className="mde-product-title">{p.title}</div>
                    <div className="mde-product-meta mono">
                      <span>CENTER: {p.centerLat.toFixed(3)}°N, {p.centerLon.toFixed(3)}°E</span>
                      <span>RES: {p.resolution}</span>
                      <span>EMISSION: {p.emissionAngleDeg}</span>
                    </div>
                    <div className="mde-product-links">
                      <a
                        href={p.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mde-link-btn mono"
                      >
                        <ExternalLink size={11} /> UAHIRISE Image
                      </a>
                      <a
                        href={p.filesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mde-link-btn mde-link-btn--ghost mono"
                      >
                        <FileText size={11} /> PDS Files
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isOdeLoading && odeResult.status === 'NO_PRODUCTS_FOUND' && (
              <div className="mde-ode-empty mono">
                <Info size={14} color="#f5c542" />
                <div>
                  <strong>NO OVERLAPPING RDR FOOTPRINT IN PDS INDEX</strong>
                  <p>
                    HiRISE takes targeted high-resolution narrow strips (~0.25m/px) rather than global coverage. Select a curated benchmark below or click near the Jezero western delta.
                  </p>
                </div>
              </div>
            )}

            {!isOdeLoading && odeResult.status === 'NETWORK_ERROR' && (
              <div className="mde-ode-error mono">
                <AlertCircle size={14} color="#ef4444" />
                <div>
                  <strong>PDS ODE SERVICE TIMEOUT</strong>
                  <p>{odeResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Curated Ground-Truth Observation Dossier */}
          <div className="mde-spec-card">
            <div className="mde-spec-card__header mono">
              <span>VERIFIED JEZERO GROUND-TRUTH CATALOG ({VERIFIED_JEZERO_OBSERVATIONS.length})</span>
              <span className="mde-spec-badge">UAHIRISE PDS ARCHIVE</span>
            </div>

            <div className="mde-gallery-list">
              {VERIFIED_JEZERO_OBSERVATIONS.map((obs) => {
                const isSelected = Math.abs(selectedTarget.lat - obs.lat) < 0.001 && Math.abs(selectedTarget.lng - obs.lon) < 0.001;
                return (
                  <div
                    key={obs.id}
                    className={`mde-gallery-item ${isSelected ? 'mde-gallery-item--active' : ''}`}
                    onClick={() => handleSelectHiRiseTarget(obs)}
                  >
                    <div className="mde-gallery-thumb-box">
                      {obs.browseImage ? (
                        <img
                          src={obs.browseImage}
                          alt={obs.title}
                          className="mde-gallery-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="mde-gallery-thumb-fallback mono">
                          <Camera size={18} />
                          <span>PDS RDR</span>
                        </div>
                      )}
                    </div>
                    <div className="mde-gallery-info">
                      <div className="mde-gallery-tag mono">
                        <span>{obs.id}</span>
                        <span>{obs.resolution}</span>
                      </div>
                      <div className="mde-gallery-title">{obs.title}</div>
                      <div className="mde-gallery-meta mono">
                        <span>{formatCoordinates(obs.lat, obs.lon)}</span>
                        <span>MOLA: {obs.elevationMeters} m</span>
                      </div>
                      <div className="mde-gallery-actions">
                        {obs.browseImage && (
                          <button
                            type="button"
                            className="mde-thumb-btn mono"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageModal(obs);
                            }}
                          >
                            <Eye size={10} /> Inspect Full Image
                          </button>
                        )}
                        <a
                          href={obs.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mde-thumb-link mono"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={10} /> HiRISE Site
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* HiRISE High-Resolution Browse Modal */}
      {activeImageModal && (
        <div className="mde-modal-overlay" onClick={() => setActiveImageModal(null)}>
          <div className="mde-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mde-modal-header">
              <div className="mde-modal-title-area">
                <span className="mde-modal-tag mono">
                  NASA MRO HiRISE RDR V1.1 // {activeImageModal.id}
                </span>
                <h3 className="mde-modal-title">{activeImageModal.title}</h3>
                <div className="mde-modal-meta mono">
                  <span>COORDINATES: {formatCoordinates(activeImageModal.lat, activeImageModal.lon)}</span>
                  <span>SOLAR INCIDENCE: {activeImageModal.solarIncidenceAngle}</span>
                  <span>ELEVATION: {activeImageModal.elevationMeters} m MOLA</span>
                </div>
              </div>
              <button
                type="button"
                className="mde-modal-close-btn mono"
                onClick={() => setActiveImageModal(null)}
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="mde-modal-body">
              <img
                src={activeImageModal.browseImage}
                alt={activeImageModal.title}
                className="mde-modal-full-img"
              />
              <p className="mde-modal-desc mono">{activeImageModal.description}</p>
            </div>

            <div className="mde-modal-footer mono">
              <div className="mde-modal-source">
                Source: University of Arizona Lunar and Planetary Laboratory / NASA Planetary Data System
              </div>
              <div className="mde-modal-actions">
                <a
                  href={activeImageModal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mde-link-btn"
                >
                  <ExternalLink size={12} /> University of Arizona Catalog
                </a>
                <a
                  href={activeImageModal.pdsArchiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mde-link-btn mde-link-btn--ghost"
                >
                  <FileText size={12} /> Download PDS Data Files
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
