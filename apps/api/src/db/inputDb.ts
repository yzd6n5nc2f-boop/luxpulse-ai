import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { nowIso } from '../utils.js';

export type InputSite = {
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

export type InputFloor = {
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

export type InputZone = {
  id: string;
  tenantId: string;
  siteId: string;
  floorId: string | null;
  zoneRef: string;
  name: string;
  zoneType: string;
  createdAt: string;
};

export type InputAsset = {
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

export type InputAssetPosition = {
  assetId: string;
  positionMode: 'indoor_xy' | 'geo';
  xPct: number | null;
  yPct: number | null;
  latitude: number | null;
  longitude: number | null;
  source: string;
  updatedAt: string;
};

type SiteRow = {
  id: string;
  tenant_id: string;
  site_ref: string;
  name: string;
  region: string;
  timezone: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

type FloorRow = {
  id: string;
  tenant_id: string;
  site_id: string;
  floor_ref: string;
  name: string;
  level_index: number;
  width_meters: number;
  height_meters: number;
  created_at: string;
};

type ZoneRow = {
  id: string;
  tenant_id: string;
  site_id: string;
  floor_id: string | null;
  zone_ref: string;
  name: string;
  zone_type: string;
  created_at: string;
};

type AssetRow = {
  id: string;
  tenant_id: string;
  site_id: string;
  floor_id: string | null;
  zone_id: string | null;
  asset_tag: string;
  serial_number: string;
  manufacturer: string;
  model: string;
  protocol_type: string;
  status: 'OK' | 'Warning' | 'Critical' | 'Offline';
  created_at: string;
};

type AssetPositionRow = {
  asset_id: string;
  position_mode: 'indoor_xy' | 'geo';
  x_pct: number | null;
  y_pct: number | null;
  latitude: number | null;
  longitude: number | null;
  source: string;
  updated_at: string;
};

const dbPath = process.env.LUXPULSE_INPUT_DB_PATH ?? resolve(process.cwd(), 'data', 'luxpulse-inputs.db');
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS input_sites (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    site_ref TEXT NOT NULL,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    timezone TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(tenant_id, site_ref)
  );

  CREATE TABLE IF NOT EXISTS input_floors (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    site_id TEXT NOT NULL,
    floor_ref TEXT NOT NULL,
    name TEXT NOT NULL,
    level_index INTEGER NOT NULL,
    width_meters REAL NOT NULL,
    height_meters REAL NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(site_id, floor_ref),
    FOREIGN KEY(site_id) REFERENCES input_sites(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS input_zones (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    site_id TEXT NOT NULL,
    floor_id TEXT,
    zone_ref TEXT NOT NULL,
    name TEXT NOT NULL,
    zone_type TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(site_id, zone_ref),
    FOREIGN KEY(site_id) REFERENCES input_sites(id) ON DELETE CASCADE,
    FOREIGN KEY(floor_id) REFERENCES input_floors(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS input_assets (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    site_id TEXT NOT NULL,
    floor_id TEXT,
    zone_id TEXT,
    asset_tag TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    protocol_type TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(tenant_id, asset_tag),
    FOREIGN KEY(site_id) REFERENCES input_sites(id) ON DELETE CASCADE,
    FOREIGN KEY(floor_id) REFERENCES input_floors(id) ON DELETE SET NULL,
    FOREIGN KEY(zone_id) REFERENCES input_zones(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS input_asset_positions (
    asset_id TEXT PRIMARY KEY,
    position_mode TEXT NOT NULL,
    x_pct REAL,
    y_pct REAL,
    latitude REAL,
    longitude REAL,
    source TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(asset_id) REFERENCES input_assets(id) ON DELETE CASCADE
  );
`);

const listSitesStmt = db.prepare('SELECT * FROM input_sites WHERE tenant_id = ? ORDER BY created_at DESC');
const getSiteStmt = db.prepare('SELECT * FROM input_sites WHERE id = ?');
const insertSiteStmt = db.prepare(`
  INSERT INTO input_sites (id, tenant_id, site_ref, name, region, timezone, latitude, longitude, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const listFloorsStmt = db.prepare('SELECT * FROM input_floors WHERE site_id = ? ORDER BY level_index ASC, created_at ASC');
const insertFloorStmt = db.prepare(`
  INSERT INTO input_floors (id, tenant_id, site_id, floor_ref, name, level_index, width_meters, height_meters, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const listZonesStmt = db.prepare('SELECT * FROM input_zones WHERE site_id = ? ORDER BY created_at ASC');
const insertZoneStmt = db.prepare(`
  INSERT INTO input_zones (id, tenant_id, site_id, floor_id, zone_ref, name, zone_type, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const listAssetsBySiteStmt = db.prepare('SELECT * FROM input_assets WHERE site_id = ? ORDER BY created_at DESC');
const insertAssetStmt = db.prepare(`
  INSERT INTO input_assets (
    id, tenant_id, site_id, floor_id, zone_id, asset_tag, serial_number, manufacturer, model, protocol_type, status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const upsertAssetPositionStmt = db.prepare(`
  INSERT INTO input_asset_positions (asset_id, position_mode, x_pct, y_pct, latitude, longitude, source, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(asset_id)
  DO UPDATE SET
    position_mode = excluded.position_mode,
    x_pct = excluded.x_pct,
    y_pct = excluded.y_pct,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    source = excluded.source,
    updated_at = excluded.updated_at
`);

const listAssetPositionsBySiteStmt = db.prepare(`
  SELECT p.*
  FROM input_asset_positions p
  INNER JOIN input_assets a ON a.id = p.asset_id
  WHERE a.site_id = ?
`);

function mapSiteRow(row: SiteRow): InputSite {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    siteRef: row.site_ref,
    name: row.name,
    region: row.region,
    timezone: row.timezone,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
  };
}

function mapFloorRow(row: FloorRow): InputFloor {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    siteId: row.site_id,
    floorRef: row.floor_ref,
    name: row.name,
    levelIndex: row.level_index,
    widthMeters: row.width_meters,
    heightMeters: row.height_meters,
    createdAt: row.created_at,
  };
}

function mapZoneRow(row: ZoneRow): InputZone {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    siteId: row.site_id,
    floorId: row.floor_id,
    zoneRef: row.zone_ref,
    name: row.name,
    zoneType: row.zone_type,
    createdAt: row.created_at,
  };
}

function mapAssetRow(row: AssetRow): InputAsset {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    siteId: row.site_id,
    floorId: row.floor_id,
    zoneId: row.zone_id,
    assetTag: row.asset_tag,
    serialNumber: row.serial_number,
    manufacturer: row.manufacturer,
    model: row.model,
    protocolType: row.protocol_type,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapAssetPositionRow(row: AssetPositionRow): InputAssetPosition {
  return {
    assetId: row.asset_id,
    positionMode: row.position_mode,
    xPct: row.x_pct,
    yPct: row.y_pct,
    latitude: row.latitude,
    longitude: row.longitude,
    source: row.source,
    updatedAt: row.updated_at,
  };
}

export function listInputSites(tenantId: string): InputSite[] {
  return (listSitesStmt.all(tenantId) as SiteRow[]).map(mapSiteRow);
}

export function getInputSite(siteId: string): InputSite | null {
  const row = getSiteStmt.get(siteId) as SiteRow | undefined;
  return row ? mapSiteRow(row) : null;
}

export function createInputSite(input: {
  tenantId: string;
  siteRef: string;
  name: string;
  region: string;
  timezone: string;
  latitude: number;
  longitude: number;
}): InputSite {
  const id = randomUUID();
  const createdAt = nowIso();
  insertSiteStmt.run(
    id,
    input.tenantId,
    input.siteRef,
    input.name,
    input.region,
    input.timezone,
    input.latitude,
    input.longitude,
    createdAt,
  );

  return {
    id,
    tenantId: input.tenantId,
    siteRef: input.siteRef,
    name: input.name,
    region: input.region,
    timezone: input.timezone,
    latitude: input.latitude,
    longitude: input.longitude,
    createdAt,
  };
}

export function listInputFloors(siteId: string): InputFloor[] {
  return (listFloorsStmt.all(siteId) as FloorRow[]).map(mapFloorRow);
}

export function createInputFloor(input: {
  tenantId: string;
  siteId: string;
  floorRef: string;
  name: string;
  levelIndex: number;
  widthMeters: number;
  heightMeters: number;
}): InputFloor {
  const id = randomUUID();
  const createdAt = nowIso();
  insertFloorStmt.run(
    id,
    input.tenantId,
    input.siteId,
    input.floorRef,
    input.name,
    input.levelIndex,
    input.widthMeters,
    input.heightMeters,
    createdAt,
  );

  return {
    id,
    tenantId: input.tenantId,
    siteId: input.siteId,
    floorRef: input.floorRef,
    name: input.name,
    levelIndex: input.levelIndex,
    widthMeters: input.widthMeters,
    heightMeters: input.heightMeters,
    createdAt,
  };
}

export function listInputZones(siteId: string): InputZone[] {
  return (listZonesStmt.all(siteId) as ZoneRow[]).map(mapZoneRow);
}

export function createInputZone(input: {
  tenantId: string;
  siteId: string;
  floorId: string | null;
  zoneRef: string;
  name: string;
  zoneType: string;
}): InputZone {
  const id = randomUUID();
  const createdAt = nowIso();
  insertZoneStmt.run(id, input.tenantId, input.siteId, input.floorId, input.zoneRef, input.name, input.zoneType, createdAt);

  return {
    id,
    tenantId: input.tenantId,
    siteId: input.siteId,
    floorId: input.floorId,
    zoneRef: input.zoneRef,
    name: input.name,
    zoneType: input.zoneType,
    createdAt,
  };
}

export function listInputAssets(siteId: string): InputAsset[] {
  return (listAssetsBySiteStmt.all(siteId) as AssetRow[]).map(mapAssetRow);
}

export function createInputAsset(input: {
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
}): InputAsset {
  const id = randomUUID();
  const createdAt = nowIso();

  insertAssetStmt.run(
    id,
    input.tenantId,
    input.siteId,
    input.floorId,
    input.zoneId,
    input.assetTag,
    input.serialNumber,
    input.manufacturer,
    input.model,
    input.protocolType,
    input.status,
    createdAt,
  );

  return {
    id,
    tenantId: input.tenantId,
    siteId: input.siteId,
    floorId: input.floorId,
    zoneId: input.zoneId,
    assetTag: input.assetTag,
    serialNumber: input.serialNumber,
    manufacturer: input.manufacturer,
    model: input.model,
    protocolType: input.protocolType,
    status: input.status,
    createdAt,
  };
}

export function upsertInputAssetPosition(input: {
  assetId: string;
  positionMode: 'indoor_xy' | 'geo';
  xPct: number | null;
  yPct: number | null;
  latitude: number | null;
  longitude: number | null;
  source: string;
}) {
  const updatedAt = nowIso();
  upsertAssetPositionStmt.run(
    input.assetId,
    input.positionMode,
    input.xPct,
    input.yPct,
    input.latitude,
    input.longitude,
    input.source,
    updatedAt,
  );

  return {
    ...input,
    updatedAt,
  };
}

export function listInputAssetPositions(siteId: string): InputAssetPosition[] {
  return (listAssetPositionsBySiteStmt.all(siteId) as AssetPositionRow[]).map(mapAssetPositionRow);
}

export function getInputSiteLayout(siteId: string) {
  const site = getInputSite(siteId);
  if (!site) {
    return null;
  }

  const floors = listInputFloors(siteId);
  const zones = listInputZones(siteId);
  const assets = listInputAssets(siteId);
  const positions = listInputAssetPositions(siteId);

  return {
    site,
    floors,
    zones,
    assets,
    positions,
  };
}

function ensureMinimalSeed() {
  const seedTenant = 'demo-tenant';
  const existing = listInputSites(seedTenant);
  if (existing.length > 0) {
    return;
  }

  const westSite = createInputSite({
    tenantId: seedTenant,
    siteRef: 'LXP-UK-001',
    name: 'London West Retail Park',
    region: 'Greater London',
    timezone: 'Europe/London',
    latitude: 51.5072,
    longitude: -0.1276,
  });

  const midlandsSite = createInputSite({
    tenantId: seedTenant,
    siteRef: 'LXP-UK-002',
    name: 'Birmingham Logistics Hub',
    region: 'West Midlands',
    timezone: 'Europe/London',
    latitude: 52.4862,
    longitude: -1.8904,
  });

  const floorWest = createInputFloor({
    tenantId: seedTenant,
    siteId: westSite.id,
    floorRef: 'GF',
    name: 'Ground Floor',
    levelIndex: 0,
    widthMeters: 120,
    heightMeters: 90,
  });

  const zoneWest = createInputZone({
    tenantId: seedTenant,
    siteId: westSite.id,
    floorId: floorWest.id,
    zoneRef: 'Z-A',
    name: 'Ground Floor Retail',
    zoneType: 'retail',
  });

  const demoAsset = createInputAsset({
    tenantId: seedTenant,
    siteId: westSite.id,
    floorId: floorWest.id,
    zoneId: zoneWest.id,
    assetTag: 'LUX-0001',
    serialNumber: 'SN-100001',
    manufacturer: 'VendorA',
    model: 'Linear Bay D4',
    protocolType: 'dali2',
    status: 'OK',
  });

  upsertInputAssetPosition({
    assetId: demoAsset.id,
    positionMode: 'indoor_xy',
    xPct: 34,
    yPct: 42,
    latitude: null,
    longitude: null,
    source: 'seed',
  });

  createInputFloor({
    tenantId: seedTenant,
    siteId: midlandsSite.id,
    floorRef: 'GF',
    name: 'Ground Floor',
    levelIndex: 0,
    widthMeters: 140,
    heightMeters: 110,
  });
}

ensureMinimalSeed();
