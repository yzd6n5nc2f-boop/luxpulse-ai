export type UUID = string;

export type AssetStatus = 'OK' | 'Warning' | 'Critical' | 'Offline';
export type EventSeverity = 'info' | 'warning' | 'critical';
export type ActorType = 'user' | 'system';
export type TargetType = 'tenant' | 'site' | 'zone' | 'asset';

export interface Tenant {
  id: UUID;
  name: string;
  status: 'active' | 'paused';
  createdAt: string;
}

export interface Site {
  id: UUID;
  tenantId: UUID;
  name: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface Zone {
  id: UUID;
  tenantId: UUID;
  siteId: UUID;
  name: string;
  type: string;
  createdAt: string;
}

export interface Asset {
  id: UUID;
  tenantId: UUID;
  siteId: UUID;
  zoneId: UUID;
  assetTag: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  protocolType: string;
  externalRef: string | null;
  status: AssetStatus;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface TelemetryPoint {
  id: UUID;
  tenantId: UUID;
  siteId: UUID;
  zoneId: UUID;
  assetId: UUID;
  ts: string;
  metricKey: string;
  metricValue: number;
  unit: string;
  quality: string;
  adapterId: UUID;
  rawPayloadRef: string | null;
}

export interface EventRecord {
  id: UUID;
  tenantId: UUID;
  siteId: UUID;
  zoneId: UUID;
  assetId: UUID;
  type: string;
  severity: EventSeverity;
  status: 'open' | 'acknowledged' | 'closed';
  detectedAt: string;
  acknowledgedAt: string | null;
  ruleId: string | null;
  ruleVersion: number | null;
  correlationId: string;
  rawPayloadRef: string | null;
}

export interface Ticket {
  id: UUID;
  tenantId: UUID;
  siteId: UUID;
  zoneId: UUID;
  assetId: UUID;
  sourceEventId: UUID | null;
  status: 'open' | 'assigned' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  openedAt: string;
  assignedTo: string | null;
  slaDueAt: string | null;
  closedAt: string | null;
  resolutionSummary: string | null;
}

export interface ControlAction {
  id: UUID;
  tenantId: UUID;
  actorType: ActorType;
  actorId: string;
  targetType: TargetType;
  targetId: UUID;
  actionType: string;
  justification: string;
  beforeStateJson: Record<string, unknown>;
  afterStateJson: Record<string, unknown>;
  approvalJson: Record<string, unknown> | null;
  correlationId: string;
  adapterResponseRef: string | null;
  createdAt: string;
}

export interface EvidencePackManifest {
  id: UUID;
  tenantId: UUID;
  siteId: UUID;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  includes: string[];
  checksums: Array<{ item: string; sha256: string }>;
}
