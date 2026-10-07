import type {
  IdentityEvidenceId,
  TenantId,
  UserId,
} from "./types.ts";

import type {
  WalletAddress,
  WalletBinding,
  WalletBindingId,
  WalletChain,
  WalletConnection,
  WalletConnectionId,
  WalletId,
  WalletIdentity,
  WalletProof,
  WalletProofId,
  WalletSignatureEvidence,
} from "./walletTypes.ts";

const EVM_ADDRESS =
  /^0x[0-9a-fA-F]{40}$/;

const HASH_LIKE =
  /^(0x)?[0-9a-fA-F]{64}$/;

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

function assertFutureAfter(
  earlier: string,
  later: string,
  field: string
): void {
  assertTimestamp(
    earlier,
    `${field}.start`
  );

  assertTimestamp(
    later,
    `${field}.end`
  );

  if (
    Date.parse(later) <=
    Date.parse(earlier)
  ) {
    throw new Error(
      `${field} expiration must be after observation time.`
    );
  }
}

function canonicalId<
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

export function createWalletId(
  value: string
): WalletId {
  return canonicalId<WalletId>(
    value,
    "wal_",
    "walletId"
  );
}

export function createWalletBindingId(
  value: string
): WalletBindingId {
  return canonicalId<WalletBindingId>(
    value,
    "wbd_",
    "walletBindingId"
  );
}

export function createWalletProofId(
  value: string
): WalletProofId {
  return canonicalId<WalletProofId>(
    value,
    "wpf_",
    "walletProofId"
  );
}

export function createWalletConnectionId(
  value: string
): WalletConnectionId {
  return canonicalId<WalletConnectionId>(
    value,
    "wcn_",
    "walletConnectionId"
  );
}

export function createWalletAddress(
  value: string
): WalletAddress {
  const normalized =
    value.trim();

  if (
    !EVM_ADDRESS.test(normalized)
  ) {
    throw new Error(
      "Wallet address must be a valid EVM address."
    );
  }

  /**
   * Lowercase is a deterministic comparison form.
   *
   * This does not claim checksum validation.
   */
  return normalized.toLowerCase() as WalletAddress;
}

export function createWalletChain(
  chainId: number
): WalletChain {
  if (
    !Number.isSafeInteger(chainId) ||
    chainId <= 0
  ) {
    throw new Error(
      "Wallet chainId must be a positive safe integer."
    );
  }

  return {
    family:
      "evm",

    chainId,

    namespace:
      `eip155:${chainId}`,
  };
}

export function sameWalletChain(
  left: WalletChain,
  right: WalletChain
): boolean {
  return (
    left.family ===
      right.family &&
    left.chainId ===
      right.chainId &&
    left.namespace ===
      right.namespace
  );
}

export function createWalletIdentity(
  input: {
    readonly walletId:
      WalletId;

    readonly address:
      WalletAddress;

    readonly chain:
      WalletChain;

    readonly createdAt:
      string;
  }
): WalletIdentity {
  assertTimestamp(
    input.createdAt,
    "walletIdentity.createdAt"
  );

  return {
    ...input,
  };
}

export function createWalletConnection(
  input: {
    readonly connectionId:
      WalletConnectionId;

    readonly wallet:
      WalletIdentity;

    readonly connectedAt:
      string;
  }
): WalletConnection {
  assertTimestamp(
    input.connectedAt,
    "walletConnection.connectedAt"
  );

  return {
    connectionId:
      input.connectionId,

    walletId:
      input.wallet.walletId,

    state:
      "connected",

    chain:
      input.wallet.chain,

    connectedAt:
      input.connectedAt,

    provesOwnership:
      false,

    grantsAuthority:
      false,
  };
}

export function disconnectWalletConnection(
  connection:
    WalletConnection,
  disconnectedAt:
    string
): WalletConnection {
  assertTimestamp(
    disconnectedAt,
    "walletConnection.disconnectedAt"
  );

  if (
    Date.parse(disconnectedAt) <
    Date.parse(connection.connectedAt)
  ) {
    throw new Error(
      "Wallet disconnection cannot precede connection."
    );
  }

  return {
    ...connection,

    state:
      "disconnected",

    disconnectedAt,
  };
}

export function createWalletSignatureEvidence(
  input: {
    readonly evidenceId:
      IdentityEvidenceId;

    readonly proofId:
      WalletProofId;

    readonly wallet:
      WalletIdentity;

    readonly challengeId:
      string;

    readonly challengeHash:
      string;

    readonly observedAt:
      string;

    readonly expiresAt:
      string;

    readonly verifiedAt?:
      string;
  }
): WalletSignatureEvidence {
  const challengeId =
    input.challengeId.trim();

  if (!challengeId) {
    throw new Error(
      "Wallet challengeId is required."
    );
  }

  if (
    !HASH_LIKE.test(
      input.challengeHash.trim()
    )
  ) {
    throw new Error(
      "Wallet challengeHash must be a 32-byte hexadecimal digest."
    );
  }

  assertFutureAfter(
    input.observedAt,
    input.expiresAt,
    "walletSignatureEvidence"
  );

  if (
    input.verifiedAt
  ) {
    assertTimestamp(
      input.verifiedAt,
      "walletSignatureEvidence.verifiedAt"
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
        "Wallet verification cannot precede observation."
      );
    }
  }

  return {
    evidenceId:
      input.evidenceId,

    proofId:
      input.proofId,

    walletId:
      input.wallet.walletId,

    address:
      input.wallet.address,

    chain:
      input.wallet.chain,

    challengeId,

    challengeHash:
      input.challengeHash.toLowerCase(),

    observedAt:
      input.observedAt,

    verifiedAt:
      input.verifiedAt,

    expiresAt:
      input.expiresAt,

    verificationState:
      input.verifiedAt
        ? "verified"
        : "unverified",

    signatureStored:
      false,

    grantsAuthority:
      false,
  };
}

export function createWalletProof(
  evidence:
    WalletSignatureEvidence
): WalletProof {
  return {
    proofId:
      evidence.proofId,

    walletId:
      evidence.walletId,

    evidenceId:
      evidence.evidenceId,

    state:
      evidence.verificationState,

    verifiedAt:
      evidence.verifiedAt,

    expiresAt:
      evidence.expiresAt,

    grantsAuthority:
      false,
  };
}

export function createWalletBinding(
  input: {
    readonly bindingId:
      WalletBindingId;

    readonly userId:
      UserId;

    readonly tenantId:
      TenantId;

    readonly wallet:
      WalletIdentity;

    readonly proof:
      WalletProof;

    readonly createdAt:
      string;
  }
): WalletBinding {
  assertTimestamp(
    input.createdAt,
    "walletBinding.createdAt"
  );

  if (
    input.proof.walletId !==
    input.wallet.walletId
  ) {
    throw new Error(
      "Wallet proof does not belong to binding wallet."
    );
  }

  if (
    input.proof.state !==
    "verified"
  ) {
    throw new Error(
      "Active wallet binding requires verified proof."
    );
  }

  if (
    Date.parse(
      input.proof.expiresAt
    ) <=
    Date.parse(
      input.createdAt
    )
  ) {
    throw new Error(
      "Wallet proof is expired for binding creation."
    );
  }

  return {
    bindingId:
      input.bindingId,

    userId:
      input.userId,

    tenantId:
      input.tenantId,

    walletId:
      input.wallet.walletId,

    chain:
      input.wallet.chain,

    state:
      "active",

    createdAt:
      input.createdAt,

    verifiedAt:
      input.proof.verifiedAt,

    proofId:
      input.proof.proofId,

    grantsAuthority:
      false,
  };
}

export function revokeWalletBinding(
  binding:
    WalletBinding,
  revokedAt:
    string,
  reason:
    string
): WalletBinding {
  assertTimestamp(
    revokedAt,
    "walletBinding.revokedAt"
  );

  const normalizedReason =
    reason.trim();

  if (!normalizedReason) {
    throw new Error(
      "Wallet binding revocation reason is required."
    );
  }

  if (
    Date.parse(revokedAt) <
    Date.parse(binding.createdAt)
  ) {
    throw new Error(
      "Wallet binding revocation cannot precede creation."
    );
  }

  if (
    binding.state ===
    "revoked"
  ) {
    throw new Error(
      "Wallet binding is already revoked."
    );
  }

  return {
    ...binding,

    state:
      "revoked",

    revokedAt,

    revocationReason:
      normalizedReason,

    grantsAuthority:
      false,
  };
}

export function walletBindingMatches(
  binding:
    WalletBinding,
  userId:
    UserId,
  tenantId:
    TenantId,
  wallet:
    WalletIdentity
): boolean {
  return (
    binding.state ===
      "active" &&
    binding.userId ===
      userId &&
    binding.tenantId ===
      tenantId &&
    binding.walletId ===
      wallet.walletId &&
    sameWalletChain(
      binding.chain,
      wallet.chain
    )
  );
}
