CREATE TABLE IF NOT EXISTS evidence_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  site_id UUID NOT NULL REFERENCES sites(id),
  requested_by TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'ready', 'failed')),
  manifest_json JSONB,
  artifact_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS evidence_pack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_pack_id UUID NOT NULL REFERENCES evidence_packs(id),
  item_type TEXT NOT NULL,
  content_ref TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_packs_tenant_site_period ON evidence_packs (tenant_id, site_id, period_start, period_end);
