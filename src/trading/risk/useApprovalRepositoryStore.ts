import {
  useSyncExternalStore,
} from "react";

import {
  acceptApprovalStoreReview,
  bootstrapApprovalStore,
  getApprovalStoreActiveReview,
  getApprovalStoreSnapshot,
  subscribeApprovalStore,
} from "./approvalStore";

export function useApprovalRepositoryStore() {
  const state =
    useSyncExternalStore(
      subscribeApprovalStore,
      getApprovalStoreSnapshot,
      getApprovalStoreSnapshot
    );

  return {
    state,

    activeReview:
      getApprovalStoreActiveReview(),

    bootstrap:
      bootstrapApprovalStore,

    acceptReview:
      acceptApprovalStoreReview,
  } as const;
}
