import type {
  ApprovalPersistenceLoadResult,
  ApprovalPersistenceRevision,
  ApprovalPersistenceSaveResult,
  ApprovalRepositoryPersistence,
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

  readonly revision:
    ApprovalPersistenceRevision;

  readonly state:
    ApprovalRepositoryState;
};

export class StaleApprovalPersistenceError
  extends Error {
  readonly expectedRevision:
    ApprovalPersistenceRevision | null;

  readonly actualRevision:
    ApprovalPersistenceRevision | null;

  constructor(
    expectedRevision:
      ApprovalPersistenceRevision | null,

    actualRevision:
      ApprovalPersistenceRevision | null
  ) {
    super(
      `Approval persistence revision conflict: expected ${
        expectedRevision ?? "empty"
      }, found ${
        actualRevision ?? "empty"
      }.`
    );

    this.name =
      "StaleApprovalPersistenceError";

    this.expectedRevision =
      expectedRevision;

    this.actualRevision =
      actualRevision;
  }
}

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
): ApprovalPersistenceEnvelope {
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

  /*
   * Backward compatibility:
   * pre-18H v1 envelopes had no revision field.
   * They are treated as revision 0.
   */
  const revision =
    parsed.revision ===
      undefined
      ? 0
      : parsed.revision;

  if (
    typeof revision !==
      "number" ||
    !Number.isInteger(
      revision
    ) ||
    revision < 0
  ) {
    throw new Error(
      "Approval persistence revision is invalid."
    );
  }

  assertPersistedApprovalState(
    parsed.state
  );

  return {
    schemaVersion:
      APPROVAL_STORAGE_SCHEMA_VERSION,

    revision,

    state:
      parsed.state,
  };
}

function readCurrentEnvelope(
  storage:
    ApprovalKeyValueStorage
): ApprovalPersistenceEnvelope | null {
  const serialized =
    storage.getItem(
      APPROVAL_STORAGE_KEY
    );

  if (
    serialized === null
  ) {
    return null;
  }

  return parseEnvelope(
    serialized
  );
}

function assertExpectedRevision(
  expectedRevision:
    ApprovalPersistenceRevision | null,

  actualRevision:
    ApprovalPersistenceRevision | null
): void {
  if (
    expectedRevision !==
    actualRevision
  ) {
    throw new StaleApprovalPersistenceError(
      expectedRevision,
      actualRevision
    );
  }
}

export function createLocalApprovalPersistence(
  storage:
    ApprovalKeyValueStorage
): ApprovalRepositoryPersistence {
  return {
    async load():
      Promise<ApprovalPersistenceLoadResult> {
      const envelope =
        readCurrentEnvelope(
          storage
        );

      if (
        envelope === null
      ) {
        return {
          state:
            null,

          revision:
            null,

          authoritative:
            false,
        };
      }

      return {
        state:
          envelope.state,

        revision:
          envelope.revision,

        authoritative:
          false,
      };
    },

    async save(
      state:
        ApprovalRepositoryState,

      expectedRevision:
        ApprovalPersistenceRevision | null
    ):
      Promise<ApprovalPersistenceSaveResult> {
      assertPersistedApprovalState(
        state
      );

      const current =
        readCurrentEnvelope(
          storage
        );

      const actualRevision =
        current?.revision ??
        null;

      assertExpectedRevision(
        expectedRevision,
        actualRevision
      );

      const nextRevision =
        (
          actualRevision ??
          0
        ) + 1;

      const envelope:
        ApprovalPersistenceEnvelope = {
          schemaVersion:
            APPROVAL_STORAGE_SCHEMA_VERSION,

          revision:
            nextRevision,

          state,
        };

      storage.setItem(
        APPROVAL_STORAGE_KEY,
        JSON.stringify(
          envelope
        )
      );

      return {
        revision:
          nextRevision,

        authoritative:
          false,
      };
    },

    async clear(
      expectedRevision:
        ApprovalPersistenceRevision | null
    ):
      Promise<void> {
      const serialized =
        storage.getItem(
          APPROVAL_STORAGE_KEY
        );

      if (
        serialized === null
      ) {
        assertExpectedRevision(
          expectedRevision,
          null
        );

        return;
      }

      let current:
        ApprovalPersistenceEnvelope;

      try {
        current =
          parseEnvelope(
            serialized
          );
      } catch (
        error
      ) {
        /*
         * Explicit corruption recovery is allowed only when
         * the caller has no trusted persisted revision.
         *
         * Revision conflicts are intentionally not handled here:
         * they are checked only after a valid envelope has parsed.
         */
        if (
          expectedRevision !==
          null
        ) {
          throw error;
        }

        storage.removeItem(
          APPROVAL_STORAGE_KEY
        );

        return;
      }

      assertExpectedRevision(
        expectedRevision,
        current.revision
      );

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
