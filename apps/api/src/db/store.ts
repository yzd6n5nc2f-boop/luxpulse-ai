import { randomUUID } from 'node:crypto';
import type { Asset, ControlAction, EventRecord, Site, TelemetryPoint, Tenant, Ticket, Zone } from '@luxpulse/canonical-model';

export type AdapterRecord = {
  id: string;
  tenantId: string;
  siteId: string;
  type: 'protocol_gateway' | 'vendor_api' | 'file_onboarding';
  name: string;
  configJson: Record<string, unknown>;
  status: 'OK' | 'Warning' | 'Critical' | 'Offline';
  lastHeartbeatAt: string;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  createdAt: string;
};

export type CredentialSet = {
  id: string;
  tenantId: string;
  siteId: string;
  adapterId: string;
  secretRef: string;
  rotatedAt: string;
  rotatedBy: string;
  createdAt: string;
};

export type EvidencePack = {
  id: string;
  tenantId: string;
  siteId: string;
  requestedBy: string;
  periodStart: string;
  periodEnd: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  manifestJson: Record<string, unknown>;
  artifactRef: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type RulesDefinition = {
  id: string;
  version: number;
  name: string;
  enabled: boolean;
  conditionJson: Record<string, unknown>;
  actionJson: Record<string, unknown>;
  createdAt: string;
};

export const store: {
  tenants: Tenant[];
  sites: Site[];
  zones: Zone[];
  assets: Asset[];
  telemetry: TelemetryPoint[];
  events: EventRecord[];
  tickets: Ticket[];
  controlActions: ControlAction[];
  adapters: AdapterRecord[];
  credentialSets: CredentialSet[];
  evidencePacks: EvidencePack[];
  rules: RulesDefinition[];
} = {
  tenants: [],
  sites: [],
  zones: [],
  assets: [],
  telemetry: [],
  events: [],
  tickets: [],
  controlActions: [],
  adapters: [],
  credentialSets: [],
  evidencePacks: [],
  rules: [],
};

export function seedStore() {
  if (store.tenants.length > 0) {
    return;
  }

  const now = new Date().toISOString();
  const tenantId = randomUUID();
  const siteIds = [randomUUID(), randomUUID(), randomUUID()] as const;
  const zoneIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID(), randomUUID()] as const;

  store.tenants.push({
    id: tenantId,
    name: 'Demo FM Tenant',
    status: 'active',
    createdAt: now,
  });

  store.sites.push(
    {
      id: siteIds[0],
      tenantId,
      name: 'London West Retail Park',
      timezone: 'Europe/London',
      latitude: 51.5072,
      longitude: -0.1276,
      createdAt: now,
    },
    {
      id: siteIds[1],
      tenantId,
      name: 'Birmingham Logistics Hub',
      timezone: 'Europe/London',
      latitude: 52.4862,
      longitude: -1.8904,
      createdAt: now,
    },
    {
      id: siteIds[2],
      tenantId,
      name: 'Manchester Commerce Campus',
      timezone: 'Europe/London',
      latitude: 53.4808,
      longitude: -2.2426,
      createdAt: now,
    },
  );

  store.zones.push(
    { id: zoneIds[0], tenantId, siteId: siteIds[0], name: 'Ground Floor Retail', type: 'retail', createdAt: now },
    { id: zoneIds[1], tenantId, siteId: siteIds[0], name: 'Loading Corridor', type: 'logistics', createdAt: now },
    { id: zoneIds[2], tenantId, siteId: siteIds[1], name: 'Dispatch Hall', type: 'warehouse', createdAt: now },
    { id: zoneIds[3], tenantId, siteId: siteIds[2], name: 'Atrium', type: 'commercial', createdAt: now },
    { id: zoneIds[4], tenantId, siteId: siteIds[2], name: 'Parking Deck', type: 'outdoor', createdAt: now },
  );

  for (let i = 0; i < 120; i += 1) {
    const siteId = siteIds[i % siteIds.length]!;
    const zoneId = zoneIds[i % zoneIds.length]!;
    store.assets.push({
      id: randomUUID(),
      tenantId,
      siteId,
      zoneId,
      assetTag: `LUX-${String(i + 1).padStart(4, '0')}`,
      serialNumber: `SN-${100000 + i}`,
      manufacturer: i % 2 === 0 ? 'VendorA' : 'VendorB',
      model: i % 3 === 0 ? 'Linear Bay D4' : 'Panel L4',
      protocolType: i % 2 === 0 ? 'dali2' : 'bacnet',
      externalRef: null,
      status: i % 19 === 0 ? 'Offline' : i % 11 === 0 ? 'Warning' : 'OK',
      lastSeenAt: new Date(Date.now() - (i % 15) * 60_000).toISOString(),
      createdAt: now,
    });
  }

  store.adapters.push(
    {
      id: randomUUID(),
      tenantId,
      siteId: siteIds[0],
      type: 'protocol_gateway',
      name: 'DALI Gateway / West',
      configJson: { endpoint: 'tcp://edge-gw-west:5020' },
      status: 'OK',
      lastHeartbeatAt: now,
      lastSuccessAt: now,
      lastErrorAt: null,
      createdAt: now,
    },
    {
      id: randomUUID(),
      tenantId,
      siteId: siteIds[1],
      type: 'vendor_api',
      name: 'Vendor Cloud A',
      configJson: { baseUrl: 'https://api.vendor-a.example' },
      status: 'Warning',
      lastHeartbeatAt: now,
      lastSuccessAt: now,
      lastErrorAt: now,
      createdAt: now,
    },
  );

  store.rules.push(
    {
      id: 'offline-threshold',
      version: 3,
      name: 'No heartbeat over threshold',
      enabled: true,
      conditionJson: { metric: 'heartbeat', noDataMinutes: 10 },
      actionJson: { eventType: 'asset_offline', severity: 'critical', openTicket: true },
      createdAt: now,
    },
    {
      id: 'power-anomaly',
      version: 2,
      name: 'Power draw anomaly',
      enabled: true,
      conditionJson: { metric: 'power_w', deviationPct: 25 },
      actionJson: { eventType: 'power_anomaly', severity: 'warning', openTicket: true },
      createdAt: now,
    },
  );
}
