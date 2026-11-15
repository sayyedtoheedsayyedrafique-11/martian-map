import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MarsLogo from '../components/ui/MarsLogo';
import {
  Rocket,
  Target,
  Lightbulb,
  AlertTriangle,
  Compass,
  ShieldAlert,
} from 'lucide-react';
import './About.css';

function About() {
  return (
    <div className="about-page fade-in">
      <div className="about-page__header">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <MarsLogo size={56} className="about-page__logo" />
        </div>
        <div className="about-page__badge">
          <Rocket size={14} /> NASA Space Apps Challenge 2026
        </div>
        <h1 className="about-page__heading">Mars Pathfinder: Interplanetary Survival Guide</h1>
        <p className="about-page__subtitle">
          An interactive, scientifically responsible planetary exploration and cartographic interface
          designed to solve navigation, terrain hazard awareness, and in-situ resource reconnaissance on the Martian surface.
        </p>
      </div>

      <div className="about-page__grid">
        {/* Challenge Problem Statement */}
        <Card title="The Challenge: Martian Map" icon={Target} accent>
          <p>
            Humanity's transition toward becoming an interplanetary species hinges on our ability to navigate, explore,
            and survive on the Martian surface. Future astronauts and robotic sorties face an environment with
            no GPS constellation, extreme diurnal temperature swings (-153°C to +20°C), atmospheric pressure at 0.6% of Earth's,
            unmitigated cosmic radiation, and treacherous geological hazards such as deep dust dunes, boulder fields, and 7-kilometer chasms.
          </p>
          <p style={{ marginTop: '12px' }}>
            Current raw NASA datasets (PDS, MOLA, HiRISE, THEMIS) are dispersed across specialized scientific portals
            and GIS software (such as JMARS) that require extensive technical training.
          </p>
        </Card>

        {/* Our Approach */}
        <Card title="Our Approach & Architecture" icon={Lightbulb} accent>
          <p>
            <strong>Mars Pathfinder</strong> democratizes planetary cartography by unifying verified NASA and USGS orbital datasets
            into an accessible, mission-control-inspired exploration suite.
          </p>
          <ul className="about-list">
            <li>
              <strong>Accessible Web GIS:</strong> Integrates equirectangular planetary basemaps derived from NASA's MOLA altimetry.
            </li>
            <li>
              <strong>Verified Exploration Catalog:</strong> Compiles real areographic coordinates, landing dates, and mission outcomes from Viking to Perseverance.
            </li>
            <li>
              <strong>Mars Mission Intelligence:</strong> Interactive dossier, scientific comparison matrix, payload specifications, and verified landing location tracking for NASA Perseverance, Curiosity, InSight, and Spirit & Opportunity.
            </li>
            <li>
              <strong>Geodesic Waypoint Trajectories:</strong> Computes true spherical distances across the Martian geoid radius (3,389.5 km).
            </li>
            <li>
              <strong>Scientific Transparency:</strong> Rejects fabricated "live" telemetry in favor of empirical ranges and accredited sensors (REMS, MEDA, TWINS).
            </li>
          </ul>
        </Card>

        {/* Scientific Limitations & Ethics */}
        <Card title="Scientific Limitations & Ethical Disclosure" icon={AlertTriangle} accent>
          <div className="about-limitation-box">
            <ShieldAlert size={20} color="var(--accent-yellow)" />
            <div>
              <strong>Planetary Navigation Disclaimer:</strong>
              <p>
                The routes plotted in this demonstration application are spherical great-circle arcs.
                They must NOT be interpreted as autonomous driving plans for real Martian rovers.
              </p>
            </div>
          </div>
          <p style={{ marginTop: '12px' }}>
            Real rover path planning requires sub-meter Digital Terrain Models (DTMs) to identify steep slopes (&gt;15°),
            slip hazards, and non-traversable boulders larger than wheel diameters (e.g., &gt;50 cm for Curiosity/Perseverance).
            Additionally, standard Earth-based web map tiles use spherical Mercator or equirectangular projections that experience
            polar distortion above ±60° latitude.
          </p>
        </Card>

        {/* Future Value */}
        <Card title="Potential Value for Future Mars Exploration" icon={Compass} accent>
          <p>
            As NASA advances the Artemis program and prepares for crewed Mars missions in the late 2030s,
            lightweight, offline-capable tactical cartography will be essential for astronaut EVA (Extravehicular Activity) navigation.
          </p>
          <p style={{ marginTop: '12px' }}>
            Future iterations of Mars Pathfinder can incorporate:
          </p>
          <ul className="about-list">
            <li>Sub-surface ice distribution maps from Mars Reconnaissance Orbiter (MRO) SHARAD radar for ISRU water extraction.</li>
            <li>Autonomous slope-gradient pathfinding utilizing localized HiRISE elevation point clouds.</li>
            <li>PDS (Planetary Data System) automated batch ingestion pipelines.</li>
          </ul>
        </Card>
      </div>

      {/* Challenge Requirements Matrix */}
      <div className="about-page__matrix">
        <h2 className="about-matrix-title">NASA Space Apps Challenge Alignment Matrix</h2>
        <div className="matrix-table-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Implementation in Mars Pathfinder</th>
                <th>Verification Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Interactive Mars Explorer</strong></td>
                <td>React-Leaflet equirectangular map with coordinate tracker, custom SVG markers, and popups.</td>
                <td><Badge variant="colored" color="#2ecc71">Complete</Badge></td>
              </tr>
              <tr>
                <td><strong>Terrain & Altimetry Layers</strong></td>
                <td>MOLA elevation basemap, layer status indicators, USGS morphological hazard assessments.</td>
                <td><Badge variant="colored" color="#2ecc71">Complete</Badge></td>
              </tr>
              <tr>
                <td><strong>Scientific Locations</strong></td>
                <td>17 verified NASA & USGS exploration sites with rover landing dates, MOLA elevations, and discovery dossiers.</td>
                <td><Badge variant="colored" color="#2ecc71">Complete</Badge></td>
              </tr>
              <tr>
                <td><strong>Mission Route Planner</strong></td>
                <td>Geodesic great-circle slerp arc generator, initial bearing azimuth, elevation deltas, USGS terrain hazard matrix, and NASA safety disclaimers.</td>
                <td><Badge variant="colored" color="#2ecc71">Complete</Badge></td>
              </tr>
              <tr>
                <td><strong>Mars Survival Analysis</strong></td>
                <td>Verified NASA & ESA environmental hazard dossiers (extreme cold, CO₂ atmosphere, RAD radiation, water-ice availability, USGS terrain obstacles) with accredited citations.</td>
                <td><Badge variant="colored" color="#2ecc71">Complete</Badge></td>
              </tr>
              <tr>
                <td><strong>Accredited Data Sources</strong></td>
                <td>Full citation registry of NASA PDS, MOLA, USGS, and JPL repositories.</td>
                <td><Badge variant="colored" color="#2ecc71">Complete</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default About;
