import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { sites } from '../../app/mockData';

export function SitesListPage() {
  const { tenantId } = useParams();

  return (
    <>
      <section className="card">
        <h2>Sites Overview</h2>
        <p className="text-muted">
          Tenant hierarchy: Tenant → Site → Zone → Asset. Use table filters in production for asset_tag, serial, and last-seen.
        </p>
        <div className="grid-2">
          <div className="map-placeholder">
            <h3>Map View</h3>
            <p className="text-muted">Dual map/list operations view. Map chrome follows selected theme.</p>
          </div>
          <div className="card">
            <h3>Live Site Status</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Availability</th>
                  <th>Offline</th>
                  <th>Tickets</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td>
                      <Link to={`/app/${tenantId ?? 'demo-tenant'}/sites/${site.id}`}>{site.name}</Link>
                    </td>
                    <td>{site.availability.toFixed(1)}%</td>
                    <td>{site.offline}</td>
                    <td>{site.openTickets}</td>
                    <td>
                      <StatusBadge status={site.offline > 5 ? 'Warning' : 'OK'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
