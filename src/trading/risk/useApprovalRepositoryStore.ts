import {
  getApprovalRecoveryAttemptHistory,
  recordApprovalRecoveryAttemptHistory,
  subscribeApprovalRecoveryAttemptHistory,
} from "./approvalRecoveryAttemptHistoryStore";


import {
  getApprovalRemoteRetryHistory,
  subscribeApprovalRemoteRetryHistory,
} from "./approvalRemoteRetryHistoryStore";

import {
  beginApprovalRecoveryAttempt,
  completeApprovalRecoveryAttempt,
  createIdleApprovalRecoveryAttempt,
  failApprovalRecoveryAttempt,
} from "./approvalRecoveryAttempt";

import type {
  ApprovalRecoveryAttemptAction,
} from "./approvalRecoveryAttempt";

import {
  createApprovalBootstrapFailurePolicy,
} from "./approvalBootstrapFailurePolicy";

import type {
  ApprovalBootstrapFailurePolicy,
} from "./approvalBootstrapFailurePolicy";

import type {
  ApprovalPersistenceMode,
} from "./approvalPersistenceMode";

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
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  acceptApprovalStoreReview,
  bootstrapApprovalStore,
  configureApprovalStoreCoordinator,
  configureApprovalStorePersistence,
  getApprovalStoreActiveReview,
  getApprovalPersistenceWriteState,
  getApprovalRecoveryDiagnostic,
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

let browserPersistenceMode:
  ApprovalPersistenceMode =
    "local";

let browserBootstrapFailurePolicy:
  ApprovalBootstrapFailurePolicy =
    createApprovalBootstrapFailurePolicy(
      "local"
    );

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

  browserPersistenceMode =
    persistenceSelection.mode;

  browserBootstrapFailurePolicy =
    createApprovalBootstrapFailurePolicy(
      persistenceSelection.mode
    );

  configureApprovalStorePersistence(
    persistenceSelection.persistence
  );

  void hydrateApprovalStore();
}

export function useApprovalRepositoryStore() {
  const recoveryAttemptInFlight =
    useRef(
      false
    );

  const [
    recoveryAttempt,
    setRecoveryAttempt,
  ] = useState(
    createIdleApprovalRecoveryAttempt
  );


  const recoveryAttemptHistory =
    useSyncExternalStore(
      subscribeApprovalRecoveryAttemptHistory,
      getApprovalRecoveryAttemptHistory,
      getApprovalRecoveryAttemptHistory
    );


  const remoteRetryHistory =
    useSyncExternalStore(
      subscribeApprovalRemoteRetryHistory,
      getApprovalRemoteRetryHistory,
      getApprovalRemoteRetryHistory
    );

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


  const recoveryDiagnostic =
    useSyncExternalStore(
      subscribeApprovalStore,
      getApprovalRecoveryDiagnostic,
      getApprovalRecoveryDiagnostic
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

  const runRecoveryAttempt =
    async (
      action:
        ApprovalRecoveryAttemptAction
    ):
      Promise<boolean> => {
      if (
        recoveryAttemptInFlight.current
      ) {
        return false;
      }

      recoveryAttemptInFlight.current =
        true;

      setRecoveryAttempt(
        beginApprovalRecoveryAttempt(
          action
        )
      );

      try {
        if (
          action ===
          "recover-local"
        ) {
          await recoverApprovalStorePersistence();
        } else {
          await hydrateApprovalStore();
        }

        const resultingLifecycle =
          getApprovalStoreLifecycle();

        const resultingDiagnostic =
          getApprovalRecoveryDiagnostic();

        if (
          resultingLifecycle.status ===
          "ready"
        ) {
          setRecoveryAttempt(
            completeApprovalRecoveryAttempt(
              action
            )
          );

          recordApprovalRecoveryAttemptHistory(
            {
              action,

              status:
                "succeeded",

              diagnosticCode:
                null,
            }
          );

          return true;
        }

        setRecoveryAttempt(
          failApprovalRecoveryAttempt(
            action,
            resultingDiagnostic?.code ??
              null
          )
        );

        recordApprovalRecoveryAttemptHistory(
          {
            action,

            status:
              "failed",

            diagnosticCode:
              resultingDiagnostic?.code ??
              null,
          }
        );

        return false;
      } catch {
        const resultingDiagnostic =
          getApprovalRecoveryDiagnostic();

        const diagnosticCode =
          resultingDiagnostic?.code ??
          "unknown";

        setRecoveryAttempt(
          failApprovalRecoveryAttempt(
            action,
            diagnosticCode
          )
        );

        recordApprovalRecoveryAttemptHistory(
          {
            action,

            status:
              "failed",

            diagnosticCode,
          }
        );

        return false;
      } finally {
        recoveryAttemptInFlight.current =
          false;
      }
    };

  return {
    state,

    lifecycle,

    persistenceDiagnostics,

    recoveryDiagnostic,

    recoveryAttempt,

    recoveryAttemptHistory,

    remoteRetryHistory,

    runRecoveryAttempt,

    persistenceMode:
      browserPersistenceMode,

    bootstrapFailurePolicy:
      browserBootstrapFailurePolicy,

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
