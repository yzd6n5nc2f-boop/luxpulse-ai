CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  site_id UUID NOT NULL REFERENCES sites(id),
  zone_id UUID NOT NULL REFERENCES zones(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('open', 'acknowledged', 'closed')),
  detected_at TIMESTAMPTZ NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  rule_id TEXT,
  rule_version INTEGER,
  correlation_id TEXT NOT NULL,
  raw_payload_ref TEXT
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  site_id UUID NOT NULL REFERENCES sites(id),
  zone_id UUID NOT NULL REFERENCES zones(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  source_event_id UUID REFERENCES events(id),
  status TEXT NOT NULL CHECK (status IN ('open', 'assigned', 'resolved', 'closed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  opened_at TIMESTAMPTZ NOT NULL,
  assigned_to TEXT,
  sla_due_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  resolution_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_tenant_status ON events (tenant_id, status, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_tenant_status ON tickets (tenant_id, status, opened_at DESC);
