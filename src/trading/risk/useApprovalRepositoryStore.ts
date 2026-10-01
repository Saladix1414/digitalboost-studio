import {
  useSyncExternalStore,
} from "react";

import {
  acceptApprovalStoreReview,
  bootstrapApprovalStore,
  getApprovalStoreActiveReview,
  getApprovalStoreLifecycle,
  getApprovalStoreSnapshot,
  hydrateApprovalStore,
  persistApprovalStore,
  subscribeApprovalStore,
} from "./approvalStore";

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
