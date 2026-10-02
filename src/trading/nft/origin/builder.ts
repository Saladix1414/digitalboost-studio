import type {
  NftAsset,
  NftCollection,
} from "../types";

import type {
  NftOriginMode,
  NftOriginRecord,
  NftOriginSourceReference,
} from "./types";

export type BuildNftOriginInput = {
  readonly id: string;

  readonly asset:
    NftAsset;

  readonly collection:
    NftCollection;

  readonly mode:
    NftOriginMode;

  readonly forgeConfig: string;

  readonly source:
    NftOriginSourceReference;

  readonly createdAt: string;

  readonly capturedAt: string;
};

export function buildNftOrigin(
  input:
    BuildNftOriginInput
): NftOriginRecord {
  return {
    id:
      input.id,

    identity: {
      assetId:
        input.asset.id,

      collectionId:
        input.collection.id,

      creator:
        input.asset.creator,

      authoritative:
        false,
    },

    context: {
      mode:
        input.mode,

      createdAt:
        input.createdAt,

      forgeConfig:
        input.forgeConfig,

      source:
        input.source,

      authoritative:
        false,
    },

    version:
      1,

    status:
      "CAPTURED",

    capturedAt:
      input.capturedAt,

    authoritative:
      false,
  };
}
