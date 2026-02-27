import { Navigate, createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import { AppLayout } from '../components/AppLayout';
import { AssetPage } from '../features/assets/AssetPage';
import { LoginPage } from '../features/auth/LoginPage';
import { SchedulesPage } from '../features/control/SchedulesPage';
import { OverridesPage } from '../features/control/OverridesPage';
import { EvidencePacksPage } from '../features/evidence/EvidencePacksPage';
import { EventsPage } from '../features/events/EventsPage';
import { InputDataPage } from '../features/input/InputDataPage';
import { IntegrationsPage } from '../features/integrations/IntegrationsPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { SiteDashboardPage } from '../features/sites/SiteDashboardPage';
import { SitesListPage } from '../features/sites/SitesListPage';
import { TicketsPage } from '../features/tickets/TicketsPage';
import { ZonePage } from '../features/zones/ZonePage';
import { useAuth } from '../auth/AuthProvider';

function HomeRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/app/demo-tenant/sites' : '/login'} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/app/:tenantId',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: 'sites',
        children: [
          { index: true, element: <SitesListPage /> },
          { path: ':siteId', element: <SiteDashboardPage /> },
          { path: ':siteId/zones/:zoneId', element: <ZonePage /> },
        ],
      },
      { path: 'assets/:assetId', element: <AssetPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'tickets', element: <TicketsPage /> },
      { path: 'control/schedules', element: <SchedulesPage /> },
      { path: 'control/overrides', element: <OverridesPage /> },
      { path: 'input', element: <InputDataPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'evidence-packs', element: <EvidencePacksPage /> },
      { path: 'integrations', element: <IntegrationsPage /> },
    ],
  },
]);
