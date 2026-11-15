import { useState, useMemo, useEffect, useCallback } from 'react';
import ClassificationBadge from '../ui/ClassificationBadge';
import {
  PERSEVERANCE_CAMERAS,
  MARS_RAW_IMAGES,
  fetchLivePerseveranceRawImages,
} from '../../data/marsRawImages';
import {
  Camera,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Maximize2,
  Filter,
  Info,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Database,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  Download,
  ZoomIn,
  ZoomOut,
  Hash,
} from 'lucide-react';
import './PerseveranceRawGallery.css';

export default function PerseveranceRawGallery() {
  const [feedMode, setFeedMode] = useState('live'); // 'live' by default for real NASA feed
  const [selectedCamera, setSelectedCamera] = useState('all');
  const [selectedSol, setSelectedSol] = useState('all');
  const [customSolInput, setCustomSolInput] = useState('');
  const [activeModalIndex, setActiveModalIndex] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Live feed states
  const [liveImages, setLiveImages] = useState([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  // Available unique Sols from curated catalog
  const availableSols = useMemo(() => {
    const sols = Array.from(new Set(MARS_RAW_IMAGES.map((img) => img.sol))).sort((a, b) => b - a);
    return sols;
  }, []);

  // Fetch live NASA images
  const loadLiveFeed = useCallback(async (targetSol, targetCamera, targetPage = 0, append = false) => {
    setIsLiveLoading(true);
    setLiveError(null);
    try {
      const res = await fetchLivePerseveranceRawImages({
        sol: targetSol !== 'all' ? targetSol : undefined,
        camera: targetCamera !== 'all' ? targetCamera : undefined,
        page: targetPage,
        num: 28,
      });

      if (res.images && res.images.length > 0) {
        setLiveImages((prev) => (append ? [...prev, ...res.images] : res.images));
        setTotalResults(res.total || res.images.length);
        setPage(targetPage);
      } else if (!append) {
        setLiveImages([]);
        setTotalResults(0);
      }
      setIsLiveLoading(false);
    } catch (err) {
      console.warn('NASA live raw feed fetch error:', err);
      setLiveError(err.message || 'Unable to establish link with NASA Mars 2020 Raw Feed. Displaying verified local archive.');
      setIsLiveLoading(false);
    }
  }, []);

  // Trigger live feed when mode, sol, or camera changes
  useEffect(() => {
    let active = true;
    if (feedMode === 'live') {
      const timer = setTimeout(() => {
        if (active) {
          loadLiveFeed(selectedSol, selectedCamera, 0, false);
        }
      }, 0);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
  }, [feedMode, selectedSol, selectedCamera, loadLiveFeed]);

  const handleCustomSolSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(customSolInput.trim(), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setSelectedSol(parsed);
    }
  };

  const handleLoadMore = () => {
    if (feedMode === 'live' && !isLiveLoading) {
      loadLiveFeed(selectedSol, selectedCamera, page + 1, true);
    }
  };

  // Active list of images depending on mode
  const currentPool = feedMode === 'live' && liveImages.length > 0 ? liveImages : (feedMode === 'live' && liveError ? MARS_RAW_IMAGES : (feedMode === 'live' ? liveImages : MARS_RAW_IMAGES));

  // Filtered images
  const filteredImages = useMemo(() => {
    return currentPool.filter((img) => {
      const matchesCam = selectedCamera === 'all' || img.camera === selectedCamera;
      const matchesSol = selectedSol === 'all' || String(img.sol) === String(selectedSol);
      return matchesCam && matchesSol;
    });
  }, [currentPool, selectedCamera, selectedSol]);

  const activeModalImage = activeModalIndex !== null && filteredImages[activeModalIndex]
    ? filteredImages[activeModalIndex]
    : null;

  const handleImageError = (id) => {
    setImageLoadErrors((prev) => ({ ...prev, [id]: true }));
  };

  const handleOpenModal = (idx) => {
    setIsZoomed(false);
    setActiveModalIndex(idx);
  };

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Keyboard navigation: Esc closes, Arrow keys navigate
  useEffect(() => {
    if (activeModalIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalIndex(null);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsZoomed(false);
        setActiveModalIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsZoomed(false);
        setActiveModalIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalIndex, filteredImages.length]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setIsZoomed(false);
    setActiveModalIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setIsZoomed(false);
    setActiveModalIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="raw-gallery fade-in">
      {/* Top Header & Context */}
      <div className="raw-gallery__header">
        <div className="raw-gallery__title-area">
          <div className="raw-gallery__tag-row">
            <span className="raw-sys-tag mono">NASA MARS 2020 // PERSEVERANCE ARCHIVE</span>
            <span className="raw-sys-tag mono" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              ● REAL DATA - NASA Raw Images
            </span>
            <a
              href="https://mars.nasa.gov/mars2020/multimedia/raw-images/"
              target="_blank"
              rel="noopener noreferrer"
              className="raw-sys-tag mono raw-sys-tag--link"
            >
              OFFICIAL NASA RAW REPOSITORY &rarr;
            </a>
          </div>
          <h2 className="raw-gallery__title">Perseverance In-Situ Raw Image Gallery</h2>
          <p className="raw-gallery__desc">
            Direct public domain downlinks acquired by NASA's Mars 2020 Perseverance rover and Ingenuity helicopter inside Jezero Crater. Explore verified engineering and science frames with real sol/camera telemetry.
          </p>
        </div>

        {/* Live Feed vs Curated Toggle */}
        <div className="raw-feed-toggle-box mono">
          <button
            type="button"
            className={`raw-feed-toggle-btn ${feedMode === 'live' ? 'raw-feed-toggle-btn--active' : ''}`}
            onClick={() => setFeedMode('live')}
          >
            <Wifi size={12} />
            <span>NASA Live Feed (Real-Time Raw Gallery)</span>
            {feedMode === 'live' && isLiveLoading && <RefreshCw size={10} className="raw-spinner" />}
          </button>
          <button
            type="button"
            className={`raw-feed-toggle-btn ${feedMode === 'curated' ? 'raw-feed-toggle-btn--active' : ''}`}
            onClick={() => setFeedMode('curated')}
          >
            <Database size={12} />
            <span>Curated Milestones ({MARS_RAW_IMAGES.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Camera, Sol, and Search */}
      <div className="raw-gallery__toolbar">
        {/* Camera Filters */}
        <div className="raw-gallery__filter-group">
          <div className="raw-gallery__filter-label mono">
            <Filter size={13} color="var(--accent-yellow, #f5c542)" />
            <span>INSTRUMENT CAMERA:</span>
          </div>
          <div className="raw-gallery__filter-pills">
            {PERSEVERANCE_CAMERAS.map((cam) => {
              const count = currentPool.filter((img) => cam.id === 'all' || img.camera === cam.id).length;
              const isActive = selectedCamera === cam.id;

              return (
                <button
                  key={cam.id}
                  type="button"
                  className={`raw-filter-btn ${isActive ? 'raw-filter-btn--active' : ''}`}
                  onClick={() => setSelectedCamera(cam.id)}
                >
                  <span>{cam.label}</span>
                  <span className="raw-filter-count mono">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sol Filter & Custom Sol Search */}
        <div className="raw-gallery__sol-filter-row mono">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={13} color="var(--accent-yellow, #f5c542)" />
            <span className="raw-gallery__filter-label">MARTIAN SOL:</span>
          </div>

          <div className="raw-gallery__sol-pills">
            <button
              type="button"
              className={`raw-sol-btn ${selectedSol === 'all' ? 'raw-sol-btn--active' : ''}`}
              onClick={() => setSelectedSol('all')}
            >
              Latest Downlinks
            </button>
            {availableSols.slice(0, 10).map((sol) => (
              <button
                key={sol}
                type="button"
                className={`raw-sol-btn ${String(selectedSol) === String(sol) ? 'raw-sol-btn--active' : ''}`}
                onClick={() => setSelectedSol(sol)}
              >
                Sol {sol}
              </button>
            ))}
          </div>

          {/* Custom Sol Input */}
          <form onSubmit={handleCustomSolSubmit} className="raw-custom-sol-form">
            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>JUMP TO SOL:</span>
            <input
              type="number"
              min="0"
              max="3500"
              placeholder="e.g. 2031"
              value={customSolInput}
              onChange={(e) => setCustomSolInput(e.target.value)}
              className="raw-sol-input mono"
            />
            <button type="submit" className="raw-sol-go-btn mono">GO</button>
          </form>

          {selectedSol !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedSol('all')}
              className="raw-sol-clear-btn mono"
              title="Clear Sol Filter"
            >
              Reset to All Sols &times;
            </button>
          )}
        </div>
      </div>

      {/* Live Loading State */}
      {feedMode === 'live' && isLiveLoading && (
        <div className="raw-gallery__loading mono">
          <RefreshCw size={18} className="raw-spinner" color="var(--accent-yellow, #f5c542)" />
          <span>QUERYING OFFICIAL NASA PERSEVERANCE RAW IMAGES REPOSITORY...</span>
        </div>
      )}

      {/* Live Error State */}
      {feedMode === 'live' && liveError && (
        <div className="raw-gallery__error mono">
          <AlertTriangle size={18} color="#ef4444" />
          <div style={{ flex: 1 }}>
            <strong>NASA LIVE FEED DIAGNOSTIC: {liveError}</strong>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>
              Displayed genuine NASA cached photographs and telemetry frames from our verified archive.
            </p>
          </div>
          <button
            type="button"
            className="raw-error-retry-btn"
            onClick={() => loadLiveFeed(selectedSol, selectedCamera, 0, false)}
          >
            Retry Connection
          </button>
          <button
            type="button"
            className="raw-error-switch-btn"
            onClick={() => setFeedMode('curated')}
          >
            View Curated
          </button>
        </div>
      )}

      {/* Results Count Banner */}
      {!isLiveLoading && (
        <div className="raw-results-bar mono">
          <span>
            DISPLAYING <strong>{filteredImages.length}</strong> AUTHENTIC NASA PHOTOGRAPHS
            {totalResults > filteredImages.length ? ` (OF ${totalResults.toLocaleString()} RECEPTIONS)` : ''}
            {selectedCamera !== 'all' && ` • CAMERA: ${selectedCamera}`}
            {selectedSol !== 'all' && ` • SOL: ${selectedSol}`}
          </span>
          <span style={{ color: '#10b981', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={11} /> 100% REAL NASA MARS PHOTOGRAPHS
          </span>
        </div>
      )}

      {/* Image Grid */}
      {!isLiveLoading && filteredImages.length === 0 ? (
        <div className="raw-gallery__empty mono">
          <Info size={18} color="var(--accent-yellow, #f5c542)" />
          <p>No verified raw photographs found matching Camera: {selectedCamera} and Sol: {selectedSol}. Try selecting &ldquo;Latest Downlinks&rdquo; or another camera instrument.</p>
        </div>
      ) : (
        <div className="raw-gallery__grid">
          {filteredImages.map((img, idx) => {
            const hasError = imageLoadErrors[img.id];

            return (
              <div
                key={img.id || idx}
                className="raw-card"
                onClick={() => handleOpenModal(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleOpenModal(idx);
                }}
              >
                <div className="raw-card__image-box">
                  {img.hasCornerBadge && (
                    <span className="raw-card__corner-badge" title="Authentic NASA Raw Frame Indicator" />
                  )}
                  {hasError ? (
                    <div className="raw-card__image-fallback mono">
                      <Camera size={24} />
                      <span style={{ color: '#f87171' }}>Original frame link offline</span>
                      <span style={{ fontSize: '8px', color: '#94a3b8' }}>ID: {img.id}</span>
                      <a
                        href={img.sourceUrl || img.officialArchiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: '#38bdf8', fontSize: '8px', textDecoration: 'underline', marginTop: '4px' }}
                      >
                        Inspect on NASA Portal &rarr;
                      </a>
                    </div>
                  ) : (
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      loading="lazy"
                      onError={() => handleImageError(img.id)}
                      className="raw-card__img"
                    />
                  )}
                  <span className="raw-card__sol-chip mono">SOL {img.sol}</span>
                  {img.isFeatured && (
                    <span className="raw-card__featured-chip mono">FEATURED</span>
                  )}
                  <span className="raw-card__expand-icon" title="Expand Photograph">
                    <Maximize2 size={13} />
                  </span>
                </div>

                <div className="raw-card__body">
                  <div className="raw-card__id-row mono">
                    <span className="raw-card__id-pill" title={`Official NASA Image ID: ${img.id}`}>
                      <Hash size={9} />
                      {img.id ? (img.id.length > 20 ? `${img.id.substring(0, 18)}...` : img.id) : 'NASA-RAW'}
                    </span>
                    <span className="raw-card__camera-badge">{img.camera}</span>
                  </div>

                  <h3 className="raw-card__heading" title={img.title}>{img.title}</h3>

                  <div className="raw-card__meta-grid mono">
                    <div className="raw-card__meta-cell">
                      <Calendar size={10} color="var(--accent-yellow)" />
                      <span>{img.dateEarthFormatted || 'Earth Date N/A'}</span>
                    </div>
                    <div className="raw-card__meta-cell">
                      <Clock size={10} color="#38bdf8" />
                      <span>{img.ltst || `Sol ${img.sol}`}</span>
                    </div>
                  </div>

                  <div className="raw-card__footer-row mono">
                    <span className="raw-card__credit" title={img.credit}>
                      {img.credit || 'NASA/JPL-Caltech'}
                    </span>
                    <ClassificationBadge type="actual" size="sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button for Live Feed */}
      {feedMode === 'live' && !isLiveLoading && filteredImages.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <button
            type="button"
            className="raw-load-more-btn mono"
            onClick={handleLoadMore}
          >
            <span>LOAD MORE NASA RAW PHOTOGRAPHS</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* Lightbox Large Viewer Modal with Arrow Navigation & Metadata */}
      {activeModalImage && (
        <div
          className="raw-modal-overlay"
          onClick={() => setActiveModalIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="raw-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous / Next Arrow Controls */}
            <button
              type="button"
              className="raw-modal__nav-btn raw-modal__nav-btn--prev"
              onClick={handlePrevImage}
              title="Previous Photograph (Left Arrow)"
              aria-label="Previous photograph"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="raw-modal__nav-btn raw-modal__nav-btn--next"
              onClick={handleNextImage}
              title="Next Photograph (Right Arrow)"
              aria-label="Next photograph"
            >
              <ChevronRight size={20} />
            </button>

            <div className="raw-modal__header">
              <div className="raw-modal__title-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span className="raw-modal__badge mono">
                    {activeModalImage.cameraFullName} • SOL {activeModalImage.sol}
                  </span>
                  <ClassificationBadge type="actual" size="sm" />
                  <span className="mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    ({activeModalIndex + 1} of {filteredImages.length})
                  </span>
                </div>
                <h3 className="raw-modal__title">{activeModalImage.title}</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="raw-modal__ctrl-btn"
                  onClick={() => setIsZoomed((prev) => !prev)}
                  title={isZoomed ? "Reset Zoom" : "Zoom High-Res"}
                >
                  {isZoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
                </button>
                <a
                  href={activeModalImage.imageUrl}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                  className="raw-modal__ctrl-btn"
                  title="Download Original NASA Image File"
                >
                  <Download size={15} />
                </a>
                <button
                  type="button"
                  className="raw-modal__close-btn"
                  onClick={() => setActiveModalIndex(null)}
                  aria-label="Close photograph details (Esc)"
                  title="Close viewer (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={`raw-modal__media-container ${isZoomed ? 'raw-modal__media-container--zoomed' : ''}`}>
              <img
                src={activeModalImage.imageUrl}
                alt={activeModalImage.title}
                className={`raw-modal__full-img ${isZoomed ? 'raw-modal__full-img--zoomed' : ''}`}
              />
            </div>

            {/* Complete Scientific Metadata Table */}
            <div className="raw-modal__details-grid mono">
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">NASA IMAGE ID:</span>
                <span className="raw-modal__val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <code style={{ color: '#38bdf8' }}>{activeModalImage.id}</code>
                  <button
                    type="button"
                    onClick={() => handleCopyId(activeModalImage.id)}
                    className="raw-copy-id-btn"
                    title="Copy NASA Image ID"
                  >
                    {copiedId ? <Check size={10} color="#10b981" /> : <Copy size={10} />}
                  </button>
                </span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">CAMERA INSTRUMENT:</span>
                <span className="raw-modal__val">{activeModalImage.cameraFullName || activeModalImage.camera}</span>
              </div>
              {activeModalImage.filterName && (
                <div className="raw-modal__detail-item">
                  <span className="raw-modal__label">OPTICAL FILTER:</span>
                  <span className="raw-modal__val">{activeModalImage.filterName}</span>
                </div>
              )}
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">MISSION SOL:</span>
                <span className="raw-modal__val" style={{ color: 'var(--accent-yellow)', fontWeight: 'bold' }}>Sol {activeModalImage.sol}</span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">EARTH TIMESTAMP (UTC):</span>
                <span className="raw-modal__val">
                  <Calendar size={11} style={{ marginRight: '4px', display: 'inline' }} />
                  {activeModalImage.dateEarthFormatted || activeModalImage.dateUtc}
                </span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">MARTIAN LOCAL TIME:</span>
                <span className="raw-modal__val">
                  <Clock size={11} style={{ marginRight: '4px', display: 'inline' }} />
                  {activeModalImage.ltst || 'not provided'}
                </span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">IMAGE CREDIT & CITATION:</span>
                <span className="raw-modal__val">{activeModalImage.credit || 'NASA/JPL-Caltech'}</span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">DATA PROVENANCE:</span>
                <span className="raw-modal__val">
                  <ClassificationBadge type="actual" customLabel="AUTHENTIC NASA DOWNLINK" size="sm" />
                </span>
              </div>
            </div>

            {activeModalImage.caption && (
              <div className="raw-modal__caption-box">
                <p className="raw-modal__caption">{activeModalImage.caption}</p>
                {activeModalImage.scientificSignificance && (
                  <div className="raw-modal__significance">
                    <strong className="mono">SCIENTIFIC SIGNIFICANCE:</strong>
                    <p>{activeModalImage.scientificSignificance}</p>
                  </div>
                )}
              </div>
            )}

            <div className="raw-modal__footer">
              <div className="raw-modal__verified mono">
                <CheckCircle2 size={13} color="var(--status-nominal)" />
                <span>OFFICIAL NASA MARS 2020 / JPL RAW REPOSITORY</span>
              </div>
              <a
                href={activeModalImage.sourceUrl || activeModalImage.officialArchiveUrl || 'https://mars.nasa.gov/mars2020/multimedia/raw-images/'}
                target="_blank"
                rel="noopener noreferrer"
                className="raw-modal__ext-link mono"
              >
                <span>OPEN OFFICIAL NASA IMAGE PAGE</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
