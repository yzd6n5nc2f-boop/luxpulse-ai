import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { store } from '../db/store.js';
import { nowIso } from '../utils.js';

const registerAdapterSchema = z.object({
  tenantId: z.string(),
  siteId: z.string(),
  type: z.enum(['protocol_gateway', 'vendor_api', 'file_onboarding']),
  name: z.string().min(2),
  configJson: z.record(z.unknown()),
});

const createCredentialSchema = z.object({
  tenantId: z.string(),
  siteId: z.string(),
  adapterId: z.string(),
  secretRef: z.string().min(3),
  rotatedBy: z.string().min(2),
});

export async function integrationRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.post('/integrations/adapters', async (request, reply) => {
    const parsed = registerAdapterSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const now = nowIso();
    const record = {
      id: randomUUID(),
      tenantId: parsed.data.tenantId,
      siteId: parsed.data.siteId,
      type: parsed.data.type,
      name: parsed.data.name,
      configJson: parsed.data.configJson,
      status: 'OK' as const,
      lastHeartbeatAt: now,
      lastSuccessAt: now,
      lastErrorAt: null,
      createdAt: now,
    };

    store.adapters.push(record);
    return reply.code(201).send({ data: record });
  });

  app.get('/integrations/adapters', async (request) => {
    const { tenantId, siteId } = request.query as { tenantId?: string; siteId?: string };
    return {
      data: store.adapters.filter(
        (adapter) => (!tenantId || adapter.tenantId === tenantId) && (!siteId || adapter.siteId === siteId),
      ),
    };
  });

  app.get('/integrations/adapters/:adapterId/health', async (request, reply) => {
    const { adapterId } = request.params as { adapterId: string };
    const adapter = store.adapters.find((record) => record.id === adapterId);
    if (!adapter) {
      return reply.code(404).send({ error: 'Adapter not found' });
    }

    return {
      data: {
        adapterId,
        status: adapter.status,
        lastHeartbeatAt: adapter.lastHeartbeatAt,
        lastSuccessAt: adapter.lastSuccessAt,
        lastErrorAt: adapter.lastErrorAt,
      },
    };
  });

  app.post('/integrations/credentials', async (request, reply) => {
    const parsed = createCredentialSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const now = nowIso();
    const credentialSet = {
      id: randomUUID(),
      tenantId: parsed.data.tenantId,
      siteId: parsed.data.siteId,
      adapterId: parsed.data.adapterId,
      secretRef: parsed.data.secretRef,
      rotatedAt: now,
      rotatedBy: parsed.data.rotatedBy,
      createdAt: now,
    };

    store.credentialSets.push(credentialSet);
    return reply.code(201).send({ data: credentialSet });
  });

  app.post('/integrations/credentials/:credentialSetId/rotate', async (request, reply) => {
    const { credentialSetId } = request.params as { credentialSetId: string };
    const credentialSet = store.credentialSets.find((record) => record.id === credentialSetId);

    if (!credentialSet) {
      return reply.code(404).send({ error: 'Credential set not found' });
    }

    const payload = request.body as { secretRef?: string; rotatedBy?: string };
    credentialSet.secretRef = payload.secretRef ?? credentialSet.secretRef;
    credentialSet.rotatedBy = payload.rotatedBy ?? credentialSet.rotatedBy;
    credentialSet.rotatedAt = nowIso();

    return { data: credentialSet };
  });
}
