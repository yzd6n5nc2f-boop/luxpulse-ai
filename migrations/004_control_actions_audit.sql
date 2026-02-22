CREATE TABLE IF NOT EXISTS control_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'system')),
  actor_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('tenant', 'site', 'zone', 'asset')),
  target_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  justification TEXT NOT NULL,
  before_state_json JSONB NOT NULL,
  after_state_json JSONB NOT NULL,
  approval_json JSONB,
  correlation_id TEXT NOT NULL,
  adapter_response_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_control_actions_target_time ON control_actions (tenant_id, target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_control_actions_correlation ON control_actions (correlation_id);

CREATE OR REPLACE FUNCTION prevent_control_action_update_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'control_actions is append-only. Updates and deletes are forbidden.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_control_action_update ON control_actions;
CREATE TRIGGER trg_prevent_control_action_update
BEFORE UPDATE ON control_actions
FOR EACH ROW
EXECUTE FUNCTION prevent_control_action_update_delete();

DROP TRIGGER IF EXISTS trg_prevent_control_action_delete ON control_actions;
CREATE TRIGGER trg_prevent_control_action_delete
BEFORE DELETE ON control_actions
FOR EACH ROW
EXECUTE FUNCTION prevent_control_action_update_delete();
