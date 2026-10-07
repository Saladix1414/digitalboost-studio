import type {
  TradingUserContext,
} from "./userContext.ts";

import type {
  WalletBinding,
  WalletConnection,
  WalletIdentity,
  WalletProof,
} from "./walletTypes.ts";

import type {
  WalletOwnershipEvidence,
} from "./ownershipEvidence.ts";

export type IdentityWalletSecurityFailureCode =
  | "SESSION_MISMATCH"
  | "TENANT_MISMATCH"
  | "USER_MISMATCH"
  | "WALLET_MISMATCH"
  | "CHAIN_MISMATCH"
  | "BINDING_INACTIVE"
  | "PROOF_UNVERIFIED"
  | "PROOF_EXPIRED"
  | "PROOF_REPLAY"
  | "OWNERSHIP_STALE"
  | "OWNERSHIP_FAILED"
  | "CONNECTION_INACTIVE";

export type IdentityWalletSecurityFailure = {
  readonly ok:
    false;

  readonly code:
    IdentityWalletSecurityFailureCode;

  readonly message:
    string;

  readonly grantsAuthority:
    false;
};

export type IdentityWalletSecuritySuccess = {
  readonly ok:
    true;

  readonly grantsAuthority:
    false;
};

export type IdentityWalletSecurityResult =
  | IdentityWalletSecuritySuccess
  | IdentityWalletSecurityFailure;

export type WalletProofReplayRegistry = {
  readonly consumedProofIds:
    ReadonlySet<string>;
};

function failure(
  code:
    IdentityWalletSecurityFailureCode,
  message:
    string
): IdentityWalletSecurityFailure {
  return {
    ok:
      false,

    code,

    message,

    grantsAuthority:
      false,
  };
}

function success():
  IdentityWalletSecuritySuccess {
  return {
    ok:
      true,

    grantsAuthority:
      false,
  };
}

function sameChain(
  left: {
    readonly family:
      string;

    readonly chainId:
      number;

    readonly namespace:
      string;
  },
  right: {
    readonly family:
      string;

    readonly chainId:
      number;

    readonly namespace:
      string;
  }
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

export function createWalletProofReplayRegistry():
  WalletProofReplayRegistry {
  return {
    consumedProofIds:
      new Set<string>(),
  };
}

export function consumeWalletProof(
  registry:
    WalletProofReplayRegistry,
  proof:
    WalletProof
):
  | {
      readonly ok:
        true;

      readonly registry:
        WalletProofReplayRegistry;

      readonly grantsAuthority:
        false;
    }
  | IdentityWalletSecurityFailure {
  if (
    registry.consumedProofIds.has(
      proof.proofId
    )
  ) {
    return failure(
      "PROOF_REPLAY",
      "Wallet proof has already been consumed."
    );
  }

  const next =
    new Set(
      registry.consumedProofIds
    );

  next.add(
    proof.proofId
  );

  return {
    ok:
      true,

    registry: {
      consumedProofIds:
        next,
    },

    grantsAuthority:
      false,
  };
}

export function validateWalletProofSecurity(
  proof:
    WalletProof,
  now:
    string
): IdentityWalletSecurityResult {
  const nowMs =
    Date.parse(now);

  const expiresMs =
    Date.parse(
      proof.expiresAt
    );

  if (
    !Number.isFinite(nowMs) ||
    !Number.isFinite(expiresMs)
  ) {
    return failure(
      "PROOF_EXPIRED",
      "Wallet proof timestamp is invalid."
    );
  }

  if (
    proof.state !==
    "verified"
  ) {
    return failure(
      "PROOF_UNVERIFIED",
      "Wallet proof is not verified."
    );
  }

  if (
    expiresMs <=
    nowMs
  ) {
    return failure(
      "PROOF_EXPIRED",
      "Wallet proof has expired."
    );
  }

  return success();
}

export function validateWalletBindingSecurity(
  context:
    TradingUserContext,
  binding:
    WalletBinding,
  wallet:
    WalletIdentity
): IdentityWalletSecurityResult {
  if (
    binding.state !==
    "active"
  ) {
    return failure(
      "BINDING_INACTIVE",
      "Wallet binding is not active."
    );
  }

  if (
    binding.userId !==
    context.userId
  ) {
    return failure(
      "USER_MISMATCH",
      "Wallet binding user does not match active user context."
    );
  }

  if (
    binding.tenantId !==
    context.tenantId
  ) {
    return failure(
      "TENANT_MISMATCH",
      "Wallet binding tenant does not match active tenant context."
    );
  }

  if (
    binding.walletId !==
    wallet.walletId
  ) {
    return failure(
      "WALLET_MISMATCH",
      "Wallet binding does not match canonical wallet."
    );
  }

  if (
    !sameChain(
      binding.chain,
      wallet.chain
    )
  ) {
    return failure(
      "CHAIN_MISMATCH",
      "Wallet binding chain does not match canonical wallet chain."
    );
  }

  return success();
}

export function validateWalletConnectionSecurity(
  wallet:
    WalletIdentity,
  connection:
    WalletConnection
): IdentityWalletSecurityResult {
  if (
    connection.state !==
    "connected"
  ) {
    return failure(
      "CONNECTION_INACTIVE",
      "Wallet connection is not active."
    );
  }

  if (
    connection.walletId !==
    wallet.walletId
  ) {
    return failure(
      "WALLET_MISMATCH",
      "Wallet connection does not match canonical wallet."
    );
  }

  if (
    !sameChain(
      connection.chain,
      wallet.chain
    )
  ) {
    return failure(
      "CHAIN_MISMATCH",
      "Wallet connection chain does not match canonical wallet chain."
    );
  }

  return success();
}

export function validateOwnershipEvidenceSecurity(
  wallet:
    WalletIdentity,
  evidence:
    WalletOwnershipEvidence
): IdentityWalletSecurityResult {
  if (
    evidence.walletId !==
    wallet.walletId
  ) {
    return failure(
      "WALLET_MISMATCH",
      "Ownership evidence wallet does not match canonical wallet."
    );
  }

  if (
    evidence.walletAddress !==
    wallet.address
  ) {
    return failure(
      "WALLET_MISMATCH",
      "Ownership evidence address does not match canonical wallet."
    );
  }

  if (
    !sameChain(
      evidence.chain,
      wallet.chain
    )
  ) {
    return failure(
      "CHAIN_MISMATCH",
      "Ownership evidence chain does not match canonical wallet chain."
    );
  }

  if (
    evidence.status ===
    "stale"
  ) {
    return failure(
      "OWNERSHIP_STALE",
      "Ownership evidence is stale."
    );
  }

  if (
    evidence.status ===
    "failed"
  ) {
    return failure(
      "OWNERSHIP_FAILED",
      "Ownership evidence is failed."
    );
  }

  return success();
}

export function validateIdentitySessionSecurity(
  expectedSessionId:
    string,
  context:
    TradingUserContext
): IdentityWalletSecurityResult {
  if (
    context.sessionId !==
    expectedSessionId
  ) {
    return failure(
      "SESSION_MISMATCH",
      "Trading user context session does not match expected session."
    );
  }

  return success();
}
