import type {
  NftAsset,
  NftCollection,
} from "../types";

import {
  assertNftMintTransition,
} from "./stateMachine";

import {
  validateNftMintIntent,
} from "./validation";

import {
  verifyNftMintEvidence,
} from "./verification";

import {
  deterministicMintPort,
} from "./deterministicPort";

import type {
  NftMintRecord,
  NftMintTransactionEvidence,
} from "./types";

function transition(
  record: NftMintRecord,
  status:
    NftMintRecord["status"],
  updatedAt: string
): NftMintRecord {
  assertNftMintTransition(
    record.status,
    status
  );

  return {
    ...record,
    status,
    updatedAt,
  };
}

export function markNftMintReady(
  record: NftMintRecord,
  assets: readonly NftAsset[],
  collections:
    readonly NftCollection[],
  updatedAt: string
): NftMintRecord {
  const validation =
    validateNftMintIntent(
      record.intent,
      assets,
      collections
    );

  if (!validation.valid) {
    throw new Error(
      `INVALID_MINT_INTENT:${validation.issues.join(",")}`
    );
  }

  return transition(
    record,
    "READY",
    updatedAt
  );
}

export function prepareNftMint(
  record: NftMintRecord,
  preparedAt: string
): NftMintRecord {
  const preparing =
    transition(
      record,
      "PREPARING",
      preparedAt
    );

  const prepared =
    deterministicMintPort.prepare(
      preparing.intent,
      preparedAt
    );

  const awaiting =
    transition(
      preparing,
      "AWAITING_SIGNATURE",
      preparedAt
    );

  return {
    ...awaiting,
    prepared,
  };
}

export function submitNftMintEvidence(
  record: NftMintRecord,
  evidence:
    NftMintTransactionEvidence,
  submittedAt: string
): NftMintRecord {
  if (!record.prepared) {
    throw new Error(
      "MINT_NOT_PREPARED"
    );
  }

  const submittedEvidence =
    deterministicMintPort.submit(
      record.prepared,
      evidence
    );

  const submitted =
    transition(
      record,
      "SUBMITTED",
      submittedAt
    );

  return {
    ...submitted,
    evidence:
      submittedEvidence,
  };
}

export function confirmAndVerifyNftMint(
  record: NftMintRecord,
  verifiedAt: string
): NftMintRecord {
  if (!record.evidence) {
    throw new Error(
      "MINT_EVIDENCE_REQUIRED"
    );
  }

  const confirming =
    transition(
      record,
      "CONFIRMING",
      verifiedAt
    );

  const verification =
    verifyNftMintEvidence(
      confirming.intent,
      record.evidence
    );

  if (!verification.verified) {
    return {
      ...transition(
        confirming,
        "FAILED",
        verifiedAt
      ),
      verification,
    };
  }

  return {
    ...transition(
      confirming,
      "VERIFIED",
      verifiedAt
    ),
    verification,
  };
}
