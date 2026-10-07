import type {
  IdentityEvidenceId,
  TenantId,
  UserId,
} from "./types.ts";

declare const walletBrand:
  unique symbol;

export type WalletBrandedId<
  Kind extends string,
> = string & {
  readonly [walletBrand]:
    Kind;
};

export type WalletId =
  WalletBrandedId<"WalletId">;

export type WalletBindingId =
  WalletBrandedId<"WalletBindingId">;

export type WalletProofId =
  WalletBrandedId<"WalletProofId">;

export type WalletConnectionId =
  WalletBrandedId<"WalletConnectionId">;

export type WalletAddress =
  string & {
    readonly __walletAddress:
      "WalletAddress";
  };

export type WalletChainFamily =
  | "evm";

export type WalletChain = {
  readonly family:
    WalletChainFamily;

  /**
   * Canonical EVM decimal chain identifier.
   *
   * Examples:
   * Ethereum = 1
   * Polygon  = 137
   */
  readonly chainId:
    number;

  readonly namespace:
    string;
};

export type WalletVerificationState =
  | "unverified"
  | "verified"
  | "expired"
  | "failed"
  | "revoked";

export type WalletIdentity = {
  readonly walletId:
    WalletId;

  readonly address:
    WalletAddress;

  readonly chain:
    WalletChain;

  readonly createdAt:
    string;
};

export type WalletConnectionState =
  | "connected"
  | "disconnected"
  | "expired"
  | "unsupported-network";

export type WalletConnection = {
  readonly connectionId:
    WalletConnectionId;

  readonly walletId:
    WalletId;

  readonly state:
    WalletConnectionState;

  readonly chain:
    WalletChain;

  readonly connectedAt:
    string;

  readonly disconnectedAt?:
    string;

  /**
   * Connection is transport/session context only.
   * It is not ownership proof.
   */
  readonly provesOwnership:
    false;

  readonly grantsAuthority:
    false;
};

export type WalletSignatureEvidence = {
  readonly evidenceId:
    IdentityEvidenceId;

  readonly proofId:
    WalletProofId;

  readonly walletId:
    WalletId;

  readonly address:
    WalletAddress;

  readonly chain:
    WalletChain;

  readonly challengeId:
    string;

  readonly challengeHash:
    string;

  readonly observedAt:
    string;

  readonly verifiedAt?:
    string;

  readonly expiresAt:
    string;

  readonly verificationState:
    WalletVerificationState;

  /**
   * Raw signatures are intentionally not part of
   * this canonical evidence model.
   */
  readonly signatureStored:
    false;

  readonly grantsAuthority:
    false;
};

export type WalletProof = {
  readonly proofId:
    WalletProofId;

  readonly walletId:
    WalletId;

  readonly evidenceId:
    IdentityEvidenceId;

  readonly state:
    WalletVerificationState;

  readonly verifiedAt?:
    string;

  readonly expiresAt:
    string;

  readonly grantsAuthority:
    false;
};

export type WalletBindingState =
  | "pending"
  | "active"
  | "revoked"
  | "expired";

export type WalletBinding = {
  readonly bindingId:
    WalletBindingId;

  readonly userId:
    UserId;

  readonly tenantId:
    TenantId;

  readonly walletId:
    WalletId;

  readonly chain:
    WalletChain;

  readonly state:
    WalletBindingState;

  readonly createdAt:
    string;

  readonly verifiedAt?:
    string;

  readonly revokedAt?:
    string;

  readonly revocationReason?:
    string;

  readonly proofId?:
    WalletProofId;

  /**
   * Binding proves a scoped application association.
   *
   * It is not unrestricted application authority.
   */
  readonly grantsAuthority:
    false;
};
