import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { AssetPage } from '../features/assets/AssetPage';
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/demo-tenant/sites" replace />,
  },
  {
    path: '/app/:tenantId',
    element: <AppLayout />,
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
