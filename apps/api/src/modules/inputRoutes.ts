import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import {
  createInputAsset,
  createInputFloor,
  createInputSite,
  createInputZone,
  getInputSiteLayout,
  listInputSites,
  upsertInputAssetPosition,
} from '../db/inputDb.js';
import { store } from '../db/store.js';
import { nowIso } from '../utils.js';

const createInputSiteSchema = z.object({
  siteRef: z.string().min(3),
  name: z.string().min(3),
  region: z.string().min(2),
  timezone: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const createFloorSchema = z.object({
  floorRef: z.string().min(1),
  name: z.string().min(2),
  levelIndex: z.number().int().min(-20).max(200),
  widthMeters: z.number().positive(),
  heightMeters: z.number().positive(),
});

const createZoneSchema = z.object({
  floorId: z.string().nullable().default(null),
  zoneRef: z.string().min(1),
  name: z.string().min(2),
  zoneType: z.string().min(2),
});

const createAssetSchema = z.object({
  tenantId: z.string().min(2),
  siteId: z.string().min(2),
  floorId: z.string().nullable().default(null),
  zoneId: z.string().nullable().default(null),
  assetTag: z.string().min(2),
  serialNumber: z.string().min(2),
  manufacturer: z.string().min(2),
  model: z.string().min(2),
  protocolType: z.string().min(2),
  status: z.enum(['OK', 'Warning', 'Critical', 'Offline']).default('OK'),
  position: z
    .object({
      mode: z.enum(['indoor_xy', 'geo']),
      xPct: z.number().min(0).max(100).nullable().default(null),
      yPct: z.number().min(0).max(100).nullable().default(null),
      latitude: z.number().min(-90).max(90).nullable().default(null),
      longitude: z.number().min(-180).max(180).nullable().default(null),
      source: z.string().min(2).default('manual_input'),
    })
    .nullable()
    .default(null),
});

const updatePositionSchema = z.object({
  mode: z.enum(['indoor_xy', 'geo']),
  xPct: z.number().min(0).max(100).nullable().default(null),
  yPct: z.number().min(0).max(100).nullable().default(null),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
  source: z.string().min(2).default('manual_input'),
});

export async function inputRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.get('/input/tenants/:tenantId/sites', async (request) => {
    const { tenantId } = request.params as { tenantId: string };
    return { data: listInputSites(tenantId) };
  });

  app.post('/input/tenants/:tenantId/sites', async (request, reply) => {
    const { tenantId } = request.params as { tenantId: string };
    const parsed = createInputSiteSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    try {
      const record = createInputSite({
        tenantId,
        ...parsed.data,
      });

      // Mirror into in-memory canonical store for immediate app compatibility.
      store.sites.push({
        id: record.id,
        tenantId: record.tenantId,
        name: record.name,
        timezone: record.timezone,
        latitude: record.latitude,
        longitude: record.longitude,
        createdAt: record.createdAt,
      });

      return reply.code(201).send({ data: record });
    } catch (error) {
      return reply.code(409).send({ error: 'Site reference already exists for this tenant', detail: String(error) });
    }
  });

  app.post('/input/tenants/:tenantId/sites/:siteId/floors', async (request, reply) => {
    const { tenantId, siteId } = request.params as { tenantId: string; siteId: string };
    const parsed = createFloorSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    try {
      const record = createInputFloor({
        tenantId,
        siteId,
        ...parsed.data,
      });

      return reply.code(201).send({ data: record });
    } catch (error) {
      return reply.code(409).send({ error: 'Floor reference already exists for this site', detail: String(error) });
    }
  });

  app.post('/input/tenants/:tenantId/sites/:siteId/zones', async (request, reply) => {
    const { tenantId, siteId } = request.params as { tenantId: string; siteId: string };
    const parsed = createZoneSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    try {
      const record = createInputZone({
        tenantId,
        siteId,
        floorId: parsed.data.floorId,
        zoneRef: parsed.data.zoneRef,
        name: parsed.data.name,
        zoneType: parsed.data.zoneType,
      });

      store.zones.push({
        id: record.id,
        tenantId: record.tenantId,
        siteId: record.siteId,
        name: record.name,
        type: record.zoneType,
        createdAt: record.createdAt,
      });

      return reply.code(201).send({ data: record });
    } catch (error) {
      return reply.code(409).send({ error: 'Zone reference already exists for this site', detail: String(error) });
    }
  });

  app.post('/input/assets', async (request, reply) => {
    const parsed = createAssetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    try {
      const record = createInputAsset({
        tenantId: parsed.data.tenantId,
        siteId: parsed.data.siteId,
        floorId: parsed.data.floorId,
        zoneId: parsed.data.zoneId,
        assetTag: parsed.data.assetTag,
        serialNumber: parsed.data.serialNumber,
        manufacturer: parsed.data.manufacturer,
        model: parsed.data.model,
        protocolType: parsed.data.protocolType,
        status: parsed.data.status,
      });

      if (parsed.data.position) {
        upsertInputAssetPosition({
          assetId: record.id,
          positionMode: parsed.data.position.mode,
          xPct: parsed.data.position.xPct,
          yPct: parsed.data.position.yPct,
          latitude: parsed.data.position.latitude,
          longitude: parsed.data.position.longitude,
          source: parsed.data.position.source,
        });
      }

      store.assets.push({
        id: record.id,
        tenantId: record.tenantId,
        siteId: record.siteId,
        zoneId: record.zoneId ?? record.siteId,
        assetTag: record.assetTag,
        serialNumber: record.serialNumber,
        manufacturer: record.manufacturer,
        model: record.model,
        protocolType: record.protocolType,
        externalRef: null,
        status: record.status,
        lastSeenAt: null,
        createdAt: record.createdAt,
      });

      return reply.code(201).send({ data: record });
    } catch (error) {
      return reply.code(409).send({ error: 'Asset tag already exists for this tenant', detail: String(error) });
    }
  });

  app.patch('/input/assets/:assetId/position', async (request, reply) => {
    const { assetId } = request.params as { assetId: string };
    const parsed = updatePositionSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const position = upsertInputAssetPosition({
      assetId,
      positionMode: parsed.data.mode,
      xPct: parsed.data.xPct,
      yPct: parsed.data.yPct,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      source: parsed.data.source,
    });

    return { data: position };
  });

  app.get('/input/sites/:siteId/layout', async (request, reply) => {
    const { siteId } = request.params as { siteId: string };
    const layout = getInputSiteLayout(siteId);

    if (!layout) {
      return reply.code(404).send({ error: 'Input site not found' });
    }

    return { data: layout };
  });

  app.get('/input/tenants/:tenantId/summary', async (request) => {
    const { tenantId } = request.params as { tenantId: string };
    const sites = listInputSites(tenantId);

    const summary = sites.map((site) => {
      const layout = getInputSiteLayout(site.id);
      return {
        siteId: site.id,
        siteRef: site.siteRef,
        siteName: site.name,
        floors: layout?.floors.length ?? 0,
        zones: layout?.zones.length ?? 0,
        assets: layout?.assets.length ?? 0,
        positionedAssets: layout?.positions.length ?? 0,
        lastUpdatedAt:
          layout?.positions
            .map((position) => position.updatedAt)
            .sort((a, b) => b.localeCompare(a))[0] ??
          site.createdAt ??
          nowIso(),
      };
    });

    return { data: summary };
  });
}
