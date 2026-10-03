import type {
  NftBlockchainGatewayState,
  NftBlockchainIndexEvidence,
  NftBlockchainSubmissionEvidence,
  NftBlockchainVerificationEvidence,
} from "../../nft/blockchain/types";

import {
  createTradingActivityEvent,
} from "../factory";

export function activityFromBlockchainSubmission(
  evidence:
    NftBlockchainSubmissionEvidence,
  sequence:
    number
) {
  return createTradingActivityEvent({
    id:
      `activity-blockchain-submitted:${evidence.requestId}:${evidence.txHash}`,

    domain:
      "BLOCKCHAIN",

    type:
      "SUBMITTED",

    severity:
      "INFO",

    title:
      "Blockchain evidence submitted",

    description:
      "Blockchain submission evidence was recorded.",

    actor: {
      type:
        "SYSTEM",

      ref:
        "digitalboost:blockchain-gateway",
    },

    references: [
      {
        kind:
          "request",

        ref:
          evidence.requestId,
      },

      {
        kind:
          "transactionHash",

        ref:
          evidence.txHash,
      },

      {
        kind:
          "chain",

        ref:
          evidence.chainRef,
      },
    ],

    occurredAt:
      evidence.submittedAt,

    sequence,
  });
}

export function activityFromBlockchainVerification(
  evidence:
    NftBlockchainVerificationEvidence,
  occurredAt:
    string,
  sequence:
    number
) {
  return createTradingActivityEvent({
    id:
      `activity-blockchain-verified:${evidence.requestId}:${evidence.txHash}`,

    domain:
      "BLOCKCHAIN",

    type:
      evidence.verified
        ? "VERIFIED"
        : "FAILED",

    severity:
      evidence.verified
        ? "SUCCESS"
        : "ERROR",

    title:
      evidence.verified
        ? "Blockchain evidence verified"
        : "Blockchain verification failed",

    description:
      evidence.verified
        ? "Blockchain evidence passed deterministic verification checks."
        : "Blockchain evidence did not pass verification checks.",

    actor: {
      type:
        "SYSTEM",

      ref:
        "digitalboost:blockchain-gateway",
    },

    references: [
      {
        kind:
          "request",

        ref:
          evidence.requestId,
      },

      {
        kind:
          "transactionHash",

        ref:
          evidence.txHash,
      },

      {
        kind:
          "chain",

        ref:
          evidence.chainRef,
      },
      ...(evidence.blockRef
        ? [
            {
              kind:
                "block",

              ref:
                evidence.blockRef,
            },
          ]
        : []),
    ],

    occurredAt,

    sequence,
  });
}

export function activityFromBlockchainIndex(
  evidence:
    NftBlockchainIndexEvidence,
  sequence:
    number
) {
  return createTradingActivityEvent({
    id:
      `activity-blockchain-indexed:${evidence.requestId}:${evidence.indexRef}`,

    domain:
      "BLOCKCHAIN",

    type:
      "INDEXED",

    severity:
      "SUCCESS",

    title:
      "Blockchain evidence indexed",

    description:
      "Verified blockchain evidence was indexed.",

    actor: {
      type:
        "SYSTEM",

      ref:
        "digitalboost:blockchain-gateway",
    },

    references: [
      {
        kind:
          "request",

        ref:
          evidence.requestId,
      },

      {
        kind:
          "transactionHash",

        ref:
          evidence.txHash,
      },

      {
        kind:
          "block",

        ref:
          evidence.blockRef,
      },

      {
        kind:
          "index",

        ref:
          evidence.indexRef,
      },
    ],

    occurredAt:
      evidence.indexedAt,

    sequence,
  });
}

export function activityFromBlockchainGatewayState(
  state:
    NftBlockchainGatewayState,
  occurredAt:
    string,
  sequence:
    number
) {
  const failed =
    state.stage ===
    "FAILED";

  return createTradingActivityEvent({
    id:
      `activity-blockchain-state:${state.id}:${state.attempt}:${state.stage}`,

    domain:
      "BLOCKCHAIN",

    type:
      failed
        ? "FAILED"
        : state.stage === "SUBMITTED"
          ? "SUBMITTED"
          : state.stage === "VERIFIED"
            ? "VERIFIED"
            : state.stage === "INDEXED"
              ? "INDEXED"
              : "UPDATED",

    severity:
      failed
        ? "ERROR"
        : "INFO",

    title:
      failed
        ? "Blockchain gateway failure"
        : `Blockchain gateway ${state.stage.toLowerCase()}`,

    description:
      failed
        ? `Gateway failure code ${state.failureCode}.`
        : `Gateway stage ${state.stage}, attempt ${state.attempt}.`,

    actor: {
      type:
        "SYSTEM",

      ref:
        "digitalboost:blockchain-gateway",
    },

    references: [
      {
        kind:
          "gatewayState",

        ref:
          state.id,
      },
    ],

    occurredAt,

    sequence,
  });
}
