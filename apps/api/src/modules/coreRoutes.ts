import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { store } from '../db/store.js';
import { correlationId, nowIso } from '../utils.js';

const createTenantSchema = z.object({
  name: z.string().min(2),
});

const createSiteSchema = z.object({
  name: z.string().min(2),
  timezone: z.string().min(2),
  latitude: z.number().nullable().default(null),
  longitude: z.number().nullable().default(null),
});

const createZoneSchema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
});

const createAssetSchema = z.object({
  siteId: z.string(),
  zoneId: z.string(),
  assetTag: z.string().min(2),
  serialNumber: z.string().min(2),
  manufacturer: z.string().min(2),
  model: z.string().min(2),
  protocolType: z.string().min(2),
  externalRef: z.string().nullable().default(null),
});

const telemetryIngestSchema = z.object({
  tenantId: z.string(),
  siteId: z.string(),
  zoneId: z.string(),
  assetId: z.string(),
  adapterId: z.string(),
  rawPayloadRef: z.string().nullable().default(null),
  points: z.array(
    z.object({
      ts: z.string().datetime(),
      metricKey: z.string(),
      metricValue: z.number(),
      unit: z.string(),
      quality: z.string().default('good'),
    }),
  ),
});

const createTicketSchema = z.object({
  tenantId: z.string(),
  siteId: z.string(),
  zoneId: z.string(),
  assetId: z.string(),
  sourceEventId: z.string().nullable().default(null),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assignedTo: z.string().nullable().default(null),
  slaDueAt: z.string().datetime().nullable().default(null),
});

const updateTicketSchema = z.object({
  status: z.enum(['open', 'assigned', 'resolved', 'closed']).optional(),
  assignedTo: z.string().nullable().optional(),
  resolutionSummary: z.string().nullable().optional(),
  closedAt: z.string().datetime().nullable().optional(),
});

export async function coreRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.get('/tenants', async () => ({ data: store.tenants }));

  app.post('/tenants', async (request, reply) => {
    const parsed = createTenantSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const tenant = {
      id: randomUUID(),
      name: parsed.data.name,
      status: 'active' as const,
      createdAt: nowIso(),
    };
    store.tenants.push(tenant);

    return reply.code(201).send({ data: tenant });
  });

  app.get('/tenants/:tenantId/sites', async (request) => {
    const { tenantId } = request.params as { tenantId: string };
    return { data: store.sites.filter((site) => site.tenantId === tenantId) };
  });

  app.post('/tenants/:tenantId/sites', async (request, reply) => {
    const { tenantId } = request.params as { tenantId: string };
    const parsed = createSiteSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const site = {
      id: randomUUID(),
      tenantId,
      name: parsed.data.name,
      timezone: parsed.data.timezone,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      createdAt: nowIso(),
    };

    store.sites.push(site);
    return reply.code(201).send({ data: site });
  });

  app.get('/tenants/:tenantId/sites/:siteId/zones', async (request) => {
    const { tenantId, siteId } = request.params as { tenantId: string; siteId: string };
    return { data: store.zones.filter((zone) => zone.tenantId === tenantId && zone.siteId === siteId) };
  });

  app.post('/tenants/:tenantId/sites/:siteId/zones', async (request, reply) => {
    const { tenantId, siteId } = request.params as { tenantId: string; siteId: string };
    const parsed = createZoneSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const zone = {
      id: randomUUID(),
      tenantId,
      siteId,
      name: parsed.data.name,
      type: parsed.data.type,
      createdAt: nowIso(),
    };

    store.zones.push(zone);
    return reply.code(201).send({ data: zone });
  });

  app.get('/tenants/:tenantId/assets', async (request) => {
    const { tenantId } = request.params as { tenantId: string };
    const { siteId, zoneId, status } = request.query as {
      siteId?: string;
      zoneId?: string;
      status?: string;
    };

    return {
      data: store.assets.filter(
        (asset) =>
          asset.tenantId === tenantId &&
          (!siteId || asset.siteId === siteId) &&
          (!zoneId || asset.zoneId === zoneId) &&
          (!status || asset.status === status),
      ),
    };
  });

  app.post('/tenants/:tenantId/assets', async (request, reply) => {
    const { tenantId } = request.params as { tenantId: string };
    const parsed = createAssetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const asset = {
      id: randomUUID(),
      tenantId,
      siteId: parsed.data.siteId,
      zoneId: parsed.data.zoneId,
      assetTag: parsed.data.assetTag,
      serialNumber: parsed.data.serialNumber,
      manufacturer: parsed.data.manufacturer,
      model: parsed.data.model,
      protocolType: parsed.data.protocolType,
      externalRef: parsed.data.externalRef,
      status: 'OK' as const,
      lastSeenAt: null,
      createdAt: nowIso(),
    };

    store.assets.push(asset);
    return reply.code(201).send({ data: asset });
  });

  app.get('/assets/:assetId', async (request, reply) => {
    const { assetId } = request.params as { assetId: string };
    const asset = store.assets.find((record) => record.id === assetId || record.assetTag === assetId);

    if (!asset) {
      return reply.code(404).send({ error: 'Asset not found' });
    }

    return { data: asset };
  });

  app.patch('/assets/:assetId', async (request, reply) => {
    const { assetId } = request.params as { assetId: string };
    const patch = request.body as { status?: 'OK' | 'Warning' | 'Critical' | 'Offline'; lastSeenAt?: string | null };
    const asset = store.assets.find((record) => record.id === assetId || record.assetTag === assetId);

    if (!asset) {
      return reply.code(404).send({ error: 'Asset not found' });
    }

    asset.status = patch.status ?? asset.status;
    asset.lastSeenAt = patch.lastSeenAt ?? asset.lastSeenAt;

    return { data: asset };
  });

  app.post('/telemetry/ingest', async (request, reply) => {
    const parsed = telemetryIngestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const payload = parsed.data;
    const records = payload.points.map((point) => ({
      id: randomUUID(),
      tenantId: payload.tenantId,
      siteId: payload.siteId,
      zoneId: payload.zoneId,
      assetId: payload.assetId,
      ts: point.ts,
      metricKey: point.metricKey,
      metricValue: point.metricValue,
      unit: point.unit,
      quality: point.quality,
      adapterId: payload.adapterId,
      rawPayloadRef: payload.rawPayloadRef,
    }));

    store.telemetry.push(...records);

    return reply.code(202).send({
      ingested: records.length,
      correlationId: correlationId(request),
    });
  });

  app.get('/events', async (request) => {
    const { tenantId, status, severity } = request.query as {
      tenantId?: string;
      status?: 'open' | 'acknowledged' | 'closed';
      severity?: 'info' | 'warning' | 'critical';
    };

    return {
      data: store.events.filter(
        (event) =>
          (!tenantId || event.tenantId === tenantId) &&
          (!status || event.status === status) &&
          (!severity || event.severity === severity),
      ),
    };
  });

  app.post('/events/:eventId/acknowledge', async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const event = store.events.find((record) => record.id === eventId);

    if (!event) {
      return reply.code(404).send({ error: 'Event not found' });
    }

    event.status = 'acknowledged';
    event.acknowledgedAt = nowIso();

    return { data: event, correlationId: correlationId(request) };
  });

  app.get('/tickets', async (request) => {
    const { tenantId, status } = request.query as {
      tenantId?: string;
      status?: 'open' | 'assigned' | 'resolved' | 'closed';
    };

    return {
      data: store.tickets.filter(
        (ticket) => (!tenantId || ticket.tenantId === tenantId) && (!status || ticket.status === status),
      ),
    };
  });

  app.post('/tickets', async (request, reply) => {
    const parsed = createTicketSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const ticket = {
      id: randomUUID(),
      tenantId: parsed.data.tenantId,
      siteId: parsed.data.siteId,
      zoneId: parsed.data.zoneId,
      assetId: parsed.data.assetId,
      sourceEventId: parsed.data.sourceEventId,
      status: parsed.data.assignedTo ? ('assigned' as const) : ('open' as const),
      priority: parsed.data.priority,
      openedAt: nowIso(),
      assignedTo: parsed.data.assignedTo,
      slaDueAt: parsed.data.slaDueAt,
      closedAt: null,
      resolutionSummary: null,
    };

    store.tickets.push(ticket);
    return reply.code(201).send({ data: ticket });
  });

  app.patch('/tickets/:ticketId', async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };
    const parsed = updateTicketSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const ticket = store.tickets.find((record) => record.id === ticketId);
    if (!ticket) {
      return reply.code(404).send({ error: 'Ticket not found' });
    }

    ticket.status = parsed.data.status ?? ticket.status;
    ticket.assignedTo = parsed.data.assignedTo ?? ticket.assignedTo;
    ticket.resolutionSummary = parsed.data.resolutionSummary ?? ticket.resolutionSummary;
    ticket.closedAt = parsed.data.closedAt ?? ticket.closedAt;

    return { data: ticket, correlationId: correlationId(request) };
  });
}
