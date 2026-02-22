import { adapterHealth } from '../../app/mockData';
import { StatusBadge } from '../../components/StatusBadge';

export function IntegrationsPage() {
  return (
    <section className="card">
      <h2>Integrations and Adapter Health</h2>
      <p className="text-muted">
        Adapters normalize protocol/vendor payloads into canonical entities. Confirm protocol/API access during onboarding.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Adapter</th>
            <th>Type</th>
            <th>Status</th>
            <th>Last Heartbeat</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {adapterHealth.map((adapter) => (
            <tr key={adapter.name}>
              <td>{adapter.name}</td>
              <td>{adapter.type}</td>
              <td>
                <StatusBadge status={adapter.status as 'OK' | 'Warning' | 'Critical' | 'Offline'} />
              </td>
              <td>{adapter.lastHeartbeat}</td>
              <td>Rotate Credentials</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
