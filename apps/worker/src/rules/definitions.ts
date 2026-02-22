export type RuleDefinition = {
  id: string;
  version: number;
  enabled: boolean;
  description: string;
  evaluate: (input: RuleInput) => RuleOutcome | null;
};

export type RuleInput = {
  tenantId: string;
  siteId: string;
  zoneId: string;
  assetId: string;
  now: string;
  telemetry: {
    heartbeatAgeMinutes: number;
    powerWatts: number;
    expectedPowerWatts: number;
    faultCount24h: number;
  };
};

export type RuleOutcome = {
  eventType: string;
  severity: 'warning' | 'critical';
  openTicket: boolean;
  reason: string;
};

export const rules: RuleDefinition[] = [
  {
    id: 'offline-threshold',
    version: 3,
    enabled: true,
    description: 'No heartbeat over threshold minutes',
    evaluate: (input) => {
      if (input.telemetry.heartbeatAgeMinutes > 10) {
        return {
          eventType: 'asset_offline',
          severity: 'critical',
          openTicket: true,
          reason: `Heartbeat age ${input.telemetry.heartbeatAgeMinutes}m exceeds threshold`,
        };
      }
      return null;
    },
  },
  {
    id: 'power-anomaly',
    version: 2,
    enabled: true,
    description: 'Power draw anomaly versus expected baseline',
    evaluate: (input) => {
      const expected = input.telemetry.expectedPowerWatts;
      const deviation = Math.abs(input.telemetry.powerWatts - expected) / Math.max(expected, 1);
      if (deviation > 0.25) {
        return {
          eventType: 'power_anomaly',
          severity: 'warning',
          openTicket: true,
          reason: `Power deviation ${(deviation * 100).toFixed(1)}% exceeds 25%`,
        };
      }
      return null;
    },
  },
  {
    id: 'repeat-fault-pattern',
    version: 1,
    enabled: true,
    description: 'Repeated faults in rolling 24h window',
    evaluate: (input) => {
      if (input.telemetry.faultCount24h >= 3) {
        return {
          eventType: 'repeated_fault_pattern',
          severity: 'warning',
          openTicket: true,
          reason: `Fault count in 24h is ${input.telemetry.faultCount24h}`,
        };
      }
      return null;
    },
  },
];
