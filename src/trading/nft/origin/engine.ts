import {
  assertNftOriginTransition,
} from "./stateMachine";

import {
  validateNftOrigin,
} from "./validation";

import type {
  NftOriginRecord,
  NftOriginStatus,
} from "./types";

function transition(
  origin:
    NftOriginRecord,
  status:
    NftOriginStatus
): NftOriginRecord {
  assertNftOriginTransition(
    origin.status,
    status
  );

  return {
    ...origin,
    status,
  };
}

export function validateAndMarkNftOrigin(
  origin:
    NftOriginRecord
): NftOriginRecord {
  const validation =
    validateNftOrigin(
      origin
    );

  if (!validation.valid) {
    throw new Error(
      `INVALID_ORIGIN:${validation.issues
        .map(
          (issue) =>
            issue.code
        )
        .join(",")}`
    );
  }

  return transition(
    origin,
    "VALIDATED"
  );
}

export function archiveNftOrigin(
  origin:
    NftOriginRecord
): NftOriginRecord {
  return transition(
    origin,
    "ARCHIVED"
  );
}
