import { StatusBadge } from '../../components/StatusBadge';

export function TicketsPage() {
  return (
    <section className="card">
      <h2>Tickets and Work Orders</h2>
      <p className="text-muted">SLA-friendly lifecycle: detect → open → assign → close.</p>
      <table className="table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Source Event</th>
            <th>Assigned</th>
            <th>Opened</th>
            <th>SLA Due</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>tkt-402</td>
            <td>evt-1901</td>
            <td>shift-electrical-2</td>
            <td>2026-02-22 07:23</td>
            <td>2026-02-22 11:23</td>
            <td>
              <StatusBadge status="Critical" />
            </td>
          </tr>
          <tr>
            <td>tkt-401</td>
            <td>evt-1900</td>
            <td>fm-ops</td>
            <td>2026-02-22 06:59</td>
            <td>2026-02-22 14:59</td>
            <td>
              <StatusBadge status="Warning" />
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
