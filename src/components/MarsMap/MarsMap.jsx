import { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import * as L_Module from 'leaflet';
import 'leaflet/dist/leaflet.css';
import marsLocations, { locationTypes } from '../../data/marsLocations';
import { formatCoordinates } from '../../utils/helpers';
import { RotateCcw, ExternalLink, Route, Compass, MapPin } from 'lucide-react';
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
    const pinColor = isSelected ? '#F5C542' : '#D4D4D8';
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
};

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
}) {
  const navigate = useNavigate();
  const [cursorCoords, setCursorCoords] = useState({ lat: 0, lng: 0 });
  const [activeLayerKey, setActiveLayerKey] = useState('mola');
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isTilesLoading, setIsTilesLoading] = useState(true);
  const [tilesLoadedCount, setTilesLoadedCount] = useState(0);
  const [tileErrorCount, setTileErrorCount] = useState(0);
  const [scaleInfo, setScaleInfo] = useState({
    kmPerPx: '26.1',
    scaleBarKm: 1000,
    scaleBarPx: 76,
  });

  const locations = useMemo(() => {
    return filteredLocations || marsLocations;
  }, [filteredLocations]);

  const currentLayer = TILE_LAYERS[activeLayerKey] || TILE_LAYERS.mola;

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
      <div className="mars-map-controls-bar">
        {/* Basemap Selection */}
        <div className="mars-map-control-group">
          <span className="mars-control-label">Basemap:</span>
          <div className="mars-button-group">
            {Object.values(TILE_LAYERS).map((layer) => (
              <button
                key={layer.id}
                type="button"
                className={`mars-control-btn ${activeLayerKey === layer.id ? 'mars-control-btn--active' : ''}`}
                onClick={() => {
                  setActiveLayerKey(layer.id);
                  setIsTilesLoading(true);
                  setTilesLoadedCount(0);
                  setTileErrorCount(0);
                }}
                title={layer.description}
              >
                {layer.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Live Basemap Service Status */}
        <div className="mars-map-status-pill">
          <span
            className="mars-map-status-dot"
            style={{
              backgroundColor: isNetworkUnavailable ? '#f59e0b' : isTilesLoading ? '#38bdf8' : '#10b981',
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

        {/* Quick Landmarks Jump Bar */}
        <div className="mars-map-control-group mars-hide-mobile">
          <span className="mars-control-label">Landmarks:</span>
          <div className="mars-button-group">
            {quickJumpTargets.map((target) => {
              const loc = marsLocations.find((l) => l.id === target.id);
              if (!loc) return null;
              const isSelected = selectedLocation?.id === target.id;
              return (
                <button
                  key={target.id}
                  type="button"
                  className={`mars-control-btn ${isSelected ? 'mars-control-btn--active' : ''}`}
                  onClick={() => onLocationSelect && onLocationSelect(loc)}
                >
                  {target.label}
                </button>
              );
            })}
          </div>
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
          key={`mars-map-${activeLayerKey}`}
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
                setTileErrorCount((c) => c + 1);
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
                        <span
                          className="mars-popup-tag"
                          style={{
                            backgroundColor: isSelected ? 'var(--accent-yellow)' : '#1c1e1e',
                            color: isSelected ? '#080909' : 'var(--text-secondary)',
                            borderColor: isSelected ? 'var(--accent-yellow)' : 'var(--border-color)',
                          }}
                        >
                          {typeInfo.label}
                        </span>
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

          {/* Route A / Primary Highlight (Warm Yellow) */}
          {routePoints && routePoints.length >= 2 && (
            <Polyline
              positions={routePoints.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: '#F5C542',
                weight: 3.5,
                opacity: 0.95,
              }}
            />
          )}
        </MapContainer>

        {/* Minimal Corner Info: Coordinates & Scale */}
        <div className="mars-map-overlay-bottom">
          <div className="mars-coords-tag mono">
            {formatCoordinates(cursorCoords.lat, cursorCoords.lng)}
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
