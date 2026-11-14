import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MarsMap from '../components/MarsMap/MarsMap';
import marsLocations from '../data/marsLocations';
import { formatCoordinates } from '../utils/helpers';
import {
  JEZERO_LANDMARKS,
  CURIOSITY_GALE_LANDMARKS,
  MOBILITY_MODELS,
  calculateRouteComparison,
  calculateTraverseSurvivalConsumables,
} from '../services/marsRouteService';
import {
  Navigation,
  ShieldAlert,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  Crosshair,
  ExternalLink,
  Compass,
  Layers,
  Clock,
  Wind,
  Droplets,
  Flame,
  Zap,
  BatteryCharging,
  HeartPulse,
} from 'lucide-react';
import './RoutePlanner.css';

// SVG Topographic Elevation Profile Component
function RouteElevationProfile({ routeData, activeRouteKey = 'routeA' }) {
  const [hoverPoint, setHoverPoint] = useState(null);
  const activeRoute = routeData[activeRouteKey] || routeData.routeA;

  // Gale Crater NASA MSL Waypoint MOLA Profile
  if (routeData.isGaleRegion) {
    const startMola = routeData.startMolaElev ?? routeData.startPoint?.elevationMeters;
    const destMola = routeData.destMolaElev ?? routeData.destPoint?.elevationMeters;
    const dist = routeData.straightDistKm || 1;
    const relief = routeData.molaReliefDeltaM ?? (startMola !== null && destMola !== null ? destMola - startMola : null);
    const avgGradePct = relief !== null ? ((Math.abs(relief) / (dist * 1000)) * 100).toFixed(1) : null;

    return (
      <div className="route-profile-gale mono">
        <div className="route-gale-header">
          <div className="route-chart-title">
            <TrendingUp size={13} color="var(--accent-yellow)" />
            <span>GALE CRATER (NASA MSL CURIOSITY TRAVERSE WAYPOINTS)</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="route-gale-badge" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              ● REAL DATA: NASA MSL WAYPOINTS
            </span>
            <span className="route-gale-badge">MOLA AREOID DATUM</span>
          </div>
        </div>

        <div className="route-gale-metrics-grid">
          <div className="route-gale-stat">
            <span className="route-gale-label">ORIGIN ELEVATION <span style={{ color: '#10b981', fontSize: '8px' }}>[REAL DATA]</span></span>
            <span className="route-gale-val">{startMola !== null ? `${startMola} m` : 'N/A'}</span>
            <span className="route-gale-sub">{routeData.startPoint?.shortName || routeData.startPoint?.name}</span>
          </div>
          <div className="route-gale-stat">
            <span className="route-gale-label">DESTINATION ELEVATION <span style={{ color: '#10b981', fontSize: '8px' }}>[REAL DATA]</span></span>
            <span className="route-gale-val">{destMola !== null ? `${destMola} m` : 'N/A'}</span>
            <span className="route-gale-sub">{routeData.destPoint?.shortName || routeData.destPoint?.name}</span>
          </div>
          <div className="route-gale-stat">
            <span className="route-gale-label">NET RELIEF Δ <span style={{ color: '#38bdf8', fontSize: '8px' }}>[CALCULATED]</span></span>
            <span className="route-gale-val">{relief !== null ? `${relief > 0 ? '+' : ''}${relief} m` : 'N/A'}</span>
            <span className="route-gale-sub">{relief > 0 ? 'Ascending Mount Sharp' : 'Descending Basin Floor'}</span>
          </div>
          <div className="route-gale-stat">
            <span className="route-gale-label">AVERAGE GRADE <span style={{ color: '#38bdf8', fontSize: '8px' }}>[CALCULATED]</span></span>
            <span className="route-gale-val">{avgGradePct !== null ? `${avgGradePct}%` : 'N/A'}</span>
            <span className="route-gale-sub">Point-to-Point Chord</span>
          </div>
        </div>

        <div className="route-gale-disclosure">
          <Info size={13} color="var(--accent-yellow)" />
          <div>
            <strong>DISCRETE NASA MSL WAYPOINT ELEVATIONS ACTIVE</strong>
            <p>
              In strict accordance with NASA scientific standards, continuous sub-kilometer DEM slope profiling is withheld because the 20m Gale CTX DEM matrix is not locally loaded. Waypoints display authentic discrete MOLA laser altimetry recorded across Curiosity's 32+ km traverse.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              <a
                href="https://science.nasa.gov/resource/curiositys-proposed-path-up-mount-sharp/"
                target="_blank"
                rel="noopener noreferrer"
                className="route-gale-link"
              >
                NASA Curiosity Mount Sharp Proposed Path Reference <ExternalLink size={11} />
              </a>
              <a
                href="https://mars.nasa.gov/msl/mission/where-is-the-rover/"
                target="_blank"
                rel="noopener noreferrer"
                className="route-gale-link"
              >
                NASA MSL Official Traverse Portal <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!routeData.isFullJezeroDemCoverage || !activeRoute.profilePoints || activeRoute.profilePoints.length < 2) {
    return (
      <div className="route-profile-empty mono">
        <Info size={14} color="var(--accent-yellow)" />
        <div>
          <strong>HIGH-RESOLUTION TERRAIN DATA UNAVAILABLE FOR THIS REGION</strong>
          <p>
            Continuous sub-kilometer slope profiling is supported exclusively within the Jezero Crater 20m CTX DEM footprint (17.58°N–19.29°N, 77.00°E–78.58°E). For global Mars traverses, intermediate slope profiles are withheld to preserve scientific integrity.
          </p>
        </div>
      </div>
    );
  }

  const points = activeRoute.profilePoints;
  const maxDist = activeRoute.totalDistKm || 1;
  const elevs = points.map((p) => p.elev).filter((e) => e !== null);
  const minElev = Math.min(...elevs);
  const maxElev = Math.max(...elevs);
  const elevSpan = Math.max(10, maxElev - minElev);

  // Chart Dimensions
  const width = 600;
  const height = 150;
  const padding = { top: 18, right: 20, bottom: 25, left: 55 };
  const graphW = width - padding.left - padding.right;
  const graphH = height - padding.top - padding.bottom;

  const getX = (dist) => padding.left + (dist / maxDist) * graphW;
  const getY = (elev) => padding.top + graphH - ((elev - minElev) / elevSpan) * graphH;

  // Build SVG Path
  const pathD = points.reduce((acc, p, i) => {
    const x = getX(p.distKm);
    const y = getY(p.elev);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(points[points.length - 1].distKm)} ${padding.top + graphH} L ${getX(0)} ${padding.top + graphH} Z`;

  return (
    <div className="route-elevation-chart-box">
      <div className="route-chart-header mono">
        <div className="route-chart-title">
          <TrendingUp size={13} color="var(--accent-yellow)" />
          <span>TOPOGRAPHIC ELEVATION TRANSECT (USGS CTX 20m DEM)</span>
        </div>
        <div className="route-chart-stats">
          <span>MIN: {minElev} m</span>
          <span>•</span>
          <span>MAX: {maxElev} m</span>
          <span>•</span>
          <span>RELIEF Δ: {Math.round(maxElev - minElev)} m</span>
        </div>
      </div>

      <div className="route-svg-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="route-profile-svg"
          onMouseLeave={() => setHoverPoint(null)}
        >
          {/* Elevation Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const elevVal = Math.round(minElev + pct * elevSpan);
            const y = padding.top + graphH - pct * graphH;
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphW}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="3,3"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="8"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {elevVal}m
                </text>
              </g>
            );
          })}

          {/* Distance Ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const distVal = (pct * maxDist).toFixed(1);
            const x = padding.left + pct * graphW;
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={padding.top + graphH}
                  x2={x}
                  y2={padding.top + graphH + 4}
                  stroke="rgba(255, 255, 255, 0.2)"
                />
                <text
                  x={x}
                  y={padding.top + graphH + 15}
                  fill="#94a3b8"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {distVal} km
                </text>
              </g>
            );
          })}

          {/* Area Fill Gradient */}
          <defs>
            <linearGradient id="elevAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5c542" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f5c542" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#elevAreaGrad)" />

          {/* Colored Segments based on Slope Thresholds */}
          {points.map((pt, i) => {
            if (i === 0) return null;
            const prev = points[i - 1];
            const x1 = getX(prev.distKm);
            const y1 = getY(prev.elev);
            const x2 = getX(pt.distKm);
            const y2 = getY(pt.elev);

            const slope = pt.slopeDeg || 0;
            const strokeColor = slope > 15 ? '#ef4444' : slope > 7 ? '#f59e0b' : '#10b981';

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}

          {/* Invisible Scrubber overlay */}
          {points.map((pt, i) => {
            const x = getX(pt.distKm);
            return (
              <rect
                key={`rect-${i}`}
                x={x - graphW / (points.length * 2)}
                y={padding.top}
                width={graphW / points.length}
                height={graphH}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={() => setHoverPoint(pt)}
              />
            );
          })}

          {/* Hover Marker & Callout */}
          {hoverPoint && (
            <g>
              <line
                x1={getX(hoverPoint.distKm)}
                y1={padding.top}
                x2={getX(hoverPoint.distKm)}
                y2={padding.top + graphH}
                stroke="#ffffff"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <circle
                cx={getX(hoverPoint.distKm)}
                cy={getY(hoverPoint.elev)}
                r="4"
                fill="#f5c542"
                stroke="#080909"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Hover Info Tooltip */}
      <div className="route-scrub-readout mono">
        {hoverPoint ? (
          <>
            <span>DISTANCE: {hoverPoint.distKm} km</span>
            <span>ELEVATION: {hoverPoint.elev} m MOLA</span>
            <span style={{ color: hoverPoint.slopeDeg > 15 ? '#ef4444' : hoverPoint.slopeDeg > 7 ? '#f59e0b' : '#10b981' }}>
              SLOPE: {hoverPoint.slopeDeg}° ({hoverPoint.slopeDeg > 15 ? 'HAZARDOUS SCARP' : hoverPoint.slopeDeg > 7 ? 'MODERATE' : 'TRAVERSABLE'})
            </span>
          </>
        ) : (
          <span className="route-scrub-hint">
            Hover along elevation cross-section to inspect local terrain slopes and MOLA datum elevations
          </span>
        )}
      </div>

      {/* Slope Color Legend */}
      <div className="route-slope-legend mono">
        <span className="route-legend-chip">
          <span className="route-legend-box" style={{ background: '#10b981' }} />
          <span>&lt;7° Flat / Safe</span>
        </span>
        <span className="route-legend-chip">
          <span className="route-legend-box" style={{ background: '#f59e0b' }} />
          <span>7°–15° Incline</span>
        </span>
        <span className="route-legend-chip">
          <span className="route-legend-box" style={{ background: '#ef4444' }} />
          <span>&gt;15° Critical Scarp</span>
        </span>
      </div>
    </div>
  );
}

// Interplanetary Survival Consumables Component (NASA-STD-3001)
function RouteSurvivalAssessment({ distanceKm, mobilityModel }) {
  const [crewCount, setCrewCount] = useState(2);
  const consumables = calculateTraverseSurvivalConsumables(distanceKm, mobilityModel?.solKm || 1, crewCount);

  return (
    <div className="route-survival-card mono">
      <div className="route-survival-header">
        <div className="route-survival-title">
          <HeartPulse size={14} color="#ef4444" />
          <span>TRAVERSE SURVIVAL & LIFE SUPPORT (NASA-STD-3001)</span>
        </div>
        <div className="route-survival-crew-toggle">
          <span className="route-survival-crew-label">CREW:</span>
          {[1, 2, 4].map((n) => (
            <button
              key={n}
              type="button"
              className={`route-crew-btn ${crewCount === n ? 'route-crew-btn--active' : ''}`}
              onClick={() => setCrewCount(n)}
            >
              {n} Astronaut{n > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="route-survival-grid">
        <div className="route-survival-stat">
          <div className="route-survival-label"><Clock size={11} /> SOL DURATION</div>
          <div className="route-survival-val">{consumables.estSols} Sols</div>
          <div className="route-survival-sub">At {mobilityModel?.label?.split('(')[0] || 'Selected Pace'}</div>
        </div>

        <div className="route-survival-stat">
          <div className="route-survival-label"><Wind size={11} /> O₂ CONSUMPTION</div>
          <div className="route-survival-val">{consumables.totalO2Kg} kg</div>
          <div className="route-survival-sub">0.84 kg/crew/sol (NASA-STD-3001)</div>
        </div>

        <div className="route-survival-stat">
          <div className="route-survival-label"><Droplets size={11} /> H₂O HYDRATION</div>
          <div className="route-survival-val">{consumables.totalWaterKg} kg</div>
          <div className="route-survival-sub">2.5 kg/crew/sol consumables</div>
        </div>

        <div className="route-survival-stat">
          <div className="route-survival-label"><Flame size={11} /> METABOLIC CALORIES</div>
          <div className="route-survival-val">{consumables.totalKcal.toLocaleString()} kcal</div>
          <div className="route-survival-sub">3,000 kcal/crew/sol in 0.38g</div>
        </div>

        <div className="route-survival-stat">
          <div className="route-survival-label"><Zap size={11} /> IONIZING RADIATION</div>
          <div className="route-survival-val" style={{ color: consumables.totalRadiationMsv > 25 ? '#ef4444' : '#f5c542' }}>
            {consumables.totalRadiationMsv} mSv
          </div>
          <div className="route-survival-sub">MSL RAD Surface: 0.65 mSv/Sol</div>
        </div>

        <div className="route-survival-stat">
          <div className="route-survival-label"><BatteryCharging size={11} /> ROBOTIC ACTUATION & HEAT</div>
          <div className="route-survival-val">{consumables.totalRoverKwh} kWh</div>
          <div className="route-survival-sub">0.9 kWh/sol equivalent electrical</div>
        </div>
      </div>

      <div className="route-survival-citations">
        <ShieldAlert size={13} color="var(--accent-yellow)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>PHYSIOLOGICAL ENVIRONMENTAL BOUNDARIES:</strong>
          <p>
            Ambient surface pressure is ~610–850 Pa (far below the 6.3 kPa Armstrong Limit). Unpressurized exposure causes instantaneous bodily fluid boiling and loss of consciousness within 15 seconds. Pressurized suit or sealed rover cabin with active thermal control is mandatory for every meter of this traverse.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RoutePlanner() {
  const [searchParams] = useSearchParams();
  const urlStart = searchParams.get('start');
  const urlDest = searchParams.get('dest');

  // Planning scope: 'jezero' (Tactical 20m DEM), 'gale' (Curiosity MSL Traverse), or 'global' (Interplanetary Mars)
  const [scopeMode, setScopeMode] = useState(() => {
    if (urlStart || urlDest) {
      const isGale = CURIOSITY_GALE_LANDMARKS.some((l) => l.id === urlStart || l.id === urlDest);
      if (isGale) return 'gale';
      const isGlobal = marsLocations.some((l) => l.id === urlStart || l.id === urlDest);
      if (isGlobal) return 'global';
    }
    return 'jezero';
  });
  const [activeRouteKey, setActiveRouteKey] = useState('routeA'); // 'routeA' | 'routeB' | 'both'

  // Endpoint selections
  const [startPoint, setStartPoint] = useState(() => {
    if (urlStart) {
      const match = JEZERO_LANDMARKS.find((l) => l.id === urlStart) ||
                    CURIOSITY_GALE_LANDMARKS.find((l) => l.id === urlStart) ||
                    marsLocations.find((l) => l.id === urlStart);
      if (match) return match;
    }
    return JEZERO_LANDMARKS[0];
  });

  const [destPoint, setDestPoint] = useState(() => {
    if (urlDest) {
      const match = JEZERO_LANDMARKS.find((l) => l.id === urlDest) ||
                    CURIOSITY_GALE_LANDMARKS.find((l) => l.id === urlDest) ||
                    marsLocations.find((l) => l.id === urlDest);
      if (match) return match;
    }
    return JEZERO_LANDMARKS[1];
  });

  // Click-to-set waypoint mode: 'none' | 'start' | 'dest'
  const [clickMode, setClickMode] = useState('none');

  // Mobility Speed Model
  const [selectedSpeedId, setSelectedSpeedId] = useState('standard-rover');

  // Route Analysis and Comparison State
  const [routeComparison, setRouteComparison] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Map center/view controller
  const [centerView, setCenterView] = useState({ lat: 18.45, lng: 77.40, zoom: 7 });

  const selectedSpeed = MOBILITY_MODELS.find((m) => m.id === selectedSpeedId) || MOBILITY_MODELS[0];

  // Re-run terrain-aware route comparison whenever endpoints change
  useEffect(() => {
    let isCancelled = false;
    const calcTimer = setTimeout(() => {
      if (!isCancelled) setIsCalculating(true);
    }, 0);

    calculateRouteComparison(startPoint, destPoint)
      .then((comp) => {
        if (!isCancelled) {
          clearTimeout(calcTimer);
          setRouteComparison(comp);
          setIsCalculating(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          clearTimeout(calcTimer);
          console.warn('Route comparison failed:', err);
          setIsCalculating(false);
        }
      });

    return () => {
      isCancelled = true;
      clearTimeout(calcTimer);
    };
  }, [startPoint, destPoint]);

  // Handle map click to place waypoints
  const handleMapClick = (latlng) => {
    const lat = Math.round(latlng.lat * 10000) / 10000;
    const lng = Math.round(latlng.lng * 10000) / 10000;
    const coordsStr = formatCoordinates(lat, lng);

    if (clickMode === 'start') {
      setStartPoint({
        id: `custom-start-${Date.now()}`,
        name: `Origin: ${coordsStr}`,
        lat,
        lng,
        isCustomClick: true,
      });
      setClickMode('none');
    } else if (clickMode === 'dest') {
      setDestPoint({
        id: `custom-dest-${Date.now()}`,
        name: `Destination: ${coordsStr}`,
        lat,
        lng,
        isCustomClick: true,
      });
      setClickMode('none');
    } else {
      // Default: cycle setting Point A then Point B
      if (startPoint && destPoint) {
        setStartPoint({
          id: `custom-start-${Date.now()}`,
          name: `Origin: ${coordsStr}`,
          lat,
          lng,
          isCustomClick: true,
        });
      } else if (!startPoint) {
        setStartPoint({
          id: `custom-start-${Date.now()}`,
          name: `Origin: ${coordsStr}`,
          lat,
          lng,
          isCustomClick: true,
        });
      } else {
        setDestPoint({
          id: `custom-dest-${Date.now()}`,
          name: `Destination: ${coordsStr}`,
          lat,
          lng,
          isCustomClick: true,
        });
      }
    }
  };

  // Preset Route Scenarios
  const loadPresetRoute = (type) => {
    if (type === 'delta-front') {
      setScopeMode('jezero');
      const start = JEZERO_LANDMARKS.find((l) => l.id === 'octavia-butler');
      const dest = JEZERO_LANDMARKS.find((l) => l.id === 'delta-front');
      setStartPoint(start);
      setDestPoint(dest);
      setCenterView({ lat: 18.48, lng: 77.38, zoom: 7 });
    } else if (type === 'belva') {
      setScopeMode('jezero');
      const start = JEZERO_LANDMARKS.find((l) => l.id === 'delta-front');
      const dest = JEZERO_LANDMARKS.find((l) => l.id === 'belva-crater');
      setStartPoint(start);
      setDestPoint(dest);
      setCenterView({ lat: 18.50, lng: 77.35, zoom: 8 });
    } else if (type === 'neretva-rim') {
      setScopeMode('jezero');
      const start = JEZERO_LANDMARKS.find((l) => l.id === 'delta-front');
      const dest = JEZERO_LANDMARKS.find((l) => l.id === 'neretva-inflow');
      setStartPoint(start);
      setDestPoint(dest);
      setCenterView({ lat: 18.68, lng: 77.42, zoom: 7 });
    } else if (type === 'gale-yellowknife') {
      setScopeMode('gale');
      const start = CURIOSITY_GALE_LANDMARKS.find((l) => l.id === 'bradbury-landing');
      const dest = CURIOSITY_GALE_LANDMARKS.find((l) => l.id === 'yellowknife-bay');
      setStartPoint(start);
      setDestPoint(dest);
      setCenterView({ lat: -4.59, lng: 137.445, zoom: 12 });
    } else if (type === 'gale-kimberley') {
      setScopeMode('gale');
      const start = CURIOSITY_GALE_LANDMARKS.find((l) => l.id === 'bradbury-landing');
      const dest = CURIOSITY_GALE_LANDMARKS.find((l) => l.id === 'kimberley');
      setStartPoint(start);
      setDestPoint(dest);
      setCenterView({ lat: -4.62, lng: 137.42, zoom: 11 });
    } else if (type === 'gale-vera-rubin') {
      setScopeMode('gale');
      const start = CURIOSITY_GALE_LANDMARKS.find((l) => l.id === 'bradbury-landing');
      const dest = CURIOSITY_GALE_LANDMARKS.find((l) => l.id === 'vera-rubin-ridge');
      setStartPoint(start);
      setDestPoint(dest);
      setCenterView({ lat: -4.66, lng: 137.40, zoom: 11 });
    } else if (type === 'gale-gediz') {
      setScopeMode('gale');
      const start = CURIOSITY_GALE_LANDMARKS.find((l) => l.id === 'glen-torridon');
      const dest = CURIOSITY_GALE_LANDMARKS.find((l) => l.id === 'gediz-vallis');
      setStartPoint(start);
      setDestPoint(dest);
      setCenterView({ lat: -4.76, lng: 137.365, zoom: 12 });
    } else if (type === 'global-msl') {
      setScopeMode('global');
      const start = marsLocations.find((l) => l.id === 'perseverance');
      const dest = marsLocations.find((l) => l.id === 'curiosity');
      setStartPoint(start);
      setDestPoint(dest);
      setCenterView({ lat: 6.0, lng: 105.0, zoom: 3 });
    }
  };

  const swapEndpoints = () => {
    const temp = startPoint;
    setStartPoint(destPoint);
    setDestPoint(temp);
  };

  const clearRoute = () => {
    setStartPoint(null);
    setDestPoint(null);
  };

  const isValidRoute = Boolean(
    startPoint &&
    destPoint &&
    typeof startPoint.lat === 'number' &&
    typeof destPoint.lat === 'number' &&
    (startPoint.lat !== destPoint.lat || startPoint.lng !== destPoint.lng)
  );

  return (
    <div className="route-page fade-in">
      {/* Header */}
      <div className="route-header">
        <div className="route-header__left">
          <div className="route-tag-strip mono">
            <span className="route-tag route-tag--accent">USGS ASTROGEOLOGY CTX 20m DEM</span>
            <span className="route-tag" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              ● REAL DATA: NASA PDS & MOLA
            </span>
            <span className="route-tag" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
              ◈ CALCULATED: GEODESIC & SLOPES
            </span>
            <span className="route-tag">AUTONAV SLOPE LIMIT: 15°</span>
          </div>
          <h1 className="route-heading">
            <Navigation size={22} className="route-heading-icon" />
            Mars Surface Route Planner & Slope Analyzer
          </h1>
          <p className="route-desc">
            Plan surface traverses across Jezero Crater and Gale Crater with terrain-aware elevation profiling. Compare direct straight-line paths with low-slope navigational bypasses, evaluate rover engineering hazards, and review real USGS/CTX digital elevation metrics.
          </p>
        </div>

        {/* Scope Mode Switcher */}
        <div className="route-scope-toggle mono">
          <button
            type="button"
            className={`route-scope-btn ${scopeMode === 'jezero' ? 'route-scope-btn--active' : ''}`}
            onClick={() => {
              setScopeMode('jezero');
              loadPresetRoute('delta-front');
            }}
          >
            <Crosshair size={12} /> Jezero Crater (Perseverance DEM)
          </button>
          <button
            type="button"
            className={`route-scope-btn ${scopeMode === 'gale' ? 'route-scope-btn--active' : ''}`}
            onClick={() => {
              setScopeMode('gale');
              loadPresetRoute('gale-vera-rubin');
            }}
          >
            <Navigation size={12} /> Gale Crater (Curiosity Traverse)
          </button>
          <button
            type="button"
            className={`route-scope-btn ${scopeMode === 'global' ? 'route-scope-btn--active' : ''}`}
            onClick={() => {
              setScopeMode('global');
              loadPresetRoute('global-msl');
            }}
          >
            <Compass size={12} /> Global Mars Overview
          </button>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="route-presets-strip">
        <span className="route-presets-label mono">
          <Crosshair size={12} /> VERIFIED MISSION TRAVERSES:
        </span>
        <div className="route-preset-buttons">
          {scopeMode === 'jezero' && (
            <>
              <button
                type="button"
                className="route-preset-btn"
                onClick={() => loadPresetRoute('delta-front')}
              >
                Landing Site → Delta Front (8.6 km)
              </button>
              <button
                type="button"
                className="route-preset-btn"
                onClick={() => loadPresetRoute('belva')}
              >
                Delta Front → Belva Crater Rim (6.4 km)
              </button>
              <button
                type="button"
                className="route-preset-btn"
                onClick={() => loadPresetRoute('neretva-rim')}
              >
                Delta Front → Neretva Inflow Gorge (37.8 km)
              </button>
            </>
          )}

          {scopeMode === 'gale' && (
            <>
              <button
                type="button"
                className="route-preset-btn"
                onClick={() => loadPresetRoute('gale-yellowknife')}
              >
                Bradbury → Yellowknife Bay (0.5 km)
              </button>
              <button
                type="button"
                className="route-preset-btn"
                onClick={() => loadPresetRoute('gale-kimberley')}
              >
                Bradbury → The Kimberley (6.4 km)
              </button>
              <button
                type="button"
                className="route-preset-btn"
                onClick={() => loadPresetRoute('gale-vera-rubin')}
              >
                Bradbury → Vera Rubin Ridge (18.6 km)
              </button>
              <button
                type="button"
                className="route-preset-btn"
                onClick={() => loadPresetRoute('gale-gediz')}
              >
                Glen Torridon → Gediz Vallis Ridge (2.4 km)
              </button>
            </>
          )}

          {scopeMode === 'global' && (
            <button
              type="button"
              className="route-preset-btn"
              onClick={() => loadPresetRoute('global-msl')}
            >
              Global: Perseverance → Curiosity (3,710 km)
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="route-grid">
        {/* Left Column: Interactive Map */}
        <div className="route-map-panel">
          {/* Map Toolbar */}
          <div className="route-map-toolbar">
            <div className="route-toolbar-left mono">
              <span>CLICK TO SET:</span>
              <button
                type="button"
                className={`route-tool-btn ${clickMode === 'start' ? 'route-tool-btn--active' : ''}`}
                onClick={() => setClickMode(clickMode === 'start' ? 'none' : 'start')}
              >
                Set Point A (Origin)
              </button>
              <button
                type="button"
                className={`route-tool-btn ${clickMode === 'dest' ? 'route-tool-btn--active' : ''}`}
                onClick={() => setClickMode(clickMode === 'dest' ? 'none' : 'dest')}
              >
                Set Point B (Destination)
              </button>
            </div>

            <div className="route-toolbar-right mono">
              <button
                type="button"
                className="route-tool-btn"
                onClick={swapEndpoints}
                disabled={!isValidRoute}
                title="Swap origin and destination"
              >
                <RotateCcw size={11} /> Swap Endpoints
              </button>
              <button
                type="button"
                className="route-tool-btn route-tool-btn--danger"
                onClick={clearRoute}
                title="Clear current route"
              >
                <XCircle size={11} /> Clear Route
              </button>
            </div>
          </div>

          {/* Interactive Map Visualizer */}
          <div className="route-canvas-box">
            <MarsMap
              routePoints={isValidRoute && routeComparison?.routeA?.waypoints ? routeComparison.routeA.waypoints : null}
              alternativeRoutePoints={
                isValidRoute && routeComparison?.isFullJezeroDemCoverage && (activeRouteKey === 'routeB' || activeRouteKey === 'both')
                  ? routeComparison.routeB.waypoints
                  : null
              }
              routeStartLoc={startPoint}
              routeDestLoc={destPoint}
              onMapClick={handleMapClick}
              centerView={centerView}
              filteredLocations={
                scopeMode === 'jezero'
                  ? JEZERO_LANDMARKS
                  : scopeMode === 'gale'
                  ? CURIOSITY_GALE_LANDMARKS
                  : marsLocations
              }
              canvasClassName="mars-map-canvas--route-planner"
            />
          </div>

          {/* Map Legend Strip */}
          <div className="route-map-legend mono">
            <div className="route-legend-group">
              <span className="route-legend-badge route-legend-badge--a">A</span>
              <span>ORIGIN: {startPoint ? startPoint.name : 'Click to Set'}</span>
            </div>
            <div className="route-legend-group">
              <span className="route-legend-badge route-legend-badge--b">B</span>
              <span>DEST: {destPoint ? destPoint.name : 'Click to Set'}</span>
            </div>
            {isValidRoute && routeComparison?.isFullJezeroDemCoverage && (
              <div className="route-legend-routes">
                <span className="route-path-chip route-path-chip--a">
                  ── Option A: Direct Geodesic
                </span>
                <span className="route-path-chip route-path-chip--b">
                  ┄┄ Option B: Low-Slope Bypass
                </span>
              </div>
            )}
            {scopeMode === 'gale' && (
              <div className="route-legend-routes">
                <span className="route-path-chip route-path-chip--a" style={{ color: '#F5C542' }}>
                  ── Active Selected Traverse
                </span>
                <span className="route-path-chip" style={{ color: '#f59e0b', border: '1px dashed rgba(245, 158, 11, 0.6)', padding: '2px 6px' }}>
                  ┄┄ Official NASA MSL Route Corridor (Sol 0 – 4100+)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Route Controls, Elevation Profile, & Comparison Inspector */}
        <div className="route-inspector-panel">
          {/* Endpoint Selection Card */}
          <div className="route-card">
            <h3 className="route-card-title mono">
              <Crosshair size={13} color="var(--accent-yellow)" /> SURFACE WAYPOINT CONFIGURATION
              {isCalculating && <span style={{ marginLeft: 'auto', fontSize: '8px', color: '#38bdf8' }}>COMPUTING TRAVERSE...</span>}
            </h3>

            <div className="route-field">
              <label className="route-label mono">Point A (Origin)</label>
              {scopeMode === 'jezero' ? (
                <select
                  className="route-select mono"
                  value={startPoint?.id || ''}
                  onChange={(e) => {
                    const found = JEZERO_LANDMARKS.find((l) => l.id === e.target.value);
                    if (found) setStartPoint(found);
                  }}
                >
                  <option value="">-- Choose Jezero Landmark --</option>
                  {JEZERO_LANDMARKS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.elevationMeters}m)
                    </option>
                  ))}
                </select>
              ) : scopeMode === 'gale' ? (
                <select
                  className="route-select mono"
                  value={startPoint?.id || ''}
                  onChange={(e) => {
                    const found = CURIOSITY_GALE_LANDMARKS.find((l) => l.id === e.target.value);
                    if (found) setStartPoint(found);
                  }}
                >
                  <option value="">-- Choose Curiosity Landmark --</option>
                  {CURIOSITY_GALE_LANDMARKS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} (Sol {l.sol} • {l.elevationMeters}m)
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  className="route-select mono"
                  value={startPoint?.id || ''}
                  onChange={(e) => {
                    const found = marsLocations.find((l) => l.id === e.target.value);
                    if (found) setStartPoint(found);
                  }}
                >
                  <option value="">-- Choose Planetary Monument --</option>
                  {marsLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              )}
              {startPoint && (
                <div className="route-coord-hint mono">
                  {formatCoordinates(startPoint.lat, startPoint.lng)} • {startPoint.elevation || `${startPoint.elevationMeters}m MOLA`}
                </div>
              )}
            </div>

            <div className="route-field">
              <label className="route-label mono">Point B (Destination)</label>
              {scopeMode === 'jezero' ? (
                <select
                  className="route-select mono"
                  value={destPoint?.id || ''}
                  onChange={(e) => {
                    const found = JEZERO_LANDMARKS.find((l) => l.id === e.target.value);
                    if (found) setDestPoint(found);
                  }}
                >
                  <option value="">-- Choose Jezero Landmark --</option>
                  {JEZERO_LANDMARKS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.elevationMeters}m)
                    </option>
                  ))}
                </select>
              ) : scopeMode === 'gale' ? (
                <select
                  className="route-select mono"
                  value={destPoint?.id || ''}
                  onChange={(e) => {
                    const found = CURIOSITY_GALE_LANDMARKS.find((l) => l.id === e.target.value);
                    if (found) setDestPoint(found);
                  }}
                >
                  <option value="">-- Choose Curiosity Landmark --</option>
                  {CURIOSITY_GALE_LANDMARKS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} (Sol {l.sol} • {l.elevationMeters}m)
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  className="route-select mono"
                  value={destPoint?.id || ''}
                  onChange={(e) => {
                    const found = marsLocations.find((l) => l.id === e.target.value);
                    if (found) setDestPoint(found);
                  }}
                >
                  <option value="">-- Choose Planetary Monument --</option>
                  {marsLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              )}
              {destPoint && (
                <div className="route-coord-hint mono">
                  {formatCoordinates(destPoint.lat, destPoint.lng)} • {destPoint.elevation || `${destPoint.elevationMeters}m MOLA`}
                </div>
              )}
            </div>

            <div className="route-field">
              <label className="route-label mono">Mobility Model Pace</label>
              <select
                className="route-select mono"
                value={selectedSpeedId}
                onChange={(e) => setSelectedSpeedId(e.target.value)}
              >
                {MOBILITY_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <span className="route-coord-hint mono">{selectedSpeed.note}</span>
            </div>
          </div>

          {/* Elevation Profile Section */}
          {isValidRoute && routeComparison && (
            <div className="route-card">
              <div className="route-tab-row mono">
                <span className="route-tab-title">TERRAIN TRANSECT</span>
                {routeComparison.isFullJezeroDemCoverage && (
                  <div className="route-route-selector">
                    <button
                      type="button"
                      className={`route-tab-btn ${activeRouteKey === 'routeA' ? 'route-tab-btn--active' : ''}`}
                      onClick={() => setActiveRouteKey('routeA')}
                    >
                      Option A (Direct)
                    </button>
                    <button
                      type="button"
                      className={`route-tab-btn ${activeRouteKey === 'routeB' ? 'route-tab-btn--active' : ''}`}
                      onClick={() => setActiveRouteKey('routeB')}
                    >
                      Option B (Low-Slope)
                    </button>
                  </div>
                )}
              </div>

              <RouteElevationProfile
                routeData={routeComparison}
                activeRouteKey={activeRouteKey}
              />
            </div>
          )}

          {/* Route Comparison Matrix Card */}
          {isValidRoute && routeComparison && routeComparison.isFullJezeroDemCoverage && (
            <div className="route-card">
              <h3 className="route-card-title mono">
                <Layers size={13} color="var(--accent-yellow)" /> COMPARATIVE TRAVERSE MATRIX
                <span style={{ marginLeft: 'auto', fontSize: '8px', color: '#38bdf8' }}>[CALCULATED]</span>
              </h3>

              <div className="route-comparison-table-wrapper mono">
                <table className="route-comparison-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Option A (Direct)</th>
                      <th>Option B (Low-Slope)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Traverse Distance</td>
                      <td>{routeComparison.routeA.totalDistKm} km</td>
                      <td>{routeComparison.routeB.totalDistKm} km</td>
                    </tr>
                    <tr>
                      <td>Total Vertical Climb (Ascent)</td>
                      <td>+{routeComparison.routeA.totalAscentM} m</td>
                      <td>+{routeComparison.routeB.totalAscentM} m</td>
                    </tr>
                    <tr>
                      <td>Total Vertical Descent</td>
                      <td>-{routeComparison.routeA.totalDescentM} m</td>
                      <td>-{routeComparison.routeB.totalDescentM} m</td>
                    </tr>
                    <tr>
                      <td>Maximum Slope Angle</td>
                      <td style={{ color: routeComparison.routeA.maxSlopeDeg > 15 ? '#ef4444' : '#10b981' }}>
                        {routeComparison.routeA.maxSlopeDeg}° {routeComparison.routeA.maxSlopeDeg > 15 && '⚠'}
                      </td>
                      <td style={{ color: routeComparison.routeB.maxSlopeDeg > 15 ? '#ef4444' : '#10b981' }}>
                        {routeComparison.routeB.maxSlopeDeg}°
                      </td>
                    </tr>
                    <tr>
                      <td>Average Slope Grade</td>
                      <td>{routeComparison.routeA.avgSlopeDeg}°</td>
                      <td>{routeComparison.routeB.avgSlopeDeg}°</td>
                    </tr>
                    <tr>
                      <td>Critical Hazard Segments (&gt;15°)</td>
                      <td style={{ color: routeComparison.routeA.steepPercent > 0 ? '#ef4444' : '#10b981' }}>
                        {routeComparison.routeA.steepPercent}%
                      </td>
                      <td style={{ color: routeComparison.routeB.steepPercent > 0 ? '#ef4444' : '#10b981' }}>
                        {routeComparison.routeB.steepPercent}%
                      </td>
                    </tr>
                    <tr>
                      <td>Estimated Sol Duration</td>
                      <td>~{Math.round(routeComparison.routeA.totalDistKm / selectedSpeed.solKm)} Sols</td>
                      <td>~{Math.round(routeComparison.routeB.totalDistKm / selectedSpeed.solKm)} Sols</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mission Planning Evaluation Callout */}
              <div className="route-evaluation-box mono">
                <div className="route-eval-header">
                  <CheckCircle2 size={13} color="var(--accent-yellow)" />
                  <strong>MISSION TRAVERSABILITY ASSESSMENT:</strong>
                </div>
                <p className="route-eval-text">{routeComparison.comparisonRationale}</p>
              </div>

              {/* Mandatory Planetary Safety Protocol Warning */}
              <div className="route-safety-alert mono">
                <ShieldAlert size={15} color="var(--accent-yellow)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>SAFETY LIMITATION DISCLOSURE:</strong>
                  <p>
                    No route across the Martian surface is completely safe. Even low-slope options may encounter unresolved sub-pixel boulder clusters (&lt;20m), loose wheel-trapping drift sand, or steep bedrock fissures below the Context Camera DEM resolution threshold. Autonomous driving requires continuous visual odometry hazard avoidance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Planetary Survival & Consumables Assessment Card */}
          {isValidRoute && routeComparison && (
            <div className="route-card">
              <RouteSurvivalAssessment
                distanceKm={
                  activeRouteKey === 'routeB' && routeComparison.isFullJezeroDemCoverage
                    ? routeComparison.routeB.totalDistKm
                    : (routeComparison.routeA?.totalDistKm || routeComparison.straightDistKm || 1)
                }
                mobilityModel={selectedSpeed}
              />
            </div>
          )}

          {/* Curiosity MSL Traverse Science Target Log (Gale Scope) */}
          {scopeMode === 'gale' && isValidRoute && (startPoint?.drillTarget || destPoint?.drillTarget) && (
            <div className="route-card mono">
              <h3 className="route-card-title">
                <Compass size={13} color="var(--accent-yellow)" /> CURIOSITY ROVER TRAVERSE LOG & DRILL SAMPLES
                <span style={{ marginLeft: 'auto', fontSize: '8px', color: '#10b981' }}>● REAL DATA: NASA MSL</span>
              </h3>
              <div className="route-gale-drill-grid">
                {startPoint?.drillTarget && (
                  <div className="route-drill-item">
                    <span className="route-drill-label">ORIGIN SCIENCE TARGET:</span>
                    <strong className="route-drill-val">{startPoint.name} (Sol {startPoint.sol})</strong>
                    <span className="route-drill-desc">{startPoint.drillTarget}</span>
                    {startPoint.cumulativeKm !== undefined && (
                      <span className="route-drill-odo">Odometer: {startPoint.cumulativeKm} km from Bradbury Landing</span>
                    )}
                  </div>
                )}
                {destPoint?.drillTarget && (
                  <div className="route-drill-item">
                    <span className="route-drill-label">DESTINATION SCIENCE TARGET:</span>
                    <strong className="route-drill-val">{destPoint.name} (Sol {destPoint.sol})</strong>
                    <span className="route-drill-desc">{destPoint.drillTarget}</span>
                    {destPoint.cumulativeKm !== undefined && (
                      <span className="route-drill-odo">Odometer: {destPoint.cumulativeKm} km from Bradbury Landing</span>
                    )}
                  </div>
                )}
              </div>
              <div className="route-gale-ext-link-row">
                <a
                  href="https://mars.nasa.gov/msl/mission/where-is-the-rover/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="route-gale-link"
                >
                  Verify on Official NASA MSL Route Map ("Where is the Rover?") <ExternalLink size={11} />
                </a>
              </div>
            </div>
          )}

          {/* Missing Data / Incomplete State */}
          {!isValidRoute && (
            <div className="route-card route-card--empty mono">
              <Navigation size={28} color="var(--accent-yellow)" style={{ opacity: 0.7 }} />
              <h4>AWAITING ROUTE WAYPOINTS</h4>
              <p>
                Click any two points on the map or choose curated landmarks from the dropdowns above to initiate terrain-aware routing and continuous elevation analysis.
              </p>
              <button
                type="button"
                className="route-preset-btn route-preset-btn--primary"
                onClick={() => loadPresetRoute('delta-front')}
              >
                Load Sample Jezero Route
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
