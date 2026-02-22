import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useParams } from 'react-router-dom';
import { ControlActionModal } from '../../components/ControlActionModal';
import { StatusBadge } from '../../components/StatusBadge';

const telemetryPoints = [
  { t: '08:00', watts: 432 },
  { t: '09:00', watts: 446 },
  { t: '10:00', watts: 468 },
  { t: '11:00', watts: 452 },
  { t: '12:00', watts: 481 },
  { t: '13:00', watts: 444 },
];

export function AssetPage() {
  const { assetId } = useParams();

  return (
    <>
      <section className="card">
        <h2>Asset Detail: {assetId}</h2>
        <div className="grid-3">
          <article className="kpi">
            <span className="text-muted">Comms Status</span>
            <strong>Connected</strong>
            <StatusBadge status="OK" />
          </article>
          <article className="kpi">
            <span className="text-muted">Last Seen</span>
            <strong>48s ago</strong>
            <StatusBadge status="OK" />
          </article>
          <article className="kpi">
            <span className="text-muted">Open Ticket</span>
            <strong>1</strong>
            <StatusBadge status="Warning" />
          </article>
        </div>
      </section>

      <section className="card">
        <h3>Telemetry</h3>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryPoints}>
              <XAxis dataKey="t" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="watts" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <h3>Control History</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Before</th>
              <th>After</th>
              <th>Correlation ID</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-02-22 07:22</td>
              <td>Manual override</td>
              <td>dim=82</td>
              <td>dim=70</td>
              <td>ca-92d71</td>
            </tr>
          </tbody>
        </table>
        <ControlActionModal actionLabel="Apply Manual Override" targetLabel={`Asset ${assetId ?? 'unknown'}`} />
      </section>
    </>
  );
}
