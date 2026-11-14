import { useState } from 'react';
import MarsSurvivalSimulator from '../components/SurvivalSimulator/MarsSurvivalSimulator';
import { survivalHazards, survivalSeverityColors } from '../data/marsSurvival';
import {
  Thermometer,
  Wind,
  Zap,
  Droplets,
  Mountain,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Activity,
} from 'lucide-react';
import './SurvivalAnalysis.css';

// Map hazard icon string → lucide component
const ICONS = {
  thermometer: Thermometer,
  wind: Wind,
  radiation: Zap,
  droplets: Droplets,
  mountain: Mountain,
};

function SeverityBadge({ severity }) {
  const cfg = survivalSeverityColors[severity] || survivalSeverityColors.moderate;
  return (
    <span
      className="survival-severity-badge mono"
      style={{ color: cfg.labelColor, borderColor: cfg.labelColor }}
    >
      {cfg.label}
    </span>
  );
}

function HazardCard({ hazard, isDefaultOpen = false }) {
  const [expanded, setExpanded] = useState(isDefaultOpen);
  const Icon = ICONS[hazard.icon] || AlertTriangle;
  const cfg = survivalSeverityColors[hazard.severity] || survivalSeverityColors.moderate;

  return (
    <div
      className="survival-card"
      style={{ borderLeftColor: cfg.border }}
    >
      {/* Header row */}
      <button
        type="button"
        className="survival-card__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="survival-card__icon-wrap" style={{ color: cfg.labelColor }}>
          <Icon size={18} />
        </span>
        <span className="survival-card__title">{hazard.title}</span>
        <SeverityBadge severity={hazard.severity} />
        <span className="survival-card__toggle">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Summary */}
      <p className="survival-card__summary">{hazard.summary}</p>

      {/* Expanded details */}
      {expanded && (
        <div className="survival-card__body">
          <table className="survival-detail-table">
            <tbody>
              {hazard.details.map((d, i) => (
                <tr key={i}>
                  <td className="survival-detail-label">{d.label}</td>
                  <td className="survival-detail-value mono">{d.value}</td>
                  <td className="survival-detail-note">{d.note}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="survival-implication">
            <div className="survival-implication__head">
              <ShieldAlert size={14} color="var(--accent-yellow)" />
              <strong className="mono">EFFECT ON HUMAN EXPLORATION & LIFE SUPPORT:</strong>
            </div>
            <p>{hazard.implication}</p>
          </div>

          {!hazard.dataAvailable && hazard.dataLimitation && (
            <div className="survival-limitation-notice">
              <AlertTriangle size={13} color="var(--accent-yellow)" />
              <span><strong>Data limitation:</strong> {hazard.dataLimitation}</span>
            </div>
          )}

          <div className="survival-card__footer">
            <span className="survival-card__source mono">
              Archived Dataset: {hazard.sourceLabel}
            </span>
            <a
              href={hazard.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="survival-card__link mono"
            >
              Verify Publication <ExternalLink size={11} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function SurvivalAnalysis() {
  const [viewMode, setViewMode] = useState('simulator'); // 'simulator' | 'hazards'

  return (
    <div className="survival-page fade-in">
      {/* Top View Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <div className="mars-view-switcher" style={{ background: 'var(--bg-card)', padding: '4px', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className={`mars-view-btn ${viewMode === 'simulator' ? 'mars-view-btn--active' : ''}`}
            onClick={() => setViewMode('simulator')}
          >
            <Activity size={13} />
            <span>Mars Survival Simulator</span>
          </button>
          <button
            type="button"
            className={`mars-view-btn ${viewMode === 'hazards' ? 'mars-view-btn--active' : ''}`}
            onClick={() => setViewMode('hazards')}
          >
            <Layers size={13} />
            <span>Hazard Reference Library</span>
          </button>
        </div>
      </div>

      {/* Main Feature: Mars Survival Simulator */}
      {viewMode === 'simulator' ? (
        <MarsSurvivalSimulator />
      ) : (
        <div className="survival-pillars-section" style={{ marginTop: 0 }}>
          <div className="survival-page__header" style={{ marginBottom: '16px' }}>
            <div className="survival-tag-row">
              <span className="survival-sys-tag mono">NASA HUMAN RESEARCH PROGRAM (HRP)</span>
              <span className="survival-sys-tag survival-sys-tag--accent mono">FIVE CRITICAL PILLARS</span>
            </div>
            <h1 className="survival-page__title">Hazard Reference Library</h1>
            <p className="survival-page__desc">
              Comprehensive biological and engineering hazard documentation compiled from peer-reviewed mission publications.
            </p>
          </div>

          <div className="survival-summary-grid">
            {survivalHazards.map((h) => {
              const Icon = ICONS[h.icon] || AlertTriangle;
              const cfg = survivalSeverityColors[h.severity] || survivalSeverityColors.moderate;
              return (
                <span key={h.id} className="survival-summary-chip">
                  <Icon size={12} style={{ color: cfg.labelColor }} />
                  <span>{h.title}</span>
                  <span
                    className="survival-summary-chip__badge mono"
                    style={{ color: cfg.labelColor }}
                  >
                    [{cfg.label}]
                  </span>
                </span>
              );
            })}
          </div>

          <div className="survival-cards-list">
            {survivalHazards.map((hazard, index) => (
              <HazardCard key={hazard.id} hazard={hazard} isDefaultOpen={index === 0 || index === 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SurvivalAnalysis;
