import {
  createNftDnaSnapshotHashes,
} from "./snapshot";

import type {
  NftDnaConsistencyIssue,
  NftDnaConsistencyResult,
  NftDnaLineage,
  NftDnaRecord,
} from "./types";

function nonEmpty(
  value: string | null
): boolean {
  return (
    value !== null &&
    value.trim().length > 0
  );
}

export function validateNftDnaConsistency(
  dna:
    NftDnaRecord,
  lineage:
    NftDnaLineage
): NftDnaConsistencyResult {
  const issues:
    NftDnaConsistencyIssue[] = [];

  if (
    lineage.dnaId !==
      dna.id
  ) {
    issues.push({
      code:
        "LINEAGE_DNA_ID_MISMATCH",

      message:
        "Lineage DNA id must match the DNA record id.",
    });
  }

  const latest =
    lineage.entries[
      lineage.entries.length - 1
    ];

  if (!latest) {
    issues.push({
      code:
        "LINEAGE_EMPTY",

      message:
        "DNA lineage must contain at least one entry.",
    });

    return {
      consistent: false,
      issues,
    };
  }

  if (
    latest.dnaId !==
      dna.id
  ) {
    issues.push({
      code:
        "DNA_ID_MISMATCH",

      message:
        "Latest lineage entry must belong to the DNA record.",
    });
  }

  if (
    latest.version !==
      lineage.entries.length
  ) {
    issues.push({
      code:
        "LINEAGE_LATEST_VERSION_MISMATCH",

      message:
        "Latest lineage version must match lineage length.",
    });
  }

  const hashes =
    createNftDnaSnapshotHashes(
      dna
    );

  if (
    latest.identityHash !==
      hashes.identityHash
  ) {
    issues.push({
      code:
        "IDENTITY_HASH_MISMATCH",

      message:
        "Latest lineage identity snapshot does not match current DNA identity.",
    });
  }

  if (
    latest.integrityHash !==
      hashes.integrityHash
  ) {
    issues.push({
      code:
        "INTEGRITY_HASH_MISMATCH",

      message:
        "Latest lineage integrity snapshot does not match current DNA integrity.",
    });
  }

  if (
    latest.blockchainProofHash !==
      hashes.blockchainProofHash
  ) {
    issues.push({
      code:
        "BLOCKCHAIN_PROOF_HASH_MISMATCH",

      message:
        "Latest lineage blockchain proof snapshot does not match current DNA proof.",
    });
  }

  const proof =
    dna.blockchainProof;

  if (proof) {
    if (
      !nonEmpty(
        proof.owner
      )
    ) {
      issues.push({
        code:
          "PROOF_OWNER_MISSING",

        message:
          "Blockchain proof owner is required.",
      });
    }

    if (
      !nonEmpty(
        proof.tokenId
      )
    ) {
      issues.push({
        code:
          "PROOF_TOKEN_MISSING",

        message:
          "Blockchain proof token id is required.",
      });
    }

    if (
      !nonEmpty(
        proof.transactionHash
      )
    ) {
      issues.push({
        code:
          "PROOF_TRANSACTION_MISSING",

        message:
          "Blockchain proof transaction hash is required.",
      });
    }

    if (
      !proof.mintEventFound
    ) {
      issues.push({
        code:
          "PROOF_EVENT_MISSING",

        message:
          "Blockchain proof requires mint event evidence.",
      });
    }

    if (
      proof.metadataRef !==
      `metadata://${dna.identity.assetId}`
    ) {
      issues.push({
        code:
          "PROOF_METADATA_MISMATCH",

        message:
          "Blockchain proof metadata reference does not match DNA asset identity.",
      });
    }
  }

  return {
    consistent:
      issues.length === 0,

    issues,
  };
}
