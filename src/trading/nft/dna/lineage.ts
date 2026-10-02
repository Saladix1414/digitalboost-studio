import {
  compareNftDna,
} from "./compare";

import {
  createNftDnaSnapshotHashes,
} from "./snapshot";

import type {
  NftDnaLineage,
  NftDnaLineageEntry,
  NftDnaLineageReason,
  NftDnaRecord,
} from "./types";

function determineReason(
  previous:
    NftDnaRecord | null,
  next:
    NftDnaRecord
): NftDnaLineageReason {
  if (!previous) {
    return "INITIAL";
  }

  const comparison =
    compareNftDna(
      previous,
      next
    );

  const identityChanged =
    comparison.changes.some(
      (change) =>
        change.layer ===
        "IDENTITY"
    );

  const integrityChanged =
    comparison.changes.some(
      (change) =>
        change.layer ===
        "INTEGRITY"
    );

  const blockchainChanged =
    comparison.changes.some(
      (change) =>
        change.layer ===
        "BLOCKCHAIN_PROOF"
    );

  if (
    !previous.blockchainProof &&
    next.blockchainProof &&
    blockchainChanged
  ) {
    return "BLOCKCHAIN_PROOF_ATTACHED";
  }

  if (identityChanged) {
    return "IDENTITY_UPDATE";
  }

  if (integrityChanged) {
    return "INTEGRITY_UPDATE";
  }

  if (blockchainChanged) {
    return "BLOCKCHAIN_PROOF_UPDATED";
  }

  return "INTEGRITY_UPDATE";
}

export function createInitialNftDnaLineage(
  dna:
    NftDnaRecord,
  createdAt: string
): NftDnaLineage {
  const hashes =
    createNftDnaSnapshotHashes(
      dna
    );

  const entry:
    NftDnaLineageEntry = {
      id:
        `lineage-${dna.id}-1`,

      dnaId:
        dna.id,

      previousEntryId:
        null,

      version:
        1,

      reason:
        "INITIAL",

      ...hashes,

      createdAt,

      authoritative:
        false,
    };

  return {
    dnaId:
      dna.id,

    entries: [
      entry,
    ],

    authoritative:
      false,
  };
}

export function appendNftDnaLineage(
  lineage:
    NftDnaLineage,
  previousDna:
    NftDnaRecord,
  nextDna:
    NftDnaRecord,
  createdAt: string
): NftDnaLineage {
  if (
    lineage.dnaId !==
      previousDna.id ||
    lineage.dnaId !==
      nextDna.id
  ) {
    throw new Error(
      "DNA_LINEAGE_ID_MISMATCH"
    );
  }

  const last =
    lineage.entries[
      lineage.entries.length - 1
    ];

  if (!last) {
    throw new Error(
      "DNA_LINEAGE_EMPTY"
    );
  }

  const comparison =
    compareNftDna(
      previousDna,
      nextDna
    );

  if (!comparison.changed) {
    throw new Error(
      "DNA_LINEAGE_NO_CHANGE"
    );
  }

  const version =
    last.version + 1;

  const hashes =
    createNftDnaSnapshotHashes(
      nextDna
    );

  const entry:
    NftDnaLineageEntry = {
      id:
        `lineage-${nextDna.id}-${version}`,

      dnaId:
        nextDna.id,

      previousEntryId:
        last.id,

      version,

      reason:
        determineReason(
          previousDna,
          nextDna
        ),

      ...hashes,

      createdAt,

      authoritative:
        false,
    };

  return {
    ...lineage,

    entries: [
      ...lineage.entries,
      entry,
    ],
  };
}
