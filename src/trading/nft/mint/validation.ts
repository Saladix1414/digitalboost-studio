import type {
  NftAsset,
  NftCollection,
} from "../types";

import type {
  NftMintIntent,
} from "./types";

export type NftMintIntentValidationIssue =
  | "ASSET_NOT_FOUND"
  | "COLLECTION_NOT_FOUND"
  | "ASSET_NOT_READY"
  | "ASSET_COLLECTION_MISMATCH"
  | "COLLECTION_ARCHIVED"
  | "INVALID_OWNER"
  | "INVALID_METADATA_REFERENCE";

export type NftMintIntentValidationResult = {
  readonly valid: boolean;
  readonly issues:
    readonly NftMintIntentValidationIssue[];
};

export function validateNftMintIntent(
  intent: NftMintIntent,
  assets: readonly NftAsset[],
  collections:
    readonly NftCollection[]
): NftMintIntentValidationResult {
  const issues:
    NftMintIntentValidationIssue[] = [];

  const asset =
    assets.find(
      (item) =>
        item.id ===
        intent.assetId
    );

  const collection =
    collections.find(
      (item) =>
        item.id ===
        intent.collectionId
    );

  if (!asset) {
    issues.push(
      "ASSET_NOT_FOUND"
    );
  }

  if (!collection) {
    issues.push(
      "COLLECTION_NOT_FOUND"
    );
  }

  if (
    asset &&
    asset.status !== "READY"
  ) {
    issues.push(
      "ASSET_NOT_READY"
    );
  }

  if (
    asset &&
    asset.collectionId !==
      intent.collectionId
  ) {
    issues.push(
      "ASSET_COLLECTION_MISMATCH"
    );
  }

  if (
    collection &&
    collection.status ===
      "ARCHIVED"
  ) {
    issues.push(
      "COLLECTION_ARCHIVED"
    );
  }

  if (
    intent.expectedOwner
      .trim()
      .length === 0
  ) {
    issues.push(
      "INVALID_OWNER"
    );
  }

  if (
    intent.expectedMetadataRef
      .trim()
      .length === 0
  ) {
    issues.push(
      "INVALID_METADATA_REFERENCE"
    );
  }

  return {
    valid:
      issues.length === 0,
    issues,
  };
}
