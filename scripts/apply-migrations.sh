#!/usr/bin/env bash
set -euo pipefail

DB_URL="${DATABASE_URL:-postgresql://luxpulse:luxpulse@localhost:5432/luxpulse}"
MIGRATIONS_DIR="$(cd "$(dirname "$0")/../migrations" && pwd)"

for file in \
  001_core_hierarchy.sql \
  002_telemetry.sql \
  003_events_tickets.sql \
  004_control_actions_audit.sql \
  005_integrations.sql \
  006_rules.sql \
  007_evidence.sql \
  008_constraints_indexes_views.sql \
  009_seed_dev.sql; do
  echo "Applying ${file}"
  psql "${DB_URL}" -v ON_ERROR_STOP=1 -f "${MIGRATIONS_DIR}/${file}"
done

echo "Migrations complete"
