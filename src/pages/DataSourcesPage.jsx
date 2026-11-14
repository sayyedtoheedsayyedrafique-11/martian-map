import { useState, useMemo } from 'react';
import SearchBar from '../components/ui/SearchBar';
import dataSources, { sourceCategories } from '../data/dataSources';
import { ExternalLink, CheckCircle2, Radio, HardDrive, Archive, Filter } from 'lucide-react';
import './DataSourcesPage.css';

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
    </div>
  );
}

export default DataSourcesPage;
