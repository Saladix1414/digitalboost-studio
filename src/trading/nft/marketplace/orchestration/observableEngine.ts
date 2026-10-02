import {
  runMarketplaceLifecycleEngine,
} from "./lifecycleEngine";

import {
  appendMarketplaceEngineTrace,
} from "./trace";

import type {
  NftMarketplaceEngineInput,
  NftMarketplaceEngineObservability,
  NftMarketplaceEngineTraceEntry,
} from "./types";

export function runObservableMarketplaceEngine(
  input:
    NftMarketplaceEngineInput
) {
  let trace:
    readonly NftMarketplaceEngineTraceEntry[] =
      [];

  trace =
    appendMarketplaceEngineTrace(
      trace,
      {
        kind:
          "LIFECYCLE",

        level:
          "INFO",

        code:
          "ENGINE_STARTED",

        message:
          "Marketplace engine lifecycle started.",

        occurredAt:
          input.clock.saleIntentAt,
      }
    );

  const result =
    runMarketplaceLifecycleEngine(
      input
    );

  if (
    result.lifecycle.status ===
      "REJECTED"
  ) {
    trace =
      appendMarketplaceEngineTrace(
        trace,
        {
          kind:
            "GUARD",

          level:
            "ERROR",

          code:
            "ELIGIBILITY_REJECTED",

          message:
            "Marketplace engine stopped because listing eligibility failed.",

          occurredAt:
            input.clock.saleIntentAt,
        }
      );

    const observability:
      NftMarketplaceEngineObservability = {
        trace,

        failureCode:
          "ELIGIBILITY_REJECTED",

        failed:
          true,

        authoritative:
          false,
      };

    return {
      ...result,

      observability,
    };
  }

  for (
    const event of
    result.lifecycle.events
  ) {
    trace =
      appendMarketplaceEngineTrace(
        trace,
        {
          kind:
            "LIFECYCLE",

          level:
            "INFO",

          code:
            event.to,

          message:
            event.reason,

          occurredAt:
            event.occurredAt,
        }
      );
  }

  trace =
    appendMarketplaceEngineTrace(
      trace,
      {
        kind:
          "BOUNDARY",

        level:
          "INFO",

        code:
          "EXECUTION_BOUNDARY_PRESERVED",

        message:
          "Engine stopped at pre-settlement without payment wallet signing or RPC.",

        occurredAt:
          input.clock.preSettlementAt,
      }
    );

  const observability:
    NftMarketplaceEngineObservability = {
      trace,

      failureCode:
        "NONE",

      failed:
        false,

      authoritative:
        false,
    };

  return {
    ...result,

    observability,
  };
}
