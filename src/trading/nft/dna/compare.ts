import type {
  NftDnaRecord,
} from "./types";

export type NftDnaChange = {
  readonly layer:
    | "IDENTITY"
    | "INTEGRITY"
    | "BLOCKCHAIN_PROOF";

  readonly field: string;

  readonly before:
    string | number | boolean | null;

  readonly after:
    string | number | boolean | null;
};

export type NftDnaComparison = {
  readonly changed: boolean;

  readonly changes:
    readonly NftDnaChange[];
};

function addChange(
  changes:
    NftDnaChange[],
  layer:
    NftDnaChange["layer"],
  field: string,
  before:
    string | number | boolean | null,
  after:
    string | number | boolean | null
): void {
  if (before === after) {
    return;
  }

  changes.push({
    layer,
    field,
    before,
    after,
  });
}

export function compareNftDna(
  before:
    NftDnaRecord,
  after:
    NftDnaRecord
): NftDnaComparison {
  const changes:
    NftDnaChange[] = [];

  addChange(
    changes,
    "IDENTITY",
    "assetId",
    before.identity.assetId,
    after.identity.assetId
  );

  addChange(
    changes,
    "IDENTITY",
    "collectionId",
    before.identity.collectionId,
    after.identity.collectionId
  );

  addChange(
    changes,
    "IDENTITY",
    "creator",
    before.identity.creator,
    after.identity.creator
  );

  addChange(
    changes,
    "IDENTITY",
    "assetVersion",
    before.identity.assetVersion,
    after.identity.assetVersion
  );

  addChange(
    changes,
    "IDENTITY",
    "collectionVersion",
    before.identity.collectionVersion,
    after.identity.collectionVersion
  );

  addChange(
    changes,
    "INTEGRITY",
    "mediaHash",
    before.integrity.mediaHash,
    after.integrity.mediaHash
  );

  addChange(
    changes,
    "INTEGRITY",
    "metadataHash",
    before.integrity.metadataHash,
    after.integrity.metadataHash
  );

  addChange(
    changes,
    "INTEGRITY",
    "forgeConfigHash",
    before.integrity.forgeConfigHash,
    after.integrity.forgeConfigHash
  );

  addChange(
    changes,
    "BLOCKCHAIN_PROOF",
    "chainId",
    before.blockchainProof
      ?.chainId ?? null,
    after.blockchainProof
      ?.chainId ?? null
  );

  addChange(
    changes,
    "BLOCKCHAIN_PROOF",
    "contractAddress",
    before.blockchainProof
      ?.contractAddress ?? null,
    after.blockchainProof
      ?.contractAddress ?? null
  );

  addChange(
    changes,
    "BLOCKCHAIN_PROOF",
    "tokenId",
    before.blockchainProof
      ?.tokenId ?? null,
    after.blockchainProof
      ?.tokenId ?? null
  );

  addChange(
    changes,
    "BLOCKCHAIN_PROOF",
    "owner",
    before.blockchainProof
      ?.owner ?? null,
    after.blockchainProof
      ?.owner ?? null
  );

  addChange(
    changes,
    "BLOCKCHAIN_PROOF",
    "metadataRef",
    before.blockchainProof
      ?.metadataRef ?? null,
    after.blockchainProof
      ?.metadataRef ?? null
  );

  return {
    changed:
      changes.length > 0,

    changes,
  };
}
