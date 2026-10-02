import {
  deterministicDnaHash,
} from "../dna/hash";

import type {
  NftDnaRecord,
} from "../dna/types";

import type {
  NftOriginRecord,
} from "./types";

import type {
  NftOriginDnaConsistencyIssue,
  NftOriginDnaConsistencyResult,
} from "./dnaBridgeTypes";

function nonEmpty(
  value: string
): boolean {
  return value.trim().length > 0;
}

export function validateOriginAgainstDna(
  origin:
    NftOriginRecord,
  dna:
    NftDnaRecord
): NftOriginDnaConsistencyResult {
  const issues:
    NftOriginDnaConsistencyIssue[] = [];

  if (
    origin.identity.assetId !==
      dna.identity.assetId
  ) {
    issues.push({
      code:
        "ASSET_ID_MISMATCH",

      message:
        "Origin asset id must match DNA asset id.",
    });
  }

  if (
    origin.identity.collectionId !==
      dna.identity.collectionId
  ) {
    issues.push({
      code:
        "COLLECTION_ID_MISMATCH",

      message:
        "Origin collection id must match DNA collection id.",
    });
  }

  if (
    origin.identity.creator !==
      dna.identity.creator
  ) {
    issues.push({
      code:
        "CREATOR_MISMATCH",

      message:
        "Origin creator must match DNA creator.",
    });
  }

  if (
    !Number.isInteger(
      origin.version
    ) ||
    origin.version < 1
  ) {
    issues.push({
      code:
        "ORIGIN_VERSION_INVALID",

      message:
        "Origin version must be >= 1.",
    });
  }

  if (
    !Number.isInteger(
      dna.identity.assetVersion
    ) ||
    dna.identity.assetVersion < 1
  ) {
    issues.push({
      code:
        "DNA_ASSET_VERSION_INVALID",

      message:
        "DNA asset version must be >= 1.",
    });
  }

  const expectedForgeConfigHash =
    deterministicDnaHash(
      [
        origin.context.forgeConfig,
        JSON.stringify(
          dna.identity.traits
        ),
      ].join(":")
    );

  if (
    dna.integrity.forgeConfigHash !==
      expectedForgeConfigHash
  ) {
    issues.push({
      code:
        "FORGE_CONFIG_HASH_MISMATCH",

      message:
        "DNA forge config hash does not match Origin forge configuration.",
    });
  }

  if (
    !nonEmpty(
      origin.context.createdAt
    )
  ) {
    issues.push({
      code:
        "ORIGIN_CREATED_AT_MISSING",

      message:
        "Origin creation timestamp is required.",
    });
  }

  if (
    !nonEmpty(
      dna.identity.createdAt
    )
  ) {
    issues.push({
      code:
        "DNA_CREATED_AT_MISSING",

      message:
        "DNA creation timestamp is required.",
    });
  }

  return {
    consistent:
      issues.length === 0,

    issues,
  };
}
