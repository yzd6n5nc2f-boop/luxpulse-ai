import { createHash, randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { store } from '../db/store.js';
import { nowIso } from '../utils.js';

const createEvidencePackSchema = z.object({
  tenantId: z.string(),
  siteId: z.string(),
  requestedBy: z.string().min(2),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

function checksum(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

export async function evidenceRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.post('/evidence-packs', async (request, reply) => {
    const parsed = createEvidencePackSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const id = randomUUID();
    const createdAt = nowIso();
    const manifest = {
      id,
      includes: [
        'asset_registry_snapshot.json',
        'config_snapshot.json',
        'override_log.csv',
        'fault_summary.json',
        'kpi_summary.json',
      ],
      checksums: [
        { item: 'asset_registry_snapshot.json', sha256: checksum(`${id}:assets`) },
        { item: 'config_snapshot.json', sha256: checksum(`${id}:config`) },
      ],
    };

    const pack = {
      id,
      tenantId: parsed.data.tenantId,
      siteId: parsed.data.siteId,
      requestedBy: parsed.data.requestedBy,
      periodStart: parsed.data.periodStart,
      periodEnd: parsed.data.periodEnd,
      status: 'ready' as const,
      manifestJson: manifest,
      artifactRef: `minio://evidence/${id}.zip`,
      createdAt,
      completedAt: createdAt,
    };

    store.evidencePacks.push(pack);
    return reply.code(202).send({ data: pack });
  });

  app.get('/evidence-packs/:packId', async (request, reply) => {
    const { packId } = request.params as { packId: string };
    const pack = store.evidencePacks.find((record) => record.id === packId);

    if (!pack) {
      return reply.code(404).send({ error: 'Evidence pack not found' });
    }

    return { data: pack };
  });

  app.get('/evidence-packs/:packId/download', async (request, reply) => {
    const { packId } = request.params as { packId: string };
    const pack = store.evidencePacks.find((record) => record.id === packId);

    if (!pack) {
      return reply.code(404).send({ error: 'Evidence pack not found' });
    }

    return {
      data: {
        artifactRef: pack.artifactRef,
        manifest: pack.manifestJson,
      },
    };
  });

  app.get('/snapshots/config', async (request, reply) => {
    const { tenantId, siteId, at } = request.query as {
      tenantId?: string;
      siteId?: string;
      at?: string;
    };

    if (!tenantId || !siteId || !at) {
      return reply.code(400).send({ error: 'tenantId, siteId, and at are required' });
    }

    const actions = store.controlActions.filter((item) => item.tenantId === tenantId && item.targetId === siteId);

    return {
      data: {
        tenantId,
        siteId,
        asOf: at,
        schedules: actions.filter((item) => item.actionType.includes('schedule')),
        overrides: actions.filter((item) => item.actionType.includes('override')),
      },
    };
  });
}
