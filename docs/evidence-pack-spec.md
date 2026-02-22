# Evidence Pack Specification (MVP)

Evidence packs support audit-ready reporting and traceability for a selected tenant/site/time range.

## Bundle layout
- `manifest.json`
- `asset_registry_snapshot.json`
- `config_snapshot.json`
- `schedule_snapshot.json`
- `override_log.csv`
- `fault_summary.json`
- `kpi_summary.json`

## Manifest fields
- `pack_id`
- `tenant_id`
- `site_id`
- `period_start`
- `period_end`
- `generated_at`
- `generator_version`
- `items[]`
  - `name`
  - `checksum_sha256`
  - `source_refs[]`

## Traceability requirements
- Every control record references `correlation_id` and appears in `override_log.csv`.
- Config snapshots include schedule versions and change timestamps.
- Fault summary includes rule id/version attribution and raw payload references.
- KPI summary includes reproducible query time and source table/view names.
