import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { store } from '../db/store.js';
import { correlationId, nowIso } from '../utils.js';

const controlActionSchema = z.object({
  tenantId: z.string(),
  actorType: z.enum(['user', 'system']),
  actorId: z.string().min(2),
  targetType: z.enum(['tenant', 'site', 'zone', 'asset']),
  targetId: z.string(),
  actionType: z.string().min(2),
  justification: z.string().min(5),
  beforeStateJson: z.record(z.unknown()),
  afterStateJson: z.record(z.unknown()),
  approvalJson: z.record(z.unknown()).nullable().default(null),
});

function appendControlAction(input: z.infer<typeof controlActionSchema>, correlationIdValue: string) {
  const record = {
    id: randomUUID(),
    tenantId: input.tenantId,
    actorType: input.actorType,
    actorId: input.actorId,
    targetType: input.targetType,
    targetId: input.targetId,
    actionType: input.actionType,
    justification: input.justification,
    beforeStateJson: input.beforeStateJson,
    afterStateJson: input.afterStateJson,
    approvalJson: input.approvalJson,
    correlationId: correlationIdValue,
    adapterResponseRef: null,
    createdAt: nowIso(),
  };

  // Append-only semantics: records are never mutated in place.
  store.controlActions.push(record);
  return record;
}

export async function controlRoutes(app: FastifyInstance, _opts: FastifyPluginOptions) {
  app.post('/control/schedules', async (request, reply) => {
    const parsed = controlActionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const cid = correlationId(request);
    const record = appendControlAction({ ...parsed.data, actionType: 'schedule.create' }, cid);

    return reply.code(201).send({ data: record, correlationId: cid });
  });

  app.post('/control/schedules/apply', async (request, reply) => {
    const parsed = controlActionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const cid = correlationId(request);
    const record = appendControlAction({ ...parsed.data, actionType: 'schedule.apply' }, cid);

    return reply.code(201).send({ data: record, correlationId: cid });
  });

  app.post('/control/overrides', async (request, reply) => {
    const parsed = controlActionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const cid = correlationId(request);
    const record = appendControlAction({ ...parsed.data, actionType: 'manual.override' }, cid);

    return reply.code(201).send({ data: record, correlationId: cid });
  });

  app.get('/control/history', async (request) => {
    const { tenantId, targetType, targetId } = request.query as {
      tenantId?: string;
      targetType?: 'tenant' | 'site' | 'zone' | 'asset';
      targetId?: string;
    };

    return {
      data: store.controlActions.filter(
        (action) =>
          (!tenantId || action.tenantId === tenantId) &&
          (!targetType || action.targetType === targetType) &&
          (!targetId || action.targetId === targetId),
      ),
    };
  });
}
