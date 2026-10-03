import type {
  DbxConsumptionIntent,
} from "./types";

import type {
  DbxConsumptionHoldBinding,
  DbxConsumptionHoldBindingCheck,
  DbxConsumptionHoldSnapshot,
} from "./holdBindingTypes";

function isPurposeCompatible(
  holdPurpose: string,
  consumptionPurpose:
    DbxConsumptionIntent["purpose"]
) {
  if (
    consumptionPurpose ===
      "AI_RUNTIME"
  ) {
    return (
      holdPurpose ===
        "AI_RUNTIME" ||
      holdPurpose ===
        "SERVICE" ||
      holdPurpose ===
        "OTHER"
    );
  }

  if (
    consumptionPurpose ===
      "TOOL_USAGE"
  ) {
    return (
      holdPurpose ===
        "TOOL_USAGE" ||
      holdPurpose ===
        "SERVICE" ||
      holdPurpose ===
        "OTHER"
    );
  }

  if (
    consumptionPurpose ===
      "BOT_RUNTIME"
  ) {
    return (
      holdPurpose ===
        "BOT_RUNTIME" ||
      holdPurpose ===
        "SERVICE" ||
      holdPurpose ===
        "OTHER"
    );
  }

  return (
    holdPurpose ===
      "SERVICE" ||
    holdPurpose ===
      "OTHER"
  );
}

export function evaluateDbxConsumptionHoldBinding(
  input: {
    readonly id: string;

    readonly intent:
      DbxConsumptionIntent;

    readonly hold:
      DbxConsumptionHoldSnapshot;

    readonly createdAt:
      string;
  }
): DbxConsumptionHoldBinding {
  const checks:
    DbxConsumptionHoldBindingCheck[] =
      [
        {
          code:
            "HOLD_ACTIVE",

          passed:
            input.hold.status ===
            "ACTIVE",
        },

        {
          code:
            "ACCOUNT_MATCH",

          passed:
            input.hold.accountId ===
            input.intent.userAccountId,
        },

        {
          code:
            "AMOUNT_MATCH",

          passed:
            input.hold.amountMinor ===
            input.intent.amountMinor,
        },

        {
          code:
            "REFERENCE_MATCH",

          passed:
            input.hold.reference ===
            input.intent.serviceReference,
        },

        {
          code:
            "PURPOSE_COMPATIBLE",

          passed:
            isPurposeCompatible(
              input.hold.purpose,
              input.intent.purpose
            ),
        },
      ];

  return {
    id:
      input.id,

    consumptionIntentId:
      input.intent.id,

    holdId:
      input.hold.id,

    userAccountId:
      input.intent.userAccountId,

    amountMinor:
      input.intent.amountMinor,

    checks,

    verified:
      checks.every(
        check =>
          check.passed
      ),

    createdAt:
      input.createdAt,

    authoritative:
      false,
  };
}

export function assertDbxConsumptionHoldBinding(
  binding:
    DbxConsumptionHoldBinding
) {
  if (
    !binding.verified
  ) {
    const failed =
      binding.checks
        .filter(
          check =>
            !check.passed
        )
        .map(
          check =>
            check.code
        )
        .join(",");

    throw new Error(
      `DBX_CONSUMPTION_HOLD_BINDING_FAILED:${failed}`
    );
  }
}
