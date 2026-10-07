import {
  infrastructureProvidersReady,
  selectInfrastructureProviders,
} from "../../infrastructure/core/providerSelection";

import type {
  InfrastructureProviderConfiguration,
} from "../../infrastructure/core/configuration";

export type InfrastructureBootstrapState = {
  readonly configuration:
    InfrastructureProviderConfiguration;

  readonly providers: {
    readonly database:
      boolean;

    readonly cache:
      boolean;

    readonly objectStorage:
      boolean;

    readonly queue:
      boolean;
  };

  readonly fullyConfigured:
    boolean;

  readonly concreteClientsCreated:
    false;

  readonly authoritative:
    false;
};

export function bootstrapInfrastructureConfiguration(
  configuration:
    InfrastructureProviderConfiguration
):
  InfrastructureBootstrapState {
  const selection =
    selectInfrastructureProviders(
      configuration
    );

  return {
    configuration,

    providers: {
      database:
        selection.databaseEnabled,

      cache:
        selection.cacheEnabled,

      objectStorage:
        selection.objectStorageEnabled,

      queue:
        selection.queueEnabled,
    },

    fullyConfigured:
      infrastructureProvidersReady(
        selection
      ),

    concreteClientsCreated:
      false,

    authoritative:
      false,
  };
}

export function describeInfrastructureBootstrap(
  state:
    InfrastructureBootstrapState
):
  string {
  const enabled = [
    state.providers.database
      ? "database"
      : null,

    state.providers.cache
      ? "cache"
      : null,

    state.providers.objectStorage
      ? "object-storage"
      : null,

    state.providers.queue
      ? "queue"
      : null,
  ].filter(
    (
      value
    ):
      value is string =>
      value !== null
  );

  if (enabled.length === 0) {
    return "infrastructure providers disabled";
  }

  return `infrastructure configured: ${enabled.join(", ")}`;
}
