import { ControlActionModal } from '../../components/ControlActionModal';

export function OverridesPage() {
  return (
    <section className="card">
      <h2>Control: Manual Overrides</h2>
      <p className="text-muted">Manual override log includes actor, justification, before/after, and adapter response references.</p>
      <table className="table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Target</th>
            <th>Before</th>
            <th>After</th>
            <th>Actor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-02-22 07:22</td>
            <td>asset:LUX-Z1-0003</td>
            <td>dim=82</td>
            <td>dim=70</td>
            <td>ops.manager</td>
          </tr>
        </tbody>
      </table>
      <ControlActionModal actionLabel="Apply Override" targetLabel="Selected Asset" />
    </section>
  );
}
