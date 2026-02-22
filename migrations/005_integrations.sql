CREATE TABLE IF NOT EXISTS adapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  site_id UUID NOT NULL REFERENCES sites(id),
  type TEXT NOT NULL CHECK (type IN ('protocol_gateway', 'vendor_api', 'file_onboarding')),
  name TEXT NOT NULL,
  config_json JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OK', 'Warning', 'Critical', 'Offline')),
  last_heartbeat_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS adapter_credential_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  site_id UUID NOT NULL REFERENCES sites(id),
  adapter_id UUID NOT NULL REFERENCES adapters(id),
  secret_ref TEXT NOT NULL,
  rotated_at TIMESTAMPTZ NOT NULL,
  rotated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_adapters_tenant_site ON adapters (tenant_id, site_id);
CREATE INDEX IF NOT EXISTS idx_adapter_cred_tenant_site ON adapter_credential_sets (tenant_id, site_id);
