CREATE INDEX IF NOT EXISTS idx_assets_tenant_site_zone ON assets (tenant_id, site_id, zone_id);
CREATE INDEX IF NOT EXISTS idx_assets_last_seen ON assets (tenant_id, last_seen_at DESC);

CREATE OR REPLACE VIEW v_site_availability AS
SELECT
  s.id AS site_id,
  s.tenant_id,
  s.name AS site_name,
  COUNT(a.id) AS asset_count,
  SUM(CASE WHEN a.status = 'Offline' THEN 1 ELSE 0 END) AS offline_assets,
  ROUND(
    100.0 * (
      COUNT(a.id) - SUM(CASE WHEN a.status = 'Offline' THEN 1 ELSE 0 END)
    ) / NULLIF(COUNT(a.id), 0),
    2
  ) AS availability_pct
FROM sites s
LEFT JOIN assets a ON a.site_id = s.id
GROUP BY s.id, s.tenant_id, s.name;

CREATE OR REPLACE VIEW v_ticket_sla_summary AS
SELECT
  tenant_id,
  site_id,
  COUNT(*) FILTER (WHERE status IN ('open', 'assigned')) AS active_tickets,
  COUNT(*) FILTER (WHERE status = 'closed') AS closed_tickets,
  COUNT(*) FILTER (WHERE sla_due_at IS NOT NULL AND sla_due_at < now() AND status <> 'closed') AS breached_sla
FROM tickets
GROUP BY tenant_id, site_id;
