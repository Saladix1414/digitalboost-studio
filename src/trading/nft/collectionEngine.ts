import type {
  NftAsset,
  NftCollection,
  NftCollectionRepositoryState,
  NftForgeActivity,
} from "./types";

import {
  validateNftCollection,
} from "./collectionValidation";

export type CreateCollectionInput = {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly description: string;
  readonly creator: string;
  readonly createdAt: string;
};

export type UpdateCollectionInput = {
  readonly collectionId: string;
  readonly name?: string;
  readonly symbol?: string;
  readonly description?: string;
  readonly updatedAt: string;
};

export type AttachAssetInput = {
  readonly collectionId: string;
  readonly assetId: string;
  readonly updatedAt: string;
};

export type DetachAssetInput = {
  readonly collectionId: string;
  readonly assetId: string;
  readonly updatedAt: string;
};

function activity(
  input: Omit<
    NftForgeActivity,
    "authoritative"
  >
): NftForgeActivity {
  return {
    ...input,
    authoritative: false,
  };
}

function replaceCollection(
  collections:
    readonly NftCollection[],
  next: NftCollection
): readonly NftCollection[] {
  return collections.map(
    (collection) =>
      collection.id === next.id
        ? next
        : collection
  );
}

function replaceAsset(
  assets:
    readonly NftAsset[],
  next: NftAsset
): readonly NftAsset[] {
  return assets.map(
    (asset) =>
      asset.id === next.id
        ? next
        : asset
  );
}

export function createNftCollection(
  state:
    NftCollectionRepositoryState,
  input:
    CreateCollectionInput
): NftCollectionRepositoryState {
  if (
    state.collections.some(
      (collection) =>
        collection.id === input.id
    )
  ) {
    throw new Error(
      "COLLECTION_ALREADY_EXISTS"
    );
  }

  const collection:
    NftCollection = {
      id: input.id,
      name: input.name,
      symbol: input.symbol,
      description:
        input.description,
      creator: input.creator,
      status: "DRAFT",
      version: 1,
      assetIds: [],
      createdAt:
        input.createdAt,
      updatedAt:
        input.createdAt,
    };

  const validation =
    validateNftCollection(
      collection,
      state.assets
    );

  if (!validation.valid) {
    throw new Error(
      `INVALID_COLLECTION:${validation.issues
        .map((issue) => issue.code)
        .join(",")}`
    );
  }

  return {
    ...state,
    collections: [
      ...state.collections,
      collection,
    ],
    activity: [
      ...state.activity,
      activity({
        id:
          `collection-created-${collection.id}-v${collection.version}`,
        kind:
          "collection.created",
        collectionId:
          collection.id,
        label:
          `${collection.name} collection created`,
        timestamp:
          input.createdAt,
      }),
    ],
  };
}

export function updateNftCollection(
  state:
    NftCollectionRepositoryState,
  input:
    UpdateCollectionInput
): NftCollectionRepositoryState {
  const existing =
    state.collections.find(
      (collection) =>
        collection.id ===
        input.collectionId
    );

  if (!existing) {
    throw new Error(
      "COLLECTION_NOT_FOUND"
    );
  }

  const next:
    NftCollection = {
      ...existing,
      name:
        input.name ??
        existing.name,
      symbol:
        input.symbol ??
        existing.symbol,
      description:
        input.description ??
        existing.description,
      version:
        existing.version + 1,
      updatedAt:
        input.updatedAt,
    };

  const validation =
    validateNftCollection(
      next,
      state.assets
    );

  if (!validation.valid) {
    throw new Error(
      `INVALID_COLLECTION:${validation.issues
        .map((issue) => issue.code)
        .join(",")}`
    );
  }

  return {
    ...state,
    collections:
      replaceCollection(
        state.collections,
        next
      ),
    activity: [
      ...state.activity,
      activity({
        id:
          `collection-updated-${next.id}-v${next.version}`,
        kind:
          "collection.updated",
        collectionId:
          next.id,
        label:
          `${next.name} collection updated to v${next.version}`,
        timestamp:
          input.updatedAt,
      }),
    ],
  };
}

export function attachAssetToCollection(
  state:
    NftCollectionRepositoryState,
  input:
    AttachAssetInput
): NftCollectionRepositoryState {
  const collection =
    state.collections.find(
      (item) =>
        item.id ===
        input.collectionId
    );

  const asset =
    state.assets.find(
      (item) =>
        item.id ===
        input.assetId
    );

  if (!collection) {
    throw new Error(
      "COLLECTION_NOT_FOUND"
    );
  }

  if (!asset) {
    throw new Error(
      "ASSET_NOT_FOUND"
    );
  }

  if (
    collection.assetIds.includes(
      asset.id
    )
  ) {
    throw new Error(
      "ASSET_ALREADY_ATTACHED"
    );
  }

  if (
    asset.collectionId !== null &&
    asset.collectionId !==
      collection.id
  ) {
    throw new Error(
      "ASSET_BOUND_TO_OTHER_COLLECTION"
    );
  }

  const nextAsset:
    NftAsset = {
      ...asset,
      collectionId:
        collection.id,
      version:
        asset.version + 1,
      updatedAt:
        input.updatedAt,
    };

  const nextCollection:
    NftCollection = {
      ...collection,
      assetIds: [
        ...collection.assetIds,
        asset.id,
      ],
      version:
        collection.version + 1,
      updatedAt:
        input.updatedAt,
    };

  const nextAssets =
    replaceAsset(
      state.assets,
      nextAsset
    );

  const validation =
    validateNftCollection(
      nextCollection,
      nextAssets
    );

  if (!validation.valid) {
    throw new Error(
      `INVALID_COLLECTION:${validation.issues
        .map((issue) => issue.code)
        .join(",")}`
    );
  }

  return {
    collections:
      replaceCollection(
        state.collections,
        nextCollection
      ),
    assets:
      nextAssets,
    activity: [
      ...state.activity,
      activity({
        id:
          `asset-attached-${asset.id}-to-${collection.id}-v${nextCollection.version}`,
        kind:
          "asset.attached",
        collectionId:
          collection.id,
        assetId:
          asset.id,
        label:
          `${asset.title} attached to ${collection.name}`,
        timestamp:
          input.updatedAt,
      }),
    ],
  };
}

export function detachAssetFromCollection(
  state:
    NftCollectionRepositoryState,
  input:
    DetachAssetInput
): NftCollectionRepositoryState {
  const collection =
    state.collections.find(
      (item) =>
        item.id ===
        input.collectionId
    );

  const asset =
    state.assets.find(
      (item) =>
        item.id ===
        input.assetId
    );

  if (!collection) {
    throw new Error(
      "COLLECTION_NOT_FOUND"
    );
  }

  if (!asset) {
    throw new Error(
      "ASSET_NOT_FOUND"
    );
  }

  if (
    !collection.assetIds.includes(
      asset.id
    )
  ) {
    throw new Error(
      "ASSET_NOT_ATTACHED"
    );
  }

  const nextAsset:
    NftAsset = {
      ...asset,
      collectionId: null,
      version:
        asset.version + 1,
      updatedAt:
        input.updatedAt,
    };

  const nextCollection:
    NftCollection = {
      ...collection,
      assetIds:
        collection.assetIds.filter(
          (assetId) =>
            assetId !== asset.id
        ),
      version:
        collection.version + 1,
      updatedAt:
        input.updatedAt,
    };

  const nextAssets =
    replaceAsset(
      state.assets,
      nextAsset
    );

  const validation =
    validateNftCollection(
      nextCollection,
      nextAssets
    );

  if (!validation.valid) {
    throw new Error(
      `INVALID_COLLECTION:${validation.issues
        .map((issue) => issue.code)
        .join(",")}`
    );
  }

  return {
    collections:
      replaceCollection(
        state.collections,
        nextCollection
      ),
    assets:
      nextAssets,
    activity: [
      ...state.activity,
      activity({
        id:
          `asset-detached-${asset.id}-from-${collection.id}-v${nextCollection.version}`,
        kind:
          "asset.detached",
        collectionId:
          collection.id,
        assetId:
          asset.id,
        label:
          `${asset.title} detached from ${collection.name}`,
        timestamp:
          input.updatedAt,
      }),
    ],
  };
}

export function archiveNftCollection(
  state:
    NftCollectionRepositoryState,
  collectionId: string,
  updatedAt: string
): NftCollectionRepositoryState {
  const existing =
    state.collections.find(
      (collection) =>
        collection.id ===
        collectionId
    );

  if (!existing) {
    throw new Error(
      "COLLECTION_NOT_FOUND"
    );
  }

  const next:
    NftCollection = {
      ...existing,
      status: "ARCHIVED",
      version:
        existing.version + 1,
      updatedAt,
    };

  return {
    ...state,
    collections:
      replaceCollection(
        state.collections,
        next
      ),
    activity: [
      ...state.activity,
      activity({
        id:
          `collection-archived-${next.id}-v${next.version}`,
        kind:
          "collection.archived",
        collectionId:
          next.id,
        label:
          `${next.name} collection archived`,
        timestamp:
          updatedAt,
      }),
    ],
  };
}
