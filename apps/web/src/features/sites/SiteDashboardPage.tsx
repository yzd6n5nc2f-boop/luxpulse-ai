import { Link, useParams } from 'react-router-dom';
import { StatusBadge, Tag } from '../../components/StatusBadge';

export function SiteDashboardPage() {
  const { tenantId, siteId } = useParams();

  return (
    <>
      <section className="card">
        <h2>Site Dashboard: {siteId}</h2>
        <p className="text-muted">
          MVP dashboard for availability, offline assets, open tickets, and energy trend baseline.
        </p>
        <div className="grid-3">
          <article className="kpi">
            <span className="text-muted">Availability</span>
            <strong>98.2%</strong>
            <StatusBadge status="OK" />
          </article>
          <article className="kpi">
            <span className="text-muted">Offline Assets</span>
            <strong>6</strong>
            <StatusBadge status="Warning" />
          </article>
          <article className="kpi">
            <span className="text-muted">Open Tickets</span>
            <strong>11</strong>
            <StatusBadge status="Warning" />
          </article>
        </div>
      </section>

      <section className="card">
        <h3>Zones</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Assets</th>
              <th>Current Schedule</th>
              <th>Last Override</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Link to={`/app/${tenantId ?? 'demo-tenant'}/sites/${siteId}/zones/zone-a`}>Ground Floor Retail</Link>
              </td>
              <td>42</td>
              <td>
                <Tag>08:00-22:00 @ 85%</Tag>
              </td>
              <td>18m ago</td>
              <td>
                <StatusBadge status="OK" />
              </td>
            </tr>
            <tr>
              <td>
                <Link to={`/app/${tenantId ?? 'demo-tenant'}/sites/${siteId}/zones/zone-b`}>Loading Corridor</Link>
              </td>
              <td>18</td>
              <td>
                <Tag>24/7 @ 65%</Tag>
              </td>
              <td>3h ago</td>
              <td>
                <StatusBadge status="Warning" />
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
