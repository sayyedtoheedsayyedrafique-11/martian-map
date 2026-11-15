import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className={`layout ${isLanding ? 'layout--landing' : ''}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout__main">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className={`layout__content ${isLanding ? 'layout__content--landing' : ''}`}>
          <Outlet />
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="layout__overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default Layout;
