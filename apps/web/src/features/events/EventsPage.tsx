import { StatusBadge, Tag } from '../../components/StatusBadge';

export function EventsPage() {
  return (
    <section className="card">
      <h2>Events and Faults</h2>
      <p className="text-muted">Canonical events include source rule id/version and raw payload references.</p>
      <table className="table">
        <thead>
          <tr>
            <th>Event ID</th>
            <th>Detected At</th>
            <th>Rule</th>
            <th>Asset</th>
            <th>Severity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>evt-1901</td>
            <td>2026-02-22 07:21</td>
            <td>
              <Tag>offline-threshold@v3</Tag>
            </td>
            <td>LUX-Z1-0003</td>
            <td>
              <StatusBadge status="Critical" />
            </td>
            <td>open</td>
          </tr>
          <tr>
            <td>evt-1900</td>
            <td>2026-02-22 06:58</td>
            <td>
              <Tag>power-anomaly@v2</Tag>
            </td>
            <td>LUX-Z1-0002</td>
            <td>
              <StatusBadge status="Warning" />
            </td>
            <td>acknowledged</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
