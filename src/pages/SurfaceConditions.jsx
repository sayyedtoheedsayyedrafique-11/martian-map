import { useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ClassificationBadge from '../components/ui/ClassificationBadge';
import marsEnvironment from '../data/marsEnvironment';
import {
  INSIGHT_MISSION_METADATA,
  MARS_INTERIOR_STRUCTURE,
  INSIGHT_MARSQUAKE_EVENTS,
} from '../data/marsQuakeCatalog';
import {
  DIURNAL_PRESSURE_TEMP_PROFILE,
} from '../data/marsWeatherTelemetry';
import {
  Thermometer,
  Gauge,
  Radio,
  ExternalLink,
  ShieldAlert,
  Activity,
  Layers,
  Globe2,
  Wind,
  Eye,
  Waves,
} from 'lucide-react';
import './SurfaceConditions.css';

function SurfaceConditions() {
  const {
    atmosphere,
    surfaceConditions,
    comparisonWithEarth,
    curiosityRemsArchive,
    perseveranceMedaArchive,
  } = marsEnvironment;

  const [activeWeatherTab, setActiveWeatherTab] = useState('curiosity');
  const [quakeFilter, setQuakeFilter] = useState('all');

  return (
    <div className="surface-conditions fade-in">
      <div className="surface-conditions__header">
        <div>
          <h1 className="surface-conditions__heading">
            <Thermometer size={28} />
            Martian Surface Environment & Meteorology
          </h1>
          <p className="surface-conditions__subtitle">
            Empirical baseline measurements, atmospheric chemistry, and verified mission telemetry archives
            cataloged by NASA landers, rovers, and the Planetary Data System (PDS).
          </p>
        </div>
      </div>

      {/* Scientific Protocol Disclosure */}
      <div className="conditions-alert">
        <ShieldAlert size={24} className="conditions-alert__icon" />
        <div>
          <h4>SCIENTIFIC PROTOCOL: VERIFIED HISTORICAL MEASUREMENTS VS REAL-TIME TELEMETRY</h4>
          <p>
            This dashboard displays verified reference ranges and published NASA mission telemetry archives from the
            <strong> NASA Planetary Data System (PDS) Geosciences Node</strong>.
            <strong> We deliberately do not fabricate fictional "live" Mars weather dials.</strong> True Martian meteorological
            telemetry is packet-relayed across 200+ million km via the NASA Deep Space Network (DSN) through orbiters
            (MRO, Odyssey, TGO) and processed in verified scientific releases rather than streamed instantaneously to web browsers.
          </p>
        </div>
      </div>

      {/* Key Physical Conditions Grid */}
      <div className="conditions-grid">
        <Card title="Surface Pressure" icon={Gauge} accent>
          <div className="metric-box">
            <span className="metric-box__val">{surfaceConditions.data.surfacePressure.value}</span>
            <span className="metric-box__sub">{surfaceConditions.data.surfacePressure.range}</span>
          </div>
          <p className="metric-box__note">
            Below Armstrong limit (~63 mbar). Exposed human body fluids boil at standard body temperature (37°C) without a pressurized counter-pressure suit.
          </p>
          <div style={{ marginTop: '10px' }}>
            <Badge variant="colored" color="#2ecc71">Verified In-Situ Baseline</Badge>
          </div>
        </Card>

        <Card title="Temperature Extremes" icon={Thermometer} accent>
          <div className="metric-box">
            <span className="metric-box__val">{surfaceConditions.data.temperatureRange.value}</span>
            <span className="metric-box__sub">{surfaceConditions.data.temperatureRange.range}</span>
          </div>
          <p className="metric-box__note">
            Diurnal swings exceed 80°C due to low atmospheric thermal inertia and absence of oceans to buffer heat.
          </p>
          <div style={{ marginTop: '10px' }}>
            <Badge variant="colored" color="#2ecc71">Verified Mission Range</Badge>
          </div>
        </Card>

        <Card title="Surface Gravity" icon={Activity} accent>
          <div className="metric-box">
            <span className="metric-box__val">{surfaceConditions.data.gravity.value}</span>
            <span className="metric-box__sub">{surfaceConditions.data.gravity.detail}</span>
          </div>
          <p className="metric-box__note">
            Lower gravity facilitates large robotic payloads and simplifies vertical climb power, but requires artificial counter-measures against crew osteopenia.
          </p>
          <div style={{ marginTop: '10px' }}>
            <Badge variant="colored" color="#3498db">Physical Constant</Badge>
          </div>
        </Card>

        <Card title="Surface Radiation" icon={Radio} accent>
          <div className="metric-box">
            <span className="metric-box__val">{surfaceConditions.data.radiation.value}</span>
            <span className="metric-box__sub">{surfaceConditions.data.radiation.range}</span>
          </div>
          <p className="metric-box__note">
            Without a planetary magnetosphere or thick ozone column, solar proton events (SPE) and galactic cosmic rays (GCR) penetrate unimpeded to the regolith.
          </p>
          <div style={{ marginTop: '10px' }}>
            <Badge variant="colored" color="#e74c3c">PDS Curiosity RAD Archive</Badge>
          </div>
        </Card>
      </div>

      {/* Authentic NASA Mission Weather Telemetry Archives */}
      <div className="conditions-section" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="conditions-section-title" style={{ margin: 0 }}>
              <Activity size={22} />
              NASA In-Situ Mission Meteorological Archives (PDS)
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Authentic Sol-by-Sol surface telemetry archived by the NASA PDS Geosciences Node.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`conditions-tab-btn ${activeWeatherTab === 'curiosity' ? 'conditions-tab-btn--active' : ''}`}
              onClick={() => setActiveWeatherTab('curiosity')}
            >
              Curiosity (REMS)
            </button>
            <button
              className={`conditions-tab-btn ${activeWeatherTab === 'perseverance' ? 'conditions-tab-btn--active' : ''}`}
              onClick={() => setActiveWeatherTab('perseverance')}
            >
              Perseverance (MEDA)
            </button>
            <button
              className={`conditions-tab-btn ${activeWeatherTab === 'insight' ? 'conditions-tab-btn--active' : ''}`}
              onClick={() => setActiveWeatherTab('insight')}
            >
              InSight (SEIS / TWINS)
            </button>
          </div>
        </div>

        {/* Curiosity REMS Content */}
        {activeWeatherTab === 'curiosity' && (
          <Card
            title={`${curiosityRemsArchive.platform} — ${curiosityRemsArchive.instrument}`}
            icon={Thermometer}
            accent
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Location: <strong>{curiosityRemsArchive.location}</strong> | Archive: <code style={{ color: 'var(--mars-coral)' }}>{curiosityRemsArchive.archivePdsId}</code>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Badge variant="colored" color="#3498db">{curiosityRemsArchive.lastArchiveRelease}</Badge>
                <a
                  href={curiosityRemsArchive.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                  style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  PDS Repository <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="conditions-table">
                <thead>
                  <tr>
                    <th>Mission Sol</th>
                    <th>Terrestrial Date</th>
                    <th>Martian Season</th>
                    <th>Air Temp (Min / Max)</th>
                    <th>Ground Temp (Min / Max)</th>
                    <th>Atm. Pressure</th>
                    <th>Dust Opacity (Tau)</th>
                  </tr>
                </thead>
                <tbody>
                  {curiosityRemsArchive.observations.map((obs) => (
                    <tr key={obs.sol}>
                      <td className="mono" style={{ fontWeight: 'bold', color: 'var(--mars-coral)' }}>Sol {obs.sol}</td>
                      <td className="mono">{obs.earthDate}</td>
                      <td>{obs.season}</td>
                      <td className="mono">{obs.airTempMin}°C / {obs.airTempMax}°C</td>
                      <td className="mono">{obs.groundTempMin}°C / {obs.groundTempMax}°C</td>
                      <td className="mono">{obs.pressureMbar} mbar ({obs.pressurePa} Pa)</td>
                      <td>{obs.opacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '10px', margin: '10px 0 0 0' }}>
              Data verified against published NASA MSL Science Team datasets. Note the extreme ground-to-air thermal gradient caused by thin atmospheric coupling.
            </p>
          </Card>
        )}

        {/* Perseverance MEDA Content */}
        {activeWeatherTab === 'perseverance' && (
          <Card
            title={`${perseveranceMedaArchive.platform} — ${perseveranceMedaArchive.instrument}`}
            icon={Gauge}
            accent
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Location: <strong>{perseveranceMedaArchive.location}</strong> | Archive: <code style={{ color: 'var(--mars-coral)' }}>{perseveranceMedaArchive.archivePdsId}</code>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Badge variant="colored" color="#3498db">{perseveranceMedaArchive.lastArchiveRelease}</Badge>
                <a
                  href={perseveranceMedaArchive.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                  style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  PDS Repository <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="conditions-table">
                <thead>
                  <tr>
                    <th>Mission Sol</th>
                    <th>Terrestrial Date</th>
                    <th>Martian Season</th>
                    <th>Air Temp (Min / Max)</th>
                    <th>Ground Temp (Min / Max)</th>
                    <th>Atm. Pressure</th>
                    <th>Field Science Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {perseveranceMedaArchive.observations.map((obs) => (
                    <tr key={obs.sol}>
                      <td className="mono" style={{ fontWeight: 'bold', color: 'var(--mars-coral)' }}>Sol {obs.sol}</td>
                      <td className="mono">{obs.earthDate}</td>
                      <td>{obs.season}</td>
                      <td className="mono">{obs.airTempMin}°C / {obs.airTempMax}°C</td>
                      <td className="mono">{obs.groundTempMin}°C / {obs.groundTempMax}°C</td>
                      <td className="mono">{obs.pressureMbar} mbar ({obs.pressurePa} Pa)</td>
                      <td style={{ fontSize: '0.8rem' }}>{obs.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '10px', margin: '10px 0 0 0' }}>
              Observations capture the dramatic seasonal CO₂ condensation cycle: pressure drops to ~7.0 mbar as polar ice caps freeze atmospheric CO₂, then rebounds above 8.4 mbar upon summer sublimation.
            </p>
          </Card>
        )}

        {/* InSight SEIS Content & Planetary Interior Structure */}
        {activeWeatherTab === 'insight' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card
              title={`${INSIGHT_MISSION_METADATA.platform} — ${INSIGHT_MISSION_METADATA.instrument}`}
              icon={Activity}
              accent
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Station: <strong>{INSIGHT_MISSION_METADATA.location}</strong> | PDS: <code style={{ color: 'var(--accent-amber)' }}>{INSIGHT_MISSION_METADATA.pdsArchiveId}</code>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <ClassificationBadge type="actual" customLabel="ACTUAL SEISMIC TELEMETRY" size="sm" />
                  <a
                    href={INSIGHT_MISSION_METADATA.irisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link mono"
                    style={{ fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    IRIS InSight Catalog <ExternalLink size={12} />
                  </a>
                  <a
                    href={INSIGHT_MISSION_METADATA.pdsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link mono"
                    style={{ fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    PDS SEIS Archive <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Marsquake Catalog Filters */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`conditions-tab-btn ${quakeFilter === 'all' ? 'conditions-tab-btn--active' : ''}`}
                  onClick={() => setQuakeFilter('all')}
                  style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                >
                  All Significant Marsquakes ({INSIGHT_MARSQUAKE_EVENTS.length})
                </button>
                <button
                  type="button"
                  className={`conditions-tab-btn ${quakeFilter === 'major' ? 'conditions-tab-btn--active' : ''}`}
                  onClick={() => setQuakeFilter('major')}
                  style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                >
                  Major Quakes (≥ 4.0 Mw)
                </button>
                <button
                  type="button"
                  className={`conditions-tab-btn ${quakeFilter === 'tectonic' ? 'conditions-tab-btn--active' : ''}`}
                  onClick={() => setQuakeFilter('tectonic')}
                  style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                >
                  Tectonic Fault Slips
                </button>
                <button
                  type="button"
                  className={`conditions-tab-btn ${quakeFilter === 'impact' ? 'conditions-tab-btn--active' : ''}`}
                  onClick={() => setQuakeFilter('impact')}
                  style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                >
                  Meteoroid Cratering
                </button>
              </div>

              {/* Marsquake Event Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
                {INSIGHT_MARSQUAKE_EVENTS.filter((ev) => {
                  if (quakeFilter === 'major') return ev.magnitudeMw >= 4.0;
                  if (quakeFilter === 'tectonic') return ev.type.includes('Tectonic');
                  if (quakeFilter === 'impact') return ev.type.includes('Impact');
                  return true;
                }).map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      borderLeft: `4px solid ${ev.magnitudeMw >= 4.5 ? 'var(--status-critical, #ef4444)' : ev.magnitudeMw >= 4.0 ? 'var(--accent-amber, #d97706)' : 'var(--status-processed, #38bdf8)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>Event {ev.id}</strong>
                      <Badge variant="colored" color={ev.magnitudeMw >= 4.5 ? '#ef4444' : ev.magnitudeMw >= 4.0 ? '#d97706' : '#38bdf8'}>
                        {ev.magnitudeFormatted}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '6px' }} className="mono">
                      Sol {ev.sol} ({ev.earthDate}) • {ev.type}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      {ev.scientificImpact}
                    </p>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }} className="mono">
                      <div>Epicenter: {ev.sourceRegion} (~{ev.epicentralDistanceKm.toLocaleString()} km / {ev.epicentralDistanceDeg}°)</div>
                      <div>Duration: {ev.durationFormatted} | Depth: {ev.depthEstimateKm}</div>
                      <div>Sensor: {ev.instrument}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Martian Interior Structure Cross-Section */}
            <Card
              title="Martian Interior Structure Model (Constrained by InSight SEIS Data)"
              icon={Layers}
              accent
            >
              <div style={{ marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Seismological Inversion: <strong>Science 2021 (Knapmeyer-Endrun et al.; Stähler et al.)</strong>
                </span>
                <ClassificationBadge type="processed" customLabel="CALIBRATED SEISMIC INVERSION" size="sm" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                  <h4 style={{ color: 'var(--accent-amber)', margin: '0 0 6px 0', fontSize: '0.86rem' }}>
                    1. {MARS_INTERIOR_STRUCTURE.crust.name}
                  </h4>
                  <div className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Thickness: {MARS_INTERIOR_STRUCTURE.crust.thicknessRange}
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>
                    Divided into 3 distinct layers: upper impact-fractured basalt, middle volcanic flows, and deep metamorphism. Density {MARS_INTERIOR_STRUCTURE.crust.density}.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                  <h4 style={{ color: '#38bdf8', margin: '0 0 6px 0', fontSize: '0.86rem' }}>
                    2. {MARS_INTERIOR_STRUCTURE.mantle.name}
                  </h4>
                  <div className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Extent: {MARS_INTERIOR_STRUCTURE.mantle.thicknessRange}
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>
                    {MARS_INTERIOR_STRUCTURE.mantle.composition}. Thick rigid thermal lithosphere retards convection, explaining the lack of active plate tectonics.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                  <h4 style={{ color: 'var(--mars-coral)', margin: '0 0 6px 0', fontSize: '0.86rem' }}>
                    3. {MARS_INTERIOR_STRUCTURE.core.name}
                  </h4>
                  <div className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Radius: {MARS_INTERIOR_STRUCTURE.core.radiusKm}
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>
                    {MARS_INTERIOR_STRUCTURE.core.state}. Core convection stopped ~4.0 Ga; remnant magnetic crustal stripes remain in southern highlands.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Diurnal Atmospheric Pressure & Temperature Cycle (Thermal Tide) */}
      <div className="conditions-section" style={{ marginTop: '30px' }}>
        <h2 className="conditions-section-title">
          <Waves size={20} />
          Martian Diurnal Atmospheric Cycle (24-Hour Sol Thermal Tide Telemetry)
        </h2>
        <Card>
          <div className="conditions-source-meta" style={{ marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Source: <strong>NASA Mars 2020 MEDA & Curiosity REMS Science Teams</strong> (CAB / INTA-CSIC / JPL)
            </span>
            <ClassificationBadge type="actual" customLabel="VERIFIED EMPIRICAL CYCLE" size="sm" />
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            In Mars&apos; thin CO₂ atmosphere (~6–8 mbar), strong solar radiative heating triggers a global semi-diurnal thermal tide.
            Atmospheric surface pressure reaches a maximum around 08:00 LTST (~782 Pa), drops to an afternoon minimum at 16:00 LTST (~694 Pa),
            while ground surface temperature swings by nearly 100°C between dawn (-89°C) and early afternoon (+11°C).
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table className="conditions-table">
              <thead>
                <tr>
                  <th>Local True Solar Time (LTST)</th>
                  <th>Atmospheric Pressure</th>
                  <th>Air Temp (1.5m Mast)</th>
                  <th>Ground Surface Temp (TIRS IR)</th>
                  <th>Mean Wind Velocity</th>
                  <th>Dust Tau (RDS)</th>
                </tr>
              </thead>
              <tbody>
                {DIURNAL_PRESSURE_TEMP_PROFILE.map((item) => (
                  <tr key={item.hourLtst}>
                    <td className="mono" style={{ fontWeight: 600 }}>{item.label}</td>
                    <td className="mono" style={{ color: item.pressurePa === 782 ? '#22c55e' : item.pressurePa === 694 ? '#ef4444' : 'inherit' }}>
                      {item.pressurePa} Pa ({(item.pressurePa / 100).toFixed(2)} mbar)
                    </td>
                    <td className="mono">{item.airTempC}°C</td>
                    <td className="mono" style={{ color: item.groundTempC > 0 ? '#f59e0b' : 'inherit' }}>
                      {item.groundTempC}°C
                    </td>
                    <td className="mono">{item.windSpeedMs} m/s</td>
                    <td className="mono">&tau; {item.tau}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Atmospheric Molecular Composition */}
      <div className="conditions-section" style={{ marginTop: '30px' }}>
        <h2 className="conditions-section-title">
          <Layers size={20} />
          {atmosphere.title}
        </h2>
        <Card>
          <div className="conditions-source-meta" style={{ marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Source: <strong>{atmosphere.source}</strong> ({atmosphere.dataDate})
            </span>
            <a href={atmosphere.sourceUrl} target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: '0.78rem' }}>
              NASA Fact Sheet Repository <ExternalLink size={12} style={{ display: 'inline' }} />
            </a>
          </div>

          <table className="conditions-table">
            <thead>
              <tr>
                <th>Gas Molecule</th>
                <th>Volumetric Mixing Ratio</th>
                <th>Parts Per Million (ppm)</th>
                <th>Planetary & Life Support Role</th>
              </tr>
            </thead>
            <tbody>
              {atmosphere.data.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{item.component}</td>
                  <td className="mono">{item.percentage}%</td>
                  <td className="mono">{item.ppm ? item.ppm.toLocaleString() : '—'} ppm</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="conditions-note" style={{ marginTop: '12px' }}>{atmosphere.note}</p>
        </Card>
      </div>

      {/* Mars vs Earth Comparative Planetology */}
      <div className="conditions-section" style={{ marginTop: '30px' }}>
        <h2 className="conditions-section-title">
          <Globe2 size={20} />
          {comparisonWithEarth.title}
        </h2>
        <Card>
          <div className="conditions-source-meta" style={{ marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Source: <strong>{comparisonWithEarth.source}</strong> ({comparisonWithEarth.dataDate})
            </span>
            <a href={comparisonWithEarth.sourceUrl} target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: '0.78rem' }}>
              NASA NSSDC Archive <ExternalLink size={12} style={{ display: 'inline' }} />
            </a>
          </div>

          <table className="conditions-table">
            <thead>
              <tr>
                <th>Physical Property</th>
                <th>Mars (Datum)</th>
                <th>Earth (Reference)</th>
                <th>Comparative Ratio</th>
                <th>Operational Consequence</th>
              </tr>
            </thead>
            <tbody>
              {comparisonWithEarth.data.map((row, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{row.property}</td>
                  <td className="mono">{row.mars}</td>
                  <td className="mono">{row.earth}</td>
                  <td className="mono" style={{ color: 'var(--mars-coral)' }}>{row.ratio}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Planetary Atmosphere Dynamics & Dust Storm Analogue (NASA Worldview) */}
      <div className="conditions-section" style={{ marginTop: '30px' }}>
        <h2 className="conditions-section-title">
          <Wind size={20} />
          Planetary Atmosphere Dynamics & Global Dust Storm Analogue
        </h2>
        <div className="dust-analogue-card">
          <div className="dust-analogue-header">
            <Eye size={22} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 className="dust-analogue-title">
                NASA Worldview Remote Sensing Analogy & Atmospheric Optical Depth (Tau)
              </h3>
              <p className="dust-analogue-desc">
                In planetary meteorology, Earth's atmospheric aerosol transport observed on NASA Worldview serves as a key comparative analogue for understanding Mars' planet-encircling dust storms (PEDEs). While NASA Worldview monitors Earth satellite layers, NASA monitors Martian dust dynamics via MRO MARCI, Odyssey THEMIS, and rover REMS/MEDA sensors.
              </p>
              <span className="mono" style={{ color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '2px 6px', fontSize: '8.5px', marginTop: '6px', display: 'inline-block', borderRadius: '2px' }}>
                ◈ EARTH SCIENTIFIC ANALOGY ONLY — NASA WORLDVIEW MONITORS TERRESTRIAL SATELLITE LAYERS (DOES NOT OBSERVE MARS DIRECTLY)
              </span>
            </div>
          </div>

          <div className="dust-comparison-grid">
            <div className="dust-col">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h4 className="dust-col-title" style={{ color: '#f59e0b', margin: 0 }}>
                  <Wind size={13} /> Martian Global Dust Storms (PEDEs)
                </h4>
                <span style={{ color: '#10b981', fontSize: '8px', fontWeight: 700 }} className="mono">● REAL DATA</span>
              </div>
              <p className="dust-col-body">
                During perihelion (southern summer), intense solar heating triggers local dust devils that can merge into planet-encircling events. In 2018, a global storm reached atmospheric optical depth &tau; &gt; 8.0, blocking &gt;99% of sunlight and concluding the solar-powered Opportunity rover mission after 15 years on Sol 5111.
              </p>
              <div className="dust-stat-row mono">
                <div className="dust-stat-item">
                  <span className="dust-stat-lbl">CLEAR SKY OPTICAL DEPTH (&tau;):</span>
                  <span className="dust-stat-val">0.5 – 0.9 (REMS/MEDA)</span>
                </div>
                <div className="dust-stat-item">
                  <span className="dust-stat-lbl">GLOBAL STORM OPTICAL DEPTH (&tau;):</span>
                  <span className="dust-stat-val">&gt; 8.0 (2018 Global Event)</span>
                </div>
                <div className="dust-stat-item">
                  <span className="dust-stat-lbl">ROVER POWER RESILIENCE:</span>
                  <span className="dust-stat-val">RTG Nuclear (Curiosity, Perseverance)</span>
                </div>
              </div>
            </div>

            <div className="dust-col">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h4 className="dust-col-title" style={{ color: '#38bdf8', margin: 0 }}>
                  <Globe2 size={13} /> Earth Aerosol Systems on NASA Worldview
                </h4>
                <span style={{ color: '#38bdf8', fontSize: '8px', fontWeight: 700 }} className="mono">◈ EARTH ANALOGUE</span>
              </div>
              <p className="dust-col-body">
                NASA Worldview interactively visualizes daily global satellite imagery (MODIS on Terra/Aqua and VIIRS on Suomi NPP/NOAA-20), tracking trans-Atlantic Saharan dust plumes and volcanic aerosol plumes. These Earth observations provide the mathematical hydrodynamic baseline for modeling Mars atmospheric suspension.
              </p>
              <div className="dust-stat-row mono">
                <div className="dust-stat-item">
                  <span className="dust-stat-lbl">SATELLITE SENSORS:</span>
                  <span className="dust-stat-val">MODIS, VIIRS, AIRS</span>
                </div>
                <div className="dust-stat-item">
                  <span className="dust-stat-lbl">CORE OBSERVABLE:</span>
                  <span className="dust-stat-val">Aerosol Optical Depth (AOD 550nm)</span>
                </div>
                <div className="dust-stat-item">
                  <span className="dust-stat-lbl">TEMPORAL REVISIT:</span>
                  <span className="dust-stat-val">Daily Global Earth Coverage</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dust-analogue-footer mono">
            <span style={{ fontSize: '8.5px', color: '#8b949e' }}>
              PROVENANCE: NASA JPL / MSSS MRO MARCI Weather Bulletins & NASA Earthdata GIBS
            </span>
            <div className="dust-analogue-links">
              <a
                href="https://worldview.earthdata.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="dust-link"
              >
                Launch NASA Worldview <ExternalLink size={10} />
              </a>
              <a
                href="https://www.msss.com/msss_images/latest_weather.html"
                target="_blank"
                rel="noopener noreferrer"
                className="dust-link"
              >
                MRO MARCI Weekly Mars Weather <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurfaceConditions;
