export type AdapterType = 'protocol_gateway' | 'vendor_api' | 'file_onboarding';
export type AdapterStatus = 'OK' | 'Warning' | 'Critical' | 'Offline';

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  backoffMultiplier: number;
}

export interface DeadLetterPolicy {
  queueName: string;
  maxAgeDays: number;
}

export interface AdapterContext {
  adapterId: string;
  tenantId: string;
  siteId: string;
  correlationId: string;
}

export interface AdapterHealth {
  adapterId: string;
  status: AdapterStatus;
  lastHeartbeatAt: string;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  detail: string | null;
}

export interface NormalizedTelemetry {
  ts: string;
  metricKey: string;
  metricValue: number;
  unit: string;
  quality: string;
}

export interface NormalizedEvent {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'open' | 'acknowledged' | 'closed';
  detectedAt: string;
  rawPayloadRef?: string;
}

export interface AdapterLifecycle {
  start(): Promise<void>;
  stop(): Promise<void>;
  heartbeat(): Promise<AdapterHealth>;
}

export interface AdapterCommandDispatcher {
  dispatchControlCommand(context: AdapterContext, payload: Record<string, unknown>): Promise<{
    accepted: boolean;
    adapterResponseRef: string | null;
  }>;
}
