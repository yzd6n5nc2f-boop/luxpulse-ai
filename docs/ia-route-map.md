# IA Route Map

Base route: `/app/:tenantId`

- `/sites` - Site list with map/list duality.
- `/sites/:siteId` - Site dashboard (availability, offline assets, ticket volume, energy trend).
- `/sites/:siteId/zones/:zoneId` - Zone assets table, schedule summary, recent overrides.
- `/assets/:assetId` - Asset identity, comms status, telemetry chart, control history.
- `/events` - Event/fault queue with severity and rule attribution.
- `/tickets` - Work order lifecycle and SLA visibility.
- `/control/schedules` - Schedule CRUD and apply flow.
- `/control/overrides` - Manual override history and submission.
- `/reports` - KPI summary (energy/cost/carbon/availability/SLA).
- `/evidence-packs` - Evidence pack generation and artifact listing.
- `/integrations` - Adapter health, heartbeat, credential rotation placeholders.
