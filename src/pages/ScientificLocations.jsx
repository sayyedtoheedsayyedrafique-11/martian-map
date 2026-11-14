import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/ui/SearchBar';
import marsLocations, { locationTypes } from '../data/marsLocations';
import { searchLocations, formatCoordinates } from '../utils/helpers';
import { ExternalLink, Globe, Route, Compass, Award, Rocket, Filter, Box } from 'lucide-react';
import './ScientificLocations.css';

function ScientificLocations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [agencyFilter, setAgencyFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = searchLocations(marsLocations, searchQuery);
    if (filterType !== 'all') {
      result = result.filter((loc) => loc.type === filterType);
    }
    if (agencyFilter !== 'all') {
      result = result.filter((loc) => (loc.agency || '').toLowerCase().includes(agencyFilter.toLowerCase()));
    }
    return result;
  }, [searchQuery, filterType, agencyFilter]);

  return (
    <div className="locations-page fade-in">
      <div className="locations-page__header">
        <div className="locations-tag-row">
          <span className="locations-sys-tag mono">NASA PDS // USGS GAZETTEER</span>
          <span className="locations-sys-tag locations-sys-tag--accent mono">16 VERIFIED PLANETARY MONUMENTS</span>
        </div>
        <h1 className="locations-page__title">Mars Scientific Locations & Landing Sites</h1>
        <p className="locations-page__subtitle">
          Documented catalog of robotic rovers, stationary landers, aerial scouts, and prominent geological monuments with verified coordinates from NASA, ESA, CNSA, and USGS records.
        </p>
      </div>

      {/* Summary Altimetry / Fleet Counter */}
      <div className="locations-summary-strip">
        <div className="locations-summary-item mono">
          <span className="locations-summary-key">CATALOGED SITES</span>
          <span className="locations-summary-val">{marsLocations.length} Verified</span>
        </div>
        <div className="locations-summary-item mono">
          <span className="locations-summary-key">ACTIVE MISSIONS</span>
          <span className="locations-summary-val" style={{ color: 'var(--status-online)' }}>
            Perseverance, Curiosity
          </span>
        </div>
        <div className="locations-summary-item mono">
          <span className="locations-summary-key">ELEVATION DATUM</span>
          <span className="locations-summary-val">MOLA Areoid (610.5 Pa)</span>
        </div>
        <div className="locations-summary-item mono">
          <span className="locations-summary-key">COORDINATE FRAME</span>
          <span className="locations-summary-val">IAU 2000 Areographic</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="locations-controls">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by rover name, landing site, crater, or landmark..."
        />

        <div className="locations-filter-group">
          <button
            type="button"
            className={`locations-filter-btn ${filterType === 'all' ? 'locations-filter-btn--active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Sites ({marsLocations.length})
          </button>
          {Object.entries(locationTypes).map(([key, { label }]) => {
            const count = marsLocations.filter((l) => l.type === key).length;
            return (
              <button
                key={key}
                type="button"
                className={`locations-filter-btn ${filterType === key ? 'locations-filter-btn--active' : ''}`}
                onClick={() => setFilterType(key)}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Agency Sub-Filters */}
        <div className="locations-agency-row">
          <span className="locations-agency-label mono">
            <Filter size={11} color="var(--accent-yellow)" /> AGENCY:
          </span>
          <button
            type="button"
            className={`locations-agency-btn ${agencyFilter === 'all' ? 'locations-agency-btn--active' : ''}`}
            onClick={() => setAgencyFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`locations-agency-btn ${agencyFilter === 'nasa' ? 'locations-agency-btn--active' : ''}`}
            onClick={() => setAgencyFilter('nasa')}
          >
            NASA / JPL
          </button>
          <button
            type="button"
            className={`locations-agency-btn ${agencyFilter === 'cnsa' ? 'locations-agency-btn--active' : ''}`}
            onClick={() => setAgencyFilter('cnsa')}
          >
            CNSA
          </button>
          <button
            type="button"
            className={`locations-agency-btn ${agencyFilter === 'usgs' ? 'locations-agency-btn--active' : ''}`}
            onClick={() => setAgencyFilter('usgs')}
          >
            USGS Nomenclature
          </button>
        </div>
      </div>

      {/* Grid of Locations */}
      {filtered.length === 0 ? (
        <div className="locations-empty">
          <p>No locations match &ldquo;{searchQuery}&rdquo;. Try another search term or reset the category filter.</p>
          <button
            type="button"
            className="locations-reset-btn"
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setAgencyFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="locations-grid">
          {filtered.map((loc) => {
            const typeLabel = locationTypes[loc.type]?.label || loc.type;

            return (
              <div key={loc.id} className="location-card">
                <div className="location-card__header">
                  <div className="location-card__tags">
                    <span className="location-tag">{typeLabel}</span>
                    <span className="location-status">{loc.status}</span>
                    {loc.catalogId && (
                      <span className="location-catalog mono">{loc.catalogId}</span>
                    )}
                  </div>
                  <h2 className="location-card__title">{loc.name}</h2>
                  {loc.mission && (
                    <span className="location-card__mission">
                      {loc.mission} • {loc.agency || 'NASA / USGS'}
                    </span>
                  )}
                </div>

                <div className="location-card__body">
                  <p className="location-card__desc">{loc.description}</p>

                  {loc.notableDiscovery && (
                    <div className="location-card__discovery">
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={13} color="var(--accent-yellow)" /> Scientific Finding:
                      </strong>
                      <span>{loc.notableDiscovery}</span>
                    </div>
                  )}

                  <div className="location-card__meta">
                    <div className="location-meta-col">
                      <span className="location-meta-label">Areographic Coordinates</span>
                      <span className="location-meta-value mono">{formatCoordinates(loc.lat, loc.lng)}</span>
                    </div>
                    <div className="location-meta-col">
                      <span className="location-meta-label">MOLA Datum Elevation</span>
                      <span className="location-meta-value">{loc.elevation || 'Not determined'}</span>
                    </div>
                    <div className="location-meta-col">
                      <span className="location-meta-label">Terrain Classification</span>
                      <span className="location-meta-value">{loc.terrainLabel || loc.terrainType}</span>
                    </div>
                    <div className="location-meta-col">
                      <span className="location-meta-label">Touchdown / Geological Era</span>
                      <span className="location-meta-value">{loc.landingDate || loc.geologicalEra || 'Documented'}</span>
                    </div>
                  </div>
                </div>

                <div className="location-card__footer">
                  <div className="location-card__actions">
                    <Link to={`/?site=${loc.id}`} className="location-action-btn" title="View on 3D Globe & Map">
                      <Globe size={13} /> 3D Globe View
                    </Link>
                    {loc.id === 'perseverance' && (
                      <Link to="/jezero" className="location-action-btn location-action-btn--jezero" title="Explore 3D Jezero Crater DEM">
                        <Box size={13} /> 3D Jezero DEM
                      </Link>
                    )}
                    {['perseverance', 'curiosity', 'insight', 'spirit', 'opportunity'].includes(loc.id) && (
                      <Link
                        to={`/missions?mission=${['spirit', 'opportunity'].includes(loc.id) ? 'spirit-opportunity' : loc.id}`}
                        className="location-action-btn"
                        title="View Mission Intelligence"
                      >
                        <Rocket size={13} /> Mission Intel
                      </Link>
                    )}
                    <Link to={`/route-planner?start=${loc.id}`} className="location-action-btn" title="Set as Route Origin (Point A)">
                      <Route size={13} /> Route Origin (A)
                    </Link>
                    <Link to={`/route-planner?dest=${loc.id}`} className="location-action-btn" title="Set as Route Destination (Point B)">
                      <Compass size={13} /> Dest (B)
                    </Link>
                  </div>

                  <a
                    href={loc.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="location-source-link"
                  >
                    NASA Archive <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ScientificLocations;
