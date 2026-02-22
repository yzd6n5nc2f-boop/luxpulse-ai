CREATE TABLE IF NOT EXISTS rule_definitions (
  id TEXT NOT NULL,
  version INTEGER NOT NULL,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  condition_json JSONB NOT NULL,
  action_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, version)
);

CREATE TABLE IF NOT EXISTS rule_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id TEXT NOT NULL,
  rule_version INTEGER NOT NULL,
  input_ref TEXT NOT NULL,
  output_event_id UUID,
  output_ticket_id UUID,
  executed_at TIMESTAMPTZ NOT NULL,
  FOREIGN KEY (rule_id, rule_version) REFERENCES rule_definitions(id, version)
);

CREATE INDEX IF NOT EXISTS idx_rule_executions_time ON rule_executions (executed_at DESC);
