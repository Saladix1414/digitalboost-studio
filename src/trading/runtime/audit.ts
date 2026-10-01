import type {
  BotRuntimeSessionResult,
} from "./session";

import type {
  RuntimeAuditRecord,
} from "./auditTypes";

export function createRuntimeAuditRecord(
  result:
    BotRuntimeSessionResult
): RuntimeAuditRecord {
  return {
    sessionId:
      result.session.id,

    botId:
      result.session.botId,

    strategyId:
      result.session.strategyId,

    approval: {
      riskReviewId:
        result.runtime.approvalReviewId,

      botId:
        result.runtime.approvalBotId,

      strategyId:
        result.runtime.approvalStrategyId,

      approvalScope:
        "paper-only",

      approvalVerified:
        true,

      bindingFingerprint:
        result.runtime
          .approvalBindingFingerprint,
    },

    decision:
      result.runtime.decision,

    events:
      result.session.events,

    authoritative:
      false,
  };
}
