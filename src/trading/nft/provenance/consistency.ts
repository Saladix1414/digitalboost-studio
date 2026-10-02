import type {
  NftDnaRecord,
} from "../dna/types";

import type {
  NftOriginRecord,
} from "../origin/types";

import type {
  NftProvenanceHistory,
  NftProvenanceRecord,
} from "./types";

import {
  snapshotNftProvenance,
} from "./snapshot";

import type {
  NftProvenanceConsistencyIssue,
  NftProvenanceConsistencyResult,
} from "./consistencyTypes";

export function validateProvenanceConsistency(
  provenance:
    NftProvenanceRecord,
  history:
    NftProvenanceHistory,
  origin:
    NftOriginRecord,
  dna:
    NftDnaRecord
): NftProvenanceConsistencyResult {
  const issues:
    NftProvenanceConsistencyIssue[] = [];

  if (
    provenance.assetId !==
      origin.identity.assetId ||
    provenance.assetId !==
      dna.identity.assetId
  ) {
    issues.push({
      code:
        "ASSET_ID_MISMATCH",

      message:
        "Provenance, Origin and DNA must reference the same asset.",
    });
  }

  if (
    provenance.collectionId !==
      origin.identity.collectionId ||
    provenance.collectionId !==
      dna.identity.collectionId
  ) {
    issues.push({
      code:
        "COLLECTION_ID_MISMATCH",

      message:
        "Provenance, Origin and DNA must reference the same collection.",
    });
  }

  if (
    provenance.creatorRef !==
      origin.identity.creator ||
    provenance.creatorRef !==
      dna.identity.creator
  ) {
    issues.push({
      code:
        "CREATOR_REF_MISMATCH",

      message:
        "Provenance creator reference must align with Origin and DNA.",
    });
  }

  const evidenceKinds =
    new Set(
      provenance.evidence.map(
        (entry) =>
          entry.kind
      )
    );

  if (
    !evidenceKinds.has(
      "ORIGIN"
    )
  ) {
    issues.push({
      code:
        "ORIGIN_EVIDENCE_MISSING",

      message:
        "Provenance requires Origin evidence.",
    });
  }

  if (
    !evidenceKinds.has(
      "DNA_IDENTITY"
    )
  ) {
    issues.push({
      code:
        "DNA_IDENTITY_EVIDENCE_MISSING",

      message:
        "Provenance requires DNA identity evidence.",
    });
  }

  if (
    !evidenceKinds.has(
      "DNA_INTEGRITY"
    )
  ) {
    issues.push({
      code:
        "DNA_INTEGRITY_EVIDENCE_MISSING",

      message:
        "Provenance requires DNA integrity evidence.",
    });
  }

  if (
    dna.blockchainProof &&
    !evidenceKinds.has(
      "BLOCKCHAIN_PROOF"
    )
  ) {
    issues.push({
      code:
        "BLOCKCHAIN_PROOF_EVIDENCE_MISSING",

      message:
        "Verified DNA blockchain proof must be represented in provenance evidence.",
    });
  }

  if (
    history.entries.length ===
      0
  ) {
    issues.push({
      code:
        "HISTORY_EMPTY",

      message:
        "Provenance consistency requires history.",
    });

    return {
      consistent:
        false,

      issues,
    };
  }

  const latest =
    history.entries[
      history.entries.length - 1
    ];

  if (
    latest.version !==
      provenance.version
  ) {
    issues.push({
      code:
        "HISTORY_LATEST_VERSION_MISMATCH",

      message:
        "Latest provenance history version must match the current provenance record.",
    });
  }

  const snapshot =
    snapshotNftProvenance(
      provenance
    );

  if (
    latest.snapshot.recordHash !==
      snapshot.recordHash
  ) {
    issues.push({
      code:
        "HISTORY_RECORD_HASH_MISMATCH",

      message:
        "Latest provenance history snapshot must match the current provenance record.",
    });
  }

  return {
    consistent:
      issues.length === 0,

    issues,
  };
}
