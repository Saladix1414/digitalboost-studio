export const APPROVAL_PERSISTENCE_LOCK_NAME =
  "digitalboost.trading.approval.persistence";

export type ApprovalPersistenceCoordinator = {
  runExclusive<T>(
    operation:
      () => Promise<T>
  ):
    Promise<T>;

  readonly authoritative:
    false;
};

export function createLocalApprovalPersistenceCoordinator():
  ApprovalPersistenceCoordinator {
  return {
    authoritative:
      false,

    async runExclusive<T>(
      operation:
        () => Promise<T>
    ):
      Promise<T> {
      return operation();
    },
  };
}

type BrowserLockManager = {
  request<T>(
    name:
      string,

    callback:
      () => Promise<T>
  ):
    Promise<T>;
};

type NavigatorWithLocks =
  Navigator & {
    readonly locks?:
      BrowserLockManager;
  };

export function createBrowserApprovalPersistenceCoordinator():
  ApprovalPersistenceCoordinator {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return createLocalApprovalPersistenceCoordinator();
  }

  const browserNavigator =
    navigator as
      NavigatorWithLocks;

  const lockManager =
    browserNavigator.locks;

  if (
    !lockManager
  ) {
    return createLocalApprovalPersistenceCoordinator();
  }

  return {
    authoritative:
      false,

    async runExclusive<T>(
      operation:
        () => Promise<T>
    ):
      Promise<T> {
      return lockManager.request(
        APPROVAL_PERSISTENCE_LOCK_NAME,
        operation
      );
    },
  };
}
