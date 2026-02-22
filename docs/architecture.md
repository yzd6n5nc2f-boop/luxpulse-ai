# LuxPulse MVP Architecture

## Goals
- Vendor-neutral interoperability through adapter boundaries.
- Canonical model normalization before analytics/control logic.
- Audit-ready evidence for monitoring and control outcomes.

## Components
- `apps/web`: Operations UI (tenant/site/zone/asset flows, control actions, evidence packs).
- `apps/api`: REST API for canonical CRUD, telemetry ingest, events, tickets, control, evidence, integrations.
- `apps/worker`: Deterministic rule execution and evidence manifest generation.
- `apps/simulator`: Deterministic local adapter simulations.
- `packages/canonical-model`: Shared entities and DTO contracts.
- `packages/adapter-sdk`: Adapter lifecycle, health, retry, and DLQ interfaces.

## Canonical Flow
1. Adapter receives protocol/vendor payload.
2. Payload normalized to canonical entities (`Telemetry`, `Event`, `Asset`, `ControlAction`).
3. API persists canonical records and raw payload references.
4. Worker evaluates rules with versioned rule definitions.
5. Event and ticket lifecycle updates are exposed through API/UI.
6. Evidence pack job snapshots config + outcomes and emits manifest/checksums.

## Control and Audit
- All control surfaces require justification.
- All control writes create immutable `control_actions` entries with:
  - actor metadata
  - target metadata
  - before/after state
  - correlation id
- DB-level trigger blocks update/delete on control actions.

## Data stores (MVP)
- PostgreSQL for hierarchy, events, tickets, control actions, integrations, evidence metadata.
- PostgreSQL partitioned telemetry table for time-series MVP.
- MinIO for evidence artifacts.
- Redis for queue placeholder/backpressure path.
