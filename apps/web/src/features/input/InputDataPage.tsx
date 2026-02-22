import { Layers, MapPinned, Plus, Save } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { StatusBadge, Tag } from '../../components/StatusBadge';

type InputSite = {
  id: string;
  tenantId: string;
  siteRef: string;
  name: string;
  region: string;
  timezone: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

type InputFloor = {
  id: string;
  tenantId: string;
  siteId: string;
  floorRef: string;
  name: string;
  levelIndex: number;
  widthMeters: number;
  heightMeters: number;
  createdAt: string;
};

type InputZone = {
  id: string;
  tenantId: string;
  siteId: string;
  floorId: string | null;
  zoneRef: string;
  name: string;
  zoneType: string;
  createdAt: string;
};

type InputAsset = {
  id: string;
  tenantId: string;
  siteId: string;
  floorId: string | null;
  zoneId: string | null;
  assetTag: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  protocolType: string;
  status: 'OK' | 'Warning' | 'Critical' | 'Offline';
  createdAt: string;
};

type InputPosition = {
  assetId: string;
  positionMode: 'indoor_xy' | 'geo';
  xPct: number | null;
  yPct: number | null;
  latitude: number | null;
  longitude: number | null;
  source: string;
  updatedAt: string;
};

type InputLayout = {
  site: InputSite;
  floors: InputFloor[];
  zones: InputZone[];
  assets: InputAsset[];
  positions: InputPosition[];
};

type InputSummaryRow = {
  siteId: string;
  siteRef: string;
  siteName: string;
  floors: number;
  zones: number;
  assets: number;
  positionedAssets: number;
  lastUpdatedAt: string;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const osmTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osmAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type LatLng = [number, number];

function ApiLocationPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (event) => {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function mapIndoorToGeo(site: InputSite, position: InputPosition): LatLng | null {
  if (position.positionMode !== 'indoor_xy' || position.xPct === null || position.yPct === null) {
    return null;
  }

  const latOffset = ((50 - position.yPct) / 100) * 0.006;
  const longitudeScale = Math.max(0.2, Math.cos((site.latitude * Math.PI) / 180));
  const lngOffset = (((position.xPct - 50) / 100) * 0.01) / longitudeScale;

  return [site.latitude + latOffset, site.longitude + lngOffset];
}

export function InputDataPage() {
  const { tenantId } = useParams();
  const resolvedTenantId = tenantId ?? 'demo-tenant';

  const [sites, setSites] = useState<InputSite[]>([]);
  const [summary, setSummary] = useState<InputSummaryRow[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [layout, setLayout] = useState<InputLayout | null>(null);
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [siteRef, setSiteRef] = useState('');
  const [siteName, setSiteName] = useState('');
  const [siteRegion, setSiteRegion] = useState('');
  const [siteTimezone, setSiteTimezone] = useState('Europe/London');
  const [siteLatitude, setSiteLatitude] = useState(51.5072);
  const [siteLongitude, setSiteLongitude] = useState(-0.1276);

  const [floorRef, setFloorRef] = useState('GF');
  const [floorName, setFloorName] = useState('Ground Floor');
  const [floorLevelIndex, setFloorLevelIndex] = useState(0);
  const [floorWidthMeters, setFloorWidthMeters] = useState(120);
  const [floorHeightMeters, setFloorHeightMeters] = useState(90);

  const [zoneRef, setZoneRef] = useState('Z-A');
  const [zoneName, setZoneName] = useState('Main Zone');
  const [zoneType, setZoneType] = useState('retail');
  const [zoneFloorId, setZoneFloorId] = useState<string>('');

  const [assetTag, setAssetTag] = useState('');
  const [assetSerial, setAssetSerial] = useState('');
  const [assetManufacturer, setAssetManufacturer] = useState('VendorA');
  const [assetModel, setAssetModel] = useState('Linear Bay D4');
  const [assetProtocol, setAssetProtocol] = useState('dali2');
  const [assetStatus, setAssetStatus] = useState<'OK' | 'Warning' | 'Critical' | 'Offline'>('OK');
  const [assetZoneId, setAssetZoneId] = useState<string>('');
  const [assetFloorId, setAssetFloorId] = useState<string>('');
  const [positionMode, setPositionMode] = useState<'indoor_xy' | 'geo'>('indoor_xy');
  const [positionXPct, setPositionXPct] = useState(50);
  const [positionYPct, setPositionYPct] = useState(50);
  const [positionLat, setPositionLat] = useState(51.5072);
  const [positionLng, setPositionLng] = useState(-0.1276);

  const selectedSite = useMemo(() => sites.find((site) => site.id === selectedSiteId) ?? null, [sites, selectedSiteId]);

  useEffect(() => {
    void refreshInputData();
  }, [resolvedTenantId]);

  useEffect(() => {
    if (!selectedSiteId && sites.length > 0) {
      setSelectedSiteId(sites[0]?.id ?? '');
    }
  }, [sites, selectedSiteId]);

  useEffect(() => {
    if (!selectedSiteId) {
      setLayout(null);
      return;
    }

    void loadSiteLayout(selectedSiteId);
  }, [selectedSiteId]);

  async function apiGet<T>(path: string): Promise<T> {
    const response = await fetch(`${apiBase}${path}`);
    if (!response.ok) {
      throw new Error(`GET ${path} failed (${response.status})`);
    }
    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${apiBase}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`POST ${path} failed (${response.status}): ${detail}`);
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  async function refreshInputData() {
    try {
      const [sitesData, summaryData] = await Promise.all([
        apiGet<InputSite[]>(`/input/tenants/${resolvedTenantId}/sites`),
        apiGet<InputSummaryRow[]>(`/input/tenants/${resolvedTenantId}/summary`),
      ]);
      setSites(sitesData);
      setSummary(summaryData);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(String(error));
    }
  }

  async function loadSiteLayout(siteId: string) {
    try {
      const siteLayout = await apiGet<InputLayout>(`/input/sites/${siteId}/layout`);
      setLayout(siteLayout);
      setZoneFloorId(siteLayout.floors[0]?.id ?? '');
      setAssetFloorId(siteLayout.floors[0]?.id ?? '');
      setAssetZoneId(siteLayout.zones[0]?.id ?? '');
      setPositionLat(siteLayout.site.latitude);
      setPositionLng(siteLayout.site.longitude);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(String(error));
    }
  }

  async function handleCreateSite(event: FormEvent) {
    event.preventDefault();
    try {
      await apiPost<InputSite>(`/input/tenants/${resolvedTenantId}/sites`, {
        siteRef,
        name: siteName,
        region: siteRegion,
        timezone: siteTimezone,
        latitude: siteLatitude,
        longitude: siteLongitude,
      });
      setInfoMessage(`Site ${siteRef} saved`);
      setSiteRef('');
      setSiteName('');
      setSiteRegion('');
      await refreshInputData();
    } catch (error) {
      setErrorMessage(String(error));
    }
  }

  async function handleCreateFloor(event: FormEvent) {
    event.preventDefault();
    if (!selectedSiteId) {
      setErrorMessage('Select a site first');
      return;
    }

    try {
      await apiPost<InputFloor>(`/input/tenants/${resolvedTenantId}/sites/${selectedSiteId}/floors`, {
        floorRef,
        name: floorName,
        levelIndex: floorLevelIndex,
        widthMeters: floorWidthMeters,
        heightMeters: floorHeightMeters,
      });
      setInfoMessage(`Floor ${floorRef} saved`);
      await loadSiteLayout(selectedSiteId);
      await refreshInputData();
    } catch (error) {
      setErrorMessage(String(error));
    }
  }

  async function handleCreateZone(event: FormEvent) {
    event.preventDefault();
    if (!selectedSiteId) {
      setErrorMessage('Select a site first');
      return;
    }

    try {
      await apiPost<InputZone>(`/input/tenants/${resolvedTenantId}/sites/${selectedSiteId}/zones`, {
        floorId: zoneFloorId || null,
        zoneRef,
        name: zoneName,
        zoneType,
      });
      setInfoMessage(`Zone ${zoneRef} saved`);
      await loadSiteLayout(selectedSiteId);
      await refreshInputData();
    } catch (error) {
      setErrorMessage(String(error));
    }
  }

  async function handleCreateAsset(event: FormEvent) {
    event.preventDefault();
    if (!selectedSiteId) {
      setErrorMessage('Select a site first');
      return;
    }

    try {
      await apiPost<InputAsset>('/input/assets', {
        tenantId: resolvedTenantId,
        siteId: selectedSiteId,
        floorId: assetFloorId || null,
        zoneId: assetZoneId || null,
        assetTag,
        serialNumber: assetSerial,
        manufacturer: assetManufacturer,
        model: assetModel,
        protocolType: assetProtocol,
        status: assetStatus,
        position: {
          mode: positionMode,
          xPct: positionMode === 'indoor_xy' ? positionXPct : null,
          yPct: positionMode === 'indoor_xy' ? positionYPct : null,
          latitude: positionMode === 'geo' ? positionLat : null,
          longitude: positionMode === 'geo' ? positionLng : null,
          source: 'manual_input',
        },
      });

      setInfoMessage(`Asset ${assetTag} saved`);
      setAssetTag('');
      setAssetSerial('');
      await loadSiteLayout(selectedSiteId);
      await refreshInputData();
    } catch (error) {
      setErrorMessage(String(error));
    }
  }

  function handleIndoorPicker(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPositionXPct(Math.max(0, Math.min(100, Number(x.toFixed(2)))));
    setPositionYPct(Math.max(0, Math.min(100, Number(y.toFixed(2)))));
  }

  const geoCenter: LatLng = selectedSite ? [selectedSite.latitude, selectedSite.longitude] : [54.5, -2.2];

  return (
    <>
      <section className="card">
        <div className="panel-title-row">
          <div>
            <h2>Data Input and Mapping</h2>
            <p className="text-muted">
              Capture site, building, and asset positions directly into the platform input database.
            </p>
          </div>
          <Tag>Tenant: {resolvedTenantId}</Tag>
        </div>

        {infoMessage ? <p className="notice success">{infoMessage}</p> : null}
        {errorMessage ? <p className="notice error">{errorMessage}</p> : null}

        <div className="grid-2">
          <article className="monitor-panel">
            <div className="panel-title-row">
              <h3>
                <MapPinned size={16} /> 1) Register Site Location
              </h3>
              <Tag>Database Input</Tag>
            </div>
            <form className="input-form" onSubmit={handleCreateSite}>
              <div className="grid-2">
                <label className="field">
                  Site Reference
                  <input value={siteRef} onChange={(event) => setSiteRef(event.target.value)} placeholder="LXP-UK-010" required />
                </label>
                <label className="field">
                  Site Name
                  <input value={siteName} onChange={(event) => setSiteName(event.target.value)} placeholder="Leeds Retail Centre" required />
                </label>
                <label className="field">
                  Region
                  <input value={siteRegion} onChange={(event) => setSiteRegion(event.target.value)} placeholder="West Yorkshire" required />
                </label>
                <label className="field">
                  Timezone
                  <input value={siteTimezone} onChange={(event) => setSiteTimezone(event.target.value)} required />
                </label>
                <label className="field">
                  Latitude
                  <input
                    type="number"
                    step="0.0001"
                    value={siteLatitude}
                    onChange={(event) => setSiteLatitude(Number(event.target.value))}
                    required
                  />
                </label>
                <label className="field">
                  Longitude
                  <input
                    type="number"
                    step="0.0001"
                    value={siteLongitude}
                    onChange={(event) => setSiteLongitude(Number(event.target.value))}
                    required
                  />
                </label>
              </div>

              <div className="leaflet-map-shell input-map">
                <MapContainer center={[54.5, -2.2]} zoom={6} minZoom={5} maxZoom={18} className="leaflet-map">
                  <TileLayer attribution={osmAttribution} url={osmTileUrl} />
                  <ApiLocationPicker
                    onPick={(lat, lng) => {
                      setSiteLatitude(Number(lat.toFixed(5)));
                      setSiteLongitude(Number(lng.toFixed(5)));
                    }}
                  />
                  <CircleMarker
                    center={[siteLatitude, siteLongitude]}
                    radius={10}
                    pathOptions={{ color: '#0a7ea4', fillColor: '#0a7ea4', fillOpacity: 0.75, weight: 2 }}
                  />
                </MapContainer>
              </div>

              <button className="btn-primary" type="submit">
                <Save size={14} /> Save Site
              </button>
            </form>
          </article>

          <article className="monitor-panel">
            <div className="panel-title-row">
              <h3>
                <Layers size={16} /> 2) Building and Asset Input
              </h3>
              <Tag>{selectedSite?.siteRef ?? 'No site selected'}</Tag>
            </div>

            <label className="field">
              Selected Site
              <select value={selectedSiteId} onChange={(event) => setSelectedSiteId(event.target.value)}>
                <option value="">Select site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.siteRef} · {site.name}
                  </option>
                ))}
              </select>
            </label>

            <form className="input-form inline-form" onSubmit={handleCreateFloor}>
              <h4>Floor</h4>
              <div className="grid-3">
                <label className="field">
                  Floor Ref
                  <input value={floorRef} onChange={(event) => setFloorRef(event.target.value)} required />
                </label>
                <label className="field">
                  Name
                  <input value={floorName} onChange={(event) => setFloorName(event.target.value)} required />
                </label>
                <label className="field">
                  Level
                  <input
                    type="number"
                    value={floorLevelIndex}
                    onChange={(event) => setFloorLevelIndex(Number(event.target.value))}
                    required
                  />
                </label>
                <label className="field">
                  Width (m)
                  <input
                    type="number"
                    value={floorWidthMeters}
                    onChange={(event) => setFloorWidthMeters(Number(event.target.value))}
                    required
                  />
                </label>
                <label className="field">
                  Height (m)
                  <input
                    type="number"
                    value={floorHeightMeters}
                    onChange={(event) => setFloorHeightMeters(Number(event.target.value))}
                    required
                  />
                </label>
              </div>
              <button className="btn-ghost" type="submit">
                <Plus size={14} /> Add Floor
              </button>
            </form>

            <form className="input-form inline-form" onSubmit={handleCreateZone}>
              <h4>Zone</h4>
              <div className="grid-3">
                <label className="field">
                  Zone Ref
                  <input value={zoneRef} onChange={(event) => setZoneRef(event.target.value)} required />
                </label>
                <label className="field">
                  Name
                  <input value={zoneName} onChange={(event) => setZoneName(event.target.value)} required />
                </label>
                <label className="field">
                  Type
                  <input value={zoneType} onChange={(event) => setZoneType(event.target.value)} required />
                </label>
                <label className="field">
                  Floor
                  <select value={zoneFloorId} onChange={(event) => setZoneFloorId(event.target.value)}>
                    <option value="">Unassigned</option>
                    {layout?.floors.map((floor) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.floorRef} · {floor.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button className="btn-ghost" type="submit">
                <Plus size={14} /> Add Zone
              </button>
            </form>
          </article>
        </div>
      </section>

      <section className="card">
        <div className="panel-title-row">
          <h3>3) Register Assets and Positioning</h3>
          <Tag>{layout?.assets.length ?? 0} assets in selected site</Tag>
        </div>

        <div className="grid-2">
          <form className="input-form" onSubmit={handleCreateAsset}>
            <div className="grid-3">
              <label className="field">
                Asset Tag
                <input value={assetTag} onChange={(event) => setAssetTag(event.target.value)} placeholder="LUX-0401" required />
              </label>
              <label className="field">
                Serial Number
                <input
                  value={assetSerial}
                  onChange={(event) => setAssetSerial(event.target.value)}
                  placeholder="SN-220001"
                  required
                />
              </label>
              <label className="field">
                Manufacturer
                <input value={assetManufacturer} onChange={(event) => setAssetManufacturer(event.target.value)} required />
              </label>
              <label className="field">
                Model
                <input value={assetModel} onChange={(event) => setAssetModel(event.target.value)} required />
              </label>
              <label className="field">
                Protocol
                <input value={assetProtocol} onChange={(event) => setAssetProtocol(event.target.value)} required />
              </label>
              <label className="field">
                Status
                <select value={assetStatus} onChange={(event) => setAssetStatus(event.target.value as typeof assetStatus)}>
                  <option value="OK">OK</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                  <option value="Offline">Offline</option>
                </select>
              </label>
              <label className="field">
                Floor
                <select value={assetFloorId} onChange={(event) => setAssetFloorId(event.target.value)}>
                  <option value="">Unassigned</option>
                  {layout?.floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.floorRef} · {floor.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Zone
                <select value={assetZoneId} onChange={(event) => setAssetZoneId(event.target.value)}>
                  <option value="">Unassigned</option>
                  {layout?.zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.zoneRef} · {zone.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="position-mode-row">
              <label>
                <input
                  type="radio"
                  name="positionMode"
                  checked={positionMode === 'indoor_xy'}
                  onChange={() => setPositionMode('indoor_xy')}
                />
                Indoor XY (typical for floor plan)
              </label>
              <label>
                <input type="radio" name="positionMode" checked={positionMode === 'geo'} onChange={() => setPositionMode('geo')} />
                Geo (outdoor or campus assets)
              </label>
            </div>

            {positionMode === 'indoor_xy' ? (
              <>
                <div className="floor-grid-picker" onClick={handleIndoorPicker} role="button" tabIndex={0}>
                  <span
                    className="floor-grid-pin"
                    style={{ left: `${positionXPct}%`, top: `${positionYPct}%` }}
                    aria-hidden
                  />
                </div>
                <p className="text-muted">Indoor coordinate: X {positionXPct.toFixed(1)}% · Y {positionYPct.toFixed(1)}%</p>
              </>
            ) : (
              <>
                <div className="leaflet-map-shell input-map compact-map">
                  <MapContainer center={geoCenter} zoom={15} minZoom={13} maxZoom={19} className="leaflet-map">
                    <TileLayer attribution={osmAttribution} url={osmTileUrl} />
                    <ApiLocationPicker
                      onPick={(lat, lng) => {
                        setPositionLat(Number(lat.toFixed(6)));
                        setPositionLng(Number(lng.toFixed(6)));
                      }}
                    />
                    <CircleMarker
                      center={[positionLat, positionLng]}
                      radius={8}
                      pathOptions={{ color: '#c0392b', fillColor: '#c0392b', fillOpacity: 0.8, weight: 1 }}
                    />
                  </MapContainer>
                </div>
                <p className="text-muted">Geo coordinate: {positionLat.toFixed(6)}, {positionLng.toFixed(6)}</p>
              </>
            )}

            <button className="btn-primary" type="submit">
              <Save size={14} /> Save Asset
            </button>
          </form>

          <article className="monitor-panel">
            <div className="panel-title-row">
              <h4>Layout Preview</h4>
              <Tag>{selectedSite?.siteRef ?? 'No site'}</Tag>
            </div>
            <div className="leaflet-map-shell input-map compact-map">
              <MapContainer center={geoCenter} zoom={14} minZoom={11} maxZoom={19} className="leaflet-map">
                <TileLayer attribution={osmAttribution} url={osmTileUrl} />
                {selectedSite ? (
                  <CircleMarker
                    center={[selectedSite.latitude, selectedSite.longitude]}
                    radius={14}
                    pathOptions={{ color: '#0a7ea4', fillColor: '#0a7ea4', fillOpacity: 0.3, weight: 2 }}
                  />
                ) : null}
                {selectedSite && layout
                  ? layout.positions.map((position) => {
                      const geo =
                        position.positionMode === 'geo' && position.latitude !== null && position.longitude !== null
                          ? ([position.latitude, position.longitude] as LatLng)
                          : mapIndoorToGeo(selectedSite, position);

                      if (!geo) {
                        return null;
                      }

                      const asset = layout.assets.find((item) => item.id === position.assetId);
                      const color = asset?.status === 'Critical' ? '#c0392b' : asset?.status === 'Warning' ? '#c98a00' : asset?.status === 'Offline' ? '#6b7280' : '#1f9d55';

                      return (
                        <CircleMarker
                          key={position.assetId}
                          center={geo}
                          radius={5}
                          pathOptions={{ color, fillColor: color, fillOpacity: 0.95, weight: 1 }}
                        />
                      );
                    })
                  : null}
              </MapContainer>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Zone</th>
                  <th>Status</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {layout?.assets.slice(0, 12).map((asset) => {
                  const position = layout.positions.find((item) => item.assetId === asset.id);
                  const zone = layout.zones.find((item) => item.id === asset.zoneId);

                  return (
                    <tr key={asset.id}>
                      <td>{asset.assetTag}</td>
                      <td>{zone?.zoneRef ?? 'Unassigned'}</td>
                      <td>
                        <StatusBadge status={asset.status} />
                      </td>
                      <td>
                        {position
                          ? position.positionMode === 'geo'
                            ? `${position.latitude?.toFixed(4)}, ${position.longitude?.toFixed(4)}`
                            : `X ${position.xPct?.toFixed(1)} / Y ${position.yPct?.toFixed(1)}`
                          : 'Not set'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </article>
        </div>
      </section>

      <section className="card">
        <h3>Input Coverage Summary</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Site Ref</th>
              <th>Site</th>
              <th>Floors</th>
              <th>Zones</th>
              <th>Assets</th>
              <th>Positioned</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={row.siteId}>
                <td>
                  <Tag>{row.siteRef}</Tag>
                </td>
                <td>{row.siteName}</td>
                <td>{row.floors}</td>
                <td>{row.zones}</td>
                <td>{row.assets}</td>
                <td>{row.positionedAssets}</td>
                <td>{new Date(row.lastUpdatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
