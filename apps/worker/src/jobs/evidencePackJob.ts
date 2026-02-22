import { createHash } from 'node:crypto';

export type EvidencePackJobInput = {
  tenantId: string;
  siteId: string;
  periodStart: string;
  periodEnd: string;
};

export function buildEvidencePackManifest(input: EvidencePackJobInput) {
  const base = `${input.tenantId}:${input.siteId}:${input.periodStart}:${input.periodEnd}`;
  const checksum = (suffix: string) => createHash('sha256').update(`${base}:${suffix}`).digest('hex');

  return {
    generatedAt: new Date().toISOString(),
    includes: [
      'asset_registry_snapshot.json',
      'config_snapshot.json',
      'schedule_snapshot.json',
      'override_log.csv',
      'fault_summary.json',
      'kpi_summary.json',
    ],
    checksums: {
      asset_registry_snapshot: checksum('assets'),
      config_snapshot: checksum('config'),
      schedule_snapshot: checksum('schedules'),
      override_log: checksum('overrides'),
      fault_summary: checksum('faults'),
      kpi_summary: checksum('kpi'),
    },
  };
}
