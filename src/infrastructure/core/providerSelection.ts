import type {
  InfrastructureProviderConfiguration,
} from "./configuration";

export type InfrastructureProviderSelection = {
  readonly databaseEnabled:
    boolean;

  readonly cacheEnabled:
    boolean;

  readonly objectStorageEnabled:
    boolean;

  readonly queueEnabled:
    boolean;

  readonly hasDurableDatabase:
    boolean;

  readonly hasDistributedCache:
    boolean;

  readonly hasDurableObjectStorage:
    boolean;

  readonly hasQueueTransport:
    boolean;

  readonly authoritative:
    false;
};

export function selectInfrastructureProviders(
  configuration:
    InfrastructureProviderConfiguration
):
  InfrastructureProviderSelection {
  return {
    databaseEnabled:
      configuration.database.provider !==
        "disabled",

    cacheEnabled:
      configuration.cache.provider !==
        "disabled",

    objectStorageEnabled:
      configuration.objectStorage.provider !==
        "disabled",

    queueEnabled:
      configuration.queue.provider !==
        "disabled",

    hasDurableDatabase:
      configuration.database.provider ===
        "postgresql",

    hasDistributedCache:
      configuration.cache.provider ===
        "redis",

    hasDurableObjectStorage:
      configuration.objectStorage.provider ===
        "s3-compatible",

    hasQueueTransport:
      configuration.queue.provider ===
        "redis-queue",

    authoritative:
      false,
  };
}

export function infrastructureProvidersReady(
  selection:
    InfrastructureProviderSelection
):
  boolean {
  return (
    selection.databaseEnabled &&
    selection.cacheEnabled &&
    selection.objectStorageEnabled &&
    selection.queueEnabled
  );
}
