import { useState, useMemo, useEffect, useCallback } from 'react';
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
  Compass,
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
} from 'lucide-react';
import './PerseveranceRawGallery.css';

export default function PerseveranceRawGallery() {
  const [feedMode, setFeedMode] = useState('curated'); // 'curated' | 'live'
  const [selectedCamera, setSelectedCamera] = useState('all');
  const [selectedSol, setSelectedSol] = useState('all');
  const [activeModalIndex, setActiveModalIndex] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  // Live feed states
  const [liveImages, setLiveImages] = useState([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  // Available unique Sols from curated catalog
  const availableSols = useMemo(() => {
    const sols = Array.from(new Set(MARS_RAW_IMAGES.map((img) => img.sol))).sort((a, b) => a - b);
    return sols;
  }, []);

  // Fetch live NASA images when live feed mode or filters change
  const refreshLiveFeed = useCallback(async () => {
    if (feedMode !== 'live') return;
    setIsLiveLoading(true);
    setLiveError(null);
    try {
      const res = await fetchLivePerseveranceRawImages({
        sol: selectedSol !== 'all' ? selectedSol : undefined,
        camera: selectedCamera !== 'all' ? selectedCamera : undefined,
        num: 24,
      });
      setLiveImages(res.images);
      setIsLiveLoading(false);
    } catch (err) {
      setLiveError(err.message || 'Failed to connect to NASA raw feed');
      setIsLiveLoading(false);
    }
  }, [feedMode, selectedSol, selectedCamera]);

  useEffect(() => {
    let isCancelled = false;
    if (feedMode === 'live') {
      const initTimer = setTimeout(() => {
        if (!isCancelled) {
          setIsLiveLoading(true);
          setLiveError(null);
        }
      }, 0);

      fetchLivePerseveranceRawImages({
        sol: selectedSol !== 'all' ? selectedSol : undefined,
        camera: selectedCamera !== 'all' ? selectedCamera : undefined,
        num: 24,
      })
        .then((res) => {
          if (!isCancelled) {
            clearTimeout(initTimer);
            setLiveImages(res.images);
            setIsLiveLoading(false);
          }
        })
        .catch((err) => {
          if (!isCancelled) {
            clearTimeout(initTimer);
            setLiveError(err.message || 'Failed to connect to NASA raw feed');
            setIsLiveLoading(false);
          }
        });

      return () => {
        isCancelled = true;
        clearTimeout(initTimer);
      };
    }
  }, [feedMode, selectedSol, selectedCamera]);

  // Active list of images depending on mode
  const currentPool = feedMode === 'live' ? liveImages : MARS_RAW_IMAGES;

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

  // Keyboard navigation: Esc closes, Arrow keys navigate
  useEffect(() => {
    if (activeModalIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalIndex(null);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveModalIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveModalIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalIndex, filteredImages.length]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveModalIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
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
            className={`raw-feed-toggle-btn ${feedMode === 'curated' ? 'raw-feed-toggle-btn--active' : ''}`}
            onClick={() => setFeedMode('curated')}
          >
            <Database size={12} />
            <span>Curated Catalog ({MARS_RAW_IMAGES.length})</span>
          </button>
          <button
            type="button"
            className={`raw-feed-toggle-btn ${feedMode === 'live' ? 'raw-feed-toggle-btn--active' : ''}`}
            onClick={() => setFeedMode('live')}
          >
            <Wifi size={12} />
            <span>Live NASA Feed</span>
            {feedMode === 'live' && isLiveLoading && <RefreshCw size={10} className="raw-spinner" />}
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Camera and Sol */}
      <div className="raw-gallery__toolbar">
        {/* Camera Filters */}
        <div className="raw-gallery__filter-group">
          <div className="raw-gallery__filter-label mono">
            <Filter size={13} color="var(--accent-yellow, #f5c542)" />
            <span>FILTER BY CAMERA:</span>
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

        {/* Sol Filter */}
        <div className="raw-gallery__sol-filter-row mono">
          <span className="raw-gallery__filter-label">
            <Calendar size={13} color="var(--accent-yellow, #f5c542)" />
            <span>FILTER BY SOL:</span>
          </span>
          <div className="raw-gallery__sol-pills">
            <button
              type="button"
              className={`raw-sol-btn ${selectedSol === 'all' ? 'raw-sol-btn--active' : ''}`}
              onClick={() => setSelectedSol('all')}
            >
              All Sols
            </button>
            {availableSols.map((sol) => (
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
        </div>
      </div>

      {/* Live Loading State */}
      {feedMode === 'live' && isLiveLoading && (
        <div className="raw-gallery__loading mono">
          <RefreshCw size={18} className="raw-spinner" color="var(--accent-yellow, #f5c542)" />
          <span>QUERYING LIVE NASA MARS 2020 RAW IMAGE FEED...</span>
        </div>
      )}

      {/* Live Error State */}
      {feedMode === 'live' && liveError && (
        <div className="raw-gallery__error mono">
          <AlertTriangle size={18} color="#ef4444" />
          <div style={{ flex: 1 }}>
            <strong>NASA LIVE FEED UNAVAILABLE: {liveError}</strong>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>
              Showing verified local and curated telemetry archives instead.
            </p>
          </div>
          <button
            type="button"
            className="raw-error-retry-btn"
            onClick={refreshLiveFeed}
          >
            Retry Feed
          </button>
          <button
            type="button"
            className="raw-error-switch-btn"
            onClick={() => setFeedMode('curated')}
          >
            Use Curated
          </button>
        </div>
      )}

      {/* Image Grid */}
      {!isLiveLoading && filteredImages.length === 0 ? (
        <div className="raw-gallery__empty mono">
          <Info size={18} color="var(--accent-yellow, #f5c542)" />
          <p>No verified raw images found matching the selected camera and Sol filters.</p>
        </div>
      ) : (
        <div className="raw-gallery__grid">
          {filteredImages.map((img, idx) => {
            const hasError = imageLoadErrors[img.id];

            return (
              <div
                key={img.id}
                className="raw-card"
                onClick={() => setActiveModalIndex(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActiveModalIndex(idx);
                }}
              >
                <div className="raw-card__image-box">
                  {img.hasCornerBadge && (
                    <span className="raw-card__corner-badge" title="Authentic NASA Raw Frame Indicator" />
                  )}
                  {hasError ? (
                    <div className="raw-card__image-fallback mono">
                      <Camera size={24} />
                      <span>{img.camera} (Sol {img.sol})</span>
                      <span style={{ fontSize: '7.5px', color: '#94a3b8' }}>Image download preview unavailable</span>
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
                    <span className="raw-card__featured-chip mono">FEATURED MOSAIC</span>
                  )}
                  <span className="raw-card__expand-icon">
                    <Maximize2 size={13} />
                  </span>
                </div>

                <div className="raw-card__body">
                  <div className="raw-card__meta-top mono">
                    <span className="raw-card__camera-badge">{img.camera}</span>
                    <span style={{ color: '#10b981', fontSize: '8px', fontWeight: 700 }}>REAL DATA - NASA Raw Images</span>
                    <span className="raw-card__date">{img.dateEarthFormatted || 'not provided'}</span>
                  </div>
                  <h3 className="raw-card__heading">{img.title}</h3>
                  <div className="raw-card__target mono">
                    <Compass size={11} />
                    <span>{img.target || 'Jezero Crater'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Large Viewer Modal with Arrow Navigation */}
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
              title="Previous Image (Left Arrow)"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="raw-modal__nav-btn raw-modal__nav-btn--next"
              onClick={handleNextImage}
              title="Next Image (Right Arrow)"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>

            <div className="raw-modal__header">
              <div className="raw-modal__title-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="raw-modal__badge mono">
                    {activeModalImage.cameraFullName} • SOL {activeModalImage.sol}
                  </span>
                  <span style={{ color: '#10b981', fontSize: '9px', fontWeight: 700 }} className="mono">
                    REAL DATA - NASA Raw Images
                  </span>
                  <span className="mono" style={{ fontSize: '9px', color: '#94a3b8' }}>
                    ({activeModalIndex + 1} of {filteredImages.length})
                  </span>
                </div>
                <h3 className="raw-modal__title">{activeModalImage.title}</h3>
              </div>
              <button
                type="button"
                className="raw-modal__close-btn"
                onClick={() => setActiveModalIndex(null)}
                aria-label="Close image details (Esc)"
                title="Close viewer (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            <div className="raw-modal__media-container">
              <img
                src={activeModalImage.imageUrl}
                alt={activeModalImage.title}
                className="raw-modal__full-img"
              />
            </div>

            <div className="raw-modal__details-grid mono">
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">CAMERA INSTRUMENT:</span>
                <span className="raw-modal__val">{activeModalImage.cameraFullName || 'not provided'}</span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">MISSION SOL:</span>
                <span className="raw-modal__val">Sol {activeModalImage.sol}</span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">EARTH TIMESTAMP:</span>
                <span className="raw-modal__val">
                  <Calendar size={11} style={{ marginRight: '4px', display: 'inline' }} />
                  {activeModalImage.dateEarthFormatted || 'not provided'}
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
                <span className="raw-modal__label">IMAGE CREDIT:</span>
                <span className="raw-modal__val">{activeModalImage.credit || 'NASA/JPL-Caltech'}</span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">DATA PROVENANCE:</span>
                <span className="raw-modal__val" style={{ color: '#10b981', fontWeight: 700 }}>
                  ● REAL DATA - NASA Raw Images
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
                <CheckCircle2 size={13} color="#10b981" />
                <span>OFFICIAL NASA MARS 2020 / JPL ARCHIVE</span>
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
