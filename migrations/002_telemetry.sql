CREATE TABLE IF NOT EXISTS telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  site_id UUID NOT NULL REFERENCES sites(id),
  zone_id UUID NOT NULL REFERENCES zones(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  ts TIMESTAMPTZ NOT NULL,
  metric_key TEXT NOT NULL,
  metric_value DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL,
  quality TEXT NOT NULL,
  adapter_id UUID,
  raw_payload_ref TEXT,
  PRIMARY KEY (id, ts)
) PARTITION BY RANGE (ts);

CREATE TABLE IF NOT EXISTS telemetry_2026_01 PARTITION OF telemetry
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE IF NOT EXISTS telemetry_2026_02 PARTITION OF telemetry
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE INDEX IF NOT EXISTS idx_telemetry_asset_ts ON telemetry (asset_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_tenant_site_ts ON telemetry (tenant_id, site_id, ts DESC);
