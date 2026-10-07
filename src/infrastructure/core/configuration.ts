export type InfrastructureEnvironment =
  | "development"
  | "test"
  | "production";

export type DatabaseProvider =
  | "disabled"
  | "postgresql";

export type CacheProvider =
  | "disabled"
  | "redis";

export type ObjectStorageProvider =
  | "disabled"
  | "s3-compatible";

export type QueueProvider =
  | "disabled"
  | "redis-queue";

export type InfrastructureProviderConfiguration = {
  readonly database: {
    readonly provider:
      DatabaseProvider;

    readonly connectionReference:
      string | null;

    readonly authoritative:
      false;
  };

  readonly cache: {
    readonly provider:
      CacheProvider;

    readonly connectionReference:
      string | null;

    readonly authoritative:
      false;
  };

  readonly objectStorage: {
    readonly provider:
      ObjectStorageProvider;

    readonly endpointReference:
      string | null;

    readonly bucketReference:
      string | null;

    readonly authoritative:
      false;
  };

  readonly queue: {
    readonly provider:
      QueueProvider;

    readonly connectionReference:
      string | null;

    readonly authoritative:
      false;
  };

  readonly environment:
    InfrastructureEnvironment;

  readonly authoritative:
    false;
};

export type InfrastructureConfigurationInput = {
  readonly environment:
    InfrastructureEnvironment;

  readonly databaseProvider?:
    DatabaseProvider;

  readonly databaseConnectionReference?:
    string | null;

  readonly cacheProvider?:
    CacheProvider;

  readonly cacheConnectionReference?:
    string | null;

  readonly objectStorageProvider?:
    ObjectStorageProvider;

  readonly objectStorageEndpointReference?:
    string | null;

  readonly objectStorageBucketReference?:
    string | null;

  readonly queueProvider?:
    QueueProvider;

  readonly queueConnectionReference?:
    string | null;
};

function normalizeReference(
  value:
    string | null | undefined
):
  string | null {
  if (
    value ===
      undefined ||
    value ===
      null
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length ===
    0
      ? null
      : normalized;
}

function requireReference(
  value:
    string | null,

  label:
    string
):
  string {
  if (
    value ===
      null
  ) {
    throw new Error(
      `${label} is required when its provider is enabled.`
    );
  }

  return value;
}

export function createInfrastructureProviderConfiguration(
  input:
    InfrastructureConfigurationInput
):
  InfrastructureProviderConfiguration {
  const databaseProvider =
    input.databaseProvider ??
    "disabled";

  const cacheProvider =
    input.cacheProvider ??
    "disabled";

  const objectStorageProvider =
    input.objectStorageProvider ??
    "disabled";

  const queueProvider =
    input.queueProvider ??
    "disabled";

  const databaseConnectionReference =
    normalizeReference(
      input.databaseConnectionReference
    );

  const cacheConnectionReference =
    normalizeReference(
      input.cacheConnectionReference
    );

  const objectStorageEndpointReference =
    normalizeReference(
      input.objectStorageEndpointReference
    );

  const objectStorageBucketReference =
    normalizeReference(
      input.objectStorageBucketReference
    );

  const queueConnectionReference =
    normalizeReference(
      input.queueConnectionReference
    );

  if (
    databaseProvider ===
      "postgresql"
  ) {
    requireReference(
      databaseConnectionReference,
      "Database connection reference"
    );
  }

  if (
    cacheProvider ===
      "redis"
  ) {
    requireReference(
      cacheConnectionReference,
      "Cache connection reference"
    );
  }

  if (
    objectStorageProvider ===
      "s3-compatible"
  ) {
    requireReference(
      objectStorageEndpointReference,
      "Object storage endpoint reference"
    );

    requireReference(
      objectStorageBucketReference,
      "Object storage bucket reference"
    );
  }

  if (
    queueProvider ===
      "redis-queue"
  ) {
    requireReference(
      queueConnectionReference,
      "Queue connection reference"
    );
  }

  return {
    database: {
      provider:
        databaseProvider,

      connectionReference:
        databaseProvider ===
          "disabled"
          ? null
          : databaseConnectionReference,

      authoritative:
        false,
    },

    cache: {
      provider:
        cacheProvider,

      connectionReference:
        cacheProvider ===
          "disabled"
          ? null
          : cacheConnectionReference,

      authoritative:
        false,
    },

    objectStorage: {
      provider:
        objectStorageProvider,

      endpointReference:
        objectStorageProvider ===
          "disabled"
          ? null
          : objectStorageEndpointReference,

      bucketReference:
        objectStorageProvider ===
          "disabled"
          ? null
          : objectStorageBucketReference,

      authoritative:
        false,
    },

    queue: {
      provider:
        queueProvider,

      connectionReference:
        queueProvider ===
          "disabled"
          ? null
          : queueConnectionReference,

      authoritative:
        false,
    },

    environment:
      input.environment,

    authoritative:
      false,
  };
}

export function createDisabledInfrastructureConfiguration(
  environment:
    InfrastructureEnvironment
):
  InfrastructureProviderConfiguration {
  return createInfrastructureProviderConfiguration({
    environment,
  });
}
