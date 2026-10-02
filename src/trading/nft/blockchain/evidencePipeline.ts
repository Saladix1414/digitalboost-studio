import {
  advanceBlockchainGatewayState,
} from "./gateway";

import {
  prepareNftBlockchainGatewayRequest,
} from "./pipeline";

import {
  createFixtureBlockchainSubmission,
} from "./submission";

import {
  verifyFixtureBlockchainSubmission,
} from "./verification";

import {
  indexVerifiedBlockchainEvidence,
} from "./indexing";

import type {
  NftBlockchainGatewayRequest,
} from "./types";

export function runFixtureBlockchainEvidencePipeline(
  request:
    NftBlockchainGatewayRequest,
  input: {
    readonly txHash:
      string;

    readonly blockRef:
      string;

    readonly submittedAt:
      string;

    readonly indexedAt:
      string;
  }
) {
  const prepared =
    prepareNftBlockchainGatewayRequest(
      request
    );

  if (
    prepared.state.stage !==
      "SEND_PREPARED" ||
    !prepared.preparation
  ) {
    throw new Error(
      "BLOCKCHAIN_GATEWAY_SEND_PREPARATION_REQUIRED"
    );
  }

  const submission =
    createFixtureBlockchainSubmission(
      prepared.preparation,
      {
        txHash:
          input.txHash,

        submittedAt:
          input.submittedAt,
      }
    );

  let state =
    advanceBlockchainGatewayState(
      prepared.state,
      "SUBMITTED"
    );

  const verification =
    verifyFixtureBlockchainSubmission(
      submission,
      {
        requestId:
          request.id,

        chainRef:
          request.chainRef,

        blockRef:
          input.blockRef,
      }
    );

  if (
    !verification.verified
  ) {
    return {
      state: {
        ...state,

        stage:
          "FAILED" as const,

        failureCode:
          "VERIFICATION_FAILED" as const,
      },

      prepared,

      submission,

      verification,

      index:
        null,

      authoritative:
        false as const,
    };
  }

  state =
    advanceBlockchainGatewayState(
      state,
      "VERIFIED"
    );

  const index =
    indexVerifiedBlockchainEvidence(
      verification,
      input.indexedAt
    );

  state =
    advanceBlockchainGatewayState(
      state,
      "INDEXED"
    );

  return {
    state,

    prepared,

    submission,

    verification,

    index,

    authoritative:
      false as const,
  };
}
