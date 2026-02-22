import { buildOfflineScenario } from './scenarios/offlineScenario.js';
import { buildOverrideScenario } from './scenarios/overrideScenario.js';

const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';
const tickMs = Number(process.env.SIM_TICK_MS ?? 45_000);

async function postJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-correlation-id': `sim-${Date.now()}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`POST ${path} failed (${response.status}): ${message}`);
  }

  return response.json();
}

async function runSimulatorTick() {
  try {
    const telemetryPayload = buildOfflineScenario();
    const telemetryResult = await postJson('/telemetry/ingest', telemetryPayload);

    const overridePayload = buildOverrideScenario();
    const overrideResult = await postJson('/control/overrides', overridePayload);

    console.log('[simulator] telemetry ingest result', telemetryResult);
    console.log('[simulator] override action result', {
      id: overrideResult?.data?.id,
      correlationId: overrideResult?.correlationId,
    });
  } catch (error) {
    console.error('[simulator] tick failed', error);
  }
}

console.log(`[simulator] sending deterministic scenarios to ${apiBaseUrl}`);
runSimulatorTick();
setInterval(runSimulatorTick, tickMs);
