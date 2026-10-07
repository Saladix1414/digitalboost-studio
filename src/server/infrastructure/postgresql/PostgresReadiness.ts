import type {
  DatabasePort,
} from "../../../infrastructure/core/database";

export type PostgresReadinessStatus =
  | "disabled"
  | "ready"
  | "unavailable";

export type PostgresReadiness = {
  readonly status:
    PostgresReadinessStatus;

  readonly checkedAt:
    string;

  readonly detail:
    string | null;

  readonly authoritative:
    false;
};

export async function checkPostgresReadiness(
  input: {
    readonly enabled:
      boolean;

    readonly database:
      DatabasePort | null;

    readonly now?:
      () => string;
  }
):
  Promise<
    PostgresReadiness
  > {
  const now =
    input.now ??
    (() =>
      new Date().toISOString());

  if (
    !input.enabled
  ) {
    return {
      status:
        "disabled",

      checkedAt:
        now(),

      detail:
        null,

      authoritative:
        false,
    };
  }

  if (
    input.database ===
      null
  ) {
    return {
      status:
        "unavailable",

      checkedAt:
        now(),

      detail:
        "PostgreSQL database adapter is unavailable.",

      authoritative:
        false,
    };
  }

  const health =
    await input.database.health();

  return {
    status:
      health.state ===
        "ready"
        ? "ready"
        : "unavailable",

    checkedAt:
      health.checkedAt,

    detail:
      health.detail,

    authoritative:
      false,
  };
}
