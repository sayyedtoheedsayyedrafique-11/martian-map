import { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents, Polygon } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import * as L_Module from 'leaflet';
import 'leaflet/dist/leaflet.css';
import marsLocations, { locationTypes } from '../../data/marsLocations';
import HIRISE_FOOTPRINTS from '../../data/hiriseFootprints';
import { formatCoordinates } from '../../utils/helpers';
import { getElevationAtCoordinate } from '../../services/marsDataService';
import ClassificationBadge from '../ui/ClassificationBadge';
import { RotateCcw, ExternalLink, Route, Compass, MapPin, Eye, ChevronDown } from 'lucide-react';
import './MarsMap.css';

// Resilient Leaflet namespace resolution
const L = L_Module?.default || L_Module;

// Fix Leaflet default marker icon asset lookup issue in Vite
try {
  if (L?.Icon?.Default?.prototype) {
    delete L.Icon.Default.prototype._getIconUrl;
  }
} catch (e) {
  console.warn('Leaflet icon prototype patch skipped:', e);
}

/**
 * Clean SVG pin icon with distinctive geometry
 * When selected, highlighted in Warm Yellow (#F5C542)
 */
function createMarkerIcon(type = 'rover', color = '#D4D4D8', isSelected = false) {
  try {
    const pinColor = isSelected ? '#d97706' : '#D4D4D8';
    const glyphFill = '#080909';
    let glyph = '';
    if (type === 'helicopter') {
      glyph = `<line x1="7" y1="12" x2="19" y2="12" stroke="${glyphFill}" stroke-width="2" stroke-linecap="round"/>
               <line x1="13" y1="9" x2="13" y2="15" stroke="${glyphFill}" stroke-width="1.5"/>`;
    } else if (type === 'landmark') {
      glyph = `<polygon points="13,7 7,16 19,16" fill="${glyphFill}"/>`;
    } else if (type === 'lander') {
      glyph = `<circle cx="13" cy="11" r="3" fill="${glyphFill}"/>
               <line x1="8" y1="16" x2="18" y2="16" stroke="${glyphFill}" stroke-width="1.8"/>`;
    } else {
      // Rover
      glyph = `<circle cx="13" cy="12" r="3.5" fill="${glyphFill}"/>`;
    }

    const strokeColor = '#080909';
    const strokeWidth = isSelected ? '2' : '1.2';
    const scale = isSelected ? 'scale(1.2) translate(-2, -2.5)' : '';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 36" width="24" height="34">
      <g transform="${scale}">
        <path d="M13 1C7 1 2 6 2 12c0 8 11 22 11 22s11-14 11-22c0-6-5-11-11-11z" fill="${pinColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        ${glyph}
      </g>
    </svg>`;

    if (L?.divIcon) {
      return L.divIcon({
        html: svg,
        className: 'mars-map-pin',
        iconSize: [24, 34],
        iconAnchor: [12, 34],
        popupAnchor: [0, -34],
      });
    }
  } catch (err) {
    console.error('Marker icon creation fallback:', err);
  }
  return undefined;
}

/**
 * Waypoint marker for route endpoints (Point A in Stark White, Point B in Warm Yellow)
 */
function createWaypointIcon(label = 'A', color = '#F5F5F0') {
  try {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
      <circle cx="14" cy="14" r="12" fill="${color}" stroke="#080909" stroke-width="2"/>
      <text x="14" y="19" font-size="13" font-weight="bold" fill="#080909" text-anchor="middle" font-family="monospace">${label}</text>
    </svg>`;

    if (L?.divIcon) {
      return L.divIcon({
        html: svg,
        className: 'mars-waypoint-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });
    }
  } catch (err) {
    console.error('Waypoint icon creation fallback:', err);
  }
  return undefined;
}

/**
 * Coordinate Tracker component that updates on mouse move and click
 */
function CoordinateTracker({ onMove, onClick }) {
  useMapEvents({
    mousemove(e) {
      if (onMove && e?.latlng) {
        onMove(e.latlng);
      }
    },
    click(e) {
      if (onClick && e?.latlng) {
        onClick(e.latlng);
      }
    },
  });
  return null;
}

/**
 * Controller to smoothly center map on target view
 */
function MapCenterController({ centerView }) {
  const map = useMap();
  useEffect(() => {
    if (centerView && map && typeof centerView.lat === 'number' && typeof centerView.lng === 'number') {
      try {
        map.flyTo([centerView.lat, centerView.lng], centerView.zoom || map.getZoom(), {
          duration: 0.9,
        });
      } catch (err) {
        console.warn('Map flyTo centerView error:', err);
      }
    }
  }, [centerView, map]);
  return null;
}

/**
 * Scale Tracker dynamically computed based on Mars volumetric radius (3,389.5 km)
 */
function MapScaleTracker({ onScaleUpdate }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const computeScale = () => {
      const zoom = map.getZoom();
      const center = map.getCenter();
      const latRad = (Math.abs(center.lat) * Math.PI) / 180;
      const circumKm = 2 * Math.PI * 3389.5 * Math.cos(latRad);
      const kmPerPx = Math.max(0.01, circumKm / (256 * Math.pow(2, zoom)));

      const targetPx = 90;
      const rawDistanceKm = kmPerPx * targetPx;
      const niceDistances = [10, 25, 50, 100, 250, 500, 1000, 2000, 5000];
      let bestDist = niceDistances[0];
      for (const d of niceDistances) {
        if (rawDistanceKm >= d * 0.7) {
          bestDist = d;
        }
      }
      const actualBarPx = Math.round(bestDist / kmPerPx);

      onScaleUpdate({
        kmPerPx: kmPerPx.toFixed(1),
        scaleBarKm: bestDist,
        scaleBarPx: Math.max(40, Math.min(140, actualBarPx)),
      });
    };

    computeScale();
    map.on('zoomend', computeScale);
    map.on('moveend', computeScale);
    return () => {
      map.off('zoomend', computeScale);
      map.off('moveend', computeScale);
    };
  }, [map, onScaleUpdate]);

  return null;
}

/**
 * Smooth Fly-To animation when user selects a location
 */
function FlyToLocation({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location && typeof location.lat === 'number' && typeof location.lng === 'number' && map) {
      try {
        map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 4), {
          duration: 0.9,
        });
      } catch (err) {
        console.warn('Map flyTo error:', err);
      }
    }
  }, [location, map]);
  return null;
}

/**
 * Controller to reset map view to global Mars perspective
 */
function MapController({ resetTrigger }) {
  const map = useMap();
  useEffect(() => {
    if (resetTrigger > 0 && map) {
      try {
        map.setView([0, 0], 2, { animate: true });
      } catch (err) {
        console.warn('Map setView error:', err);
      }
    }
  }, [resetTrigger, map]);
  return null;
}

/**
 * Real planetary imagery basemaps from NASA and USGS (Unfiltered, natural scientific colors)
 */
const TILE_LAYERS = {
  ctx: {
    id: 'ctx',
    name: 'USGS Astrogeology & Caltech CTX Global Mosaic (5.0 m/px)',
    shortLabel: 'USGS CTX High-Res (5m)',
    provider: 'USGS Astrogeology / NASA CTX / Caltech',
    url: 'https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer/tile/{z}/{y}/{x}',
    attribution: 'USGS Astrogeology / NASA CTX / Caltech',
    maxNativeZoom: 11,
    maxZoom: 12,
    description: 'Sub-6m high-resolution panchromatic mosaic of Mars, revealing crater terraces, boulder fields, and rover exploration zones.',
  },
  mola: {
    id: 'mola',
    name: 'USGS Shaded Relief Basemap (Viking Albedo + MOLA Relief)',
    shortLabel: 'USGS Shaded Relief',
    provider: 'USGS Astrogeology & NASA MGS MOLA',
    url: 'https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-2/all/{z}/{x}/{y}.png',
    attribution: 'USGS Astrogeology & NASA MOLA',
    maxNativeZoom: 7,
    maxZoom: 8,
    description: 'Blended mosaic of USGS Viking visual surface albedo and MOLA laser altimetry shaded topography in natural albedo.',
  },
  viking: {
    id: 'viking',
    name: 'NASA Mars Trek — Viking MDIM 2.1 Color Mosaic',
    shortLabel: 'NASA Viking True Color',
    provider: 'NASA Mars Trek / USGS Astrogeology',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    attribution: 'NASA / USGS Viking Color Mosaic',
    maxNativeZoom: 6,
    maxZoom: 8,
    description: 'Controlled true-color planetary visual mosaic (~232 m/px) showing albedo, dark basalt sand fields, and polar caps.',
  },
  'mola-color': {
    id: 'mola-color',
    name: 'NASA Mars Trek — MOLA Elevation Topography',
    shortLabel: 'MOLA Topography',
    provider: 'NASA GSFC / JPL Solar System Treks',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    attribution: 'NASA / JPL MOLA Elevation Map',
    maxNativeZoom: 6,
    maxZoom: 8,
    description: 'Laser altimetry elevation map color-coded from deep basins (-8.2 km) to volcanic peaks (+21.3 km).',
  },
  themis: {
    id: 'themis',
    name: 'NASA Mars Trek — THEMIS Nighttime Infrared (100 m/px)',
    shortLabel: 'THEMIS Night IR',
    provider: 'NASA JPL / ASU Mars Odyssey THEMIS',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/THEMIS_NightIR_ControlledMosaics_100m_v2_oct2018/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    attribution: 'NASA JPL / ASU THEMIS Night IR Mosaic',
    maxNativeZoom: 7,
    maxZoom: 8,
    description: '100m controlled nighttime thermal infrared mosaic mapping thermal inertia, surface rock abundance, and bedrock exposure.',
  },
  esa_hrsc: {
    id: 'esa_hrsc',
    name: 'ESA Mars Express HRSC & CaSSIS Controlled Regional Mosaics (12.5 m/px)',
    shortLabel: 'ESA HRSC / CaSSIS',
    provider: 'European Space Agency (ESA) / DLR / UniBE',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MEX_HRSC_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    attribution: 'ESA / DLR / Freie Universität Berlin / UniBE CaSSIS',
    maxNativeZoom: 6,
    maxZoom: 8,
    description: 'ESA Mars Express High Resolution Stereo Camera color relief mosaic and ExoMars CaSSIS stereo terrain imaging.',
  },
};

/**
 * Controller to ensure Leaflet recalculates viewport bounds inside flex layouts
 */
function MapInvalidateController() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    const container = map.getContainer();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(container);
    }
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  return null;
}

function MarsMap({
  selectedLocation = null,
  showMarkers = true,
  routePoints = null,
  alternativeRoutePoints = null,
  routeStartLoc = null,
  routeDestLoc = null,
  onLocationSelect,
  onMapClick,
  centerView = null,
  filteredLocations,
  height = null,
  canvasClassName = '',
  className = '',
  onCursorCoordsChange = null,
  activeLayer = null,
  onLayerChange = null,
  hideToolbar = false,
}) {
  const navigate = useNavigate();
  const [cursorCoords, setCursorCoords] = useState({ lat: 0, lng: 0 });
  const [activeLayerKey, setActiveLayerKey] = useState('viking');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isTilesLoading, setIsTilesLoading] = useState(true);
  const [tilesLoadedCount, setTilesLoadedCount] = useState(0);
  const [tileErrorCount, setTileErrorCount] = useState(0);
  const [scaleInfo, setScaleInfo] = useState({
    kmPerPx: '26.1',
    scaleBarKm: 1000,
    scaleBarPx: 76,
  });
  const [showHiriseFootprints, setShowHiriseFootprints] = useState(true);

  const effectiveLayerKey = activeLayer || activeLayerKey;
  const currentLayer = TILE_LAYERS[effectiveLayerKey] || TILE_LAYERS.viking;

  const handleSelectLayer = (id) => {
    if (onLayerChange) onLayerChange(id);
    setActiveLayerKey(id);
    setIsTilesLoading(true);
    setTilesLoadedCount(0);
    setTileErrorCount(0);
  };

  const [cursorElev, setCursorElev] = useState({
    elevationMeters: null,
    elevationFormatted: 'MOLA Datum (610.5 Pa)',
  });

  useEffect(() => {
    let isMounted = true;
    getElevationAtCoordinate(cursorCoords.lat, cursorCoords.lng)
      .then((data) => {
        if (isMounted && data) {
          setCursorElev(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCursorElev({ elevationMeters: null, elevationFormatted: 'MOLA Datum (610.5 Pa)' });
        }
      });
    return () => {
      isMounted = false;
    };
  }, [cursorCoords.lat, cursorCoords.lng]);

  useEffect(() => {
    if (onCursorCoordsChange) {
      onCursorCoordsChange(cursorCoords, cursorElev);
    }
  }, [cursorCoords, cursorElev, onCursorCoordsChange]);

  const locations = useMemo(() => {
    return filteredLocations || marsLocations;
  }, [filteredLocations]);

  const handleScaleUpdate = useCallback((newScale) => {
    setScaleInfo(newScale);
  }, []);

  // Quick jump targets for instant navigation to verified planetary landmarks
  const quickJumpTargets = [
    { id: 'perseverance', label: 'Perseverance (Jezero)' },
    { id: 'curiosity', label: 'Curiosity (Gale)' },
    { id: 'olympus-mons', label: 'Olympus Mons (+21.3 km)' },
    { id: 'valles-marineris', label: 'Valles Marineris' },
    { id: 'hellas-basin', label: 'Hellas Basin (-8.2 km)' },
  ];

  const isNetworkUnavailable = tilesLoadedCount === 0 && tileErrorCount > 4;

  return (
    <div className={`mars-map-card ${className}`}>
      {/* Top Map Toolbar */}
      {!hideToolbar && (
        <div className="mars-map-controls-bar">
          {/* Basemap Dropdown Selector */}
          <div className="mars-map-control-group">
            <label htmlFor="mars-basemap-select" className="mars-control-label">Basemap:</label>
            <div className="mars-select-wrapper">
              <select
                id="mars-basemap-select"
                className="mars-control-select mono"
                value={effectiveLayerKey}
                onChange={(e) => handleSelectLayer(e.target.value)}
                title={currentLayer.description}
              >
                {Object.values(TILE_LAYERS).map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    {layer.shortLabel}
                  </option>
                ))}
              </select>
              <ChevronDown size={11} className="mars-select-chevron" />
            </div>
          </div>

          {/* Landmark Quick-Jump Dropdown Selector */}
          <div className="mars-map-control-group mars-hide-mobile">
            <label htmlFor="mars-landmark-select" className="mars-control-label">Jump to Site:</label>
            <div className="mars-select-wrapper">
              <select
                id="mars-landmark-select"
                className="mars-control-select mono"
                value={selectedLocation?.id || ''}
                onChange={(e) => {
                  const loc = marsLocations.find((l) => l.id === e.target.value);
                  if (loc && onLocationSelect) onLocationSelect(loc);
                }}
              >
                <option value="" disabled>Select Target Landmark…</option>
                {quickJumpTargets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={11} className="mars-select-chevron" />
            </div>
          </div>

          {/* HiRISE Footprints Overlay Toggle */}
          <div className="mars-map-control-group">
            <button
              type="button"
              className={`mars-control-btn ${showHiriseFootprints ? 'mars-control-btn--active' : ''}`}
              onClick={() => setShowHiriseFootprints((prev) => !prev)}
              title="Toggle University of Arizona / NASA HiRISE 0.25 m/px high-resolution observation footprints"
            >
              <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
              HiRISE (25cm)
            </button>
          </div>

          {/* Live Basemap Service Status */}
          <div className="mars-map-status-pill">
            <span
              className="mars-map-status-dot"
              style={{
                backgroundColor: isNetworkUnavailable
                  ? 'var(--status-warning, #d97706)'
                  : isTilesLoading
                  ? 'var(--status-processed, #38bdf8)'
                  : 'var(--status-nominal, #22c55e)',
              }}
            />
            <span className="mars-map-status-text">
              {isNetworkUnavailable
                ? 'Tile Service Offline (Coordinate Grid Active)'
                : isTilesLoading
                ? 'Streaming Planetary GIS Tiles...'
                : 'Basemap Online (Verified Surface Imagery)'}
            </span>
          </div>

          {/* Reset View */}
          <button
            type="button"
            className="mars-control-btn mars-reset-btn"
            onClick={() => setResetTrigger((c) => c + 1)}
            title="Reset to global planetary view"
          >
            <RotateCcw size={13} /> Reset View
          </button>
        </div>
      )}

      {/* Map Canvas */}
      <div
        className={`mars-map-canvas ${canvasClassName}`}
        style={height ? { height } : undefined}
      >
        {/* Loading overlay — shown while first tile batch streams in */}
        {isTilesLoading && tilesLoadedCount === 0 && !isNetworkUnavailable && (
          <div className="mars-map-loading-overlay" aria-live="polite" aria-label="Loading Mars imagery">
            <div className="mars-map-loading-spinner" />
            <span className="mars-map-loading-text">Streaming Mars GIS tiles…</span>
          </div>
        )}
        <MapContainer
          key={`mars-map-${effectiveLayerKey}`}
          center={[0, 0]}
          zoom={2}
          minZoom={1}
          maxZoom={8}
          className="mars-leaflet-container"
          worldCopyJump={false}
          scrollWheelZoom={true}
          maxBounds={[[-85, -180], [85, 180]]}
          maxBoundsViscosity={0.9}
        >
          <MapInvalidateController />
          <MapController resetTrigger={resetTrigger} />

          {/* Actual planetary map layer with NO CSS filters */}
          <TileLayer
            key={currentLayer.id}
            url={currentLayer.url}
            attribution={currentLayer.attribution}
            noWrap={true}
            tms={false}
            maxNativeZoom={currentLayer.maxNativeZoom || 6}
            maxZoom={8}
            eventHandlers={{
              loading: () => {
                setIsTilesLoading(true);
              },
              load: () => {
                setIsTilesLoading(false);
              },
              tileload: () => {
                setTilesLoadedCount((c) => c + 1);
                setIsTilesLoading(false);
              },
              tileerror: () => {
                setTileErrorCount((c) => {
                  const newCount = c + 1;
                  // If CTX network times out, gracefully fallback to high-reliability NASA Viking basemap
                  if (newCount > 4 && effectiveLayerKey === 'ctx') {
                    console.warn('CTX tile endpoint unreachable, falling back to NASA Viking Color Mosaic');
                    handleSelectLayer('viking');
                  }
                  return newCount;
                });
              },
            }}
          />

          <MapCenterController centerView={centerView} />
          <CoordinateTracker onMove={setCursorCoords} onClick={onMapClick} />
          <MapScaleTracker onScaleUpdate={handleScaleUpdate} />

          {selectedLocation && <FlyToLocation location={selectedLocation} />}

          {/* Render Verified Locations */}
          {showMarkers &&
            locations.map((loc) => {
              const typeInfo = locationTypes[loc.type] || { color: '#94A3B8', label: loc.type };
              const isSelected = selectedLocation?.id === loc.id;
              const icon = createMarkerIcon(loc.type, typeInfo.color, isSelected);
              return (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  icon={icon}
                  eventHandlers={{
                    click: () => onLocationSelect && onLocationSelect(loc),
                  }}
                >
                  <Popup>
                    <div className="mars-popup-box">
                      <div className="mars-popup-header">
                        <ClassificationBadge type="actual" size="sm" />
                        <span className="mars-popup-status">{loc.status}</span>
                      </div>

                      <h4 className="mars-popup-name">{loc.name}</h4>

                      {loc.catalogId && (
                        <div className="mars-popup-catalog mono">
                          {loc.catalogId}
                        </div>
                      )}

                      <p className="mars-popup-text">{loc.description}</p>

                      <div className="mars-popup-details">
                        <div className="mars-popup-row">
                          <span>Areographic:</span>
                          <strong className="mono">{formatCoordinates(loc.lat, loc.lng)}</strong>
                        </div>
                        {loc.elevation && (
                          <div className="mars-popup-row">
                            <span>MOLA Datum:</span>
                            <strong>{loc.elevation}</strong>
                          </div>
                        )}
                        {loc.terrainLabel && (
                          <div className="mars-popup-row">
                            <span>Terrain:</span>
                            <span>{loc.terrainLabel}</span>
                          </div>
                        )}
                      </div>

                      {/* Interactive Route & Dossier Actions inside Popup */}
                      <div className="mars-popup-actions">
                        <button
                          type="button"
                          className="mars-popup-btn mars-popup-btn--primary"
                          onClick={() => {
                            if (onLocationSelect) onLocationSelect(loc);
                          }}
                        >
                          <MapPin size={11} /> Inspect Dossier
                        </button>

                        <button
                          type="button"
                          className="mars-popup-btn"
                          onClick={() => navigate(`/route-planner?start=${loc.id}`)}
                          title="Set as Route Origin (Point A)"
                        >
                          <Route size={11} /> Route from Here
                        </button>

                        <button
                          type="button"
                          className="mars-popup-btn"
                          onClick={() => navigate(`/route-planner?dest=${loc.id}`)}
                          title="Set as Route Destination (Point B)"
                        >
                          <Compass size={11} /> Route to Here
                        </button>
                      </div>

                      <div className="mars-popup-footer">
                        <span>Source: </span>
                        <a href={loc.sourceUrl} target="_blank" rel="noopener noreferrer">
                          {loc.source} <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
                        </a>
                        <span style={{ margin: '0 4px', color: 'var(--text-muted)' }}>•</span>
                        <a
                          href={`https://trek.nasa.gov/mars/#v=0.1&x=${loc.lng.toFixed(4)}&y=${loc.lat.toFixed(4)}&z=6&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mono"
                          title="View coordinates in official NASA JPL Mars Trek GIS portal"
                          style={{ color: 'var(--accent-yellow)' }}
                        >
                          NASA Mars Trek <ExternalLink size={10} style={{ verticalAlign: 'middle' }} />
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Waypoint Pins for Route (Point A in Stark White, Point B in Warm Yellow) */}
          {routeStartLoc && (
            <Marker
              position={[routeStartLoc.lat, routeStartLoc.lng]}
              icon={createWaypointIcon('A', '#F5F5F0')}
            />
          )}
          {routeDestLoc && (
            <Marker
              position={[routeDestLoc.lat, routeDestLoc.lng]}
              icon={createWaypointIcon('B', '#F5C542')}
            />
          )}

          {/* Full Historical Curiosity MSL Traverse Corridor (Gale Crater Mode) */}
          {filteredLocations && filteredLocations.length > 0 && filteredLocations[0]?.sol !== undefined && (
            <Polyline
              positions={filteredLocations.map((l) => [l.lat, l.lng])}
              pathOptions={{
                color: '#f59e0b',
                weight: 2.5,
                dashArray: '4, 6',
                opacity: 0.7,
              }}
            />
          )}

          {/* Alternative Route B (Dashed Cyan) */}
          {alternativeRoutePoints && alternativeRoutePoints.length >= 2 && (
            <Polyline
              positions={alternativeRoutePoints.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: '#38bdf8',
                weight: 3,
                dashArray: '6, 6',
                opacity: 0.9,
              }}
            />
          )}

          {/* Route A / Primary Highlight (Muted Amber) */}
          {routePoints && routePoints.length >= 2 && (
            <Polyline
              positions={routePoints.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: 'var(--accent-amber, #d97706)',
                weight: 3.5,
                opacity: 0.95,
              }}
            />
          )}

          {/* HiRISE Observation Footprints Overlay (0.25 m/pixel) */}
          {showHiriseFootprints &&
            HIRISE_FOOTPRINTS.map((fp) => (
              <Polygon
                key={fp.id}
                positions={fp.polygonCoords}
                pathOptions={{
                  color: 'var(--accent-amber, #d97706)',
                  weight: 1.5,
                  dashArray: '4, 4',
                  fillColor: '#d97706',
                  fillOpacity: 0.15,
                }}
              >
                <Popup>
                  <div className="mars-popup-box">
                    <div className="mars-popup-header">
                      <ClassificationBadge type="actual" customLabel="NASA / UArizona HiRISE" size="sm" />
                      <span className="mars-popup-status mono">{fp.resolutionFormatted}</span>
                    </div>

                    <h4 className="mars-popup-name">{fp.targetName}</h4>

                    <div className="mars-popup-catalog mono" style={{ color: 'var(--accent-amber, #d97706)' }}>
                      {fp.id} • {fp.region}
                    </div>

                    <p className="mars-popup-text">{fp.scienceSummary}</p>

                    <div className="mars-popup-details">
                      <div className="mars-popup-row">
                        <span>Center:</span>
                        <span className="mono">{fp.centerLat.toFixed(4)}°N, {fp.centerLng.toFixed(4)}°E</span>
                      </div>
                      <div className="mars-popup-row">
                        <span>Stereo Pair:</span>
                        <span className="mono">{fp.stereoPairProductId || 'None'}</span>
                      </div>
                      <div className="mars-popup-row">
                        <span>DTM Precision:</span>
                        <span className="mono">{fp.dtmAvailability}</span>
                      </div>
                    </div>

                    <div className="mars-popup-actions">
                      <a
                        href={fp.officialArchiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mars-popup-link"
                      >
                        <ExternalLink size={12} /> UArizona HiRISE Operations Center
                      </a>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            ))}
        </MapContainer>

        {/* Minimal Corner Info: Coordinates, Dynamic MOLA Elevation & Scale */}
        <div className="mars-map-overlay-bottom">
          <div className="mars-coords-tag mono">
            <span className="mars-coords-text">{formatCoordinates(cursorCoords.lat, cursorCoords.lng)}</span>
            <span className="mars-coords-elev">
              {cursorElev.elevationMeters !== null
                ? `${cursorElev.elevationFormatted} (DEM)`
                : 'MOLA Datum (610.5 Pa)'}
            </span>
          </div>
          <div className="mars-scale-tag">
            <div className="mars-scale-line" style={{ width: `${scaleInfo.scaleBarPx}px` }} />
            <span className="mono">{scaleInfo.scaleBarKm.toLocaleString()} km</span>
          </div>
        </div>

        {/* Offline fallback notice only if tiles cannot be contacted */}
        {isNetworkUnavailable && (
          <div className="mars-tile-error-banner">
            Note: Network basemap tiles are currently unreachable. Verified location coordinates remain visible on the coordinate grid.
          </div>
        )}
      </div>

      {/* Map Footer Attribution & Datum Specification */}
      <div className="mars-map-footer">
        <span>Layer: {currentLayer.provider}</span>
        <span>•</span>
        <span>Datum: IAU 2000 Mars Spheroid / MOLA Areoid (0 m = 610.5 Pa)</span>
        <span>•</span>
        <span>Mars Radius: 3,389.5 km</span>
        <span>•</span>
        <a
          href="https://trek.nasa.gov/mars/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-yellow)', textDecoration: 'none' }}
        >
          NASA JPL Mars Trek <ExternalLink size={10} style={{ verticalAlign: 'middle' }} />
        </a>
      </div>
    </div>
  );
}

export default MarsMap;
