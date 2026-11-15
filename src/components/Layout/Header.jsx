import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Box, Globe } from 'lucide-react';
import MarsLogo from '../ui/MarsLogo';
import './Header.css';

const pageTitles = {
  '/': 'MISSION OVERVIEW & GUIDE',
  '/explore': 'SURFACE MAP & 3D GIS',
  '/data-explorer': 'MARS DATA EXPLORER',
  '/jezero': 'JEZERO CRATER 3D DEM',
  '/missions': 'MISSION INTELLIGENCE',
  '/raw-images': 'PERSEVERANCE RAW IMAGES',
  '/locations': 'SCIENTIFIC LOCATIONS',
  '/terrain': 'TERRAIN & HAZARDS',
  '/route-planner': 'ROUTE PLANNER',
  '/conditions': 'SURFACE CONDITIONS',
  '/survival': 'SURVIVAL SIMULATOR',
  '/data-sources': 'DATA ARCHIVES',
  '/about': 'MISSION SPECS',
};

function Header({ onMenuToggle }) {
  const location = useLocation();
  const sectionTitle = pageTitles[location.pathname] || 'FIELD GIS';
  const isJezero = location.pathname === '/jezero' || (location.pathname === '/terrain' && location.search.includes('jezero'));

  // Live mission clock (UTC)
  const [utcTime, setUtcTime] = useState(() => {
    const d = new Date();
    return d.toISOString().substring(11, 19) + ' UTC';
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setUtcTime(d.toISOString().substring(11, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header" aria-label="Mission Telemetry Status Bar">
      <div className="header__left">
        <button
          className="header__menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={13} />
        </button>

        <Link to="/" className="header__brand-link" aria-label="Mars Pathfinder Home">
          <MarsLogo size={20} className="header__brand-logo" />
        </Link>

        <div className="header__brand-group">
          <Link to="/" className="header__brand-tag mono">MARS PATHFINDER</Link>
          <span className="header__divider">/</span>
          <h1 className="header__section-title mono">{sectionTitle}</h1>
        </div>
      </div>

      <div className="header__right mono">
        {/* Active Landing Site Coordinates & MOLA Elevation Datum */}
        <div className="header__telemetry-item header__telemetry-item--hide-sm" title="Active Target Site Coordinates">
          <span className="header__telemetry-label">SITE:</span>
          <span className="header__telemetry-value">18.4447°N, 77.4508°E</span>
        </div>

        <div className="header__telemetry-item header__telemetry-item--hide-md" title="MOLA Elevation Reference Datum (Water Triple Point 610.5 Pa)">
          <span className="header__telemetry-label">MOLA:</span>
          <span className="header__telemetry-value">-2,568m AREOID</span>
        </div>

        {/* Real-time Martian Mission Sol & Clock */}
        <div className="header__telemetry-item" title="Perseverance Mars 2020 Mission Sol">
          <span className="header__telemetry-label">SOL:</span>
          <span className="header__telemetry-value">1420</span>
        </div>

        <div className="header__telemetry-item header__telemetry-item--hide-xs" title="UTC Mission Clock">
          <span className="header__telemetry-label">UTC:</span>
          <span className="header__telemetry-value">{utcTime}</span>
        </div>

        {/* Data Provenance & Operational Status */}
        <div className="header__telemetry-item" title="Data Provenance: NASA Planetary Data System & USGS Geologic Map">
          <span className="header__status-dot" />
          <span className="header__telemetry-value">PDS/USGS NOMINAL</span>
        </div>

        {/* Avionics-Style Quick-Switch Links */}
        <div className="header__quick-tools">
          {location.pathname === '/' ? (
            <Link to="/explore" className="header__cta-link" title="Launch Interactive Mars Explorer">
              <Globe size={11} />
              <span>EXPLORE MARS</span>
            </Link>
          ) : (
            <>
              {!isJezero && (
                <Link to="/jezero" className="header__quick-link" title="Open 3D Jezero Crater DEM">
                  <Box size={10} />
                  <span>3D DEM</span>
                </Link>
              )}
              <Link to="/explore" className="header__quick-link" title="Open Primary 2D GIS Map & 3D Globe">
                <Globe size={10} />
                <span>MAP</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
