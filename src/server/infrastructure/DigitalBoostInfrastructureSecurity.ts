import type {
  InfrastructureProviderConfiguration,
} from "../../infrastructure/core/configuration";

import type {
  InfrastructureEnvironmentSource,
} from "./DigitalBoostInfrastructureEnvironment";

export type InfrastructureSecurityIssue = {
  readonly code:
    string;

  readonly provider:
    "database"
    | "cache"
    | "object-storage"
    | "queue";

  readonly detail:
    string;
};

export type SafeInfrastructureRuntimeDescription = {
  readonly database:
    "disabled"
    | "configured";

  readonly cache:
    "disabled"
    | "configured";

  readonly objectStorage:
    "disabled"
    | "configured";

  readonly queue:
    "disabled"
    | "configured";

  readonly authoritative:
    false;
};

function requireNonEmpty(
  input: {
    readonly provider:
      InfrastructureSecurityIssue["provider"];

    readonly variable:
      string;

    readonly value:
      string | undefined;
  },

  issues:
    InfrastructureSecurityIssue[]
):
  string | null {
  const value =
    input.value?.trim();

  if (
    value === undefined ||
    value.length ===
      0
  ) {
    issues.push({
      code:
        "missing-secret",

      provider:
        input.provider,

      detail:
        `${input.variable} is required.`,
    });

    return null;
  }

  return value;
}

function validateUrl(
  input: {
    readonly provider:
      InfrastructureSecurityIssue["provider"];

    readonly variable:
      string;

    readonly value:
      string;

    readonly protocols:
      readonly string[];

    readonly forbidCredentials?:
      boolean;
  },

  issues:
    InfrastructureSecurityIssue[]
):
  void {
  let url:
    URL;

  try {
    url =
      new URL(
        input.value
      );
  } catch {
    issues.push({
      code:
        "invalid-url",

      provider:
        input.provider,

      detail:
        `${input.variable} must be a valid URL.`,
    });

    return;
  }

  if (
    !input.protocols.includes(
      url.protocol
    )
  ) {
    issues.push({
      code:
        "unsafe-protocol",

      provider:
        input.provider,

      detail:
        `${input.variable} uses an unsupported protocol.`,
    });
  }

  if (
    input.forbidCredentials ===
      true &&
    (
      url.username.length >
        0 ||
      url.password.length >
        0
    )
  ) {
    issues.push({
      code:
        "credentials-in-endpoint",

      provider:
        input.provider,

      detail:
        `${input.variable} must not embed credentials.`,
    });
  }
}

export function inspectInfrastructureRuntimeSecurity(
  input: {
    readonly configuration:
      InfrastructureProviderConfiguration;

    readonly source:
      InfrastructureEnvironmentSource;
  }
):
  readonly InfrastructureSecurityIssue[] {
  const issues:
    InfrastructureSecurityIssue[] =
    [];

  if (
    input.configuration.database.provider ===
      "postgresql"
  ) {
    if (
      input.configuration.database.connectionReference !==
        "env:DATABASE_URL"
    ) {
      issues.push({
        code:
          "invalid-secret-reference",

        provider:
          "database",

        detail:
          "Database connection reference must be env:DATABASE_URL.",
      });
    }

    const value =
      requireNonEmpty(
        {
          provider:
            "database",

          variable:
            "DATABASE_URL",

          value:
            input.source.DATABASE_URL,
        },
        issues
      );

    if (
      value !==
        null
    ) {
      validateUrl(
        {
          provider:
            "database",

          variable:
            "DATABASE_URL",

          value,

          protocols: [
            "postgres:",
            "postgresql:",
          ],
        },
        issues
      );
    }
  }

  if (
    input.configuration.cache.provider ===
      "redis"
  ) {
    if (
      input.configuration.cache.connectionReference !==
        "env:REDIS_URL"
    ) {
      issues.push({
        code:
          "invalid-secret-reference",

        provider:
          "cache",

        detail:
          "Cache connection reference must be env:REDIS_URL.",
      });
    }

    const value =
      requireNonEmpty(
        {
          provider:
            "cache",

          variable:
            "REDIS_URL",

          value:
            input.source.REDIS_URL,
        },
        issues
      );

    if (
      value !==
        null
    ) {
      validateUrl(
        {
          provider:
            "cache",

          variable:
            "REDIS_URL",

          value,

          protocols: [
            "redis:",
            "rediss:",
          ],
        },
        issues
      );
    }
  }

  if (
    input.configuration.objectStorage.provider ===
      "s3-compatible"
  ) {
    if (
      input.configuration.objectStorage.endpointReference !==
        "env:OBJECT_STORAGE_ENDPOINT"
    ) {
      issues.push({
        code:
          "invalid-endpoint-reference",

        provider:
          "object-storage",

        detail:
          "Object storage endpoint reference must be env:OBJECT_STORAGE_ENDPOINT.",
      });
    }

    if (
      input.configuration.objectStorage.bucketReference !==
        "env:OBJECT_STORAGE_BUCKET"
    ) {
      issues.push({
        code:
          "invalid-bucket-reference",

        provider:
          "object-storage",

        detail:
          "Object storage bucket reference must be env:OBJECT_STORAGE_BUCKET.",
      });
    }

    const endpoint =
      requireNonEmpty(
        {
          provider:
            "object-storage",

          variable:
            "OBJECT_STORAGE_ENDPOINT",

          value:
            input.source.OBJECT_STORAGE_ENDPOINT,
        },
        issues
      );

    requireNonEmpty(
      {
        provider:
          "object-storage",

        variable:
          "OBJECT_STORAGE_BUCKET",

        value:
          input.source.OBJECT_STORAGE_BUCKET,
      },
      issues
    );

    if (
      endpoint !==
        null
    ) {
      validateUrl(
        {
          provider:
            "object-storage",

          variable:
            "OBJECT_STORAGE_ENDPOINT",

          value:
            endpoint,

          protocols: [
            "http:",
            "https:",
          ],

          forbidCredentials:
            true,
        },
        issues
      );
    }
  }

  if (
    input.configuration.queue.provider ===
      "redis-queue"
  ) {
    if (
      input.configuration.queue.connectionReference !==
        "env:QUEUE_REDIS_URL"
    ) {
      issues.push({
        code:
          "invalid-secret-reference",

        provider:
          "queue",

        detail:
          "Queue connection reference must be env:QUEUE_REDIS_URL.",
      });
    }

    const value =
      requireNonEmpty(
        {
          provider:
            "queue",

          variable:
            "QUEUE_REDIS_URL",

          value:
            input.source.QUEUE_REDIS_URL,
        },
        issues
      );

    if (
      value !==
        null
    ) {
      validateUrl(
        {
          provider:
            "queue",

          variable:
            "QUEUE_REDIS_URL",

          value,

          protocols: [
            "redis:",
            "rediss:",
          ],
        },
        issues
      );
    }
  }

  return issues;
}

export function assertSafeInfrastructureRuntimeConfiguration(
  input: {
    readonly configuration:
      InfrastructureProviderConfiguration;

    readonly source:
      InfrastructureEnvironmentSource;
  }
):
  void {
  const issues =
    inspectInfrastructureRuntimeSecurity(
      input
    );

  if (
    issues.length >
      0
  ) {
    const codes =
      issues
        .map(
          issue =>
            `${issue.provider}:${issue.code}`
        )
        .join(",");

    throw new Error(
      `Unsafe infrastructure configuration: ${codes}`
    );
  }
}

export function describeSafeInfrastructureRuntime(
  input: {
    readonly configuration:
      InfrastructureProviderConfiguration;
  }
):
  SafeInfrastructureRuntimeDescription {
  return {
    database:
      input.configuration.database.provider ===
        "disabled"
        ? "disabled"
        : "configured",

    cache:
      input.configuration.cache.provider ===
        "disabled"
        ? "disabled"
        : "configured",

    objectStorage:
      input.configuration.objectStorage.provider ===
        "disabled"
        ? "disabled"
        : "configured",

    queue:
      input.configuration.queue.provider ===
        "disabled"
        ? "disabled"
        : "configured",

    authoritative:
      false,
  };
}

export function sanitizeInfrastructureError(
  _error:
    unknown
):
  {
    readonly code:
      "infrastructure-operation-failed";

    readonly message:
      "Infrastructure operation failed.";

    readonly authoritative:
      false;
  } {
  return {
    code:
      "infrastructure-operation-failed",

    message:
      "Infrastructure operation failed.",

    authoritative:
      false,
  };
}
