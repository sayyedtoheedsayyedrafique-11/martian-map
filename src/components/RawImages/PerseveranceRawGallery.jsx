import { useState, useMemo } from 'react';
import {
  PERSEVERANCE_CAMERAS,
  MARS_RAW_IMAGES,
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
} from 'lucide-react';
import './PerseveranceRawGallery.css';

export default function PerseveranceRawGallery() {
  const [selectedCamera, setSelectedCamera] = useState('all');
  const [activeModalImage, setActiveModalImage] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  const filteredImages = useMemo(() => {
    if (selectedCamera === 'all') return MARS_RAW_IMAGES;
    return MARS_RAW_IMAGES.filter((img) => img.camera === selectedCamera);
  }, [selectedCamera]);

  const handleImageError = (id) => {
    setImageLoadErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="raw-gallery fade-in">
      {/* Top Header & Context */}
      <div className="raw-gallery__header">
        <div className="raw-gallery__title-area">
          <div className="raw-gallery__tag-row">
            <span className="raw-sys-tag mono">NASA MARS 2020 // PERSEVERANCE ARCHIVE</span>
            <span className="raw-sys-tag mono" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
              ● REAL DATA: NASA PDS & MARS 2020 RAW DOWNLINK
            </span>
            <span className="raw-sys-tag raw-sys-tag--accent mono">AUTHENTIC IN-SITU RECONNAISSANCE</span>
            <a
              href="https://mars.nasa.gov/mars2020/multimedia/raw-images/"
              target="_blank"
              rel="noopener noreferrer"
              className="raw-sys-tag mono raw-sys-tag--link"
            >
              OFFICIAL RAW REPOSITORY &rarr;
            </a>
          </div>
          <h2 className="raw-gallery__title">Perseverance In-Situ Raw Image Gallery</h2>
          <p className="raw-gallery__desc">
            Direct public domain downlinks acquired by NASA's Mars 2020 Perseverance rover and Ingenuity helicopter inside Jezero Crater. Explore scientifically verified frames across primary science and engineering cameras.
          </p>
        </div>
      </div>

      {/* Camera Filter Toolbar */}
      <div className="raw-gallery__toolbar">
        <div className="raw-gallery__filter-label mono">
          <Filter size={13} color="var(--accent-yellow, #f5c542)" />
          <span>FILTER BY INSTRUMENT:</span>
        </div>
        <div className="raw-gallery__filter-pills">
          {PERSEVERANCE_CAMERAS.map((cam) => {
            const count = cam.id === 'all'
              ? MARS_RAW_IMAGES.length
              : MARS_RAW_IMAGES.filter((img) => img.camera === cam.id).length;
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

      {/* Image Grid */}
      {filteredImages.length === 0 ? (
        <div className="raw-gallery__empty mono">
          <Info size={18} color="var(--accent-yellow, #f5c542)" />
          <p>No verified raw images found for the selected instrument filter.</p>
        </div>
      ) : (
        <div className="raw-gallery__grid">
          {filteredImages.map((img) => {
            const hasError = imageLoadErrors[img.id];

            return (
              <div
                key={img.id}
                className="raw-card"
                onClick={() => setActiveModalImage(img)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActiveModalImage(img);
                }}
              >
                <div className="raw-card__image-box">
                  {img.hasCornerBadge && (
                    <span className="raw-card__corner-badge" title="Authentic NASA Raw Frame Indicator" />
                  )}
                  {hasError ? (
                    <div className="raw-card__image-fallback mono">
                      <Camera size={24} />
                      <span>NASA Archive Image Preview</span>
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
                    <span style={{ color: '#10b981', fontSize: '8px', fontWeight: 700 }}>● REAL DATA</span>
                    <span className="raw-card__date">{img.dateEarthFormatted}</span>
                  </div>
                  <h3 className="raw-card__heading">{img.title}</h3>
                  <div className="raw-card__target mono">
                    <Compass size={11} />
                    <span>{img.target}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeModalImage && (
        <div
          className="raw-modal-overlay"
          onClick={() => setActiveModalImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="raw-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="raw-modal__header">
              <div className="raw-modal__title-box">
                <span className="raw-modal__badge mono">
                  {activeModalImage.cameraFullName} • SOL {activeModalImage.sol}
                </span>
                <h3 className="raw-modal__title">{activeModalImage.title}</h3>
              </div>
              <button
                type="button"
                className="raw-modal__close-btn"
                onClick={() => setActiveModalImage(null)}
                aria-label="Close image details"
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
                <span className="raw-modal__label">TARGET LOCATION:</span>
                <span className="raw-modal__val">{activeModalImage.target}</span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">EARTH TIMESTAMP:</span>
                <span className="raw-modal__val">
                  <Calendar size={11} style={{ marginRight: '4px', display: 'inline' }} />
                  {activeModalImage.dateEarthFormatted}
                </span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">MARTIAN LOCAL TIME:</span>
                <span className="raw-modal__val">
                  <Clock size={11} style={{ marginRight: '4px', display: 'inline' }} />
                  {activeModalImage.ltst}
                </span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">DATA PROVENANCE:</span>
                <span className="raw-modal__val" style={{ color: '#10b981', fontWeight: 700 }}>
                  ● REAL DATA (In-Situ Mars Transmission)
                </span>
              </div>
              <div className="raw-modal__detail-item">
                <span className="raw-modal__label">IMAGE CREDIT:</span>
                <span className="raw-modal__val">{activeModalImage.credit}</span>
              </div>
            </div>

            <div className="raw-modal__caption-box">
              <p className="raw-modal__caption">{activeModalImage.caption}</p>
              <div className="raw-modal__significance">
                <strong className="mono">SCIENTIFIC SIGNIFICANCE:</strong>
                <p>{activeModalImage.scientificSignificance}</p>
              </div>
            </div>

            <div className="raw-modal__footer">
              <div className="raw-modal__verified mono">
                <CheckCircle2 size={13} color="#10b981" />
                <span>OFFICIAL NASA PDS / JPL PHOTOJOURNAL ARCHIVE</span>
              </div>
              <a
                href={activeModalImage.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="raw-modal__ext-link mono"
              >
                <span>OPEN NASA PHOTOJOURNAL ENTRY</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
