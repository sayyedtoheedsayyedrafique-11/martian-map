import { ExternalLink, Database } from 'lucide-react';
import ClassificationBadge from './ClassificationBadge';
import './MetadataInspector.css';

export default function MetadataInspector({
  title,
  classification = 'actual',
  customClassificationLabel,
  instrument,
  platform,
  sol,
  earthDate,
  coordinates,
  elevation,
  geologicUnit,
  sourceName,
  sourceUrl,
  doiOrCatalogId,
  processingStatus,
  className = '',
}) {
  const coordString = coordinates
    ? `${coordinates.lat?.toFixed?.(4) ?? coordinates.lat}°N, ${coordinates.lng?.toFixed?.(4) ?? coordinates.lng}°E`
    : null;

  return (
    <div className={`metadata-inspector ${className}`.trim()}>
      <div className="metadata-inspector__header">
        <div className="metadata-inspector__title-row">
          <Database size={13} className="metadata-inspector__icon" aria-hidden="true" />
          <span className="metadata-inspector__title mono">{title || 'SCIENTIFIC METADATA & PROVENANCE'}</span>
        </div>
        <ClassificationBadge
          type={classification}
          customLabel={customClassificationLabel}
          size="sm"
        />
      </div>

      <div className="metadata-inspector__grid mono">
        {instrument && (
          <div className="metadata-inspector__row">
            <span className="metadata-inspector__label">INSTRUMENT:</span>
            <span className="metadata-inspector__value">{instrument}</span>
          </div>
        )}

        {platform && (
          <div className="metadata-inspector__row">
            <span className="metadata-inspector__label">PLATFORM / MISSION:</span>
            <span className="metadata-inspector__value">{platform}</span>
          </div>
        )}

        {sol !== undefined && sol !== null && (
          <div className="metadata-inspector__row">
            <span className="metadata-inspector__label">MISSION SOL:</span>
            <span className="metadata-inspector__value">Sol {sol}</span>
          </div>
        )}

        {earthDate && (
          <div className="metadata-inspector__row">
            <span className="metadata-inspector__label">EARTH TIMESTAMP:</span>
            <span className="metadata-inspector__value">{earthDate}</span>
          </div>
        )}

        {coordString && (
          <div className="metadata-inspector__row">
            <span className="metadata-inspector__label">AREOGRAPHIC COORDS:</span>
            <span className="metadata-inspector__value">
              {coordString}
              {coordinates.datum ? ` (${coordinates.datum})` : ''}
            </span>
          </div>
        )}

        {elevation && (
          <div className="metadata-inspector__row">
            <span className="metadata-inspector__label">MOLA ELEVATION:</span>
            <span className="metadata-inspector__value">{elevation}</span>
          </div>
        )}

        {geologicUnit && (
          <div className="metadata-inspector__row">
            <span className="metadata-inspector__label">USGS GEOLOGIC UNIT:</span>
            <span className="metadata-inspector__value">{geologicUnit}</span>
          </div>
        )}

        {processingStatus && (
          <div className="metadata-inspector__row">
            <span className="metadata-inspector__label">PROCESSING STATUS:</span>
            <span className="metadata-inspector__value">{processingStatus}</span>
          </div>
        )}

        {doiOrCatalogId && (
          <div className="metadata-inspector__row">
            <span className="metadata-inspector__label">CATALOG / DOI:</span>
            <span className="metadata-inspector__value">{doiOrCatalogId}</span>
          </div>
        )}

        {sourceName && (
          <div className="metadata-inspector__row metadata-inspector__row--source">
            <span className="metadata-inspector__label">AUTHORITATIVE SOURCE:</span>
            <span className="metadata-inspector__value">
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="metadata-inspector__link"
                >
                  {sourceName} <ExternalLink size={10} aria-hidden="true" />
                </a>
              ) : (
                sourceName
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

