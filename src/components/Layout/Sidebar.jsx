import { NavLink } from 'react-router-dom';
import {
  Globe,
  Route,
  Database,
  Info,
  ShieldAlert,
  X,
  Thermometer,
  Layers,
  Compass,
  Camera,
} from 'lucide-react';
import './Sidebar.css';

const primaryNav = [
  {
    to: '/',
    icon: Globe,
    label: 'Explore Map',
    subtitle: '2D Map & 3D Terrain',
    end: true,
  },
  {
    to: '/route-planner',
    icon: Route,
    label: 'Rover Routes',
    subtitle: 'Traverse & Survival',
  },
  {
    to: '/conditions',
    icon: Thermometer,
    label: 'Surface & Weather',
    subtitle: 'Atmosphere & Geology',
  },
  {
    to: '/missions',
    icon: Camera,
    label: 'Rover Gallery',
    subtitle: 'Perseverance Raw Photos',
  },
];

const secondaryNav = [
  { to: '/terrain', icon: Layers, label: 'Terrain & Hazards' },
  { to: '/survival', icon: ShieldAlert, label: 'Survival Simulator' },
  { to: '/data-sources', icon: Database, label: 'NASA Data Sources' },
  { to: '/about', icon: Info, label: 'Mission & Specs' },
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
        {/* 4 Clear Primary Categories */}
        <div className="sidebar__section">
          <div className="sidebar__nav-label mono">Mission Navigation</div>
          <div className="sidebar__primary-list">
            {primaryNav.map(({ to, icon: Icon, label, subtitle, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar__link sidebar__link--primary ${isActive ? 'sidebar__link--active' : ''}`
                }
                onClick={onClose}
              >
                <div className="sidebar__link-icon-box">
                  <Icon size={16} className="sidebar__link-icon" />
                </div>
                <div className="sidebar__link-content">
                  <span className="sidebar__link-title">{label}</span>
                  <span className="sidebar__link-sub mono">{subtitle}</span>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Secondary Specialized Science Tools */}
        <div className="sidebar__section sidebar__section--secondary">
          <div className="sidebar__nav-label mono">Archive & Advanced</div>
          {secondaryNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__link sidebar__link--compact ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={13} className="sidebar__link-icon" />
              <span className="sidebar__link-text">{label}</span>
            </NavLink>
          ))}
        </div>
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
