#!/usr/bin/env node

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const childProcess = require('node:child_process');
const { URL } = require('node:url');

const WEB_PORT = Number(process.env.WEB_PORT || 5173);
const API_PORT = Number(process.env.API_PORT || 4000);

const isPkg = Boolean(process.pkg);
const baseDir = isPkg ? path.dirname(process.execPath) : process.cwd();
const webRoot = path.resolve(__dirname, '../apps/web/dist');
const dataPath = path.resolve(baseDir, 'luxlight-runtime-data.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.map': 'application/json; charset=utf-8',
};

function nowIso() {
  return new Date().toISOString();
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

function seedData() {
  const tenantId = 'demo-tenant';
  const site1 = {
    id: crypto.randomUUID(),
    tenantId,
    siteRef: 'LXP-UK-001',
    name: 'London West Retail Park',
    region: 'Greater London',
    timezone: 'Europe/London',
    latitude: 51.5072,
    longitude: -0.1276,
    createdAt: nowIso(),
  };
  const site2 = {
    id: crypto.randomUUID(),
    tenantId,
    siteRef: 'LXP-UK-002',
    name: 'Birmingham Logistics Hub',
    region: 'West Midlands',
    timezone: 'Europe/London',
    latitude: 52.4862,
    longitude: -1.8904,
    createdAt: nowIso(),
  };

  const floor = {
    id: crypto.randomUUID(),
    tenantId,
    siteId: site1.id,
    floorRef: 'GF',
    name: 'Ground Floor',
    levelIndex: 0,
    widthMeters: 120,
    heightMeters: 90,
    createdAt: nowIso(),
  };

  const zone = {
    id: crypto.randomUUID(),
    tenantId,
    siteId: site1.id,
    floorId: floor.id,
    zoneRef: 'Z-A',
    name: 'Ground Floor Retail',
    zoneType: 'retail',
    createdAt: nowIso(),
  };

  const asset = {
    id: crypto.randomUUID(),
    tenantId,
    siteId: site1.id,
    floorId: floor.id,
    zoneId: zone.id,
    assetTag: 'LUX-0001',
    serialNumber: 'SN-100001',
    manufacturer: 'VendorA',
    model: 'Linear Bay D4',
    protocolType: 'dali2',
    status: 'OK',
    createdAt: nowIso(),
  };

  const position = {
    assetId: asset.id,
    positionMode: 'indoor_xy',
    xPct: 34,
    yPct: 42,
    latitude: null,
    longitude: null,
    source: 'seed',
    updatedAt: nowIso(),
  };

  return {
    sites: [site1, site2],
    floors: [floor],
    zones: [zone],
    assets: [asset],
    positions: [position],
  };
}

function loadDb() {
  try {
    if (fs.existsSync(dataPath)) {
      const raw = fs.readFileSync(dataPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.sites)) {
        return parsed;
      }
    }
  } catch (_) {
    // fall through to seed
  }

  const seeded = seedData();
  saveDb(seeded);
  return seeded;
}

function saveDb(db) {
  fs.writeFileSync(dataPath, JSON.stringify(db, null, 2), 'utf8');
}

const db = loadDb();

function listSitesByTenant(tenantId) {
  return db.sites.filter((site) => site.tenantId === tenantId);
}

function getSiteLayout(siteId) {
  const site = db.sites.find((item) => item.id === siteId);
  if (!site) return null;

  return {
    site,
    floors: db.floors.filter((item) => item.siteId === siteId),
    zones: db.zones.filter((item) => item.siteId === siteId),
    assets: db.assets.filter((item) => item.siteId === siteId),
    positions: db.positions.filter((position) => db.assets.some((asset) => asset.id === position.assetId && asset.siteId === siteId)),
  };
}

function parsePath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  return segments;
}

async function handleApi(req, res) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  const reqUrl = new URL(req.url, `http://127.0.0.1:${API_PORT}`);
  const pathname = reqUrl.pathname;

  if (req.method === 'GET' && pathname === '/health') {
    sendJson(res, 200, { ok: true, service: 'luxlight-runtime-api', time: nowIso() });
    return;
  }

  const segments = parsePath(pathname);

  // /api/v1/input/tenants/:tenantId/sites
  if (req.method === 'GET' && segments.length === 6 && segments[0] === 'api' && segments[1] === 'v1' && segments[2] === 'input' && segments[3] === 'tenants' && segments[5] === 'sites') {
    const tenantId = segments[4];
    sendJson(res, 200, { data: listSitesByTenant(tenantId) });
    return;
  }

  if (req.method === 'POST' && segments.length === 6 && segments[0] === 'api' && segments[1] === 'v1' && segments[2] === 'input' && segments[3] === 'tenants' && segments[5] === 'sites') {
    const tenantId = segments[4];
    const body = await readRequestBody(req);

    if (!body.siteRef || !body.name || typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      sendJson(res, 400, { error: 'siteRef, name, latitude, longitude are required' });
      return;
    }

    if (db.sites.some((site) => site.tenantId === tenantId && site.siteRef === body.siteRef)) {
      sendJson(res, 409, { error: 'Site reference already exists for this tenant' });
      return;
    }

    const record = {
      id: crypto.randomUUID(),
      tenantId,
      siteRef: String(body.siteRef),
      name: String(body.name),
      region: String(body.region || 'Unknown'),
      timezone: String(body.timezone || 'Europe/London'),
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      createdAt: nowIso(),
    };
    db.sites.push(record);
    saveDb(db);
    sendJson(res, 201, { data: record });
    return;
  }

  // /api/v1/input/tenants/:tenantId/sites/:siteId/floors
  if (req.method === 'POST' && segments.length === 8 && segments[0] === 'api' && segments[1] === 'v1' && segments[2] === 'input' && segments[3] === 'tenants' && segments[5] === 'sites' && segments[7] === 'floors') {
    const tenantId = segments[4];
    const siteId = segments[6];
    const body = await readRequestBody(req);

    const record = {
      id: crypto.randomUUID(),
      tenantId,
      siteId,
      floorRef: String(body.floorRef || 'GF'),
      name: String(body.name || 'Floor'),
      levelIndex: Number(body.levelIndex ?? 0),
      widthMeters: Number(body.widthMeters ?? 100),
      heightMeters: Number(body.heightMeters ?? 80),
      createdAt: nowIso(),
    };

    if (db.floors.some((floor) => floor.siteId === siteId && floor.floorRef === record.floorRef)) {
      sendJson(res, 409, { error: 'Floor reference already exists for this site' });
      return;
    }

    db.floors.push(record);
    saveDb(db);
    sendJson(res, 201, { data: record });
    return;
  }

  // /api/v1/input/tenants/:tenantId/sites/:siteId/zones
  if (req.method === 'POST' && segments.length === 8 && segments[0] === 'api' && segments[1] === 'v1' && segments[2] === 'input' && segments[3] === 'tenants' && segments[5] === 'sites' && segments[7] === 'zones') {
    const tenantId = segments[4];
    const siteId = segments[6];
    const body = await readRequestBody(req);

    const record = {
      id: crypto.randomUUID(),
      tenantId,
      siteId,
      floorId: body.floorId || null,
      zoneRef: String(body.zoneRef || 'Z-A'),
      name: String(body.name || 'Zone'),
      zoneType: String(body.zoneType || 'general'),
      createdAt: nowIso(),
    };

    if (db.zones.some((zone) => zone.siteId === siteId && zone.zoneRef === record.zoneRef)) {
      sendJson(res, 409, { error: 'Zone reference already exists for this site' });
      return;
    }

    db.zones.push(record);
    saveDb(db);
    sendJson(res, 201, { data: record });
    return;
  }

  // /api/v1/input/assets
  if (req.method === 'POST' && pathname === '/api/v1/input/assets') {
    const body = await readRequestBody(req);

    if (!body.tenantId || !body.siteId || !body.assetTag || !body.serialNumber) {
      sendJson(res, 400, { error: 'tenantId, siteId, assetTag, serialNumber are required' });
      return;
    }

    if (db.assets.some((asset) => asset.tenantId === body.tenantId && asset.assetTag === body.assetTag)) {
      sendJson(res, 409, { error: 'Asset tag already exists for this tenant' });
      return;
    }

    const record = {
      id: crypto.randomUUID(),
      tenantId: String(body.tenantId),
      siteId: String(body.siteId),
      floorId: body.floorId || null,
      zoneId: body.zoneId || null,
      assetTag: String(body.assetTag),
      serialNumber: String(body.serialNumber),
      manufacturer: String(body.manufacturer || 'Unknown'),
      model: String(body.model || 'Unknown'),
      protocolType: String(body.protocolType || 'unknown'),
      status: ['OK', 'Warning', 'Critical', 'Offline'].includes(body.status) ? body.status : 'OK',
      createdAt: nowIso(),
    };

    db.assets.push(record);

    if (body.position && body.position.mode) {
      db.positions = db.positions.filter((position) => position.assetId !== record.id);
      db.positions.push({
        assetId: record.id,
        positionMode: body.position.mode,
        xPct: body.position.xPct ?? null,
        yPct: body.position.yPct ?? null,
        latitude: body.position.latitude ?? null,
        longitude: body.position.longitude ?? null,
        source: String(body.position.source || 'manual_input'),
        updatedAt: nowIso(),
      });
    }

    saveDb(db);
    sendJson(res, 201, { data: record });
    return;
  }

  // /api/v1/input/assets/:assetId/position
  if (req.method === 'PATCH' && segments.length === 6 && segments[0] === 'api' && segments[1] === 'v1' && segments[2] === 'input' && segments[3] === 'assets' && segments[5] === 'position') {
    const assetId = segments[4];
    const body = await readRequestBody(req);

    db.positions = db.positions.filter((position) => position.assetId !== assetId);
    const record = {
      assetId,
      positionMode: body.mode || 'indoor_xy',
      xPct: body.xPct ?? null,
      yPct: body.yPct ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      source: String(body.source || 'manual_input'),
      updatedAt: nowIso(),
    };
    db.positions.push(record);
    saveDb(db);
    sendJson(res, 200, { data: record });
    return;
  }

  // /api/v1/input/sites/:siteId/layout
  if (req.method === 'GET' && segments.length === 6 && segments[0] === 'api' && segments[1] === 'v1' && segments[2] === 'input' && segments[3] === 'sites' && segments[5] === 'layout') {
    const siteId = segments[4];
    const layout = getSiteLayout(siteId);
    if (!layout) {
      sendJson(res, 404, { error: 'Input site not found' });
      return;
    }
    sendJson(res, 200, { data: layout });
    return;
  }

  // /api/v1/input/tenants/:tenantId/summary
  if (req.method === 'GET' && segments.length === 6 && segments[0] === 'api' && segments[1] === 'v1' && segments[2] === 'input' && segments[3] === 'tenants' && segments[5] === 'summary') {
    const tenantId = segments[4];
    const summary = listSitesByTenant(tenantId).map((site) => {
      const layout = getSiteLayout(site.id);
      const updatedAt =
        layout && layout.positions.length > 0
          ? layout.positions.map((position) => position.updatedAt).sort((a, b) => b.localeCompare(a))[0]
          : site.createdAt;
      return {
        siteId: site.id,
        siteRef: site.siteRef,
        siteName: site.name,
        floors: layout ? layout.floors.length : 0,
        zones: layout ? layout.zones.length : 0,
        assets: layout ? layout.assets.length : 0,
        positionedAssets: layout ? layout.positions.length : 0,
        lastUpdatedAt: updatedAt,
      };
    });
    sendJson(res, 200, { data: summary });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

const apiServer = http.createServer((req, res) => {
  handleApi(req, res).catch((error) => {
    sendJson(res, 500, { error: 'Internal error', detail: String(error) });
  });
});

function safeResolveStaticFile(urlPath) {
  const cleaned = decodeURIComponent(urlPath.split('?')[0] || '/');
  const relative = cleaned === '/' ? 'index.html' : cleaned.replace(/^\/+/, '');
  const filePath = path.resolve(webRoot, relative);
  if (!filePath.startsWith(webRoot)) {
    return null;
  }
  return filePath;
}

const webServer = http.createServer((req, res) => {
  const filePath = safeResolveStaticFile(req.url || '/');

  const sendFile = (targetPath) => {
    try {
      const content = fs.readFileSync(targetPath);
      const ext = path.extname(targetPath).toLowerCase();
      const type = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'content-type': type, 'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=300' });
      res.end(content);
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  };

  if (!filePath) {
    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(filePath);
    return;
  }

  sendFile(path.resolve(webRoot, 'index.html'));
});

function openBrowser(url) {
  const platform = process.platform;
  if (platform === 'win32') {
    childProcess.exec(`start "" "${url}"`);
    return;
  }
  if (platform === 'darwin') {
    childProcess.exec(`open "${url}"`);
    return;
  }
  childProcess.exec(`xdg-open "${url}"`);
}

apiServer.listen(API_PORT, '127.0.0.1', () => {
  console.log(`[runtime] API listening at http://127.0.0.1:${API_PORT}`);
});

webServer.listen(WEB_PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${WEB_PORT}`;
  console.log(`[runtime] Web listening at ${url}`);
  openBrowser(url);
});

function shutdown() {
  apiServer.close(() => {});
  webServer.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
