import type {
  ApprovalRepositoryPersistence,
  ApprovalPersistenceLoadResult,
} from "./approvalPersistence";

import type {
  ApprovalRepositoryState,
} from "./reviewRepository";

import {
  validateRiskReviewChain,
} from "./reviewChainValidation";

export const APPROVAL_STORAGE_SCHEMA_VERSION =
  1 as const;

export const APPROVAL_STORAGE_KEY =
  "digitalboost.trading.approval.v1";

export type ApprovalKeyValueStorage = {
  getItem(
    key:
      string
  ):
    string | null;

  setItem(
    key:
      string,
    value:
      string
  ):
    void;

  removeItem(
    key:
      string
  ):
    void;
};

type ApprovalPersistenceEnvelope = {
  readonly schemaVersion:
    typeof APPROVAL_STORAGE_SCHEMA_VERSION;

  readonly state:
    ApprovalRepositoryState;
};

function isRecord(
  value:
    unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function assertPersistedApprovalState(
  value:
    unknown
): asserts value is ApprovalRepositoryState {
  if (
    !isRecord(
      value
    )
  ) {
    throw new Error(
      "Approval persistence state is not an object."
    );
  }

  if (
    value.authoritative !==
    false
  ) {
    throw new Error(
      "Approval persistence state has invalid authority metadata."
    );
  }

  const active =
    value.active;

  const history =
    value.history;

  if (
    active === null &&
    history === null
  ) {
    return;
  }

  if (
    !isRecord(
      active
    ) ||
    !isRecord(
      history
    )
  ) {
    throw new Error(
      "Approval persistence active review/history pair is incomplete."
    );
  }

  if (
    history.authoritative !==
    false ||
    !Array.isArray(
      history.entries
    )
  ) {
    throw new Error(
      "Approval persistence history is malformed."
    );
  }

  let integrity;

  try {
    integrity =
      validateRiskReviewChain(
        history as unknown as
          ApprovalRepositoryState["history"] &
          object
      );
  } catch {
    throw new Error(
      "Approval persistence review chain could not be validated."
    );
  }

  if (
    !integrity.valid
  ) {
    throw new Error(
      `Approval persistence review chain is invalid: ${
        integrity.issues
          .map(
            issue =>
              issue.code
          )
          .join(", ")
      }`
    );
  }

  const latestEntry =
    history.entries[
      history.entries.length - 1
    ];

  if (
    !isRecord(
      latestEntry
    ) ||
    !isRecord(
      latestEntry.versionedReview
    )
  ) {
    throw new Error(
      "Approval persistence latest history entry is malformed."
    );
  }

  const latestVersioned =
    latestEntry.versionedReview;

  if (
    typeof active.version !==
      "number" ||
    typeof latestVersioned.version !==
      "number" ||
    active.version !==
      latestVersioned.version
  ) {
    throw new Error(
      "Approval persistence active version does not match history."
    );
  }

  if (
    !isRecord(
      active.review
    ) ||
    !isRecord(
      latestVersioned.review
    ) ||
    typeof active.review.id !==
      "string" ||
    typeof latestVersioned.review.id !==
      "string" ||
    active.review.id !==
      latestVersioned.review.id
  ) {
    throw new Error(
      "Approval persistence active review does not match latest history."
    );
  }
}

function parseEnvelope(
  serialized:
    string
): ApprovalRepositoryState {
  let parsed:
    unknown;

  try {
    parsed =
      JSON.parse(
        serialized
      );
  } catch {
    throw new Error(
      "Approval persistence payload is not valid JSON."
    );
  }

  if (
    !isRecord(
      parsed
    )
  ) {
    throw new Error(
      "Approval persistence payload is malformed."
    );
  }

  if (
    parsed.schemaVersion !==
    APPROVAL_STORAGE_SCHEMA_VERSION
  ) {
    throw new Error(
      "Approval persistence schema version is unsupported."
    );
  }

  assertPersistedApprovalState(
    parsed.state
  );

  return parsed.state;
}

export function createLocalApprovalPersistence(
  storage:
    ApprovalKeyValueStorage
): ApprovalRepositoryPersistence {
  return {
    async load():
      Promise<ApprovalPersistenceLoadResult> {
      const serialized =
        storage.getItem(
          APPROVAL_STORAGE_KEY
        );

      if (
        serialized === null
      ) {
        return {
          state:
            null,

          authoritative:
            false,
        };
      }

      return {
        state:
          parseEnvelope(
            serialized
          ),

        authoritative:
          false,
      };
    },

    async save(
      state:
        ApprovalRepositoryState
    ):
      Promise<void> {
      assertPersistedApprovalState(
        state
      );

      const envelope:
        ApprovalPersistenceEnvelope = {
          schemaVersion:
            APPROVAL_STORAGE_SCHEMA_VERSION,

          state,
        };

      storage.setItem(
        APPROVAL_STORAGE_KEY,
        JSON.stringify(
          envelope
        )
      );
    },

    async clear():
      Promise<void> {
      storage.removeItem(
        APPROVAL_STORAGE_KEY
      );
    },
  };
}

export function createBrowserApprovalPersistence():
  ApprovalRepositoryPersistence | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return createLocalApprovalPersistence(
    window.localStorage
  );
}
