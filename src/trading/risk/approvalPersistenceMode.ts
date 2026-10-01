import {
  createBrowserApprovalPersistence,
} from "./localApprovalPersistence";

import {
  createApprovalRemoteComposition,
} from "./approvalRemoteComposition";

import type {
  ApprovalRepositoryPersistence,
} from "./approvalPersistence";


export type ApprovalPersistenceMode =
  | "local"
  | "remote";


export type ApprovalLocalPersistenceConfig = {
  readonly mode:
    "local";
};


export type ApprovalRemotePersistenceConfig = {
  readonly mode:
    "remote";

  readonly baseUrl:
    string;

  readonly path?:
    string;

  readonly timeoutMs?:
    number;

  readonly fetchImpl?:
    typeof fetch;
};


export type ApprovalPersistenceConfig =
  | ApprovalLocalPersistenceConfig
  | ApprovalRemotePersistenceConfig;


export type ApprovalPersistenceSelection = {
  readonly mode:
    ApprovalPersistenceMode;

  readonly persistence:
    ApprovalRepositoryPersistence;

  readonly authoritative:
    false;
};


export function createDefaultApprovalPersistenceConfig():
  ApprovalLocalPersistenceConfig {
  return {
    mode:
      "local",
  };
}


function assertRemoteBaseUrl(
  baseUrl:
    string
):
  void {
  if (
    baseUrl.trim().length ===
    0
  ) {
    throw new Error(
      "Remote approval persistence requires baseUrl."
    );
  }
}


export function selectApprovalPersistence(
  config:
    ApprovalPersistenceConfig
):
  ApprovalPersistenceSelection {
  if (
    config.mode ===
    "local"
  ) {
    return {
      mode:
        "local",

      persistence:
        createBrowserApprovalPersistence(),

      authoritative:
        false,
    };
  }

  assertRemoteBaseUrl(
    config.baseUrl
  );

  const composition =
    createApprovalRemoteComposition({
      baseUrl:
        config.baseUrl,

      path:
        config.path,

      timeoutMs:
        config.timeoutMs,

      fetchImpl:
        config.fetchImpl,
    });

  return {
    mode:
      "remote",

    persistence:
      composition.persistence,

    authoritative:
      false,
  };
}
