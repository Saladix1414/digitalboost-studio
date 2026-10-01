import {
  validateRiskReviewChain,
} from "./reviewChainValidation";

import type {
  ApprovalRepositoryState,
} from "./reviewRepository";

import type {
  RiskReview,
  RiskReviewCheck,
  RiskReviewCheckId,
  RiskReviewStatus,
} from "./reviewTypes";

import type {
  RiskReviewHistory,
  RiskReviewHistoryEntry,
} from "./reviewHistory";

import type {
  RiskReviewCreationReason,
  RiskReviewProvenance,
  RiskReviewProvenanceSource,
} from "./reviewProvenance";

import type {
  VersionedRiskReview,
} from "./reviewVersion";


export class ApprovalBackendStateValidationError
  extends Error {
  readonly authoritative =
    false as const;

  constructor(
    message:
      string
  ) {
    super(
      message
    );

    this.name =
      "ApprovalBackendStateValidationError";
  }
}


function fail(
  message:
    string
):
  never {
  throw new ApprovalBackendStateValidationError(
    message
  );
}


function isRecord(
  value:
    unknown
):
  value is Record<
    string,
    unknown
  > {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}


function requireRecord(
  value:
    unknown,

  label:
    string
):
  Record<string, unknown> {
  if (
    !isRecord(
      value
    )
  ) {
    fail(
      `${label} must be an object.`
    );
  }

  return value;
}


function requireString(
  value:
    unknown,

  label:
    string
):
  string {
  if (
    typeof value !==
      "string" ||
    value.length ===
      0
  ) {
    fail(
      `${label} must be a non-empty string.`
    );
  }

  return value;
}


function requireBoolean(
  value:
    unknown,

  label:
    string
):
  boolean {
  if (
    typeof value !==
      "boolean"
  ) {
    fail(
      `${label} must be boolean.`
    );
  }

  return value;
}


function requirePositiveInteger(
  value:
    unknown,

  label:
    string
):
  number {
  if (
    typeof value !==
      "number" ||
    !Number.isInteger(
      value
    ) ||
    value <
      1
  ) {
    fail(
      `${label} must be a positive integer.`
    );
  }

  return value;
}


function requireNullableString(
  value:
    unknown,

  label:
    string
):
  string | null {
  if (
    value ===
    null
  ) {
    return null;
  }

  return requireString(
    value,
    label
  );
}


const reviewStatuses =
  new Set<RiskReviewStatus>([
    "pending",
    "approved",
    "rejected",
  ]);


const reviewCheckIds =
  new Set<RiskReviewCheckId>([
    "strategy-valid",
    "paper-only",
    "order-limit",
    "position-limit",
    "cash-reserve",
    "risk-reward",
  ]);


const provenanceSources =
  new Set<RiskReviewProvenanceSource>([
    "risk-review-workspace",
    "bot-forge",
  ]);


const creationReasons =
  new Set<RiskReviewCreationReason>([
    "initial-review",
    "explicit-rereview",
  ]);


function parseRiskReviewCheck(
  value:
    unknown,

  index:
    number
):
  RiskReviewCheck {
  const record =
    requireRecord(
      value,
      `Risk review check ${index}`
    );

  const id =
    requireString(
      record.id,
      `Risk review check ${index}.id`
    );

  if (
    !reviewCheckIds.has(
      id as RiskReviewCheckId
    )
  ) {
    fail(
      `Risk review check ${index}.id is invalid.`
    );
  }

  return {
    id:
      id as RiskReviewCheckId,

    passed:
      requireBoolean(
        record.passed,
        `Risk review check ${index}.passed`
      ),

    message:
      requireString(
        record.message,
        `Risk review check ${index}.message`
      ),
  };
}


function parseRiskReview(
  value:
    unknown,

  label:
    string
):
  RiskReview {
  const record =
    requireRecord(
      value,
      label
    );

  const status =
    requireString(
      record.status,
      `${label}.status`
    );

  if (
    !reviewStatuses.has(
      status as RiskReviewStatus
    )
  ) {
    fail(
      `${label}.status is invalid.`
    );
  }

  if (
    !Array.isArray(
      record.checks
    )
  ) {
    fail(
      `${label}.checks must be an array.`
    );
  }

  const checks =
    record.checks.map(
      (
        check,
        index
      ) =>
        parseRiskReviewCheck(
          check,
          index
        )
    );

  const seenChecks =
    new Set<
      RiskReviewCheckId
    >();

  for (
    const check of
    checks
  ) {
    if (
      seenChecks.has(
        check.id
      )
    ) {
      fail(
        `${label}.checks contains duplicate check ${check.id}.`
      );
    }

    seenChecks.add(
      check.id
    );
  }

  if (
    record.approvedFor !==
      "paper-only"
  ) {
    fail(
      `${label}.approvedFor must be paper-only.`
    );
  }

  if (
    record.authoritative !==
      true
  ) {
    fail(
      `${label}.authoritative must be true.`
    );
  }

  return {
    id:
      requireString(
        record.id,
        `${label}.id`
      ),

    botId:
      requireString(
        record.botId,
        `${label}.botId`
      ),

    strategyId:
      requireString(
        record.strategyId,
        `${label}.strategyId`
      ),

    status:
      status as RiskReviewStatus,

    checks,

    approvedFor:
      "paper-only",

    bindingFingerprint:
      requireString(
        record.bindingFingerprint,
        `${label}.bindingFingerprint`
      ),

    authoritative:
      true,
  };
}


function parseVersionedRiskReview(
  value:
    unknown,

  label:
    string
):
  VersionedRiskReview {
  const record =
    requireRecord(
      value,
      label
    );

  return {
    review:
      parseRiskReview(
        record.review,
        `${label}.review`
      ),

    version:
      requirePositiveInteger(
        record.version,
        `${label}.version`
      ),

    previousReviewId:
      requireNullableString(
        record.previousReviewId,
        `${label}.previousReviewId`
      ),
  };
}


function parseProvenance(
  value:
    unknown,

  label:
    string
):
  RiskReviewProvenance {
  const record =
    requireRecord(
      value,
      label
    );

  const source =
    requireString(
      record.source,
      `${label}.source`
    );

  if (
    !provenanceSources.has(
      source as RiskReviewProvenanceSource
    )
  ) {
    fail(
      `${label}.source is invalid.`
    );
  }

  const createdFrom =
    requireString(
      record.createdFrom,
      `${label}.createdFrom`
    );

  if (
    !creationReasons.has(
      createdFrom as RiskReviewCreationReason
    )
  ) {
    fail(
      `${label}.createdFrom is invalid.`
    );
  }

  if (
    record.approvalScope !==
      "paper-only"
  ) {
    fail(
      `${label}.approvalScope must be paper-only.`
    );
  }

  if (
    record.authoritative !==
      false
  ) {
    fail(
      `${label}.authoritative must be false.`
    );
  }

  return {
    reviewId:
      requireString(
        record.reviewId,
        `${label}.reviewId`
      ),

    version:
      requirePositiveInteger(
        record.version,
        `${label}.version`
      ),

    source:
      source as RiskReviewProvenanceSource,

    createdFrom:
      createdFrom as RiskReviewCreationReason,

    supersedes:
      requireNullableString(
        record.supersedes,
        `${label}.supersedes`
      ),

    botId:
      requireString(
        record.botId,
        `${label}.botId`
      ),

    strategyId:
      requireString(
        record.strategyId,
        `${label}.strategyId`
      ),

    bindingFingerprint:
      requireString(
        record.bindingFingerprint,
        `${label}.bindingFingerprint`
      ),

    approvalScope:
      "paper-only",

    authoritative:
      false,
  };
}


function parseHistoryEntry(
  value:
    unknown,

  index:
    number
):
  RiskReviewHistoryEntry {
  const record =
    requireRecord(
      value,
      `Approval history entry ${index}`
    );

  return {
    versionedReview:
      parseVersionedRiskReview(
        record.versionedReview,
        `Approval history entry ${index}.versionedReview`
      ),

    provenance:
      parseProvenance(
        record.provenance,
        `Approval history entry ${index}.provenance`
      ),
  };
}


function parseHistory(
  value:
    unknown
):
  RiskReviewHistory {
  const record =
    requireRecord(
      value,
      "Approval history"
    );

  if (
    record.authoritative !==
      false
  ) {
    fail(
      "Approval history.authoritative must be false."
    );
  }

  if (
    !Array.isArray(
      record.entries
    ) ||
    record.entries.length ===
      0
  ) {
    fail(
      "Approval history.entries must be a non-empty array."
    );
  }

  return {
    entries:
      record.entries.map(
        (
          entry,
          index
        ) =>
          parseHistoryEntry(
            entry,
            index
          )
      ),

    authoritative:
      false,
  };
}


export function parseApprovalBackendRepositoryState(
  value:
    unknown
):
  ApprovalRepositoryState {
  const record =
    requireRecord(
      value,
      "Approval backend state"
    );

  if (
    record.authoritative !==
      false
  ) {
    fail(
      "Approval backend state.authoritative must be false."
    );
  }

  if (
    record.active ===
      null &&
    record.history ===
      null
  ) {
    return {
      active:
        null,

      history:
        null,

      authoritative:
        false,
    };
  }

  if (
    record.active ===
      null ||
    record.history ===
      null
  ) {
    fail(
      "Approval backend active/history pair is incomplete."
    );
  }

  const active =
    parseVersionedRiskReview(
      record.active,
      "Approval backend active review"
    );

  const history =
    parseHistory(
      record.history
    );

  let integrity;

  try {
    integrity =
      validateRiskReviewChain(
        history
      );
  } catch {
    fail(
      "Approval backend review chain could not be validated."
    );
  }

  if (
    !integrity.valid
  ) {
    fail(
      `Approval backend review chain is invalid: ${
        integrity.issues
          .map(
            issue =>
              issue.code
          )
          .join(", ")
      }`
    );
  }

  const latest =
    history.entries.at(
      -1
    );

  if (
    !latest
  ) {
    fail(
      "Approval backend history has no latest entry."
    );
  }

  if (
    active.version !==
      latest.versionedReview.version
  ) {
    fail(
      "Approval backend active version does not match latest history."
    );
  }

  if (
    active.review.id !==
      latest.versionedReview.review.id
  ) {
    fail(
      "Approval backend active review does not match latest history."
    );
  }

  return {
    active,

    history,

    authoritative:
      false,
  };
}


export function parseApprovalBackendRevision(
  value:
    unknown,

  options: {
    readonly nullable:
      boolean;
  }
):
  number | null {
  if (
    value ===
      null &&
    options.nullable
  ) {
    return null;
  }

  if (
    typeof value !==
      "number" ||
    !Number.isInteger(
      value
    ) ||
    value <
      0
  ) {
    fail(
      "Approval backend revision must be a non-negative integer."
    );
  }

  return value;
}
