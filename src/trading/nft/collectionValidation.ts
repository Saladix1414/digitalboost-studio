import type {
  NftAsset,
  NftCollection,
  NftCollectionValidationIssue,
  NftCollectionValidationResult,
} from "./types";

function nonEmptyString(
  value: string
): boolean {
  return value.trim().length > 0;
}

export function validateNftCollection(
  collection: NftCollection,
  assets: readonly NftAsset[]
): NftCollectionValidationResult {
  const issues:
    NftCollectionValidationIssue[] = [];

  if (
    !nonEmptyString(collection.id)
  ) {
    issues.push({
      code: "INVALID_ID",
      field: "id",
      message:
        "Collection id is required.",
    });
  }

  if (
    !nonEmptyString(collection.name)
  ) {
    issues.push({
      code: "INVALID_NAME",
      field: "name",
      message:
        "Collection name is required.",
    });
  }

  if (
    !/^[A-Z0-9]{2,12}$/.test(
      collection.symbol
    )
  ) {
    issues.push({
      code: "INVALID_SYMBOL",
      field: "symbol",
      message:
        "Collection symbol must contain 2-12 uppercase letters or digits.",
    });
  }

  if (
    !nonEmptyString(
      collection.description
    )
  ) {
    issues.push({
      code: "INVALID_DESCRIPTION",
      field: "description",
      message:
        "Collection description is required.",
    });
  }

  if (
    !nonEmptyString(
      collection.creator
    )
  ) {
    issues.push({
      code: "INVALID_CREATOR",
      field: "creator",
      message:
        "Collection creator is required.",
    });
  }

  if (
    !Number.isInteger(
      collection.version
    ) ||
    collection.version < 1
  ) {
    issues.push({
      code: "INVALID_VERSION",
      field: "version",
      message:
        "Collection version must be an integer greater than zero.",
    });
  }

  const uniqueAssetIds =
    new Set(collection.assetIds);

  if (
    uniqueAssetIds.size !==
    collection.assetIds.length
  ) {
    issues.push({
      code: "DUPLICATE_ASSET_ID",
      field: "assetIds",
      message:
        "Collection cannot contain duplicate asset ids.",
    });
  }

  const assetsById =
    new Map(
      assets.map(
        (asset) => [
          asset.id,
          asset,
        ]
      )
    );

  for (
    const assetId of
    collection.assetIds
  ) {
    const asset =
      assetsById.get(assetId);

    if (!asset) {
      issues.push({
        code: "UNKNOWN_ASSET_ID",
        field: "assetIds",
        message:
          `Unknown asset id: ${assetId}`,
      });

      continue;
    }

    if (
      asset.collectionId !==
      collection.id
    ) {
      issues.push({
        code:
          "ASSET_COLLECTION_MISMATCH",
        field: "assetIds",
        message:
          `Asset ${asset.id} is not bound to collection ${collection.id}.`,
      });
    }
  }

  return {
    valid:
      issues.length === 0,
    issues,
  };
}
