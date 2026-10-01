import {
  readApprovalEnvironmentConfig,
} from "./approvalEnvironmentConfig";

import {
  selectApprovalPersistence,
} from "./approvalPersistenceMode";

import {
  createBrowserApprovalPersistenceCoordinator,
} from "./approvalCoordination";

import {
  useEffect,
  useSyncExternalStore,
} from "react";

import {
  acceptApprovalStoreReview,
  bootstrapApprovalStore,
  configureApprovalStoreCoordinator,
  configureApprovalStorePersistence,
  getApprovalStoreActiveReview,
  getApprovalPersistenceWriteState,
  getApprovalStoreLifecycle,
  getApprovalStoreSnapshot,
  hydrateApprovalStore,
  markApprovalStoreStale,
  persistApprovalStore,
  recoverApprovalStorePersistence,
  subscribeApprovalStore,
} from "./approvalStore";

import {
  APPROVAL_STORAGE_KEY,
} from "./localApprovalPersistence";

let browserPersistenceStarted =
  false;

function handleApprovalStorageChange(
  event:
    StorageEvent
): void {
  if (
    event.key !==
    APPROVAL_STORAGE_KEY
  ) {
    return;
  }

  markApprovalStoreStale();
}

function startBrowserApprovalPersistence():
  void {
  if (
    browserPersistenceStarted
  ) {
    return;
  }

  browserPersistenceStarted =
    true;

  configureApprovalStoreCoordinator(
    createBrowserApprovalPersistenceCoordinator()
  );

  const persistenceSelection =
    selectApprovalPersistence(
      readApprovalEnvironmentConfig()
    );

  configureApprovalStorePersistence(
    persistenceSelection.persistence
  );

  void hydrateApprovalStore();
}

export function useApprovalRepositoryStore() {
  const state =
    useSyncExternalStore(
      subscribeApprovalStore,
      getApprovalStoreSnapshot,
      getApprovalStoreSnapshot
    );

  const lifecycle =
    useSyncExternalStore(
      subscribeApprovalStore,
      getApprovalStoreLifecycle,
      getApprovalStoreLifecycle
    );

  const persistenceDiagnostics =
    useSyncExternalStore(
      subscribeApprovalStore,
      getApprovalPersistenceWriteState,
      getApprovalPersistenceWriteState
    );

  useEffect(
    () => {
      startBrowserApprovalPersistence();

      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      window.addEventListener(
        "storage",
        handleApprovalStorageChange
      );

      return () => {
        window.removeEventListener(
          "storage",
          handleApprovalStorageChange
        );
      };
    },
    []
  );

  return {
    state,

    lifecycle,

    persistenceDiagnostics,

    activeReview:
      getApprovalStoreActiveReview(),

    bootstrap:
      bootstrapApprovalStore,

    acceptReview:
      acceptApprovalStoreReview,

    hydrate:
      hydrateApprovalStore,

    persist:
      persistApprovalStore,

    recoverPersistence:
      recoverApprovalStorePersistence,
  } as const;
}
