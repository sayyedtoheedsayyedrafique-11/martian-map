import { useLocation, Link } from 'react-router-dom';
import { Menu, Compass, Box, Globe } from 'lucide-react';
import './Header.css';

const pageTitles = {
  '/': 'SURFACE MAP & 3D GIS',
  '/jezero': 'JEZERO CRATER 3D ELEVATION DEM',
  '/missions': 'MARS MISSION INTELLIGENCE',
  '/locations': 'SCIENTIFIC LOCATIONS',
  '/terrain': 'TERRAIN & HAZARDS',
  '/route-planner': 'SMART ROUTE PLANNER',
  '/conditions': 'SURFACE CONDITIONS & METEOROLOGY',
  '/survival': 'MARS SURVIVAL SIMULATOR',
  '/data-sources': 'DATA ARCHIVES & SOURCES',
  '/about': 'MISSION & SPECS',
};

function Header({ onMenuToggle }) {
  const location = useLocation();
  const sectionTitle = pageTitles[location.pathname] || 'FIELD GIS';
  const isJezero = location.pathname === '/jezero' || (location.pathname === '/terrain' && location.search.includes('jezero'));

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={16} />
        </button>

        <div className="header__brand-group">
          <span className="header__brand-tag">MARS PATHFINDER</span>
          <span className="header__divider">/</span>
          <h1 className="header__section-title">{sectionTitle}</h1>
        </div>
      </div>

      <div className="header__right">
        <div className="header__status-badge">
          <span className="header__status-indicator" />
          <span className="mono">DATUM: MOLA AREOID (610.5 Pa)</span>
        </div>

        <div className="header__coords-pill mono">
          <span>L_s: 64° [N. SPRING]</span>
        </div>

        <div className="header__coords-pill mono">
          <Compass size={12} />
          <span>IAU 2000 AREOGRAPHIC</span>
        </div>

        {/* Quick-switch tools */}
        {!isJezero && (
          <Link to="/jezero" className="header__quick-tool-btn header__quick-tool-btn--jezero" title="Open 3D Jezero Crater DEM">
            <Box size={13} />
            <span>3D JEZERO</span>
          </Link>
        )}

        {location.pathname !== '/' && (
          <Link to="/" className="header__quick-tool-btn header__quick-tool-btn--globe" title="Open 3D Globe & GIS Map">
            <Globe size={13} />
            <span>MAP & GLOBE</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
