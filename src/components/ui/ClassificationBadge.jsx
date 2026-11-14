import './ClassificationBadge.css';

const BADGE_CONFIGS = {
  actual: {
    label: 'ACTUAL DATA',
    description: 'Empirical telemetry downlinked from NASA spacecraft, USGS publications, or PDS archives.',
    badgeClass: 'classification-badge--actual',
    dotColor: '#22c55e',
  },
  processed: {
    label: 'PROCESSED DATA',
    description: 'Calibrated DEM elevation matrices, slope transects, or cartographic mosaics.',
    badgeClass: 'classification-badge--processed',
    dotColor: '#38bdf8',
  },
  illustrative: {
    label: 'ILLUSTRATIVE EXAMPLE',
    description: 'Analytical simulations, predictive survival projections, or Earth analogue models.',
    badgeClass: 'classification-badge--illustrative',
    dotColor: '#d97706',
  },
};

export default function ClassificationBadge({
  type = 'actual',
  customLabel,
  size = 'md',
  className = '',
}) {
  const normalizedType = BADGE_CONFIGS[type] ? type : 'actual';
  const config = BADGE_CONFIGS[normalizedType];
  const displayLabel = customLabel || config.label;

  return (
    <span
      className={`classification-badge ${config.badgeClass} classification-badge--${size} ${className}`.trim()}
      title={config.description}
      aria-label={`${displayLabel}: ${config.description}`}
      role="status"
    >
      <span
        className="classification-badge__dot"
        style={{ backgroundColor: config.dotColor }}
        aria-hidden="true"
      />
      <span className="classification-badge__label mono">
        {displayLabel}
      </span>
    </span>
  );
}

