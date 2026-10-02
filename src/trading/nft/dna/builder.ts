import type {
  NftAsset,
  NftCollection,
} from "../types";

import type {
  NftMintRecord,
} from "../mint/types";

import {
  deterministicDnaHash,
} from "./hash";

import type {
  NftDnaBlockchainProof,
  NftDnaRecord,
} from "./types";

export type BuildNftDnaInput = {
  readonly id: string;

  readonly asset:
    NftAsset;

  readonly collection:
    NftCollection;

  readonly mintRecord:
    NftMintRecord | null;

  readonly forgeConfig: string;

  readonly generatedAt: string;
};

function buildBlockchainProof(
  mintRecord:
    NftMintRecord | null
): NftDnaBlockchainProof | null {
  if (
    !mintRecord ||
    mintRecord.status !==
      "VERIFIED" ||
    mintRecord.verification
      ?.verified !== true ||
    !mintRecord.evidence ||
    mintRecord.evidence.tokenId ===
      null ||
    mintRecord.evidence.owner ===
      null ||
    mintRecord.evidence.metadataRef ===
      null
  ) {
    return null;
  }

  return {
    chainId:
      mintRecord.evidence.chainId,

    contractAddress:
      mintRecord.evidence
        .contractAddress,

    tokenId:
      mintRecord.evidence.tokenId,

    transactionHash:
      mintRecord.evidence
        .transactionHash,

    blockNumber:
      mintRecord.evidence
        .blockNumber,

    owner:
      mintRecord.evidence.owner,

    metadataRef:
      mintRecord.evidence
        .metadataRef,

    mintEventFound:
      mintRecord.evidence
        .mintEventFound,

    authoritative:
      false,
  };
}

export function buildNftDna(
  input:
    BuildNftDnaInput
): NftDnaRecord {
  const metadataPayload =
    JSON.stringify(
      input.asset.metadata
    );

  const traitsPayload =
    JSON.stringify(
      input.asset.traits
    );

  const mediaPayload = [
    input.asset.id,
    input.asset.mediaKind,
    input.asset.title,
  ].join(":");

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

      traits:
        input.asset.traits,

      assetVersion:
        input.asset.version,

      collectionVersion:
        input.collection.version,

      createdAt:
        input.collection.createdAt,

      authoritative:
        false,
    },

    integrity: {
      mediaHash:
        deterministicDnaHash(
          mediaPayload
        ),

      metadataHash:
        deterministicDnaHash(
          metadataPayload
        ),

      forgeConfigHash:
        deterministicDnaHash(
          [
            input.forgeConfig,
            traitsPayload,
          ].join(":")
        ),

      authoritative:
        false,
    },

    blockchainProof:
      buildBlockchainProof(
        input.mintRecord
      ),

    generatedAt:
      input.generatedAt,

    authoritative:
      false,
  };
}
