import {
  hashProposal,
} from "../DigitalBoostPulseContracts";

import {
  verifyPulseIntentReconciliation,
  type PulseIntentReconciliationResult,
} from "./DigitalBoostPulseIntentReconciliation";

import {
  verifyPulseIntentReconciliationRecord,
  type PulseIntentReconciliationRecord,
} from "./DigitalBoostPulseIntentReconciliationRegistry";

export const PULSE_INTENT_RECONCILIATION_CONSUMPTION_CONTRACT =
  "p0.7.2.10" as const;

export type PulseIntentReconciliationConsumerPurpose =
  | "GOAL"
  | "PLANNING"
  | "EVALUATION";

export type PulseIntentReconciliationConsumptionDecision =
  | "ALLOW_OBSERVATION"
  | "BLOCK";

export type PulseIntentReconciliationConsumptionClass =
  | "RECONCILIATION_OBSERVATION"
  | "BLOCKED";

export type PulseIntentReconciliationObservation = {
  contract:
    typeof PULSE_INTENT_RECONCILIATION_CONSUMPTION_CONTRACT;

  observationId:
    string;

  tenantId:
    string;

  contextId:
    string;

  contextVersion:
    string;

  store?:
    string;

  section?:
    string;

  purpose:
    PulseIntentReconciliationConsumerPurpose;

  recordId:
    string;

  reconciliationId:
    string;

  relation:
    PulseIntentReconciliationResult["relation"];

  ruleIntent:
    PulseIntentReconciliationResult["ruleIntent"];

  aiCandidate?:
    PulseIntentReconciliationResult["aiCandidate"];

  authority:
    "RULE_ENGINE";

  canOverrideIntent:
    false;

  canSupportSemanticClaim:
    false;

  canSupportExecution:
    false;

  decision:
    PulseIntentReconciliationConsumptionDecision;

  consumptionClass:
    PulseIntentReconciliationConsumptionClass;

  sourceRegistryHash:
    string;

  source:
    "pulse-intent-reconciliation-consumer";

  observedAt:
    string;

  observationHash:
    string;
};

export class PulseIntentReconciliationConsumerError
  extends Error
{
  readonly code:
    | "INVALID_TENANT"
    | "INVALID_PURPOSE"
    | "TENANT_MISMATCH"
    | "CONTEXT_MISMATCH"
    | "INVALID_RECORD"
    | "BLOCKED_RECONCILIATION"
    | "INVALID_OBSERVATION";

  constructor(
    code:
      PulseIntentReconciliationConsumerError["code"],
    message: string,
  ) {
    super(message);
    this.name =
      "PulseIntentReconciliationConsumerError";
    this.code =
      code;
  }
}

function normalizeTenantId(
  value:
    unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    throw new PulseIntentReconciliationConsumerError(
      "INVALID_TENANT",
      "tenantId must be a non-empty string.",
    );
  }

  const tenantId =
    value.trim();

  if (!tenantId) {
    throw new PulseIntentReconciliationConsumerError(
      "INVALID_TENANT",
      "tenantId must be a non-empty string.",
    );
  }

  if (
    tenantId.includes(
      "\u0000",
    )
  ) {
    throw new PulseIntentReconciliationConsumerError(
      "INVALID_TENANT",
      "tenantId contains a null byte.",
    );
  }

  if (
    tenantId === "*" ||
    tenantId.toLowerCase() ===
      "global" ||
    tenantId.toLowerCase() ===
      "all"
  ) {
    throw new PulseIntentReconciliationConsumerError(
      "INVALID_TENANT",
      "Wildcard/global tenants are not allowed.",
    );
  }

  return tenantId;
}

function normalizeRequiredString(
  value:
    unknown,
  field:
    string,
): string {
  if (
    typeof value !==
    "string"
  ) {
    throw new PulseIntentReconciliationConsumerError(
      "INVALID_OBSERVATION",
      `${field} must be a string.`,
    );
  }

  const normalized =
    value.trim();

  if (!normalized) {
    throw new PulseIntentReconciliationConsumerError(
      "INVALID_OBSERVATION",
      `${field} must be non-empty.`,
    );
  }

  return normalized;
}

function normalizePurpose(
  value:
    unknown,
): PulseIntentReconciliationConsumerPurpose {
  if (
    value === "GOAL" ||
    value === "PLANNING" ||
    value === "EVALUATION"
  ) {
    return value;
  }

  throw new PulseIntentReconciliationConsumerError(
    "INVALID_PURPOSE",
    "Unsupported reconciliation consumption purpose.",
  );
}

function canonicalize(
  value:
    unknown,
): unknown {
  if (
    value === null ||
    typeof value !==
      "object"
  ) {
    return value;
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      canonicalize,
    );
  }

  const object =
    value as Record<
      string,
      unknown
    >;

  return Object.keys(object)
    .sort()
    .reduce(
      (
        result,
        key,
      ) => {
        result[key] =
          canonicalize(
            object[key],
          );

        return result;
      },
      {} as Record<
        string,
        unknown
      >,
    );
}

function canonicalJson(
  value:
    unknown,
): string {
  return JSON.stringify(
    canonicalize(value),
  );
}

function calculateObservationId(
  input: {
    tenantId:
      string;
    contextId:
      string;
    contextVersion:
      string;
    purpose:
      PulseIntentReconciliationConsumerPurpose;
    recordId:
      string;
    registryHash:
      string;
  },
): string {
  return (
    "pulse-intent-reconciliation-observation:" +
    hashProposal(
      canonicalJson(
        input,
      ),
    )
  );
}

function calculateObservationHash(
  observation:
    Omit<
      PulseIntentReconciliationObservation,
      "observationHash"
    >,
): string {
  return hashProposal(
    observation,
  );
}

function assertValidSourceRecord(
  input: {
    tenantId:
      string;
    record:
      PulseIntentReconciliationRecord;
  },
): PulseIntentReconciliationResult {
  const tenantId =
    normalizeTenantId(
      input.tenantId,
    );

  if (
    !verifyPulseIntentReconciliationRecord(
      input.record,
    )
  ) {
    throw new PulseIntentReconciliationConsumerError(
      "INVALID_RECORD",
      "Persisted reconciliation record failed registry verification.",
    );
  }

  if (
    input.record.tenantId !==
    tenantId
  ) {
    throw new PulseIntentReconciliationConsumerError(
      "TENANT_MISMATCH",
      "Consumer tenant does not match reconciliation record tenant.",
    );
  }

  const reconciliation =
    input.record.reconciliation;

  if (
    !verifyPulseIntentReconciliation(
      reconciliation,
    )
  ) {
    throw new PulseIntentReconciliationConsumerError(
      "BLOCKED_RECONCILIATION",
      "Reconciliation failed canonical verification.",
    );
  }

  if (
    reconciliation.tenantId !==
    tenantId
  ) {
    throw new PulseIntentReconciliationConsumerError(
      "TENANT_MISMATCH",
      "Reconciliation tenant does not match consumer tenant.",
    );
  }

  if (
    reconciliation.contextId !==
    input.record.contextId ||
    reconciliation.contextVersion !==
    input.record.contextVersion
  ) {
    throw new PulseIntentReconciliationConsumerError(
      "CONTEXT_MISMATCH",
      "Reconciliation context binding does not match persisted record.",
    );
  }

  return reconciliation;
}

export function consumePulseIntentReconciliation(
  input: {
    tenantId:
      string;

    record:
      PulseIntentReconciliationRecord;

    purpose:
      PulseIntentReconciliationConsumerPurpose;
  },
): PulseIntentReconciliationObservation {
  const tenantId =
    normalizeTenantId(
      input.tenantId,
    );

  const purpose =
    normalizePurpose(
      input.purpose,
    );

  const reconciliation =
    assertValidSourceRecord({
      tenantId,
      record:
        input.record,
    });

  const now =
    new Date().toISOString();

  const base: Omit<
    PulseIntentReconciliationObservation,
    "observationHash"
  > = {
    contract:
      PULSE_INTENT_RECONCILIATION_CONSUMPTION_CONTRACT,

    observationId:
      calculateObservationId({
        tenantId,
        contextId:
          input.record.contextId,
        contextVersion:
          input.record.contextVersion,
        purpose,
        recordId:
          input.record.recordId,
        registryHash:
          input.record.registryHash,
      }),

    tenantId,

    contextId:
      input.record.contextId,

    contextVersion:
      input.record.contextVersion,

    store:
      input.record.store,

    purpose,

    recordId:
      input.record.recordId,

    reconciliationId:
      input.record.reconciliationId,

    relation:
      reconciliation.relation,

    ruleIntent:
      reconciliation.ruleIntent,

    aiCandidate:
      reconciliation.aiCandidate,

    authority:
      "RULE_ENGINE",

    canOverrideIntent:
      false,

    canSupportSemanticClaim:
      false,

    canSupportExecution:
      false,

    decision:
      "ALLOW_OBSERVATION",

    consumptionClass:
      "RECONCILIATION_OBSERVATION",

    sourceRegistryHash:
      input.record.registryHash,

    source:
      "pulse-intent-reconciliation-consumer",

    observedAt:
      now,
  };

  return {
    ...base,
    observationHash:
      calculateObservationHash(
        base,
      ),
  };
}

export function verifyPulseIntentReconciliationObservation(
  observation:
    PulseIntentReconciliationObservation,
): boolean {
  try {
    const tenantId =
      normalizeTenantId(
        observation.tenantId,
      );

    normalizePurpose(
      observation.purpose,
    );

    if (
      observation.contract !==
      PULSE_INTENT_RECONCILIATION_CONSUMPTION_CONTRACT
    ) {
      return false;
    }

    if (
      observation.authority !==
        "RULE_ENGINE" ||
      observation.canOverrideIntent !==
        false ||
      observation.canSupportSemanticClaim !==
        false ||
      observation.canSupportExecution !==
        false
    ) {
      return false;
    }

    if (
      observation.decision !==
      "ALLOW_OBSERVATION"
    ) {
      return false;
    }

    if (
      observation.consumptionClass !==
      "RECONCILIATION_OBSERVATION"
    ) {
      return false;
    }

    if (
      observation.source !==
      "pulse-intent-reconciliation-consumer"
    ) {
      return false;
    }

    if (
      observation.tenantId !==
      tenantId
    ) {
      return false;
    }

    if (
      !observation.contextId ||
      !observation.contextVersion ||
      !observation.recordId ||
      !observation.reconciliationId ||
      !observation.sourceRegistryHash ||
      !observation.observedAt ||
      !observation.observationId ||
      !observation.observationHash
    ) {
      return false;
    }

    const expectedId =
      calculateObservationId({
        tenantId:
          observation.tenantId,
        contextId:
          observation.contextId,
        contextVersion:
          observation.contextVersion,
        purpose:
          observation.purpose,
        recordId:
          observation.recordId,
        registryHash:
          observation.sourceRegistryHash,
      });

    if (
      expectedId !==
      observation.observationId
    ) {
      return false;
    }

    const {
      observationHash,
      ...base
    } = observation;

    return (
      calculateObservationHash(
        base,
      ) ===
      observationHash
    );
  } catch {
    return false;
  }
}

export default
  consumePulseIntentReconciliation;
