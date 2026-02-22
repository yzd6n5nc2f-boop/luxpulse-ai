export function buildOfflineScenario() {
  return {
    tenantId: 'demo-tenant',
    siteId: 'site-london-west',
    zoneId: 'zone-a',
    assetId: 'LUX-0003',
    adapterId: 'adapter-dali-west',
    rawPayloadRef: 'sim://offline-asset/LUX-0003',
    points: [
      {
        ts: new Date(Date.now() - 11 * 60_000).toISOString(),
        metricKey: 'heartbeat_age_minutes',
        metricValue: 11,
        unit: 'minutes',
        quality: 'good',
      },
      {
        ts: new Date().toISOString(),
        metricKey: 'power_w',
        metricValue: 0,
        unit: 'W',
        quality: 'suspect',
      },
    ],
  };
}
