import { randomUUID } from 'node:crypto';
import type { FastifyRequest } from 'fastify';

export function nowIso() {
  return new Date().toISOString();
}

export function correlationId(request: FastifyRequest) {
  const headerId = request.headers['x-correlation-id'];
  if (typeof headerId === 'string' && headerId.trim()) {
    return headerId;
  }
  return randomUUID();
}
