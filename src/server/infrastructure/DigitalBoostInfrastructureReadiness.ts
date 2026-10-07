import type {
  InfrastructureFoundation,
} from "../../infrastructure/core/foundation";

export type UnifiedInfrastructureReadinessState =
  | "ready"
  | "degraded"
  | "unavailable";

type ProviderReadinessState =
  | "ready"
  | "degraded"
  | "unavailable"
  | "disabled";

export type UnifiedInfrastructureReadiness = {
  readonly status:
    UnifiedInfrastructureReadinessState;

  readonly database:
    ProviderReadinessState;

  readonly cache:
    ProviderReadinessState;

  readonly objectStorage:
    ProviderReadinessState;

  readonly queue:
    ProviderReadinessState;

  readonly checkedAt:
    string;

  readonly authoritative:
    false;
};

async function isolatedHealth(
  input: {
    readonly enabled:
      boolean;

    readonly health:
      (() => Promise<{
        readonly state:
          "ready"
          | "degraded"
          | "unavailable";
      }>)
      | null;
  }
):
  Promise<
    ProviderReadinessState
  > {
  if (
    !input.enabled
  ) {
    return "disabled";
  }

  if (
    input.health ===
      null
  ) {
    return "unavailable";
  }

  try {
    const health =
      await input.health();

    return health.state;
  } catch {
    return "unavailable";
  }
}

export async function checkUnifiedInfrastructureReadiness(
  input: {
    readonly foundation:
      InfrastructureFoundation;

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

    readonly now?:
      () => string;
  }
):
  Promise<
    UnifiedInfrastructureReadiness
  > {
  const now =
    input.now ??
    (() =>
      new Date().toISOString());

  const [
    database,
    cache,
    queue,
  ] =
    await Promise.all([
      isolatedHealth({
        enabled:
          input.providers.database,

        health:
          input.foundation.database ===
            null
            ? null
            : () =>
                input.foundation.database!.health(),
      }),

      isolatedHealth({
        enabled:
          input.providers.cache,

        health:
          input.foundation.cache ===
            null
            ? null
            : () =>
                input.foundation.cache!.health(),
      }),

      isolatedHealth({
        enabled:
          input.providers.queue,

        health:
          input.foundation.queue ===
            null
            ? null
            : () =>
                input.foundation.queue!.health(),
      }),
    ]);

  const objectStorage:
    ProviderReadinessState =
    input.providers.objectStorage
      ? (
          input.foundation.objectStorage ===
            null
            ? "unavailable"
            : "ready"
        )
      : "disabled";

  const states = [
    database,
    cache,
    objectStorage,
    queue,
  ];

  const status:
    UnifiedInfrastructureReadinessState =
    states.includes(
      "unavailable"
    )
      ? "unavailable"
      : states.includes(
          "degraded"
        )
        ? "degraded"
        : "ready";

  return {
    status,
    database,
    cache,
    objectStorage,
    queue,
    checkedAt:
      now(),

    authoritative:
      false,
  };
}
