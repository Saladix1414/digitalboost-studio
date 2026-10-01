import {
  useEffect,
  useSyncExternalStore,
} from "react";

import {
  acceptApprovalStoreReview,
  bootstrapApprovalStore,
  configureApprovalStorePersistence,
  getApprovalStoreActiveReview,
  getApprovalStoreLifecycle,
  getApprovalStoreSnapshot,
  hydrateApprovalStore,
  persistApprovalStore,
  subscribeApprovalStore,
} from "./approvalStore";

import {
  createBrowserApprovalPersistence,
} from "./localApprovalPersistence";

let browserPersistenceStarted =
  false;

function startBrowserApprovalPersistence():
  void {
  if (
    browserPersistenceStarted
  ) {
    return;
  }

  browserPersistenceStarted =
    true;

  configureApprovalStorePersistence(
    createBrowserApprovalPersistence()
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

  useEffect(
    () => {
      startBrowserApprovalPersistence();
    },
    []
  );

  return {
    state,

    lifecycle,

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
  } as const;
}
