import { Moon, Sun } from 'lucide-react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useTheme } from '../theme/ThemeProvider';

const navItems = [
  { path: 'sites', label: 'Sites' },
  { path: 'input', label: 'Input' },
  { path: 'events', label: 'Events/Faults' },
  { path: 'tickets', label: 'Tickets' },
  { path: 'control/schedules', label: 'Control' },
  { path: 'reports', label: 'Reports' },
  { path: 'evidence-packs', label: 'Evidence Packs' },
  { path: 'integrations', label: 'Integrations' },
];

export function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { tenantId } = useParams();

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">LuxPulse</p>
          <h1>Lighting Operations Console</h1>
        </div>
        <div className="toolbar">
          <label className="field-inline">
            Tenant
            <select defaultValue={tenantId ?? 'demo-tenant'}>
              <option value="demo-tenant">Demo FM Tenant</option>
            </select>
          </label>
          <button className="btn-ghost" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Day' : 'Night'} Theme
          </button>
        </div>
      </header>

      <nav className="navbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={`/app/${tenantId ?? 'demo-tenant'}/${item.path}`}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
