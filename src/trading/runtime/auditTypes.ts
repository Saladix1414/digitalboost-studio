import type {
  BotRuntimeDecision,
} from "./types";

import type {
  BotRuntimeEvent,
} from "./activityTypes";

export type RuntimeApprovalEvidence = {
  readonly riskReviewId:
    string;

  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly approvalScope:
    "paper-only";

  readonly approvalVerified:
    true;
};

export type RuntimeAuditRecord = {
  readonly sessionId:
    string;

  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly approval:
    RuntimeApprovalEvidence;

  readonly decision:
    BotRuntimeDecision;

  readonly events:
    readonly BotRuntimeEvent[];

  readonly authoritative:
    false;
};
