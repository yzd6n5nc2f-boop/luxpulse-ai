import cors from '@fastify/cors';
import Fastify from 'fastify';
import { seedStore } from './db/store.js';
import { controlRoutes } from './modules/controlRoutes.js';
import { coreRoutes } from './modules/coreRoutes.js';
import { evidenceRoutes } from './modules/evidenceRoutes.js';
import { integrationRoutes } from './modules/integrationRoutes.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

async function createServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
  });

  seedStore();

  app.get('/health', async () => ({
    ok: true,
    service: 'luxpulse-api',
    time: new Date().toISOString(),
  }));

  await app.register(async (v1) => {
    await v1.register(coreRoutes);
    await v1.register(controlRoutes);
    await v1.register(evidenceRoutes);
    await v1.register(integrationRoutes);
  }, { prefix: '/api/v1' });

  return app;
}

const server = await createServer();

server.listen({ port, host }).catch((err) => {
  server.log.error(err);
  process.exit(1);
});
