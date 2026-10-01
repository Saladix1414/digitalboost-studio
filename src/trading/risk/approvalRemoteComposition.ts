import {
  createApprovalFetchHttpClient,
} from "./approvalFetchHttpClient";

import {
  createApprovalHttpBackendClient,
} from "./approvalHttpBackendClient";

import {
  createRemoteApprovalPersistence,
} from "./remoteApprovalPersistence";

import {
  configureApprovalStorePersistence,
} from "./approvalStore";

import type {
  ApprovalHttpClient,
} from "./approvalHttpClient";

import type {
  ApprovalBackendClient,
} from "./remoteApprovalPersistence";

import type {
  ApprovalRepositoryPersistence,
} from "./approvalPersistence";


export type ApprovalRemoteCompositionConfig = {
  readonly baseUrl:
    string;

  readonly path?:
    string;

  readonly timeoutMs?:
    number;

  readonly fetchImpl?:
    typeof fetch;
};


export type ApprovalRemoteComposition = {
  readonly mode:
    "remote";

  readonly httpClient:
    ApprovalHttpClient;

  readonly backendClient:
    ApprovalBackendClient;

  readonly persistence:
    ApprovalRepositoryPersistence;

  readonly authoritative:
    false;
};


export function createApprovalRemoteComposition(
  config:
    ApprovalRemoteCompositionConfig
):
  ApprovalRemoteComposition {
  const httpClient =
    createApprovalFetchHttpClient({
      baseUrl:
        config.baseUrl,

      fetchImpl:
        config.fetchImpl,
    });

  const backendClient =
    createApprovalHttpBackendClient(
      httpClient,
      {
        path:
          config.path,

        timeoutMs:
          config.timeoutMs,
      }
    );

  const persistence =
    createRemoteApprovalPersistence(
      backendClient
    );

  return {
    mode:
      "remote",

    httpClient,
    backendClient,
    persistence,

    authoritative:
      false,
  };
}


export function installApprovalRemotePersistence(
  composition:
    ApprovalRemoteComposition
):
  void {
  configureApprovalStorePersistence(
    composition.persistence
  );
}
