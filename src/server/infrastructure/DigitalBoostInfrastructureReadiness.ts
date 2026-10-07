import type {
  InfrastructureFoundation,
} from "../../infrastructure/core/foundation";

export type UnifiedInfrastructureReadinessState =
  | "ready"
  | "degraded"
  | "unavailable";

export type UnifiedInfrastructureReadiness = {
  readonly status:
    UnifiedInfrastructureReadinessState;

  readonly database:
    string;

  readonly cache:
    string;

  readonly objectStorage:
    string;

  readonly queue:
    string;

  readonly checkedAt:
    string;

  readonly authoritative:
    false;
};

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

  const database =
    input.foundation.database ===
      null
      ? (
          input.providers.database
            ? "unavailable"
            : "disabled"
        )
      : (
          await input.foundation.database.health()
        ).state;

  const cache =
    input.foundation.cache ===
      null
      ? (
          input.providers.cache
            ? "unavailable"
            : "disabled"
        )
      : (
          await input.foundation.cache.health()
        ).state;

  const objectStorage =
    input.foundation.objectStorage ===
      null
      ? (
          input.providers.objectStorage
            ? "unavailable"
            : "disabled"
        )
      : "ready";

  const queue =
    input.foundation.queue ===
      null
      ? (
          input.providers.queue
            ? "unavailable"
            : "disabled"
        )
      : (
          await input.foundation.queue.health()
        ).state;

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
