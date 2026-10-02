import type {
  NftMintStatus,
} from "./types";

const allowedTransitions:
  Readonly<
    Record<
      NftMintStatus,
      readonly NftMintStatus[]
    >
  > = {
    DRAFT: [
      "READY",
      "CANCELLED",
    ],

    READY: [
      "PREPARING",
      "REJECTED",
      "CANCELLED",
    ],

    PREPARING: [
      "AWAITING_SIGNATURE",
      "FAILED",
      "CANCELLED",
    ],

    AWAITING_SIGNATURE: [
      "SUBMITTED",
      "REJECTED",
      "FAILED",
      "CANCELLED",
    ],

    SUBMITTED: [
      "CONFIRMING",
      "FAILED",
    ],

    CONFIRMING: [
      "VERIFIED",
      "FAILED",
    ],

    VERIFIED: [],

    FAILED: [],

    REJECTED: [],

    CANCELLED: [],
  };

export function canTransitionNftMint(
  from: NftMintStatus,
  to: NftMintStatus
): boolean {
  return allowedTransitions[
    from
  ].includes(to);
}

export function assertNftMintTransition(
  from: NftMintStatus,
  to: NftMintStatus
): void {
  if (
    !canTransitionNftMint(
      from,
      to
    )
  ) {
    throw new Error(
      `ILLEGAL_MINT_TRANSITION:${from}->${to}`
    );
  }
}
