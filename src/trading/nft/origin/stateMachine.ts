import type {
  NftOriginStatus,
} from "./types";

const allowedTransitions:
  Readonly<
    Record<
      NftOriginStatus,
      readonly NftOriginStatus[]
    >
  > = {
    DRAFT: [
      "CAPTURED",
      "ARCHIVED",
    ],

    CAPTURED: [
      "VALIDATED",
      "ARCHIVED",
    ],

    VALIDATED: [
      "ARCHIVED",
    ],

    ARCHIVED: [],
  };

export function canTransitionNftOrigin(
  from:
    NftOriginStatus,
  to:
    NftOriginStatus
): boolean {
  return allowedTransitions[
    from
  ].includes(to);
}

export function assertNftOriginTransition(
  from:
    NftOriginStatus,
  to:
    NftOriginStatus
): void {
  if (
    !canTransitionNftOrigin(
      from,
      to
    )
  ) {
    throw new Error(
      `ILLEGAL_ORIGIN_TRANSITION:${from}->${to}`
    );
  }
}
