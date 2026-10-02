import type {
  NftTrait,
} from "../types";

export type NftDnaIdentity = {
  readonly assetId: string;
  readonly collectionId: string;
  readonly creator: string;

  readonly traits:
    readonly NftTrait[];

  readonly assetVersion: number;
  readonly collectionVersion: number;

  readonly createdAt: string;

  /**
   * Identity describes what the NFT claims to be.
   * It is not blockchain proof.
   */
  readonly authoritative: false;
};

export type NftDnaIntegrity = {
  readonly mediaHash: string;
  readonly metadataHash: string;
  readonly forgeConfigHash: string;

  /**
   * Integrity hashes detect change.
   * They do not establish ownership or provenance.
   */
  readonly authoritative: false;
};

export type NftDnaBlockchainProof = {
  readonly chainId: string;
  readonly contractAddress: string;
  readonly tokenId: string;
  readonly transactionHash: string;
  readonly blockNumber: number;
  readonly owner: string;
  readonly metadataRef: string;
  readonly mintEventFound: boolean;

  /**
   * Blockchain proof is evidence.
   * It does not redefine NFT identity.
   */
  readonly authoritative: false;
};

export type NftDnaRecord = {
  readonly id: string;

  readonly identity:
    NftDnaIdentity;

  readonly integrity:
    NftDnaIntegrity;

  readonly blockchainProof:
    NftDnaBlockchainProof | null;

  readonly generatedAt: string;

  /**
   * NFT DNA is a structured record,
   * not a governance authority.
   */
  readonly authoritative: false;
};

export type NftDnaValidationIssueCode =
  | "INVALID_DNA_ID"
  | "INVALID_ASSET_ID"
  | "INVALID_COLLECTION_ID"
  | "INVALID_CREATOR"
  | "INVALID_ASSET_VERSION"
  | "INVALID_COLLECTION_VERSION"
  | "INVALID_CREATED_AT"
  | "INVALID_MEDIA_HASH"
  | "INVALID_METADATA_HASH"
  | "INVALID_FORGE_CONFIG_HASH"
  | "INVALID_BLOCKCHAIN_CHAIN"
  | "INVALID_BLOCKCHAIN_CONTRACT"
  | "INVALID_BLOCKCHAIN_TOKEN"
  | "INVALID_BLOCKCHAIN_TRANSACTION"
  | "INVALID_BLOCKCHAIN_BLOCK"
  | "INVALID_BLOCKCHAIN_OWNER"
  | "INVALID_BLOCKCHAIN_METADATA"
  | "MISSING_BLOCKCHAIN_MINT_EVENT";

export type NftDnaValidationIssue = {
  readonly code:
    NftDnaValidationIssueCode;

  readonly message: string;
};

export type NftDnaValidationResult = {
  readonly valid: boolean;

  readonly issues:
    readonly NftDnaValidationIssue[];
};
