import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MarsGlobe from '../components/MarsGlobe/MarsGlobe';
import MarsMap from '../components/MarsMap/MarsMap';
import JezeroTerrainViewer from '../components/Jezero3D/JezeroTerrainViewer';
import SearchBar from '../components/ui/SearchBar';
import marsLocations, { locationTypes } from '../data/marsLocations';
import { searchLocations, formatCoordinates } from '../utils/helpers';
import {
  MapPin,
  ExternalLink,
  Route,
  Compass,
  Copy,
  Check,
  X,
  Award,
  Globe,
  Layers,
  ArrowDown,
  Activity,
  Rocket,
  Box,
  Camera,
} from 'lucide-react';
import './MarsExplorer.css';

function MarsExplorer() {
  const [searchParams] = useSearchParams();
  const siteParam = searchParams.get('site');
  const mapSectionRef = useRef(null);
  const terrainSectionRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [viewMode, setViewMode] = useState('unified'); // 'unified' | 'globe' | 'terrain' | 'map'
  const [terrainFeatureId, setTerrainFeatureId] = useState('jezero-crater');

  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (siteParam) {
      return marsLocations.find((l) => l.id === siteParam) || null;
    }
    return marsLocations.find((l) => l.id === 'perseverance') || marsLocations[0];
  });
  const [prevSiteParam, setPrevSiteParam] = useState(siteParam);

  if (prevSiteParam !== siteParam) {
    setPrevSiteParam(siteParam);
    if (siteParam) {
      const match = marsLocations.find((l) => l.id === siteParam);
      if (match) {
        setSelectedLocation(match);
      }
    }
  }

  // Filter locations by search query and type
  let filteredLocations = searchLocations(marsLocations, searchQuery);
  if (selectedType !== 'all') {
    filteredLocations = filteredLocations.filter((loc) => loc.type === selectedType);
  }

  const handleCopyCoords = (lat, lng) => {
    const text = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    navigator.clipboard?.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const scrollToMap = (targetLoc) => {
    if (targetLoc) {
      setSelectedLocation(targetLoc);
    }
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExploreTerrain = (targetLoc) => {
    if (targetLoc) {
      setSelectedLocation(targetLoc);
    }
    setViewMode('terrain');
    terrainSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="mars-page fade-in">
      {/* Top Header & Mission Control Bar */}
      <div className="mars-page__header">
        <div className="mars-page__title-area">
          <div className="mars-tag-row">
            <span className="mars-sys-tag mono">NASA PDS // IAU AREOGRAPHIC FRAME</span>
            <span className="mars-sys-tag mars-sys-tag--accent mono">3D GLOBE + 2D FIELD GIS</span>
            <Link to="/data-explorer" className="mars-sys-tag mono" style={{ textDecoration: 'none', color: 'var(--accent-yellow)', borderColor: 'var(--accent-yellow)' }}>
              &rarr; LAUNCH PDS / CTX DATA EXPLORER
            </Link>
          </div>
          <h1 className="mars-page__title">Mars Surface Exploration & GIS</h1>
          <p className="mars-page__desc">
            Explore authentic Martian landing sites using an interactive 3D planetary globe mapped with verified NASA Viking MDIM 2.1 cartography and USGS Astrogeology basemaps.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="mars-view-switcher">
          <button
            type="button"
            className={`mars-view-btn ${viewMode === 'unified' ? 'mars-view-btn--active' : ''}`}
            onClick={() => setViewMode('unified')}
          >
            <Activity size={13} />
            <span>Overview</span>
          </button>
          <button
            type="button"
            className={`mars-view-btn ${viewMode === 'globe' ? 'mars-view-btn--active' : ''}`}
            onClick={() => setViewMode('globe')}
          >
            <Globe size={13} />
            <span>3D Globe</span>
          </button>
          <button
            type="button"
            className={`mars-view-btn ${viewMode === 'terrain' ? 'mars-view-btn--active' : ''}`}
            onClick={() => setViewMode('terrain')}
          >
            <Box size={13} />
            <span>3D Terrain (Jezero DEM)</span>
          </button>
          <button
            type="button"
            className={`mars-view-btn ${viewMode === 'map' ? 'mars-view-btn--active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <Layers size={13} />
            <span>2D GIS Map</span>
          </button>
        </div>
      </div>

      {/* 3D Jezero Crater Terrain Mode */}
      {viewMode === 'terrain' && (
        <section ref={terrainSectionRef} className="mars-terrain-section" aria-label="3D Jezero Crater Terrain Explorer">
          <div className="mars-section-header">
            <div className="mars-section-title-wrap">
              <span className="mars-subtag mono">REGIONAL 3D TOPOGRAPHY // CTX DEM 20M/PX</span>
              <h2 className="mars-section-heading">Jezero Crater 3D Elevation Mesh</h2>
            </div>
            <div className="mars-section-hint mono">
              <span>DRAG TO ORBIT • RIGHT-DRAG TO PAN • SCROLL TO ZOOM • HOVER FOR MOLA ELEVATION</span>
            </div>
          </div>

          <JezeroTerrainViewer
            height="74vh"
            selectedFeatureId={terrainFeatureId}
            onFeatureSelect={(f) => setTerrainFeatureId(f.id)}
          />
        </section>
      )}
      {/* 3D Mars Globe Section */}
      {(viewMode === 'unified' || viewMode === 'globe') && (
        <section className="mars-globe-section" aria-label="Interactive 3D Mars Globe">
          <div className="mars-section-header">
            <div className="mars-section-title-wrap">
              <span className="mars-subtag mono">ORBITAL VIEW</span>
              <h2 className="mars-section-heading">Planetary 3D Sphere</h2>
            </div>
            <div className="mars-section-hint mono">
              <span>DRAG TO ROTATE • SCROLL TO ZOOM • CLICK MARKERS TO INSPECT</span>
            </div>
          </div>

          <MarsGlobe
            locations={marsLocations}
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
            onScrollToMap={() => scrollToMap()}
            onExploreTerrain={() => handleExploreTerrain(selectedLocation)}
            height={viewMode === 'globe' ? '82vh' : '72vh'}
          />
        </section>
      )}

      {/* Selected Location Scientific Editorial Dossier */}
      {selectedLocation && (
        <section className="mars-dossier-section" aria-label="Selected Location Scientific Dossier">
          <div className="mars-location-detail-card">
            <div className="mars-detail-top">
              <div>
                <div className="mars-detail-tags">
                  <span className="mars-detail-tag">
                    {locationTypes[selectedLocation.type]?.label || selectedLocation.type}
                  </span>
                  <span className="mars-detail-status">{selectedLocation.status}</span>
                  {selectedLocation.catalogId && (
                    <span className="mars-detail-catalog mono">{selectedLocation.catalogId}</span>
                  )}
                </div>
                <h2 className="mars-detail-title">{selectedLocation.name}</h2>
                <span className="mars-detail-mission mono">
                  {selectedLocation.mission} • {selectedLocation.agency || 'NASA / USGS'}
                </span>
              </div>
              <button
                type="button"
                className="mars-detail-close"
                onClick={() => setSelectedLocation(null)}
                aria-label="Close location dossier"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mars-detail-body">
              <p className="mars-detail-text">{selectedLocation.description}</p>

              {selectedLocation.notableDiscovery && (
                <div className="mars-discovery-note">
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Award size={14} color="var(--accent-yellow)" /> Verified Scientific Finding:
                  </strong>
                  <span>{selectedLocation.notableDiscovery}</span>
                </div>
              )}

              {/* Scientific Metadata Grid */}
              <div className="mars-metadata-grid">
                <div className="mars-meta-item">
                  <span className="mars-meta-label">Areographic Coordinates:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mars-meta-value mono">{formatCoordinates(selectedLocation.lat, selectedLocation.lng)}</span>
                    <button
                      type="button"
                      className="mars-copy-btn"
                      onClick={() => handleCopyCoords(selectedLocation.lat, selectedLocation.lng)}
                      title="Copy decimal coordinates"
                    >
                      {copiedCoords ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      {copiedCoords ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="mars-meta-item">
                  <span className="mars-meta-label">Elevation Datum (MOLA Areoid):</span>
                  <span className="mars-meta-value">{selectedLocation.elevation || 'Not determined'}</span>
                </div>

                <div className="mars-meta-item">
                  <span className="mars-meta-label">Terrain Classification:</span>
                  <span className="mars-meta-value">{selectedLocation.terrainLabel || selectedLocation.terrainType}</span>
                </div>

                <div className="mars-meta-item">
                  <span className="mars-meta-label">Touchdown / Geological Era:</span>
                  <span className="mars-meta-value">{selectedLocation.landingDate || selectedLocation.geologicalEra || 'Documented'}</span>
                </div>
              </div>

              {/* Actions for Route Exploration and Citations */}
              <div className="mars-detail-actions">
                {['perseverance', 'curiosity', 'insight', 'spirit', 'opportunity'].includes(selectedLocation.id) && (
                  <Link
                    to={`/missions?mission=${['spirit', 'opportunity'].includes(selectedLocation.id) ? 'spirit-opportunity' : selectedLocation.id}`}
                    className="mars-btn-primary"
                  >
                    <Rocket size={14} /> Mission Intelligence
                  </Link>
                )}

                <Link
                  to={`/route-planner?start=${selectedLocation.id}`}
                  className={['perseverance', 'curiosity', 'insight', 'spirit', 'opportunity'].includes(selectedLocation.id) ? "mars-btn-secondary" : "mars-btn-primary"}
                >
                  <Route size={14} /> Plan Route as Origin (Point A)
                </Link>

                <Link
                  to={`/route-planner?dest=${selectedLocation.id}`}
                  className="mars-btn-secondary"
                >
                  <Compass size={14} /> Plan Route as Destination (Point B)
                </Link>

                <a
                  href={selectedLocation.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mars-btn-secondary"
                >
                  {selectedLocation.source} <ExternalLink size={12} />
                </a>

                <a
                  href={`https://trek.nasa.gov/mars/#v=0.1&x=${selectedLocation.lng.toFixed(4)}&y=${selectedLocation.lat.toFixed(4)}&z=7&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mars-btn-secondary"
                  title="Synchronize and open this landing site in NASA JPL Mars Trek"
                >
                  <Compass size={14} /> Open in NASA JPL Mars Trek <ExternalLink size={12} />
                </a>

                {selectedLocation.id === 'perseverance' && (
                  <Link
                    to="/raw-images"
                    className="mars-btn-primary"
                  >
                    <Camera size={14} /> In-Situ Raw Images
                  </Link>
                )}

                {selectedLocation.id === 'perseverance' && (
                  <button
                    type="button"
                    className="mars-btn-primary"
                    onClick={() => handleExploreTerrain(selectedLocation)}
                  >
                    <Box size={14} /> 3D Jezero Crater DEM Mesh
                  </button>
                )}

                <button
                  type="button"
                  className="mars-btn-secondary"
                  onClick={() => scrollToMap(selectedLocation)}
                >
                  <ArrowDown size={14} /> Center on 2D GIS Map
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2D High-Resolution Surface GIS Map Section */}
      {(viewMode === 'unified' || viewMode === 'map') && (
        <section ref={mapSectionRef} id="mars-surface-map" className="mars-surface-map-section">
          <div className="mars-section-header">
            <div className="mars-section-title-wrap">
              <span className="mars-subtag mono">SURFACE GIS RECONNAISSANCE</span>
              <h2 className="mars-section-heading">High-Resolution Cartographic Basemap</h2>
            </div>
            <div className="mars-search-compact">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search rovers, craters, or landmarks..."
              />
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="mars-category-bar">
            <button
              type="button"
              className={`mars-cat-btn ${selectedType === 'all' ? 'mars-cat-btn--active' : ''}`}
              onClick={() => setSelectedType('all')}
            >
              All Sites ({marsLocations.length})
            </button>
            {Object.entries(locationTypes).map(([key, { label }]) => {
              const count = marsLocations.filter((l) => l.type === key).length;
              return (
                <button
                  key={key}
                  type="button"
                  className={`mars-cat-btn ${selectedType === key ? 'mars-cat-btn--active' : ''}`}
                  onClick={() => setSelectedType(selectedType === key ? 'all' : key)}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {/* Main Focus: The Mars Map */}
          <div className="mars-map-section">
            <MarsMap
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
              filteredLocations={filteredLocations}
              canvasClassName="mars-map-canvas--explorer"
            />
          </div>
        </section>
      )}

      {/* Verified Locations Directory Grid */}
      <div className="mars-quick-list-section">
        <h3 className="mars-section-subtitle">
          <MapPin size={16} /> Verified Planetary Locations ({filteredLocations.length})
        </h3>
        
        {filteredLocations.length === 0 ? (
          <div className="mars-empty-search">
            <p>No verified planetary locations match &ldquo;{searchQuery}&rdquo;.</p>
            <button
              type="button"
              className="mars-reset-search-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="mars-quick-grid">
            {filteredLocations.map((loc) => {
              const isSelected = selectedLocation?.id === loc.id;
              return (
                <div
                  key={loc.id}
                  className={`mars-site-card ${isSelected ? 'mars-site-card--selected' : ''}`}
                  onClick={() => {
                    setSelectedLocation(loc);
                  }}
                >
                  <div className="mars-site-header">
                    <h4 className="mars-site-name">{loc.name}</h4>
                    <span className="mars-site-type">{locationTypes[loc.type]?.label}</span>
                  </div>
                  <div className="mars-site-coords mono">
                    {formatCoordinates(loc.lat, loc.lng)} • {loc.elevation}
                  </div>
                  <p className="mars-site-desc">
                    {loc.description.slice(0, 110)}...
                  </p>
                  <div className="mars-site-footer">
                    <span className="mars-site-status">{loc.status}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="mars-site-select-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocation(loc);
                        }}
                      >
                        Inspect
                      </button>
                      <Link
                        to={`/route-planner?start=${loc.id}`}
                        className="mars-site-select-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Route
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarsExplorer;