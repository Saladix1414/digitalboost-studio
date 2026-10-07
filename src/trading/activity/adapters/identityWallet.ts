import {
  createTradingActivityEvent,
} from "../factory";

import type {
  TradingActivityEvent,
} from "../types";

import type {
  TradingUserContext,
} from "../../identity/userContext";

import type {
  WalletBinding,
  WalletConnection,
  WalletIdentity,
} from "../../identity/walletTypes";

import type {
  BoundWalletOwnershipEvidence,
} from "../../identity/ownershipEvidence";

/**
 * Phase 33F
 *
 * Identity and wallet evidence is projected into the existing
 * Activity Center.
 *
 * This adapter:
 * - does not mutate identity state
 * - does not mutate wallet state
 * - does not execute blockchain operations
 * - does not grant authority
 * - does not write directly to the shared Activity store
 */

function activityId(
  kind: string,
  ref: string
): string {
  return `activity-identity-wallet:${kind}:${ref}`;
}

function userActor(
  context: TradingUserContext
) {
  return {
    type:
      "USER" as const,

    ref:
      context.userId,
  };
}

export function activityFromIdentitySessionStarted(
  context:
    TradingUserContext,
  sequence:
    number
): TradingActivityEvent {
  return createTradingActivityEvent({
    id:
      activityId(
        "identity-session-started",
        context.sessionId
      ),

    domain:
      "SECURITY",

    type:
      "STARTED",

    severity:
      "INFO",

    title:
      "Identity session started",

    description:
      "A canonical Trading identity session became active.",

    actor:
      userActor(context),

    references: [
      {
        kind:
          "user",
        ref:
          context.userId,
      },
      {
        kind:
          "tenant",
        ref:
          context.tenantId,
      },
      {
        kind:
          "session",
        ref:
          context.sessionId,
      },
      {
        kind:
          "workspace",
        ref:
          context.workspaceId,
      },
    ],

    occurredAt:
      context.createdAt,

    sequence,
  });
}

export function activityFromIdentitySessionEnded(
  context:
    TradingUserContext,
  occurredAt:
    string,
  sequence:
    number
): TradingActivityEvent {
  return createTradingActivityEvent({
    id:
      activityId(
        "identity-session-ended",
        context.sessionId
      ),

    domain:
      "SECURITY",

    type:
      "COMPLETED",

    severity:
      "INFO",

    title:
      "Identity session ended",

    description:
      "A canonical Trading identity session ended.",

    actor:
      userActor(context),

    references: [
      {
        kind:
          "user",
        ref:
          context.userId,
      },
      {
        kind:
          "tenant",
        ref:
          context.tenantId,
      },
      {
        kind:
          "session",
        ref:
          context.sessionId,
      },
    ],

    occurredAt,

    sequence,
  });
}

export function activityFromWalletConnected(
  context:
    TradingUserContext,
  wallet:
    WalletIdentity,
  connection:
    WalletConnection,
  sequence:
    number
): TradingActivityEvent {
  return createTradingActivityEvent({
    id:
      activityId(
        "wallet-connected",
        connection.connectionId
      ),

    domain:
      "SECURITY",

    type:
      "STARTED",

    severity:
      "INFO",

    title:
      "Wallet connected",

    description:
      "A wallet connection session was established. Connection alone does not prove ownership or grant authority.",

    actor:
      userActor(context),

    references: [
      {
        kind:
          "wallet",
        ref:
          wallet.walletId,
      },
      {
        kind:
          "wallet-connection",
        ref:
          connection.connectionId,
      },
      {
        kind:
          "chain",
        ref:
          wallet.chain.namespace,
      },
      {
        kind:
          "session",
        ref:
          context.sessionId,
      },
    ],

    occurredAt:
      connection.connectedAt,

    sequence,
  });
}

export function activityFromWalletDisconnected(
  context:
    TradingUserContext,
  wallet:
    WalletIdentity,
  connection:
    WalletConnection,
  sequence:
    number
): TradingActivityEvent {
  if (
    !connection.disconnectedAt
  ) {
    throw new Error(
      "Disconnected wallet activity requires disconnectedAt."
    );
  }

  return createTradingActivityEvent({
    id:
      activityId(
        "wallet-disconnected",
        connection.connectionId
      ),

    domain:
      "SECURITY",

    type:
      "COMPLETED",

    severity:
      "INFO",

    title:
      "Wallet disconnected",

    description:
      "A wallet connection session was disconnected.",

    actor:
      userActor(context),

    references: [
      {
        kind:
          "wallet",
        ref:
          wallet.walletId,
      },
      {
        kind:
          "wallet-connection",
        ref:
          connection.connectionId,
      },
      {
        kind:
          "chain",
        ref:
          wallet.chain.namespace,
      },
    ],

    occurredAt:
      connection.disconnectedAt,

    sequence,
  });
}

export function activityFromWalletChainChanged(
  context:
    TradingUserContext,
  previousWallet:
    WalletIdentity,
  nextWallet:
    WalletIdentity,
  occurredAt:
    string,
  sequence:
    number
): TradingActivityEvent {
  if (
    previousWallet.walletId !==
    nextWallet.walletId
  ) {
    throw new Error(
      "Chain-change activity requires the same canonical wallet."
    );
  }

  if (
    previousWallet.chain.namespace ===
    nextWallet.chain.namespace
  ) {
    throw new Error(
      "Chain-change activity requires a changed chain."
    );
  }

  return createTradingActivityEvent({
    id:
      activityId(
        "wallet-chain-changed",
        `${nextWallet.walletId}:${nextWallet.chain.namespace}:${sequence}`
      ),

    domain:
      "SECURITY",

    type:
      "UPDATED",

    severity:
      "INFO",

    title:
      "Wallet network changed",

    description:
      `Wallet network changed from ${previousWallet.chain.namespace} to ${nextWallet.chain.namespace}.`,

    actor:
      userActor(context),

    references: [
      {
        kind:
          "wallet",
        ref:
          nextWallet.walletId,
      },
      {
        kind:
          "previous-chain",
        ref:
          previousWallet.chain.namespace,
      },
      {
        kind:
          "current-chain",
        ref:
          nextWallet.chain.namespace,
      },
    ],

    occurredAt,

    sequence,
  });
}

export function activityFromWalletBindingCreated(
  binding:
    WalletBinding,
  sequence:
    number
): TradingActivityEvent {
  if (
    binding.state !==
    "active"
  ) {
    throw new Error(
      "Created wallet-binding activity requires an active binding."
    );
  }

  return createTradingActivityEvent({
    id:
      activityId(
        "wallet-binding-created",
        binding.bindingId
      ),

    domain:
      "SECURITY",

    type:
      "CREATED",

    severity:
      "SUCCESS",

    title:
      "Wallet binding created",

    description:
      "A verified wallet association was created. The binding does not grant unrestricted application authority.",

    actor: {
      type:
        "USER",

      ref:
        binding.userId,
    },

    references: [
      {
        kind:
          "wallet-binding",
        ref:
          binding.bindingId,
      },
      {
        kind:
          "wallet",
        ref:
          binding.walletId,
      },
      {
        kind:
          "user",
        ref:
          binding.userId,
      },
      {
        kind:
          "tenant",
        ref:
          binding.tenantId,
      },
      {
        kind:
          "chain",
        ref:
          binding.chain.namespace,
      },
      ...(binding.proofId
        ? [
            {
              kind:
                "wallet-proof",
              ref:
                binding.proofId,
            },
          ]
        : []),
    ],

    occurredAt:
      binding.verifiedAt ??
      binding.createdAt,

    sequence,
  });
}

export function activityFromWalletBindingRevoked(
  binding:
    WalletBinding,
  sequence:
    number
): TradingActivityEvent {
  if (
    binding.state !==
      "revoked" ||
    !binding.revokedAt
  ) {
    throw new Error(
      "Revoked wallet-binding activity requires revoked binding evidence."
    );
  }

  return createTradingActivityEvent({
    id:
      activityId(
        "wallet-binding-revoked",
        binding.bindingId
      ),

    domain:
      "SECURITY",

    type:
      "CANCELLED",

    severity:
      "WARNING",

    title:
      "Wallet binding revoked",

    description:
      binding.revocationReason
        ? `Wallet association was revoked: ${binding.revocationReason}.`
        : "Wallet association was revoked.",

    actor: {
      type:
        "USER",

      ref:
        binding.userId,
    },

    references: [
      {
        kind:
          "wallet-binding",
        ref:
          binding.bindingId,
      },
      {
        kind:
          "wallet",
        ref:
          binding.walletId,
      },
      {
        kind:
          "user",
        ref:
          binding.userId,
      },
      {
        kind:
          "tenant",
        ref:
          binding.tenantId,
      },
    ],

    occurredAt:
      binding.revokedAt,

    sequence,
  });
}

export function activityFromWalletOwnershipObserved(
  bound:
    BoundWalletOwnershipEvidence,
  sequence:
    number
): TradingActivityEvent {
  const {
    evidence,
  } = bound;

  return createTradingActivityEvent({
    id:
      activityId(
        "wallet-ownership-observed",
        evidence.evidenceId
      ),

    domain:
      "BLOCKCHAIN",

    type:
      evidence.status ===
        "verified"
        ? "VERIFIED"
        : evidence.status ===
            "failed"
          ? "FAILED"
          : evidence.status ===
              "stale"
            ? "WARNING"
            : "CAPTURED",

    severity:
      evidence.status ===
        "verified"
        ? "SUCCESS"
        : evidence.status ===
            "failed"
          ? "ERROR"
          : evidence.status ===
              "stale"
            ? "WARNING"
            : "INFO",

    title:
      "Wallet ownership evidence observed",

    description:
      "Blockchain asset observations were projected into Activity Center. Holdings do not grant authority or establish legal ownership.",

    actor: {
      type:
        "USER",

      ref:
        bound.userId,
    },

    references: [
      {
        kind:
          "ownership-evidence",
        ref:
          evidence.evidenceId,
      },
      {
        kind:
          "wallet-binding",
        ref:
          bound.bindingId,
      },
      {
        kind:
          "wallet",
        ref:
          evidence.walletId,
      },
      {
        kind:
          "tenant",
        ref:
          bound.tenantId,
      },
      {
        kind:
          "chain",
        ref:
          evidence.chain.namespace,
      },
    ],

    occurredAt:
      evidence.lastVerifiedAt ??
      evidence.observedAt,

    sequence,
  });
}
