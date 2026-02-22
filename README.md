# LuxPulse Monorepo

Vendor-neutral lighting asset management platform scaffold for laptop-first MVP development.

## Workspace layout
- `apps/web`: React + Vite operations UI with day/night themes and IA route skeleton.
- `apps/api`: Fastify API stubs for canonical entities, control actions, evidence packs, and integrations.
- `apps/worker`: Deterministic rules engine and evidence job placeholders.
- `apps/simulator`: Simulated adapters for deterministic telemetry/event flows.
- `packages/canonical-model`: Shared canonical entities, enums, and DTO contracts.
- `packages/adapter-sdk`: Shared adapter lifecycle and retry/DLQ interfaces.
- `migrations`: SQL schema and seed migrations with append-only audit semantics.
- `infra/docker-compose.yml`: Local Postgres + Redis + MinIO services.

## Quick start
1. `npm install`
2. `npm run dev:web`
3. `npm run dev:api`
4. `npm run dev:worker`
5. `npm run dev:simulator`

Or run all services together:
- `npm run dev`

## Default local URLs
- Web UI: `http://localhost:5173`
- API: `http://localhost:4000`

## Notes
- Integrations are adapter-driven. Confirm protocol/API access per vendor/site.
- Evidence packs are implementation outputs for reporting and traceability; no compliance guarantee is implied.
