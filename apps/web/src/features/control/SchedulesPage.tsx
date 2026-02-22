import { ControlActionModal } from '../../components/ControlActionModal';

export function SchedulesPage() {
  return (
    <section className="card">
      <h2>Control: Schedules</h2>
      <p className="text-muted">
        Scheduled dimming supports zone and asset targets. Every change writes immutable ControlAction records.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Scope</th>
            <th>Schedule</th>
            <th>Version</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Zone zone-a</td>
            <td>Weekdays 07:30-22:30 @ 82%</td>
            <td>v6</td>
            <td>2026-02-22 07:21</td>
          </tr>
          <tr>
            <td>Zone zone-b</td>
            <td>24/7 @ 65%</td>
            <td>v3</td>
            <td>2026-02-21 19:01</td>
          </tr>
        </tbody>
      </table>
      <ControlActionModal actionLabel="Create Schedule" targetLabel="Selected Zone" />
    </section>
  );
}
