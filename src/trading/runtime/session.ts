import {
  runBotRuntimeStep,
} from "./botRuntime";

import {
  createRuntimeSessionId,
} from "./sessionIdentity";

import type {
  BotRuntimeContext,
  BotRuntimeResult,
} from "./types";

import type {
  BotRuntimeEvent,
  BotRuntimeEventType,
  BotRuntimeSession,
} from "./activityTypes";

function createEvent(
  sessionId:
    string,

  sequence:
    number,

  type:
    BotRuntimeEventType,

  context:
    BotRuntimeContext,

  message:
    string
): BotRuntimeEvent {
  return {
    id:
      `${sessionId}-event-${sequence}`,

    sequence,
    type,

    botId:
      context.bot.id,

    strategyId:
      context.strategy.id,

    symbol:
      context.bot.symbol,

    message,
  };
}

export type BotRuntimeSessionResult = {
  readonly session:
    BotRuntimeSession;

  readonly runtime:
    BotRuntimeResult;
};

export function runBotRuntimeSession(
  context:
    BotRuntimeContext
): BotRuntimeSessionResult {
  const sessionId =
    createRuntimeSessionId(
      context.bot.id
    );

  const events:
    BotRuntimeEvent[] = [];

  const pushEvent =
    (
      type:
        BotRuntimeEventType,

      message:
        string
    ) => {
      events.push(
        createEvent(
          sessionId,
          events.length + 1,
          type,
          context,
          message
        )
      );
    };

  pushEvent(
    "session_started",
    "Paper bot runtime session started."
  );

  if (
    context.evaluation.signal ===
    "none"
  ) {
    pushEvent(
      "no_signal",
      "Strategy evaluation produced no actionable signal."
    );
  } else {
    pushEvent(
      "signal_seen",
      `Strategy signal observed: ${context.evaluation.signal}.`
    );
  }

  const runtime =
    runBotRuntimeStep(
      context
    );

  if (
    runtime.decision ===
    "approval-rejected"
  ) {
    pushEvent(
      "approval_checked",
      "Paper runtime approval binding was checked."
    );

    pushEvent(
      "approval_rejected",
      runtime.reason
    );
  } else if (
    runtime.decision ===
    "risk-rejected"
  ) {
    pushEvent(
      "risk_checked",
      "Paper risk policy rejected the runtime request."
    );

    pushEvent(
      "order_rejected",
      runtime.reason
    );
  } else if (
    runtime.decision ===
    "paper-filled"
  ) {
    pushEvent(
      "risk_checked",
      "Paper risk policy approved the runtime request."
    );

    pushEvent(
      "order_accepted",
      runtime.reason
    );

    pushEvent(
      "ledger_updated",
      "Paper account state was updated by the execution boundary."
    );
  } else if (
    runtime.decision ===
    "paper-rejected"
  ) {
    pushEvent(
      "risk_checked",
      "Paper risk policy approved the runtime request."
    );

    pushEvent(
      "order_rejected",
      runtime.reason
    );
  }

  pushEvent(
    "session_completed",
    `Runtime decision: ${runtime.decision}.`
  );

  return {
    runtime,

    session: {
      id:
        sessionId,

      botId:
        context.bot.id,

      strategyId:
        context.strategy.id,

      events,

      completed:
        true,

      authoritative:
        false,
    },
  };
}

export default runBotRuntimeSession;
