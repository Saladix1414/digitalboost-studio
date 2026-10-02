import {
  getNftMintPricingIntent,
} from "./pricing";

import type {
  NftMintIntent,
  NftMintMode,
  NftMintRecord,
} from "./types";

export type CreateNftMintIntentInput = {
  readonly id: string;
  readonly assetId: string;
  readonly collectionId: string;
  readonly mode: NftMintMode;
  readonly expectedOwner: string;
  readonly expectedMetadataRef: string;
  readonly requestedAt: string;
};

export function createNftMintRecord(
  input:
    CreateNftMintIntentInput
): NftMintRecord {
  const intent:
    NftMintIntent = {
      ...input,
      pricing:
        getNftMintPricingIntent(
          input.mode
        ),
    };

  return {
    intent,
    status: "DRAFT",
    prepared: null,
    evidence: null,
    verification: null,
    updatedAt:
      input.requestedAt,
  };
}
