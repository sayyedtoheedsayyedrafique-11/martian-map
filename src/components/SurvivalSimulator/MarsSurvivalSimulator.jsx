import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import marsSurvivalLocations from '../../data/marsSurvivalLocations';
import marsSurvivalReadiness from '../../data/marsReadinessAssessment';
import marsGlossary from '../../data/marsGlossary';
import {
  ShieldAlert,
  Wind,
  Thermometer,
  Zap,
  Droplets,
  Mountain,
  RotateCcw,
  ExternalLink,
  BookOpen,
  X,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Cpu,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';
import './MarsSurvivalSimulator.css';

const DEFAULT_LOCATION_ID = 'jezero-crater';

function MarsSurvivalSimulator() {
  const [selectedLocId, setSelectedLocId] = useState(DEFAULT_LOCATION_ID);
  const [activeTab, setActiveTab] = useState('conditions'); // 'conditions' | 'challenges' | 'readiness'
  const [showGlossary, setShowGlossary] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState('');

  // Selected location resolution
  const selectedLocation = useMemo(() => {
    return (
      marsSurvivalLocations.find((l) => l.id === selectedLocId) ||
      marsSurvivalLocations[0]
    );
  }, [selectedLocId]);

  // Reset to default
  const handleReset = () => {
    setSelectedLocId(DEFAULT_LOCATION_ID);
    setActiveTab('conditions');
    setShowGlossary(false);
  };

  // Filtered glossary entries
  const filteredGlossary = useMemo(() => {
    if (!glossarySearch.trim()) return marsGlossary;
    const q = glossarySearch.toLowerCase();
    return marsGlossary.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.simpleExplanation.toLowerCase().includes(q)
    );
  }, [glossarySearch]);

  const { conditions, dustAndTerrain } = selectedLocation;

  return (
    <div className="mss-root fade-in">
      {/* Header & Scientific Protocol */}
      <div className="mss-header">
        <div className="mss-tag-row">
          <span className="mss-sys-tag mono">NASA HUMAN RESEARCH PROGRAM (HRP)</span>
          <span className="mss-sys-tag mss-sys-tag--accent mono">MARS SURVIVAL SIMULATOR</span>
          <span className="mss-sys-tag mono">NASA-STD-3001 LIFE SUPPORT PROTOCOL</span>
        </div>
        <h1 className="mss-title">Mars Environmental Survival Simulator</h1>
        <p className="mss-desc">
          Interactive educational simulator analyzing the biological and technological survival boundaries
          on the Martian surface. Explore actual in-situ meteorological measurements, hypobaric Armstrong
          limits, cryogenic temperature swings, ionizing radiation fluxes, and mandatory life-support engineering.
        </p>

        {/* Mandatory Scientific Protocol Banner */}
        <div className="mss-ethics-banner">
          <ShieldAlert size={20} color="var(--accent-yellow)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div className="mss-ethics-text">
            <strong>EMPIRICAL INTEGRITY & NO FAKE SURVIVAL SCORES DIRECTIVE</strong>
            <span>
              All environmental telemetry is strictly grounded in peer-reviewed mission archives (Curiosity REMS/RAD,
              Perseverance MEDA, InSight APSS, and Phoenix TEGA). Fictitious survival percentage scores are rejected:
              the Martian surface is lethal to unprotected humans in under 60 seconds at every location.
            </span>
          </div>
        </div>
      </div>

      {/* Location Selection Toolbar */}
      <div className="mss-location-toolbar">
        <div className="mss-toolbar-top">
          <span className="mss-toolbar-label mono">
            Select Verified Research Site or Surface Station:
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="mss-reset-btn mono"
              onClick={() => setShowGlossary(true)}
              title="Open simple explanations of scientific terms"
            >
              <BookOpen size={13} /> Scientific Glossary
            </button>
            <button
              type="button"
              className="mss-reset-btn mono"
              onClick={handleReset}
              title="Reset simulator to default Jezero Crater"
            >
              <RotateCcw size={13} /> Reset Simulator
            </button>
          </div>
        </div>

        {/* Quick Location Buttons */}
        <div className="mss-quick-locations">
          {marsSurvivalLocations.map((loc) => {
            const isActive = loc.id === selectedLocId;
            return (
              <button
                key={loc.id}
                type="button"
                className={`mss-loc-btn ${isActive ? 'mss-loc-btn--active' : ''}`}
                onClick={() => setSelectedLocId(loc.id)}
              >
                <span>{loc.shortName}</span>
                {loc.hasInSituSensors ? (
                  <span className="mono" style={{ fontSize: '10px', opacity: 0.85 }}>[In-Situ]</span>
                ) : (
                  <span className="mono" style={{ fontSize: '10px', opacity: 0.65 }}>[Model]</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Location Context Card */}
      <div className="mss-location-card">
        <div className="mss-location-row">
          <div className="mss-location-title-group">
            <h2>{selectedLocation.name}</h2>
            <div className="mss-location-sub">
              Primary Vehicle / Mission: <strong>{selectedLocation.roverOrLander}</strong>
            </div>
          </div>

          <div
            className={`mss-sensor-badge ${
              selectedLocation.hasInSituSensors
                ? 'mss-sensor-badge--insitu'
                : 'mss-sensor-badge--modeled'
            }`}
          >
            {selectedLocation.hasInSituSensors ? (
              <CheckCircle2 size={13} />
            ) : (
              <AlertTriangle size={13} />
            )}
            <span>{selectedLocation.measurementStatus}</span>
          </div>
        </div>

        <div className="mss-location-meta-strip mono">
          <div className="mss-loc-meta-item">
            <span className="mss-loc-meta-key">AREOGRAPHIC COORDS</span>
            <span className="mss-loc-meta-val" style={{ color: 'var(--accent-yellow)' }}>
              {selectedLocation.coordinates.latFormatted}, {selectedLocation.coordinates.lngFormatted}
            </span>
          </div>
          <div className="mss-loc-meta-item">
            <span className="mss-loc-meta-key">MOLA ELEVATION DATUM</span>
            <span className="mss-loc-meta-val">{selectedLocation.elevationFormatted}</span>
          </div>
          <div className="mss-loc-meta-item">
            <span className="mss-loc-meta-key">GEOLOGICAL SETTING</span>
            <span className="mss-loc-meta-val">{selectedLocation.geologicalSetting}</span>
          </div>
          <div className="mss-loc-meta-item">
            <span className="mss-loc-meta-key">SENSOR SUITE / PERIOD</span>
            <span className="mss-loc-meta-val">{selectedLocation.sensorSuiteName}</span>
          </div>
        </div>
      </div>

      {/* Interactive Feature Tabs */}
      <div className="mss-tabs">
        <button
          type="button"
          className={`mss-tab-btn ${activeTab === 'conditions' ? 'mss-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('conditions')}
        >
          <Wind size={14} /> 1. Verified Environmental Conditions
        </button>
        <button
          type="button"
          className={`mss-tab-btn ${activeTab === 'challenges' ? 'mss-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          <AlertTriangle size={14} /> 2. Human Survival Challenges
        </button>
        <button
          type="button"
          className={`mss-tab-btn ${activeTab === 'readiness' ? 'mss-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('readiness')}
        >
          <ShieldAlert size={14} /> 3. Survival Readiness Assessment
        </button>
      </div>

      {/* =========================================================================
          SECTION 1: ENVIRONMENTAL CONDITIONS (5 CORE FACTORS)
          ========================================================================= */}
      {activeTab === 'conditions' && (
        <div className="mss-conditions-grid">
          {/* 1. Atmospheric Pressure */}
          <div className="mss-condition-card">
            <div className="mss-condition-header">
              <div className="mss-condition-title-wrap">
                <Wind size={18} color="var(--accent-yellow)" />
                <h3 className="mss-condition-title">Atmospheric Pressure</h3>
              </div>
              <span
                className={`mss-measurement-pill ${
                  conditions.pressure.measurementType === 'in-situ'
                    ? 'mss-measurement-pill--insitu'
                    : 'mss-measurement-pill--modeled'
                }`}
              >
                {conditions.pressure.typeLabel}
              </span>
            </div>

            <div className="mss-condition-value-box">
              <span className="mss-condition-value mono">{conditions.pressure.value}</span>
              <span className="mss-condition-unit mono">{conditions.pressure.unit}</span>
            </div>

            <p className="mss-condition-notes">{conditions.pressure.notes}</p>

            <div className="mss-condition-implication">
              <strong>Armstrong Limit Consequence: </strong>
              <span>{conditions.pressure.armstrongComparison}</span>
            </div>

            <div className="mss-condition-footer mono">
              <span>
                <strong>Source:</strong> {conditions.pressure.source} ({conditions.pressure.observationPeriod})
              </span>
              <a
                href={conditions.pressure.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mss-condition-source-link"
              >
                PDS Archive <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* 2. Temperature */}
          <div className="mss-condition-card">
            <div className="mss-condition-header">
              <div className="mss-condition-title-wrap">
                <Thermometer size={18} color="var(--accent-yellow)" />
                <h3 className="mss-condition-title">Surface & Ambient Temperature</h3>
              </div>
              <span
                className={`mss-measurement-pill ${
                  conditions.temperature.measurementType === 'in-situ'
                    ? 'mss-measurement-pill--insitu'
                    : 'mss-measurement-pill--modeled'
                }`}
              >
                {conditions.temperature.typeLabel}
              </span>
            </div>

            <div className="mss-condition-value-box">
              <span className="mss-condition-value mono">{conditions.temperature.value}</span>
              <span className="mss-condition-unit mono">{conditions.temperature.unit}</span>
            </div>

            <p className="mss-condition-notes">{conditions.temperature.notes}</p>

            <div className="mss-condition-implication">
              <strong>Thermal Hazard: </strong>
              <span>{conditions.temperature.thermalExtreme}</span>
            </div>

            <div className="mss-condition-footer mono">
              <span>
                <strong>Source:</strong> {conditions.temperature.source} ({conditions.temperature.observationPeriod})
              </span>
              <a
                href={conditions.temperature.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mss-condition-source-link"
              >
                PDS Archive <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* 3. Atmospheric Composition */}
          <div className="mss-condition-card">
            <div className="mss-condition-header">
              <div className="mss-condition-title-wrap">
                <Layers size={18} color="var(--accent-yellow)" />
                <h3 className="mss-condition-title">Atmospheric Molecular Composition</h3>
              </div>
              <span
                className={`mss-measurement-pill ${
                  conditions.atmosphereComposition.measurementType.includes('in-situ')
                    ? 'mss-measurement-pill--insitu'
                    : 'mss-measurement-pill--modeled'
                }`}
              >
                {conditions.atmosphereComposition.typeLabel}
              </span>
            </div>

            <div className="mss-condition-value-box">
              <span className="mss-condition-value mono" style={{ fontSize: '17px' }}>
                {conditions.atmosphereComposition.value}
              </span>
            </div>

            <p className="mss-condition-notes">{conditions.atmosphereComposition.notes}</p>

            <div className="mss-condition-implication">
              <strong>Physiological Breathability: </strong>
              <span>{conditions.atmosphereComposition.breathability}</span>
            </div>

            <div className="mss-condition-footer mono">
              <span>
                <strong>Source:</strong> {conditions.atmosphereComposition.source} ({conditions.atmosphereComposition.observationPeriod})
              </span>
              <a
                href={conditions.atmosphereComposition.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mss-condition-source-link"
              >
                Verification Reference <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* 4. Radiation Environment */}
          <div className="mss-condition-card">
            <div className="mss-condition-header">
              <div className="mss-condition-title-wrap">
                <Zap size={18} color="var(--accent-yellow)" />
                <h3 className="mss-condition-title">Ionizing Radiation Environment (GCR & Solar Flux)</h3>
              </div>
              <span
                className={`mss-measurement-pill ${
                  conditions.radiation.measurementType === 'in-situ'
                    ? 'mss-measurement-pill--insitu'
                    : 'mss-measurement-pill--modeled'
                }`}
              >
                {conditions.radiation.typeLabel}
              </span>
            </div>

            <div className="mss-condition-value-box">
              <span className="mss-condition-value mono">{conditions.radiation.value}</span>
              <span className="mss-condition-unit mono">{conditions.radiation.unit}</span>
            </div>

            <p className="mss-condition-notes">{conditions.radiation.notes}</p>

            <div className="mss-condition-implication">
              <strong>Bioastronautics Impact: </strong>
              <span>{conditions.radiation.biologicalImpact}</span>
            </div>

            <div className="mss-condition-footer mono">
              <span>
                <strong>Source:</strong> {conditions.radiation.source} ({conditions.radiation.observationPeriod})
              </span>
              <a
                href={conditions.radiation.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mss-condition-source-link"
              >
                Science / RAD Publication <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* 5. Water Availability */}
          <div className="mss-condition-card">
            <div className="mss-condition-header">
              <div className="mss-condition-title-wrap">
                <Droplets size={18} color="var(--accent-yellow)" />
                <h3 className="mss-condition-title">Water Availability & ISRU Viability</h3>
              </div>
              <span
                className={`mss-measurement-pill ${
                  conditions.waterAvailability.measurementType === 'in-situ'
                    ? 'mss-measurement-pill--insitu'
                    : 'mss-measurement-pill--modeled'
                }`}
              >
                {conditions.waterAvailability.typeLabel}
              </span>
            </div>

            <div className="mss-condition-value-box">
              <span className="mss-condition-value mono" style={{ fontSize: '18px' }}>
                {conditions.waterAvailability.value}
              </span>
            </div>

            <p className="mss-condition-notes">{conditions.waterAvailability.notes}</p>

            <div className="mss-condition-implication">
              <strong>ISRU Extraction Feasibility: </strong>
              <span>{conditions.waterAvailability.isruFeasibility}</span>
            </div>

            <div className="mss-condition-footer mono">
              <span>
                <strong>Source:</strong> {conditions.waterAvailability.source} ({conditions.waterAvailability.observationPeriod})
              </span>
              <a
                href={conditions.waterAvailability.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mss-condition-source-link"
              >
                Research Archive <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* 6. Dust & Regolith Terrain Profile */}
          {dustAndTerrain && (
            <div className="mss-condition-card">
              <div className="mss-condition-header">
                <div className="mss-condition-title-wrap">
                  <Mountain size={18} color="var(--accent-yellow)" />
                  <h3 className="mss-condition-title">Dust Aerosols & Regolith Geochemistry</h3>
                </div>
                <span className="mss-measurement-pill mss-measurement-pill--insitu">
                  Orbital & Surface Characterization
                </span>
              </div>

              <div className="mss-location-meta-strip mono" style={{ border: 'none', padding: 0 }}>
                <div className="mss-loc-meta-item">
                  <span className="mss-loc-meta-key">TERRAIN REGOLITH</span>
                  <span className="mss-loc-meta-val">{dustAndTerrain.terrainType}</span>
                </div>
                <div className="mss-loc-meta-item">
                  <span className="mss-loc-meta-key">DUST OPTICAL DEPTH</span>
                  <span className="mss-loc-meta-val" style={{ color: 'var(--accent-yellow)' }}>
                    {dustAndTerrain.dustOpticalDepth}
                  </span>
                </div>
                <div className="mss-loc-meta-item">
                  <span className="mss-loc-meta-key">PERCHLORATE CONCENTRATION</span>
                  <span className="mss-loc-meta-val">{dustAndTerrain.perchlorateContent}</span>
                </div>
                <div className="mss-loc-meta-item">
                  <span className="mss-loc-meta-key">TRAVERSE SLIP RISK</span>
                  <span className="mss-loc-meta-val">{dustAndTerrain.wheelSlipRisk}</span>
                </div>
              </div>

              <div className="mss-condition-implication">
                <strong>Toxicological & Operational Impact: </strong>
                <span>
                  Perchlorate salts ({dustAndTerrain.perchlorateContent}) are hazardous thyroid inhibitors. Jagged, unweathered
                  sub-3-micron dust grains will damage space-suit seals and human respiratory alveoli unless airlock suitports are strictly enforced.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 2: SURVIVAL CHALLENGES (THE 5 CORE HAZARDS)
          ========================================================================= */}
      {activeTab === 'challenges' && (
        <div className="mss-challenges-grid">
          {/* Challenge 1: Extremely Low Temperatures */}
          <div className="mss-challenge-card">
            <div className="mss-challenge-header">
              <Thermometer size={18} color="var(--accent-yellow)" />
              <h3 className="mss-challenge-title">1. Extremely Low Temperatures</h3>
            </div>
            <div className="mss-challenge-body">
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">HUMAN PHYSIOLOGY:</span>
                <p>
                  Night temperatures drop to between -80°C and -153°C. Exposure leads to rapid hypothermia,
                  frostbite, and peripheral circulatory collapse within minutes.
                </p>
              </div>
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">EQUIPMENT & MATERIALS:</span>
                <p>
                  Rubber O-rings, spacesuit joints, and silicone seals suffer cryogenic embrittlement.
                  Batteries lose over 70% of electrochemical capacity without thermal warmers.
                </p>
              </div>
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">REQUIRED LIFE SUPPORT:</span>
                <p>
                  Space suits require internal active liquid cooling/heating loops (LCVG). Habitats require
                  aerogel vacuum-insulated walls and high-capacity electrical heating grids.
                </p>
              </div>
            </div>
          </div>

          {/* Challenge 2: Thin Atmosphere */}
          <div className="mss-challenge-card">
            <div className="mss-challenge-header">
              <Wind size={18} color="var(--accent-yellow)" />
              <h3 className="mss-challenge-title">2. Thin CO₂ Atmosphere</h3>
            </div>
            <div className="mss-challenge-body">
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">HUMAN PHYSIOLOGY:</span>
                <p>
                  At 600–900 Pa, pressure is far below the Armstrong Limit (6,300 Pa). Tears, saliva, and
                  alveolar lung fluids boil at body heat (37°C). Total lack of oxygen induces loss of
                  consciousness in 9–12 seconds and fatal hypoxia in minutes.
                </p>
              </div>
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">EQUIPMENT & AERODYNAMICS:</span>
                <p>
                  Ultra-thin air provides negligible dynamic lift; parachutes alone cannot land heavy human
                  crews, demanding supersonic retro-propulsion.
                </p>
              </div>
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">REQUIRED LIFE SUPPORT:</span>
                <p>
                  Hermetically sealed pressure suits (minimum 29.6 kPa pure O₂) and habitat airlocks
                  pressurized to 70–101 kPa with oxygen/nitrogen gas mixtures.
                </p>
              </div>
            </div>
          </div>

          {/* Challenge 3: Radiation Exposure */}
          <div className="mss-challenge-card">
            <div className="mss-challenge-header">
              <Zap size={18} color="var(--accent-yellow)" />
              <h3 className="mss-challenge-title">3. Radiation Exposure</h3>
            </div>
            <div className="mss-challenge-body">
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">HUMAN PHYSIOLOGY:</span>
                <p>
                  Continuous bombardment by Galactic Cosmic Rays (GCRs) delivers ~0.67 mSv/day (~80× Earth background).
                  Sporadic Solar Particle Events (SPEs) can deliver lethal acute radiation sickness doses within hours.
                </p>
              </div>
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">LONG-TERM EFFECTS:</span>
                <p>
                  Elevated lifetime cancer mortality, cataract formation, cognitive decline from high-Z particle
                  brain traversal, and central nervous system degradation.
                </p>
              </div>
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">REQUIRED LIFE SUPPORT:</span>
                <p>
                  Regolith shielding covers (2.5–3 m depth), polyethylene storm shelters, real-time orbital
                  warning monitors, and strict crew surface stay duration limits.
                </p>
              </div>
            </div>
          </div>

          {/* Challenge 4: Limited Liquid Water */}
          <div className="mss-challenge-card">
            <div className="mss-challenge-header">
              <Droplets size={18} color="var(--accent-yellow)" />
              <h3 className="mss-challenge-title">4. Limited Liquid Water</h3>
            </div>
            <div className="mss-challenge-body">
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">HUMAN PHYSIOLOGY:</span>
                <p>
                  Adult humans require 2.5 to 3.5 liters of clean water daily for metabolic hydration, food
                  preparation, and hygiene. No open surface water bodies exist on Mars.
                </p>
              </div>
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">RESOURCE EXTRACTION:</span>
                <p>
                  Water must be mined from subsurface permafrost (Phoenix Arctic site) or extracted by baking
                  hydrated clay minerals at 400°C–500°C, requiring significant industrial power.
                </p>
              </div>
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">REQUIRED LIFE SUPPORT:</span>
                <p>
                  Advanced closed-loop ECLSS recycling &gt;98% of all cabin moisture, urine, and sweat.
                  Multi-stage chemical filters to eliminate toxic perchlorate contaminants.
                </p>
              </div>
            </div>
          </div>

          {/* Challenge 5: Dust and Terrain Conditions */}
          <div className="mss-challenge-card">
            <div className="mss-challenge-header">
              <Mountain size={18} color="var(--accent-yellow)" />
              <h3 className="mss-challenge-title">5. Dust & Terrain Conditions</h3>
            </div>
            <div className="mss-challenge-body">
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">HUMAN TOXICOLOGY:</span>
                <p>
                  Martian dust is unweathered, abrasive, microscopic (&lt;3 μm), and contains 0.5%–1.0% toxic perchlorate
                  salts. Inhalation causes mechanical silicosis and severe thyroid dysfunction.
                </p>
              </div>
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">SURFACE OPERATIONS:</span>
                <p>
                  Electrostatic dust coats solar arrays (which terminated Opportunity and InSight). Abrasive grit
                  jams mechanical bearings, suit airlock seals, and rover wheel gearboxes.
                </p>
              </div>
              <div className="mss-impact-row">
                <span className="mss-impact-label mono">REQUIRED LIFE SUPPORT:</span>
                <p>
                  Rear-entry suitport docking (spacesuit never enters living quarters), electrostatic precipitator
                  airlock scrubbers, and automated mechanical brush systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: SURVIVAL READINESS ASSESSMENT (EDUCATIONAL MATRIX)
          ========================================================================= */}
      {activeTab === 'readiness' && (
        <div className="mss-readiness-matrix">
          {marsSurvivalReadiness.map((item) => (
            <div key={item.id} className="mss-readiness-card">
              <div className="mss-readiness-header">
                <div>
                  <h3 className="mss-readiness-title">{item.title}</h3>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Category: {item.category}
                  </span>
                </div>
                <span className="mss-severity-tag mono">{item.severity}</span>
              </div>

              <div className="mss-readiness-grid">
                {/* Available Scientific Evidence */}
                <div className="mss-readiness-block">
                  <span className="mss-readiness-block-title mono">
                    <FileText size={13} /> Available Scientific Evidence
                  </span>
                  <p className="mss-readiness-block-content">{item.scientificEvidence}</p>
                  <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Citations: {item.evidenceCitation}
                  </span>
                </div>

                {/* Required Protection or Life Support */}
                <div className="mss-readiness-block">
                  <span className="mss-readiness-block-title mono" style={{ color: '#10b981' }}>
                    <Cpu size={13} /> Required Protection & Life-Support Systems
                  </span>
                  <ul className="mss-bullet-list">
                    {item.requiredProtection.map((req, i) => (
                      <li key={i} className="mss-bullet-item">
                        <span className="mss-bullet-dot">■</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Missing or Uncertain Information */}
              <div className="mss-readiness-block" style={{ borderLeft: '3px solid var(--accent-yellow)' }}>
                <span className="mss-readiness-block-title mono">
                  <HelpCircle size={13} /> Missing or Uncertain Scientific Information
                </span>
                <ul className="mss-bullet-list">
                  {item.missingOrUncertainInfo.map((uncer, i) => (
                    <li key={i} className="mss-bullet-item">
                      <span className="mss-bullet-dot" style={{ color: 'var(--accent-yellow)' }}>?</span>
                      <span>{uncer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Navigation to Route Planner & Map */}
      <div className="mss-condition-card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Integrate with Planetary GIS & Navigation:</h4>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Selected research site is connected to the Mars Pathfinder areographic cartography database.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link to="/" className="mss-loc-btn mono">
            <Compass size={13} /> Open 3D Globe & Map
          </Link>
          <Link to="/missions" className="mss-loc-btn mono">
            <Layers size={13} /> View Mission Intelligence
          </Link>
          <Link to={`/route-planner?start=${selectedLocation.id}`} className="mss-loc-btn mono mss-loc-btn--active">
            Plan Surface Route
          </Link>
        </div>
      </div>

      {/* =========================================================================
          SCIENTIFIC TERMS GLOSSARY MODAL
          ========================================================================= */}
      {showGlossary && (
        <div className="mss-glossary-modal-backdrop" onClick={() => setShowGlossary(false)}>
          <div className="mss-glossary-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mss-glossary-modal-header">
              <div>
                <span className="mss-sys-tag mono" style={{ marginBottom: '4px', display: 'inline-block' }}>
                  NASA ASTROBIOLOGY // EDUCATIONAL DEFINITIONS
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Mars Environmental & Survival Terms
                </h3>
              </div>
              <button
                type="button"
                className="mss-reset-btn"
                onClick={() => setShowGlossary(false)}
                aria-label="Close glossary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mss-glossary-modal-body">
              <input
                type="text"
                placeholder="Search scientific terms (e.g., Armstrong, mSv, perchlorates)..."
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '10px 14px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredGlossary.map((item) => (
                  <div key={item.term} className="mss-glossary-item">
                    <div className="mss-glossary-top">
                      <span className="mss-glossary-term">{item.term}</span>
                      <span className="mss-glossary-category mono">{item.category}</span>
                    </div>
                    {item.symbol && (
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--accent-yellow)' }}>
                        Standard Baseline: {item.symbol}
                      </span>
                    )}
                    <p className="mss-glossary-exp">{item.simpleExplanation}</p>
                    <span className="mss-glossary-cite mono">Citation: {item.citation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarsSurvivalSimulator;
