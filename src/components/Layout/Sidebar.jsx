import { NavLink } from 'react-router-dom';
import {
  Globe,
  MapPin,
  Route,
  Database,
  Info,
  ShieldAlert,
  Mountain,
  Rocket,
  X,
  Thermometer,
  Layers,
  Compass,
} from 'lucide-react';
import './Sidebar.css';

const navSections = [
  {
    title: 'Planetary Cartography',
    items: [
      { to: '/', icon: Globe, label: '3D Globe & Map', badge: '3D/2D' },
      { to: '/data-explorer', icon: Database, label: 'Mars Data Explorer', badge: 'PDS/CTX' },
      { to: '/jezero', icon: Mountain, label: '3D Jezero Terrain', badge: 'DEM 20m' },
      { to: '/locations', icon: MapPin, label: 'Scientific Locations' },
    ],
  },
  {
    title: 'Mission Flight Ops',
    items: [
      { to: '/missions', icon: Rocket, label: 'Mission Intelligence' },
      { to: '/route-planner', icon: Route, label: 'Smart Route Planner' },
      { to: '/conditions', icon: Thermometer, label: 'Surface Conditions' },
    ],
  },
  {
    title: 'Terrain & Survival',
    items: [
      { to: '/terrain', icon: Layers, label: 'Terrain & Hazards' },
      { to: '/survival', icon: ShieldAlert, label: 'Survival Simulator' },
    ],
  },
  {
    title: 'Research & Archive',
    items: [
      { to: '/data-sources', icon: Database, label: 'NASA Data Sources' },
      { to: '/about', icon: Info, label: 'Mission & Specs' },
    ],
  },
];

function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <div className="sidebar__brand-mark">
            <Compass size={14} />
          </div>
          <div className="sidebar__brand-text">
            <span className="sidebar__title">Mars Pathfinder</span>
            <span className="sidebar__subtitle mono">NASA SPACE APPS // GIS</span>
          </div>
        </div>
        <button
          className="sidebar__close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {navSections.map((section) => (
          <div key={section.title} className="sidebar__section">
            <div className="sidebar__nav-label mono">{section.title}</div>
            {section.items.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={15} className="sidebar__link-icon" />
                <span className="sidebar__link-text">{label}</span>
                {badge && <span className="sidebar__link-badge mono">{badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__footer-meta mono">
          <div className="sidebar__meta-row">
            <span className="sidebar__meta-key">DATUM</span>
            <span className="sidebar__meta-val">MOLA 610.5 Pa</span>
          </div>
          <div className="sidebar__meta-row">
            <span className="sidebar__meta-key">FRAME</span>
            <span className="sidebar__meta-val">IAU AREOGRAPHIC</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
