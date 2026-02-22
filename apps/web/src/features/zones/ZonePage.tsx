import { Link, useParams } from 'react-router-dom';
import { zoneAssets } from '../../app/mockData';
import { ControlActionModal } from '../../components/ControlActionModal';
import { StatusBadge } from '../../components/StatusBadge';

export function ZonePage() {
  const { tenantId, siteId, zoneId } = useParams();

  return (
    <>
      <section className="card">
        <h2>Zone: {zoneId}</h2>
        <p className="text-muted">
          Schedule summary and recent manual overrides with auditable control entry points.
        </p>
        <div className="grid-2">
          <div className="card">
            <h3>Schedule Summary</h3>
            <p>Weekday schedule: 07:30-22:30 at 82% dim level</p>
            <p>Weekend schedule: 09:00-20:00 at 72% dim level</p>
            <ControlActionModal actionLabel="Update Zone Schedule" targetLabel={`Zone ${zoneId ?? 'unknown'}`} />
          </div>
          <div className="card">
            <h3>Recent Overrides</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2026-02-22 07:22</td>
                  <td>ops.manager</td>
                  <td>Dim 82% → 70%</td>
                </tr>
                <tr>
                  <td>2026-02-21 19:01</td>
                  <td>system.rule.v3</td>
                  <td>Recovery schedule applied</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Zone Assets</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Model</th>
              <th>Status</th>
              <th>Burn Hours</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {zoneAssets.map((asset) => (
              <tr key={asset.assetTag}>
                <td>
                  <Link to={`/app/${tenantId ?? 'demo-tenant'}/assets/${asset.assetTag}`}>{asset.assetTag}</Link>
                </td>
                <td>{asset.model}</td>
                <td>
                  <StatusBadge status={asset.status as 'OK' | 'Warning' | 'Critical' | 'Offline'} />
                </td>
                <td>{asset.burnHours}</td>
                <td>{asset.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-muted">Path: Tenant {tenantId} / Site {siteId} / Zone {zoneId}</p>
      </section>
    </>
  );
}
