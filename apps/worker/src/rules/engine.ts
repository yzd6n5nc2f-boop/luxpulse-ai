import { randomUUID } from 'node:crypto';
import { rules, type RuleInput } from './definitions.js';

export type RuleExecutionRecord = {
  ruleId: string;
  ruleVersion: number;
  executedAt: string;
  inputRef: string;
  outputEventId: string | null;
  outputTicketId: string | null;
  outcome: string;
};

export function evaluateRules(input: RuleInput) {
  const executions: RuleExecutionRecord[] = [];

  for (const rule of rules) {
    if (!rule.enabled) {
      continue;
    }

    const outcome = rule.evaluate(input);
    const eventId = outcome ? `evt-${randomUUID()}` : null;
    const ticketId = outcome?.openTicket ? `tkt-${randomUUID()}` : null;

    executions.push({
      ruleId: rule.id,
      ruleVersion: rule.version,
      executedAt: input.now,
      inputRef: `replay:${input.assetId}:${input.now}`,
      outputEventId: eventId,
      outputTicketId: ticketId,
      outcome: outcome?.reason ?? 'no match',
    });
  }

  return executions;
}

export function replayFixture(name: string, input: RuleInput) {
  const result = evaluateRules(input);
  return {
    fixture: name,
    input,
    result,
  };
}
