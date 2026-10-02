import type {
  NftDnaRecord,
  NftDnaValidationIssue,
  NftDnaValidationResult,
} from "./types";

function nonEmpty(
  value: string
): boolean {
  return value.trim().length > 0;
}

function validVersion(
  value: number
): boolean {
  return (
    Number.isInteger(value) &&
    value >= 1
  );
}

function validHash(
  value: string
): boolean {
  return /^dna-[a-f0-9]{8}$/i.test(
    value
  );
}

export function validateNftDna(
  dna:
    NftDnaRecord
): NftDnaValidationResult {
  const issues:
    NftDnaValidationIssue[] = [];

  if (!nonEmpty(dna.id)) {
    issues.push({
      code:
        "INVALID_DNA_ID",
      message:
        "DNA id is required.",
    });
  }

  if (
    !nonEmpty(
      dna.identity.assetId
    )
  ) {
    issues.push({
      code:
        "INVALID_ASSET_ID",
      message:
        "Asset id is required.",
    });
  }

  if (
    !nonEmpty(
      dna.identity.collectionId
    )
  ) {
    issues.push({
      code:
        "INVALID_COLLECTION_ID",
      message:
        "Collection id is required.",
    });
  }

  if (
    !nonEmpty(
      dna.identity.creator
    )
  ) {
    issues.push({
      code:
        "INVALID_CREATOR",
      message:
        "Creator is required.",
    });
  }

  if (
    !validVersion(
      dna.identity.assetVersion
    )
  ) {
    issues.push({
      code:
        "INVALID_ASSET_VERSION",
      message:
        "Asset version must be >= 1.",
    });
  }

  if (
    !validVersion(
      dna.identity.collectionVersion
    )
  ) {
    issues.push({
      code:
        "INVALID_COLLECTION_VERSION",
      message:
        "Collection version must be >= 1.",
    });
  }

  if (
    !nonEmpty(
      dna.identity.createdAt
    )
  ) {
    issues.push({
      code:
        "INVALID_CREATED_AT",
      message:
        "Creation time is required.",
    });
  }

  if (
    !validHash(
      dna.integrity.mediaHash
    )
  ) {
    issues.push({
      code:
        "INVALID_MEDIA_HASH",
      message:
        "Media hash is invalid.",
    });
  }

  if (
    !validHash(
      dna.integrity.metadataHash
    )
  ) {
    issues.push({
      code:
        "INVALID_METADATA_HASH",
      message:
        "Metadata hash is invalid.",
    });
  }

  if (
    !validHash(
      dna.integrity
        .forgeConfigHash
    )
  ) {
    issues.push({
      code:
        "INVALID_FORGE_CONFIG_HASH",
      message:
        "Forge config hash is invalid.",
    });
  }

  const proof =
    dna.blockchainProof;

  if (proof) {
    if (
      !nonEmpty(
        proof.chainId
      )
    ) {
      issues.push({
        code:
          "INVALID_BLOCKCHAIN_CHAIN",
        message:
          "Blockchain chain id is required.",
      });
    }

    if (
      !nonEmpty(
        proof.contractAddress
      )
    ) {
      issues.push({
        code:
          "INVALID_BLOCKCHAIN_CONTRACT",
        message:
          "Blockchain contract is required.",
      });
    }

    if (
      !nonEmpty(
        proof.tokenId
      )
    ) {
      issues.push({
        code:
          "INVALID_BLOCKCHAIN_TOKEN",
        message:
          "Blockchain token id is required.",
      });
    }

    if (
      !nonEmpty(
        proof.transactionHash
      )
    ) {
      issues.push({
        code:
          "INVALID_BLOCKCHAIN_TRANSACTION",
        message:
          "Blockchain transaction is required.",
      });
    }

    if (
      !Number.isInteger(
        proof.blockNumber
      ) ||
      proof.blockNumber < 1
    ) {
      issues.push({
        code:
          "INVALID_BLOCKCHAIN_BLOCK",
        message:
          "Blockchain block number is invalid.",
      });
    }

    if (
      !nonEmpty(
        proof.owner
      )
    ) {
      issues.push({
        code:
          "INVALID_BLOCKCHAIN_OWNER",
        message:
          "Blockchain owner is required.",
      });
    }

    if (
      !nonEmpty(
        proof.metadataRef
      )
    ) {
      issues.push({
        code:
          "INVALID_BLOCKCHAIN_METADATA",
        message:
          "Blockchain metadata reference is required.",
      });
    }

    if (
      !proof.mintEventFound
    ) {
      issues.push({
        code:
          "MISSING_BLOCKCHAIN_MINT_EVENT",
        message:
          "Blockchain mint event is required.",
      });
    }
  }

  return {
    valid:
      issues.length === 0,

    issues,
  };
}
