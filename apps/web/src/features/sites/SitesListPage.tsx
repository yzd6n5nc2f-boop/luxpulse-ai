import { Building2, Crosshair, MapPinned, Radar, ZoomIn } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildStatusMix, getSiteById, siteData } from '../../app/mockData';
import { StatusBadge, Tag } from '../../components/StatusBadge';

const statusPalette = {
  OK: '#1f9d55',
  Warning: '#c98a00',
  Critical: '#c0392b',
  Offline: '#6b7280',
} as const;

const zoneSlots = [
  { left: 8, top: 10, width: 28, height: 35 },
  { left: 39, top: 20, width: 26, height: 38 },
  { left: 68, top: 12, width: 24, height: 46 },
] as const;

type MapMode = 'region' | 'site';

export function SitesListPage() {
  const { tenantId } = useParams();
  const [selectedSiteId, setSelectedSiteId] = useState(siteData[0]?.id);
  const [mapMode, setMapMode] = useState<MapMode>('region');

  const selectedSite = getSiteById(selectedSiteId);
  const statusMix = useMemo(() => buildStatusMix(selectedSite.assetPoints), [selectedSite]);
  const networkEdges = useMemo(
    () => siteData.slice(1).map((site, index) => ({ from: siteData[index]!, to: site })),
    [],
  );

  const zoomToSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    setMapMode('site');
  };

  return (
    <>
      <section className="card">
        <div className="panel-title-row">
          <div>
            <h2>Network Monitoring Hub</h2>
            <p className="text-muted">
              Unified map + analytics view for multi-site lighting operations with unique site references.
            </p>
          </div>
          <Tag>Tenant: {tenantId ?? 'demo-tenant'}</Tag>
        </div>

        <div className="monitoring-grid">
          <article className="monitor-panel">
            <div className="panel-title-row">
              <h3>
                <MapPinned size={16} /> Site Map
              </h3>
              <Tag>{mapMode === 'region' ? 'Region View' : `Zoomed: ${selectedSite.ref}`}</Tag>
            </div>

            <div className="map-toolbar">
              <button
                className={`btn-ghost compact ${mapMode === 'region' ? 'selected' : ''}`}
                type="button"
                onClick={() => setMapMode('region')}
              >
                <Crosshair size={14} />
                Region Map
              </button>
              <button
                className={`btn-ghost compact ${mapMode === 'site' ? 'selected' : ''}`}
                type="button"
                onClick={() => setMapMode('site')}
              >
                <ZoomIn size={14} />
                Zoom to {selectedSite.ref}
              </button>
              <Link className="btn-primary compact-link" to={`/app/${tenantId ?? 'demo-tenant'}/sites/${selectedSite.id}`}>
                Open Full Site
              </Link>
            </div>

            {mapMode === 'region' ? (
              <div className="region-map-canvas">
                <div className="site-map-grid" />
                <svg className="network-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                  {networkEdges.map((edge) => (
                    <line
                      key={`${edge.from.id}-${edge.to.id}`}
                      x1={edge.from.mapX}
                      y1={edge.from.mapY}
                      x2={edge.to.mapX}
                      y2={edge.to.mapY}
                    />
                  ))}
                </svg>
                {siteData.map((site) => (
                  <button
                    key={site.id}
                    className={`region-site-dot ${site.id === selectedSite.id ? 'active' : ''}`}
                    style={{ left: `${site.mapX}%`, top: `${site.mapY}%` }}
                    onClick={() => zoomToSite(site.id)}
                    type="button"
                  >
                    <span className="region-dot-core" />
                    <div className="region-site-label">
                      <strong>{site.ref}</strong>
                      <small>{site.name}</small>
                    </div>
                  </button>
                ))}
                <p className="map-footnote">Click a site marker to zoom into the site layout.</p>
              </div>
            ) : (
              <div className="site-zoom-canvas">
                <div className="site-map-grid" />
                {selectedSite.zoneSummaries.map((zone, index) => {
                  const slot = zoneSlots[index];
                  if (!slot) {
                    return null;
                  }
                  return (
                    <div
                      key={zone.id}
                      className="zone-block active"
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
                {selectedSite.assetPoints.map((asset) => (
                  <Link
                    key={asset.assetTag}
                    to={`/app/${tenantId ?? 'demo-tenant'}/assets/${asset.assetTag}`}
                    className={`asset-point point-${asset.status.toLowerCase()}`}
                    style={{ left: `${asset.x}%`, top: `${asset.y}%` }}
                    title={`${asset.assetTag} · ${asset.zoneLabel} · ${asset.status} · Last seen ${asset.lastSeen}`}
                  >
                    <span>{asset.assetTag}</span>
                  </Link>
                ))}
                <p className="map-footnote">Live asset dots for {selectedSite.ref}. Click any dot to open the asset.</p>
              </div>
            )}

            <div className="site-metadata">
              <div className="key-value-grid">
                <div>
                  <span className="text-muted">Selected Site</span>
                  <strong>{selectedSite.name}</strong>
                </div>
                <div>
                  <span className="text-muted">Region</span>
                  <strong>{selectedSite.region}</strong>
                </div>
                <div>
                  <span className="text-muted">Coordinates</span>
                  <strong>
                    {selectedSite.lat.toFixed(4)}, {selectedSite.lng.toFixed(4)}
                  </strong>
                </div>
                <div>
                  <span className="text-muted">Reference</span>
                  <strong>{selectedSite.ref}</strong>
                </div>
              </div>
              <Link className="btn-primary" to={`/app/${tenantId ?? 'demo-tenant'}/sites/${selectedSite.id}`}>
                Open Site Dashboard
              </Link>
            </div>
          </article>

          <article className="monitor-panel">
            <div className="panel-title-row">
              <h3>
                <Building2 size={16} /> Live Site Register
              </h3>
              <Tag>{siteData.length} Sites</Tag>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Site</th>
                  <th>Assets</th>
                  <th>Availability</th>
                  <th>Offline</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {siteData.map((site) => (
                  <tr
                    key={site.id}
                    className={`${site.id === selectedSite.id ? 'row-active' : ''} clickable-row`}
                    onClick={() => setSelectedSiteId(site.id)}
                  >
                    <td>
                      <Tag>{site.ref}</Tag>
                    </td>
                    <td>
                      <Link to={`/app/${tenantId ?? 'demo-tenant'}/sites/${site.id}`}>{site.name}</Link>
                    </td>
                    <td>{site.assets}</td>
                    <td>{site.availability.toFixed(1)}%</td>
                    <td>{site.offline}</td>
                    <td>
                      <StatusBadge status={site.offline > 6 ? 'Warning' : 'OK'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </div>

        <div className="grid-3">
          <article className="monitor-panel">
            <div className="panel-title-row">
              <h3>Availability Trend</h3>
              <Tag>Last 16h</Tag>
            </div>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedSite.trend}>
                  <defs>
                    <linearGradient id="availabilityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a7ea4" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#0a7ea4" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis domain={[96, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="availability"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="url(#availabilityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="monitor-panel">
            <div className="panel-title-row">
              <h3>Energy and Fault Pulse</h3>
              <Tag>Operational</Tag>
            </div>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedSite.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="energyMwh" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="faults" fill="#c98a00" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="monitor-panel">
            <div className="panel-title-row">
              <h3>
                <Radar size={16} /> Asset Health Mix
              </h3>
              <Tag>{selectedSite.assets} assets</Tag>
            </div>
            <div className="chart-frame">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusMix}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {statusMix.map((entry) => (
                      <Cell key={entry.name} fill={statusPalette[entry.name as keyof typeof statusPalette]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="status-legend">
              {statusMix.map((entry) => (
                <div key={entry.name}>
                  <span style={{ backgroundColor: statusPalette[entry.name as keyof typeof statusPalette] }} />
                  <p>
                    {entry.name}
                    <strong>{entry.value}</strong>
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
