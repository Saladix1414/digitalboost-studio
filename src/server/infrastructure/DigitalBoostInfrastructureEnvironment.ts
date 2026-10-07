import {
  createInfrastructureProviderConfiguration,
} from "../../infrastructure/core/configuration";

import type {
  InfrastructureEnvironment,
  InfrastructureProviderConfiguration,
} from "../../infrastructure/core/configuration";

export type InfrastructureEnvironmentSource = {
  readonly NODE_ENV?:
    string;

  readonly DIGITALBOOST_INFRA_DATABASE_PROVIDER?:
    string;

  readonly DATABASE_URL?:
    string;

  readonly DIGITALBOOST_INFRA_CACHE_PROVIDER?:
    string;

  readonly REDIS_URL?:
    string;

  readonly DIGITALBOOST_INFRA_OBJECT_STORAGE_PROVIDER?:
    string;

  readonly OBJECT_STORAGE_ENDPOINT?:
    string;

  readonly OBJECT_STORAGE_BUCKET?:
    string;

  readonly DIGITALBOOST_INFRA_QUEUE_PROVIDER?:
    string;

  readonly QUEUE_REDIS_URL?:
    string;
};

function parseEnvironment(
  value:
    string | undefined
):
  InfrastructureEnvironment {
  if (value === "production") {
    return "production";
  }

  if (value === "test") {
    return "test";
  }

  return "development";
}

function parseDatabaseProvider(
  value:
    string | undefined
):
  "disabled" | "postgresql" {
  if (
    value === undefined ||
    value.trim() === "" ||
    value === "disabled"
  ) {
    return "disabled";
  }

  if (value === "postgresql") {
    return "postgresql";
  }

  throw new Error(
    `Unsupported database provider: ${value}.`
  );
}

function parseCacheProvider(
  value:
    string | undefined
):
  "disabled" | "redis" {
  if (
    value === undefined ||
    value.trim() === "" ||
    value === "disabled"
  ) {
    return "disabled";
  }

  if (value === "redis") {
    return "redis";
  }

  throw new Error(
    `Unsupported cache provider: ${value}.`
  );
}

function parseObjectStorageProvider(
  value:
    string | undefined
):
  "disabled" | "s3-compatible" {
  if (
    value === undefined ||
    value.trim() === "" ||
    value === "disabled"
  ) {
    return "disabled";
  }

  if (value === "s3-compatible") {
    return "s3-compatible";
  }

  throw new Error(
    `Unsupported object storage provider: ${value}.`
  );
}

function parseQueueProvider(
  value:
    string | undefined
):
  "disabled" | "redis-queue" {
  if (
    value === undefined ||
    value.trim() === "" ||
    value === "disabled"
  ) {
    return "disabled";
  }

  if (value === "redis-queue") {
    return "redis-queue";
  }

  throw new Error(
    `Unsupported queue provider: ${value}.`
  );
}

function envReference(
  name:
    string,

  value:
    string | undefined
):
  string | null {
  if (
    value === undefined ||
    value.trim().length === 0
  ) {
    return null;
  }

  return `env:${name}`;
}

export function readInfrastructureEnvironment(
  source:
    InfrastructureEnvironmentSource
):
  InfrastructureProviderConfiguration {
  const databaseProvider =
    parseDatabaseProvider(
      source.DIGITALBOOST_INFRA_DATABASE_PROVIDER
    );

  const cacheProvider =
    parseCacheProvider(
      source.DIGITALBOOST_INFRA_CACHE_PROVIDER
    );

  const objectStorageProvider =
    parseObjectStorageProvider(
      source.DIGITALBOOST_INFRA_OBJECT_STORAGE_PROVIDER
    );

  const queueProvider =
    parseQueueProvider(
      source.DIGITALBOOST_INFRA_QUEUE_PROVIDER
    );

  return createInfrastructureProviderConfiguration({
    environment:
      parseEnvironment(
        source.NODE_ENV
      ),

    databaseProvider,

    databaseConnectionReference:
      databaseProvider === "postgresql"
        ? envReference(
            "DATABASE_URL",
            source.DATABASE_URL
          )
        : null,

    cacheProvider,

    cacheConnectionReference:
      cacheProvider === "redis"
        ? envReference(
            "REDIS_URL",
            source.REDIS_URL
          )
        : null,

    objectStorageProvider,

    objectStorageEndpointReference:
      objectStorageProvider === "s3-compatible"
        ? envReference(
            "OBJECT_STORAGE_ENDPOINT",
            source.OBJECT_STORAGE_ENDPOINT
          )
        : null,

    objectStorageBucketReference:
      objectStorageProvider === "s3-compatible"
        ? envReference(
            "OBJECT_STORAGE_BUCKET",
            source.OBJECT_STORAGE_BUCKET
          )
        : null,

    queueProvider,

    queueConnectionReference:
      queueProvider === "redis-queue"
        ? envReference(
            "QUEUE_REDIS_URL",
            source.QUEUE_REDIS_URL
          )
        : null,
  });
}
