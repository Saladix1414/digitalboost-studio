import type {
  TenantId,
  UserId,
} from "./types.ts";

import type {
  WalletAddress,
  WalletBindingId,
  WalletChain,
  WalletId,
} from "./walletTypes.ts";

declare const ownershipEvidenceBrand:
  unique symbol;

export type OwnershipEvidenceId =
  string & {
    readonly [ownershipEvidenceBrand]:
      "OwnershipEvidenceId";
  };

export type AssetObservationId =
  string & {
    readonly [ownershipEvidenceBrand]:
      "AssetObservationId";
  };

export type OwnershipEvidenceStatus =
  | "observed"
  | "verified"
  | "stale"
  | "failed";

export type AssetKind =
  | "native-token"
  | "fungible-token"
  | "nft";

export type BlockchainObservationSource =
  | "blockchain-gateway"
  | "indexer"
  | "rpc-read"
  | "test";

export type NativeTokenAsset = {
  readonly kind:
    "native-token";

  readonly symbol:
    string;

  readonly decimals:
    number;
};

export type FungibleTokenAsset = {
  readonly kind:
    "fungible-token";

  readonly contractAddress:
    WalletAddress;

  readonly symbol?:
    string;

  readonly decimals:
    number;
};

export type NftAsset = {
  readonly kind:
    "nft";

  readonly contractAddress:
    WalletAddress;

  readonly tokenId:
    string;
};

export type ObservedAsset =
  | NativeTokenAsset
  | FungibleTokenAsset
  | NftAsset;

export type WalletAssetObservation = {
  readonly observationId:
    AssetObservationId;

  readonly evidenceId:
    OwnershipEvidenceId;

  readonly walletId:
    WalletId;

  readonly walletAddress:
    WalletAddress;

  readonly chain:
    WalletChain;

  readonly asset:
    ObservedAsset;

  /**
   * Base-unit quantity as a decimal integer string.
   *
   * Avoids floating-point accounting semantics.
   */
  readonly quantity:
    string;

  readonly blockNumber:
    number;

  readonly observedAt:
    string;

  readonly source:
    BlockchainObservationSource;

  readonly status:
    OwnershipEvidenceStatus;

  readonly verifiedAt?:
    string;

  readonly expiresAt?:
    string;

  readonly grantsAuthority:
    false;

  readonly claimsLegalOwnership:
    false;
};

export type WalletOwnershipEvidence = {
  readonly evidenceId:
    OwnershipEvidenceId;

  readonly walletId:
    WalletId;

  readonly walletAddress:
    WalletAddress;

  readonly chain:
    WalletChain;

  readonly observations:
    readonly WalletAssetObservation[];

  readonly observedAt:
    string;

  readonly lastVerifiedAt?:
    string;

  readonly status:
    OwnershipEvidenceStatus;

  readonly grantsAuthority:
    false;

  readonly claimsLegalOwnership:
    false;
};

export type BoundWalletOwnershipEvidence = {
  readonly evidence:
    WalletOwnershipEvidence;

  readonly bindingId:
    WalletBindingId;

  readonly userId:
    UserId;

  readonly tenantId:
    TenantId;

  /**
   * The binding provides application association context only.
   *
   * This still does not turn holdings into permissions.
   */
  readonly grantsAuthority:
    false;
};

const INTEGER_STRING =
  /^(0|[1-9][0-9]*)$/;

const TOKEN_ID =
  /^[A-Za-z0-9._:-]{1,256}$/;

function assertTimestamp(
  value: string,
  field: string
): void {
  if (
    !value.trim() ||
    !Number.isFinite(
      Date.parse(value)
    )
  ) {
    throw new Error(
      `${field} must be a valid timestamp.`
    );
  }
}

function assertDecimals(
  value: number
): void {
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    value > 255
  ) {
    throw new Error(
      "Asset decimals must be an integer between 0 and 255."
    );
  }
}

function assertBlockNumber(
  value: number
): void {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new Error(
      "blockNumber must be a non-negative safe integer."
    );
  }
}

function assertQuantity(
  value: string
): void {
  if (
    !INTEGER_STRING.test(value)
  ) {
    throw new Error(
      "Asset quantity must be a non-negative base-unit integer string."
    );
  }
}

function canonicalEvidenceId<
  T extends string,
>(
  value: string,
  prefix: string,
  field: string
): T {
  const normalized =
    value.trim();

  const pattern =
    new RegExp(
      `^${prefix}[A-Za-z0-9][A-Za-z0-9._:-]{5,159}$`
    );

  if (
    !pattern.test(normalized)
  ) {
    throw new Error(
      `${field} must use canonical ${prefix} format.`
    );
  }

  return normalized as T;
}

export function createOwnershipEvidenceId(
  value: string
): OwnershipEvidenceId {
  return canonicalEvidenceId<OwnershipEvidenceId>(
    value,
    "owe_",
    "ownershipEvidenceId"
  );
}

export function createAssetObservationId(
  value: string
): AssetObservationId {
  return canonicalEvidenceId<AssetObservationId>(
    value,
    "aob_",
    "assetObservationId"
  );
}

export function createNativeTokenAsset(
  symbol: string,
  decimals: number
): NativeTokenAsset {
  const normalizedSymbol =
    symbol.trim().toUpperCase();

  if (
    !/^[A-Z0-9._-]{1,32}$/.test(
      normalizedSymbol
    )
  ) {
    throw new Error(
      "Native token symbol is invalid."
    );
  }

  assertDecimals(
    decimals
  );

  return {
    kind:
      "native-token",

    symbol:
      normalizedSymbol,

    decimals,
  };
}

export function createFungibleTokenAsset(
  contractAddress:
    WalletAddress,
  decimals: number,
  symbol?: string
): FungibleTokenAsset {
  assertDecimals(
    decimals
  );

  const normalizedSymbol =
    symbol?.trim().toUpperCase();

  if (
    normalizedSymbol &&
    !/^[A-Z0-9._-]{1,32}$/.test(
      normalizedSymbol
    )
  ) {
    throw new Error(
      "Fungible token symbol is invalid."
    );
  }

  return {
    kind:
      "fungible-token",

    contractAddress,

    decimals,

    symbol:
      normalizedSymbol || undefined,
  };
}

export function createNftAsset(
  contractAddress:
    WalletAddress,
  tokenId: string
): NftAsset {
  const normalizedTokenId =
    tokenId.trim();

  if (
    !TOKEN_ID.test(
      normalizedTokenId
    )
  ) {
    throw new Error(
      "NFT tokenId is invalid."
    );
  }

  return {
    kind:
      "nft",

    contractAddress,

    tokenId:
      normalizedTokenId,
  };
}

export function createWalletAssetObservation(
  input: {
    readonly observationId:
      AssetObservationId;

    readonly evidenceId:
      OwnershipEvidenceId;

    readonly walletId:
      WalletId;

    readonly walletAddress:
      WalletAddress;

    readonly chain:
      WalletChain;

    readonly asset:
      ObservedAsset;

    readonly quantity:
      string;

    readonly blockNumber:
      number;

    readonly observedAt:
      string;

    readonly source:
      BlockchainObservationSource;

    readonly verifiedAt?:
      string;

    readonly expiresAt?:
      string;
  }
): WalletAssetObservation {
  assertQuantity(
    input.quantity
  );

  assertBlockNumber(
    input.blockNumber
  );

  assertTimestamp(
    input.observedAt,
    "walletAssetObservation.observedAt"
  );

  if (
    input.verifiedAt
  ) {
    assertTimestamp(
      input.verifiedAt,
      "walletAssetObservation.verifiedAt"
    );

    if (
      Date.parse(
        input.verifiedAt
      ) <
      Date.parse(
        input.observedAt
      )
    ) {
      throw new Error(
        "Asset verification cannot precede observation."
      );
    }
  }

  if (
    input.expiresAt
  ) {
    assertTimestamp(
      input.expiresAt,
      "walletAssetObservation.expiresAt"
    );

    if (
      Date.parse(
        input.expiresAt
      ) <=
      Date.parse(
        input.observedAt
      )
    ) {
      throw new Error(
        "Asset evidence expiration must be after observation."
      );
    }
  }

  if (
    input.asset.kind ===
      "nft" &&
    input.quantity !==
      "0" &&
    input.quantity !==
      "1"
  ) {
    throw new Error(
      "NFT ownership observation quantity must be 0 or 1."
    );
  }

  return {
    ...input,

    status:
      input.verifiedAt
        ? "verified"
        : "observed",

    grantsAuthority:
      false,

    claimsLegalOwnership:
      false,
  };
}

export function buildWalletOwnershipEvidence(
  input: {
    readonly evidenceId:
      OwnershipEvidenceId;

    readonly walletId:
      WalletId;

    readonly walletAddress:
      WalletAddress;

    readonly chain:
      WalletChain;

    readonly observations:
      readonly WalletAssetObservation[];

    readonly observedAt:
      string;
  }
): WalletOwnershipEvidence {
  assertTimestamp(
    input.observedAt,
    "walletOwnershipEvidence.observedAt"
  );

  for (
    const observation of
    input.observations
  ) {
    if (
      observation.evidenceId !==
      input.evidenceId
    ) {
      throw new Error(
        "Ownership observation evidenceId mismatch."
      );
    }

    if (
      observation.walletId !==
      input.walletId
    ) {
      throw new Error(
        "Ownership observation walletId mismatch."
      );
    }

    if (
      observation.walletAddress !==
      input.walletAddress
    ) {
      throw new Error(
        "Ownership observation wallet address mismatch."
      );
    }

    if (
      observation.chain.namespace !==
      input.chain.namespace
    ) {
      throw new Error(
        "Ownership observation chain mismatch."
      );
    }
  }

  const verified =
    input.observations.filter(
      (item) =>
        item.status ===
        "verified"
    );

  const lastVerifiedAt =
    verified
      .map(
        (item) =>
          item.verifiedAt
      )
      .filter(
        (value):
          value is string =>
          Boolean(value)
      )
      .sort()
      .at(-1);

  return {
    evidenceId:
      input.evidenceId,

    walletId:
      input.walletId,

    walletAddress:
      input.walletAddress,

    chain:
      input.chain,

    observations:
      [...input.observations],

    observedAt:
      input.observedAt,

    lastVerifiedAt,

    status:
      input.observations.length > 0 &&
      input.observations.every(
        (item) =>
          item.status ===
          "verified"
      )
        ? "verified"
        : "observed",

    grantsAuthority:
      false,

    claimsLegalOwnership:
      false,
  };
}

export function markOwnershipEvidenceStale(
  evidence:
    WalletOwnershipEvidence
): WalletOwnershipEvidence {
  return {
    ...evidence,

    status:
      "stale",

    grantsAuthority:
      false,

    claimsLegalOwnership:
      false,
  };
}

export function hasObservedNftHolding(
  evidence:
    WalletOwnershipEvidence,
  contractAddress:
    WalletAddress,
  tokenId:
    string
): boolean {
  return evidence.observations.some(
    (item) =>
      item.asset.kind ===
        "nft" &&
      item.asset.contractAddress ===
        contractAddress &&
      item.asset.tokenId ===
        tokenId &&
      item.quantity ===
        "1" &&
      (
        item.status ===
          "observed" ||
        item.status ===
          "verified"
      )
  );
}

export function readObservedAssetQuantity(
  evidence:
    WalletOwnershipEvidence,
  predicate:
    (
      asset:
        ObservedAsset
    ) => boolean
): string {
  let total =
    0n;

  for (
    const observation of
    evidence.observations
  ) {
    if (
      predicate(
        observation.asset
      )
    ) {
      total +=
        BigInt(
          observation.quantity
        );
    }
  }

  return total.toString();
}

export function bindOwnershipEvidenceToIdentity(
  input: {
    readonly evidence:
      WalletOwnershipEvidence;

    readonly bindingId:
      WalletBindingId;

    readonly userId:
      UserId;

    readonly tenantId:
      TenantId;
  }
): BoundWalletOwnershipEvidence {
  return {
    ...input,

    grantsAuthority:
      false,
  };
}
