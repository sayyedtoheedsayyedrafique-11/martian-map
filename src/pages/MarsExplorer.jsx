import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MarsGlobe from '../components/MarsGlobe/MarsGlobe';
import MarsMap from '../components/MarsMap/MarsMap';
import JezeroTerrainViewer from '../components/Jezero3D/JezeroTerrainViewer';
import SearchBar from '../components/ui/SearchBar';
import ClassificationBadge from '../components/ui/ClassificationBadge';
import MetadataInspector from '../components/ui/MetadataInspector';
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
  Activity,
  Box,
  Camera,
  SlidersHorizontal,
} from 'lucide-react';
import './MarsExplorer.css';

function MarsExplorer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteParam = searchParams.get('site');
  const viewParam = searchParams.get('view');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [copiedCoords, setCopiedCoords] = useState(false);
  // Default viewMode is 'map' — Map-Centric Primary Focus
  const [viewMode, setViewMode] = useState(() => (viewParam === 'globe' ? 'globe' : viewParam === 'terrain' ? 'terrain' : 'map'));
  const [terrainFeatureId, setTerrainFeatureId] = useState('jezero-crater');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeBasemap, setActiveBasemap] = useState('viking');

  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (siteParam) {
      return marsLocations.find((l) => l.id === siteParam) || marsLocations[0];
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
        setIsDrawerOpen(true);
      }
    }
  }

  // Filter locations by search query and type
  const filteredLocations = useMemo(() => {
    let results = searchLocations(marsLocations, searchQuery);
    if (selectedType !== 'all') {
      results = results.filter((loc) => loc.type === selectedType);
    }
    return results;
  }, [searchQuery, selectedType]);

  const handleCopyCoords = (lat, lng) => {
    const text = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    navigator.clipboard?.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setIsDrawerOpen(true);
  };

  return (
    <div className="mars-page mars-page--workstation fade-in">
      {/* Workstation Viewport Sub-Toolbar (Streamlined, Non-Redundant) */}
      <div className="mars-workstation__subtoolbar" aria-label="Workstation View Controls">
        <div className="mars-workstation__view-controls">
          <div className="mars-view-switcher" role="tablist" aria-label="Workstation View Modes">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'map'}
              className={`mars-view-btn ${viewMode === 'map' ? 'mars-view-btn--active' : ''}`}
              onClick={() => setViewMode('map')}
              title="2D Cartographic Basemap (USGS / NASA Mars Trek)"
            >
              <Layers size={12} />
              <span>2D Map</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'globe'}
              className={`mars-view-btn ${viewMode === 'globe' ? 'mars-view-btn--active' : ''}`}
              onClick={() => setViewMode('globe')}
              title="Interactive 3D Planetary Sphere"
            >
              <Globe size={12} />
              <span>3D Globe</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'terrain'}
              className={`mars-view-btn ${viewMode === 'terrain' ? 'mars-view-btn--active' : ''}`}
              onClick={() => setViewMode('terrain')}
              title="3D Jezero Crater DEM Elevation Mesh (20m/px)"
            >
              <Box size={12} />
              <span>3D Jezero</span>
            </button>
          </div>

          <span className="mars-sys-tag mono">MOLA AREOID (610.5 Pa)</span>
          <ClassificationBadge type="actual" customLabel="ACTUAL GIS" size="sm" />
        </div>

        {/* Toggle Right Mission Data Drawer */}
        <button
          type="button"
          className={`mars-drawer-toggle-btn ${isDrawerOpen ? 'mars-drawer-toggle-btn--active' : ''}`}
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          title="Toggle Target Science Dossier Drawer"
          aria-expanded={isDrawerOpen}
        >
          <SlidersHorizontal size={12} />
          <span>Target Dossier</span>
          {selectedLocation && <span className="mars-drawer-indicator" />}
        </button>
      </div>

      {/* Main Expansive Viewport Workstation Canvas & Sliding Drawer Container */}
      <main className="mars-workstation-viewport" aria-label="Mars Surface Exploration Canvas">
        <div className="mars-workstation-canvas-container">
          {/* Active Workstation View Mode */}
          {viewMode === 'map' && (
            <div className="mars-viewport-map-wrapper">
              <MarsMap
                selectedLocation={selectedLocation}
                onLocationSelect={handleSelectLocation}
                filteredLocations={filteredLocations}
                height="100%"
                canvasClassName="mars-map-canvas--full-viewport"
                activeLayer={activeBasemap}
                onLayerChange={setActiveBasemap}
              />
            </div>
          )}

          {viewMode === 'globe' && (
            <div className="mars-viewport-3d-wrapper">
              <div className="mars-3d-hud-hint mono">
                <span>ORBITAL VIEW // DRAG TO ROTATE • SCROLL TO ZOOM • CLICK TARGET TO INSPECT</span>
              </div>
              <MarsGlobe
                locations={filteredLocations}
                selectedLocation={selectedLocation}
                onLocationSelect={handleSelectLocation}
                onExploreTerrain={() => setViewMode('terrain')}
                height="100%"
              />
            </div>
          )}

          {viewMode === 'terrain' && (
            <div className="mars-viewport-3d-wrapper">
              <div className="mars-3d-hud-hint mono">
                <span>REGIONAL 3D CTX DEM (20M/PX) // DRAG TO ORBIT • RIGHT-DRAG TO PAN • SCROLL TO ZOOM</span>
              </div>
              <JezeroTerrainViewer
                height="100%"
                selectedFeatureId={terrainFeatureId}
                onFeatureSelect={(f) => setTerrainFeatureId(f.id)}
              />
            </div>
          )}
        </div>

        {/* Collapsible Sliding Right-Hand Mission Data Drawer */}
        <aside
          className={`mars-mission-drawer ${isDrawerOpen ? 'mars-mission-drawer--open' : ''}`}
          aria-label="Selected Target Mission Dossier"
          aria-hidden={!isDrawerOpen}
        >
          {selectedLocation ? (
            <div className="mars-drawer-content">
              {/* Drawer Header */}
              <div className="mars-drawer-header">
                <div className="mars-drawer-badge-row">
                  <ClassificationBadge
                    type="actual"
                    customLabel={selectedLocation.type === 'landmark' ? 'IAU VERIFIED LANDMARK' : 'VERIFIED IN-SITU ROVER'}
                    size="sm"
                  />
                  <span className="mars-drawer-status mono">{selectedLocation.status}</span>
                </div>
                <div className="mars-drawer-title-row">
                  <div>
                    <h2 className="mars-drawer-title">{selectedLocation.name}</h2>
                    <span className="mars-drawer-mission mono">
                      {selectedLocation.mission} • {selectedLocation.agency || 'NASA / USGS'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mars-drawer-close-btn"
                    onClick={() => setIsDrawerOpen(false)}
                    aria-label="Collapse Mission Drawer"
                    title="Collapse Drawer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="mars-drawer-body">
                <p className="mars-drawer-desc">{selectedLocation.description}</p>

                {selectedLocation.notableDiscovery && (
                  <div className="mars-drawer-discovery">
                    <strong className="mono">
                      <Award size={13} className="mars-discovery-icon" />
                      NOTABLE SCIENTIFIC DISCOVERY
                    </strong>
                    <p>{selectedLocation.notableDiscovery}</p>
                  </div>
                )}

                {/* Standardized Scientific Metadata Inspector */}
                <MetadataInspector
                  title="TARGET SCIENTIFIC PROVENANCE"
                  classification="actual"
                  customClassificationLabel="NASA PDS / USGS DATUM"
                  platform={selectedLocation.mission}
                  instrument={selectedLocation.terrainLabel}
                  sol={selectedLocation.status?.includes('Sol') ? selectedLocation.status.match(/Sol\s+(\d+\+?)/)?.[0] : undefined}
                  coordinates={{
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    datum: 'MOLA Areoid (610.5 Pa)',
                  }}
                  elevation={selectedLocation.elevation}
                  geologicUnit={selectedLocation.geologicalEra || 'USGS SIM 3292'}
                  sourceName={selectedLocation.source || 'NASA Planetary Data System (PDS)'}
                  sourceUrl={selectedLocation.sourceUrl}
                  doiOrCatalogId={selectedLocation.catalogId}
                  processingStatus="Verified Planetary Telemetry"
                />

                {/* Deep-Link Actions */}
                <div className="mars-drawer-actions">
                  <span className="mars-drawer-actions-label mono">TACTICAL NAVIGATION & CITATIONS:</span>
                  <div className="mars-drawer-btn-grid">
                    <button
                      type="button"
                      className="mars-drawer-btn mars-drawer-btn--primary"
                      onClick={() => navigate(`/route-planner?start=${selectedLocation.id}`)}
                      title="Set target as route origin Point A"
                    >
                      <Route size={12} />
                      <span>Route From Here (A)</span>
                    </button>
                    <button
                      type="button"
                      className="mars-drawer-btn"
                      onClick={() => navigate(`/route-planner?dest=${selectedLocation.id}`)}
                      title="Set target as route destination Point B"
                    >
                      <Compass size={12} />
                      <span>Route To Here (B)</span>
                    </button>
                    <a
                      href={`https://trek.nasa.gov/mars/#v=0.1&x=${selectedLocation.lng.toFixed(4)}&y=${selectedLocation.lat.toFixed(4)}&z=6&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mars-drawer-btn mars-drawer-btn--ext"
                    >
                      <span>Open in NASA Mars Trek</span>
                      <ExternalLink size={11} />
                    </a>
                    {selectedLocation.id === 'perseverance' && (
                      <Link to="/raw-images" className="mars-drawer-btn mars-drawer-btn--accent">
                        <Camera size={12} />
                        <span>In-Situ Raw Images</span>
                      </Link>
                    )}
                    {selectedLocation.id === 'curiosity' && (
                      <Link to="/route-planner" className="mars-drawer-btn mars-drawer-btn--accent">
                        <Activity size={12} />
                        <span>Curiosity Gale Dossier</span>
                      </Link>
                    )}
                    {(selectedLocation.id === 'perseverance' || selectedLocation.id === 'jezero') && (
                      <button
                        type="button"
                        className="mars-drawer-btn"
                        onClick={() => setViewMode('terrain')}
                      >
                        <Box size={12} />
                        <span>View 3D CTX DEM</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="mars-drawer-btn"
                      onClick={() => handleCopyCoords(selectedLocation.lat, selectedLocation.lng)}
                    >
                      {copiedCoords ? <Check size={12} color="var(--status-nominal)" /> : <Copy size={12} />}
                      <span>{copiedCoords ? 'Copied IAU Coords!' : 'Copy IAU Coords'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mars-drawer-empty mono">
              <span>SELECT A MARS ROVER, CRATER, OR LANDMARK PIN TO INSPECT SCIENTIFIC DOSSIER.</span>
            </div>
          )}
        </aside>
      </main>

      {/* Directory & Search Explorer Footer Drawer Section */}
      <section className="mars-locations-browser" aria-label="Mars Surface Sites Directory">
        <div className="mars-locations-browser__header">
          <div className="mars-locations-browser__title-wrap">
            <h3 className="mars-locations-browser__title mono">
              <MapPin size={14} className="mars-locations-browser__icon" />
              PLANETARY CATALOG DIRECTORY ({filteredLocations.length} SITES)
            </h3>
            <span className="mars-locations-browser__subtitle">
              Browse all 12 verified NASA & USGS surface targets across Mars. Click any card to center map and open dossier.
            </span>
          </div>

          {/* Search input */}
          <div className="mars-search-wrap">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search landing sites, craters, volcanoes..."
            />
          </div>
        </div>

        {/* Filter Pills */}
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

        {/* Location Cards Grid */}
        <div className="mars-quick-grid">
          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            return (
              <div
                key={loc.id}
                className={`mars-site-card ${isSelected ? 'mars-site-card--selected' : ''}`}
                onClick={() => handleSelectLocation(loc)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectLocation(loc)}
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
                  <ClassificationBadge type="actual" size="sm" />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="mars-site-select-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectLocation(loc);
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
      </section>
    </div>
  );
}

export default MarsExplorer;
