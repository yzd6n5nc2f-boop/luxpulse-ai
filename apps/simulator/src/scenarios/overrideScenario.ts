export function buildOverrideScenario() {
  return {
    tenantId: 'demo-tenant',
    actorType: 'user',
    actorId: 'ops.manager',
    targetType: 'asset',
    targetId: 'LUX-0003',
    actionType: 'manual.override',
    justification: 'Night inspection task for aisle lighting',
    beforeStateJson: { dimLevel: 82, scheduleVersion: 6 },
    afterStateJson: { dimLevel: 70, scheduleVersion: 6 },
    approvalJson: { requested: false },
  };
}
