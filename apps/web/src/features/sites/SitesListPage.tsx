import { Building2, Crosshair, MapPinned, Radar, ZoomIn } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { buildStatusMix, getSiteById, siteData, type SiteAssetPoint, type SiteRecord } from '../../app/mockData';
import { StatusBadge, Tag } from '../../components/StatusBadge';

const statusPalette = {
  OK: '#1f9d55',
  Warning: '#c98a00',
  Critical: '#c0392b',
  Offline: '#6b7280',
} as const;

const osmTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type MapMode = 'region' | 'site';
type LatLng = [number, number];

function computeRegionCenter(sites: SiteRecord[]): LatLng {
  const sums = sites.reduce(
    (acc, site) => {
      acc.lat += site.lat;
      acc.lng += site.lng;
      return acc;
    },
    { lat: 0, lng: 0 },
  );

  return [sums.lat / sites.length, sums.lng / sites.length];
}

function toLatLng(site: SiteRecord): LatLng {
  return [site.lat, site.lng];
}

function toAssetLatLng(site: SiteRecord, asset: SiteAssetPoint): LatLng {
  const latOffset = ((50 - asset.y) / 100) * 0.012;
  const longitudeScale = Math.max(0.2, Math.cos((site.lat * Math.PI) / 180));
  const lngOffset = (((asset.x - 50) / 100) * 0.018) / longitudeScale;

  return [site.lat + latOffset, site.lng + lngOffset];
}

function FlyToSite({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();

  const [lat, lng] = center;
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [map, lat, lng, zoom]);

  return null;
}

export function SitesListPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [selectedSiteId, setSelectedSiteId] = useState(siteData[0]?.id);
  const [mapMode, setMapMode] = useState<MapMode>('region');

  const selectedSite = getSiteById(selectedSiteId);
  const statusMix = useMemo(() => buildStatusMix(selectedSite.assetPoints), [selectedSite]);
  const regionCenter = useMemo(() => computeRegionCenter(siteData), []);
  const networkPath = useMemo(() => siteData.map((site) => toLatLng(site)), []);
  const selectedSiteCenter: LatLng = [selectedSite.lat, selectedSite.lng];

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
                Open Site Dashboard
              </Link>
            </div>

            <div className="leaflet-map-shell">
              {mapMode === 'region' ? (
                <MapContainer center={regionCenter} zoom={6} minZoom={5} maxZoom={9} scrollWheelZoom className="leaflet-map">
                  <TileLayer attribution={osmAttribution} url={osmTileUrl} />
                  <Polyline positions={networkPath} pathOptions={{ color: '#0a7ea4', opacity: 0.55, weight: 2 }} />
                  {siteData.map((site) => (
                    <CircleMarker
                      key={site.id}
                      center={toLatLng(site)}
                      radius={site.id === selectedSite.id ? 11 : 8}
                      pathOptions={{
                        color: '#0a7ea4',
                        weight: 2,
                        fillColor: site.id === selectedSite.id ? '#0a7ea4' : '#1f9d55',
                        fillOpacity: 0.9,
                      }}
                      eventHandlers={{ click: () => zoomToSite(site.id) }}
                    >
                      <Popup>
                        <strong>{site.name}</strong>
                        <br />
                        Ref: {site.ref}
                        <br />
                        Offline: {site.offline}
                        <br />
                        Click marker to zoom into site.
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              ) : (
                <MapContainer
                  center={selectedSiteCenter}
                  zoom={15}
                  minZoom={13}
                  maxZoom={19}
                  scrollWheelZoom
                  className="leaflet-map"
                >
                  <TileLayer attribution={osmAttribution} url={osmTileUrl} />
                  <FlyToSite center={selectedSiteCenter} zoom={15} />
                  <CircleMarker
                    center={selectedSiteCenter}
                    radius={14}
                    pathOptions={{ color: '#0a7ea4', fillColor: '#0a7ea4', fillOpacity: 0.35, weight: 2 }}
                  >
                    <Popup>
                      <strong>{selectedSite.name}</strong>
                      <br />
                      Ref: {selectedSite.ref}
                      <br />
                      {selectedSite.lat.toFixed(4)}, {selectedSite.lng.toFixed(4)}
                    </Popup>
                  </CircleMarker>
                  {selectedSite.assetPoints.map((asset) => (
                    <CircleMarker
                      key={asset.assetTag}
                      center={toAssetLatLng(selectedSite, asset)}
                      radius={5}
                      pathOptions={{
                        color: statusPalette[asset.status],
                        fillColor: statusPalette[asset.status],
                        fillOpacity: 0.94,
                        weight: 1,
                      }}
                      eventHandlers={{
                        click: () => navigate(`/app/${tenantId ?? 'demo-tenant'}/assets/${asset.assetTag}`),
                      }}
                    >
                      <Popup>
                        <strong>{asset.assetTag}</strong>
                        <br />
                        Zone: {asset.zoneLabel}
                        <br />
                        Status: {asset.status}
                        <br />
                        Last seen: {asset.lastSeen}
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              )}
            </div>
            <p className="map-footnote-inline">
              {mapMode === 'region'
                ? 'Click any site marker to zoom into that site.'
                : `Viewing ${selectedSite.ref}. Click asset dots to open individual assets.`}
            </p>

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
