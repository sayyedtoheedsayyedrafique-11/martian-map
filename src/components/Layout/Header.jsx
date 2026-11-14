import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Box, Globe } from 'lucide-react';
import './Header.css';

const pageTitles = {
  '/': 'SURFACE MAP & 3D GIS',
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

  // Precision single-line mission clock (UTC)
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
    <header className="header" aria-label="Mission Telemetry Bar">
      <div className="header__left">
        <button
          className="header__menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={14} />
        </button>

        <div className="header__brand-group">
          <span className="header__brand-tag mono">MARS PATHFINDER</span>
          <span className="header__divider">/</span>
          <h1 className="header__section-title mono">{sectionTitle}</h1>
        </div>
      </div>

      <div className="header__right mono">
        {/* Real-time mission telemetry readouts */}
        <div className="header__telemetry-item" title="Mission Clock (UTC)">
          <span className="header__telemetry-label">CLK:</span>
          <span className="header__telemetry-value">{utcTime}</span>
        </div>

        <div className="header__telemetry-item" title="Perseverance Mission Sol">
          <span className="header__telemetry-label">SOL:</span>
          <span className="header__telemetry-value">1420 (M20)</span>
        </div>

        <div className="header__telemetry-item" title="System Telemetry Status">
          <span className="header__status-dot" />
          <span className="header__telemetry-value">NOMINAL</span>
        </div>

        <div className="header__telemetry-item header__telemetry-item--hide-sm" title="Planetary Coordinate Reference">
          <span className="header__telemetry-label">REF:</span>
          <span className="header__telemetry-value">IAU AREOID (610.5 Pa)</span>
        </div>

        {/* Quiet Quick-Switch Links */}
        <div className="header__quick-tools">
          {!isJezero && (
            <Link to="/jezero" className="header__quick-link" title="Open 3D Jezero Crater DEM">
              <Box size={11} />
              <span>3D DEM</span>
            </Link>
          )}

          {location.pathname !== '/' && (
            <Link to="/" className="header__quick-link" title="Open Primary 2D GIS Map & 3D Globe">
              <Globe size={11} />
              <span>MAP</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
