import { Activity, Building2, LocateFixed } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildStatusMix, getSiteById } from '../../app/mockData';
import { StatusBadge, Tag } from '../../components/StatusBadge';

const zoneSlots = [
  { left: 8, top: 10, width: 28, height: 35 },
  { left: 39, top: 20, width: 26, height: 38 },
  { left: 68, top: 12, width: 24, height: 46 },
] as const;

export function SiteDashboardPage() {
  const { tenantId, siteId } = useParams();
  const site = getSiteById(siteId);
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const visibleAssets = useMemo(() => {
    if (zoneFilter === 'all') {
      return site.assetPoints;
    }
    return site.assetPoints.filter((asset) => asset.zoneId === zoneFilter);
  }, [site.assetPoints, zoneFilter]);

  const visibleStatusMix = useMemo(() => buildStatusMix(visibleAssets), [visibleAssets]);

  const zoneRiskData = site.zoneSummaries.map((zone) => ({
    zone: zone.id.toUpperCase(),
    assets: zone.assets,
    offline: zone.offline,
    warning: zone.warning,
    critical: zone.critical,
  }));

  return (
    <>
      <section className="card">
        <div className="panel-title-row">
          <div>
            <h2>{site.name}</h2>
            <p className="text-muted">
              Site reference {site.ref} · {site.region} · {site.lat.toFixed(4)}, {site.lng.toFixed(4)}
            </p>
          </div>
          <Tag>{site.ref}</Tag>
        </div>

        <div className="grid-4">
          <article className="kpi">
            <span className="text-muted">Availability</span>
            <strong>{site.availability.toFixed(1)}%</strong>
            <StatusBadge status={site.availability >= 98 ? 'OK' : 'Warning'} />
          </article>
          <article className="kpi">
            <span className="text-muted">Assets</span>
            <strong>{site.assets}</strong>
            <StatusBadge status="OK" />
          </article>
          <article className="kpi">
            <span className="text-muted">Offline</span>
            <strong>{site.offline}</strong>
            <StatusBadge status={site.offline > 5 ? 'Warning' : 'OK'} />
          </article>
          <article className="kpi">
            <span className="text-muted">Open Tickets</span>
            <strong>{site.openTickets}</strong>
            <StatusBadge status={site.openTickets > 10 ? 'Warning' : 'OK'} />
          </article>
        </div>
      </section>

      <section className="card">
        <div className="panel-title-row">
          <h3>
            <LocateFixed size={16} /> Asset Placement Map
          </h3>
          <div className="zone-filter-row">
            <button
              className={`btn-ghost compact ${zoneFilter === 'all' ? 'selected' : ''}`}
              onClick={() => setZoneFilter('all')}
              type="button"
            >
              All Zones
            </button>
            {site.zoneSummaries.map((zone) => (
              <button
                key={zone.id}
                className={`btn-ghost compact ${zoneFilter === zone.id ? 'selected' : ''}`}
                onClick={() => setZoneFilter(zone.id)}
                type="button"
              >
                {zone.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="asset-map-shell">
          {site.zoneSummaries.map((zone, index) => {
            const slot = zoneSlots[index];
            if (!slot) {
              return null;
            }

            return (
              <div
                key={zone.id}
                className={`zone-block ${zoneFilter === 'all' || zoneFilter === zone.id ? 'active' : ''}`}
                style={{
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`,
                }}
              >
                <span>
                  {zone.id.toUpperCase()} · {zone.name}
                </span>
              </div>
            );
          })}

          {visibleAssets.map((asset) => (
            <button
              key={asset.assetTag}
              type="button"
              className={`asset-point point-${asset.status.toLowerCase()}`}
              style={{ left: `${asset.x}%`, top: `${asset.y}%` }}
              title={`${asset.assetTag} | ${asset.zoneLabel} | ${asset.status} | Last seen ${asset.lastSeen}`}
            >
              <span>{asset.assetTag}</span>
            </button>
          ))}
        </div>

        <div className="status-legend compact-legend">
          {visibleStatusMix.map((entry) => (
            <div key={entry.name}>
              <span className={`swatch swatch-${entry.name.toLowerCase()}`} />
              <p>
                {entry.name}
                <strong>{entry.value}</strong>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid-2">
        <article className="card">
          <div className="panel-title-row">
            <h3>
              <Activity size={16} /> Availability vs Offline Trend
            </h3>
            <Tag>16h window</Tag>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={site.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis yAxisId="left" domain={[96, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="availability" stroke="var(--accent)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="offlineAssets" stroke="#c0392b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <div className="panel-title-row">
            <h3>
              <Building2 size={16} /> Zone Risk Distribution
            </h3>
            <Tag>{site.ref}</Tag>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneRiskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="zone" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="assets" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="warning" fill="#c98a00" radius={[6, 6, 0, 0]} />
                <Bar dataKey="offline" fill="#6b7280" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="card">
        <h3>Zone Operations</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Assets</th>
              <th>Current Schedule</th>
              <th>Last Override</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            {site.zoneSummaries.map((zone) => (
              <tr key={zone.id}>
                <td>
                  <Link to={`/app/${tenantId ?? 'demo-tenant'}/sites/${site.id}/zones/${zone.id}`}>{zone.name}</Link>
                  <p className="text-muted">Ref: {site.ref}</p>
                </td>
                <td>{zone.assets}</td>
                <td>
                  <Tag>{zone.schedule}</Tag>
                </td>
                <td>{zone.lastOverride}</td>
                <td>
                  <StatusBadge status={zone.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <div className="panel-title-row">
          <h3>Energy Profile</h3>
          <Tag>Today</Tag>
        </div>
        <div className="chart-frame">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={site.trend}>
              <defs>
                <linearGradient id="siteEnergyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0a7ea4" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#0a7ea4" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="energyMwh" stroke="var(--accent)" fill="url(#siteEnergyGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
