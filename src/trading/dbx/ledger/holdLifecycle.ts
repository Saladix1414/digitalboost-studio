import type {
  DbxHold,
  DbxHoldStore,
} from "./types";

function replaceHold(
  store:
    DbxHoldStore,
  updated:
    DbxHold
): DbxHoldStore {
  return {
    holds:
      store.holds.map(
        (hold) =>
          hold.id ===
            updated.id
            ? updated
            : hold
      ),
  };
}

export function releaseDbxHold(
  store:
    DbxHoldStore,
  holdId:
    string,
  releasedAt:
    string
): {
  readonly store:
    DbxHoldStore;

  readonly hold:
    DbxHold;
} {
  const hold =
    store.holds.find(
      (candidate) =>
        candidate.id ===
        holdId
    );

  if (!hold) {
    throw new Error(
      "DBX_HOLD_NOT_FOUND"
    );
  }

  if (
    hold.status !==
      "ACTIVE"
  ) {
    throw new Error(
      "DBX_HOLD_NOT_ACTIVE"
    );
  }

  const updated:
    DbxHold = {
      ...hold,

      status:
        "RELEASED",

      releasedAt,

      authoritative:
        false,
    };

  return {
    store:
      replaceHold(
        store,
        updated
      ),

    hold:
      updated,
  };
}

export function expireDbxHold(
  store:
    DbxHoldStore,
  holdId:
    string,
  now:
    string
) {
  const hold =
    store.holds.find(
      (candidate) =>
        candidate.id ===
        holdId
    );

  if (!hold) {
    throw new Error(
      "DBX_HOLD_NOT_FOUND"
    );
  }

  if (
    hold.status !==
      "ACTIVE"
  ) {
    throw new Error(
      "DBX_HOLD_NOT_ACTIVE"
    );
  }

  if (
    !hold.expiresAt
  ) {
    throw new Error(
      "DBX_HOLD_HAS_NO_EXPIRATION"
    );
  }

  if (
    Date.parse(now) <
    Date.parse(
      hold.expiresAt
    )
  ) {
    throw new Error(
      "DBX_HOLD_NOT_EXPIRED"
    );
  }

  const updated:
    DbxHold = {
      ...hold,

      status:
        "EXPIRED",

      releasedAt:
        now,

      authoritative:
        false,
    };

  return {
    store:
      replaceHold(
        store,
        updated
      ),

    hold:
      updated,
  };
}

export function captureDbxHold(
  store:
    DbxHoldStore,
  holdId:
    string,
  transactionId:
    string
) {
  const hold =
    store.holds.find(
      (candidate) =>
        candidate.id ===
        holdId
    );

  if (!hold) {
    throw new Error(
      "DBX_HOLD_NOT_FOUND"
    );
  }

  if (
    hold.status !==
      "ACTIVE"
  ) {
    throw new Error(
      "DBX_HOLD_NOT_ACTIVE"
    );
  }

  if (
    transactionId.trim()
      .length === 0
  ) {
    throw new Error(
      "DBX_HOLD_CAPTURE_TRANSACTION_REQUIRED"
    );
  }

  const updated:
    DbxHold = {
      ...hold,

      status:
        "CAPTURED",

      capturedTransactionId:
        transactionId,

      authoritative:
        false,
    };

  return {
    store:
      replaceHold(
        store,
        updated
      ),

    hold:
      updated,
  };
}
