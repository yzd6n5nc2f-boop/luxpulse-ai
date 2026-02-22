import { buildEvidencePackManifest } from './jobs/evidencePackJob.js';
import { replayFixture } from './rules/engine.js';

const replayInput = {
  tenantId: 'demo-tenant',
  siteId: 'site-london-west',
  zoneId: 'zone-a',
  assetId: 'LUX-0003',
  now: new Date().toISOString(),
  telemetry: {
    heartbeatAgeMinutes: 14,
    powerWatts: 520,
    expectedPowerWatts: 420,
    faultCount24h: 3,
  },
};

function runWorkerTick() {
  const replay = replayFixture('offline-event-ticket', {
    ...replayInput,
    now: new Date().toISOString(),
  });

  const manifest = buildEvidencePackManifest({
    tenantId: 'demo-tenant',
    siteId: 'site-london-west',
    periodStart: '2026-02-15T00:00:00.000Z',
    periodEnd: '2026-02-22T23:59:59.999Z',
  });

  console.log('[worker] deterministic replay', JSON.stringify(replay.result, null, 2));
  console.log('[worker] evidence manifest checksums', manifest.checksums);
}

runWorkerTick();
setInterval(runWorkerTick, 60_000);
