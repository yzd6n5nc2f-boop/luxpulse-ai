# Pilot to Scale Rollout Plan

## Duration
- 12 weeks, three gates.

## Gate 1: Foundation (Weeks 1-2)
- Deploy local stack and migration baseline.
- Validate adapter registration and health reporting.
- Validate append-only audit enforcement.
- Exit criteria:
  - deterministic simulator scenarios run end-to-end
  - API control action and evidence endpoints operational

## Gate 2: Pilot (Weeks 3-6)
- Scope: 1 tenant, 2-3 sites, 5-10 zones, 50-200 assets.
- Operate fault-to-ticket workflow with SLA timestamps.
- Operate schedule and manual override with mandatory justification.
- Exit criteria:
  - offline scenario auto-creates event/ticket with rule attribution
  - control actions capture before/after and correlation id
  - weekly evidence pack generated successfully

## Gate 3: Scale Readiness (Weeks 7-12)
- Expand to multi-site adapter onboarding playbook.
- Establish tenant-level retention and credential rotation policy.
- Measure KPI baselines and reporting cadence.
- Exit criteria:
  - integration checklist completed per new site
  - no critical audit gaps in evidence packs
  - operational runbook approved by FM stakeholders

## Risks and mitigations
- Integration ambiguity: confirm protocol/API access before onboarding.
- Data quality drift: normalizer validation + payload quarantine.
- Adoption friction: table-first operator workflows + role-based training.
- Audit integrity: hard-block control actions without justification.
- Performance: server-side pagination and indexed queries.
