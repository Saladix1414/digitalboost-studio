export const RUNTIME_EVIDENCE_PERSISTENCE_LOCK_NAME =
  "digitalboost.trading.runtime-evidence.persistence";


export type RuntimeEvidenceCoordinator = {
  runExclusive<T>(
    operation:
      () => Promise<T>
  ):
    Promise<T>;

  readonly crossContextSafe:
    boolean;

  readonly authoritative:
    false;
};


export function createLocalRuntimeEvidenceCoordinator():
  RuntimeEvidenceCoordinator {
  return {
    crossContextSafe:
      false,

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


export function createBrowserRuntimeEvidenceCoordinator():
  RuntimeEvidenceCoordinator {
  const lockManager =
    typeof navigator !==
      "undefined"
      ? (
          navigator as Navigator & {
            locks?:
              BrowserLockManager;
          }
        ).locks
      : undefined;

  if (
    !lockManager ||
    typeof lockManager.request !==
      "function"
  ) {
    return createLocalRuntimeEvidenceCoordinator();
  }

  return {
    crossContextSafe:
      true,

    authoritative:
      false,

    async runExclusive<T>(
      operation:
        () => Promise<T>
    ):
      Promise<T> {
      return lockManager.request(
        RUNTIME_EVIDENCE_PERSISTENCE_LOCK_NAME,
        operation
      );
    },
  };
}
