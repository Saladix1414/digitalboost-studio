import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import type {
  ObjectStoragePort,
} from "../../../infrastructure/core/objectStorage";

import type {
  InfrastructureProviderConfiguration,
} from "../../../infrastructure/core/configuration";

import type {
  InfrastructureEnvironmentSource,
} from "../DigitalBoostInfrastructureEnvironment";

import {
  createS3ObjectStorageAdapter,
} from "./S3ObjectStorageAdapter";

import type {
  S3ObjectStorageClientLike,
  S3PutObjectInput,
  S3StoredObject,
} from "./S3DriverTypes";

export type ManagedS3ClientLike =
  S3ObjectStorageClientLike & {
    destroy():
      void;
  };

export type S3ClientFactory =
  (
    input: {
      readonly endpoint:
        string;

      readonly bucket:
        string;
    }
  ) =>
    ManagedS3ClientLike;

export type S3ServerComposition = {
  readonly enabled:
    boolean;

  readonly storage:
    ObjectStoragePort | null;

  readonly authoritative:
    false;

  close():
    Promise<void>;
};

async function bodyToUint8Array(
  body:
    unknown
):
  Promise<Uint8Array> {
  if (
    body &&
    typeof body ===
      "object" &&
    "transformToByteArray" in body &&
    typeof (
      body as {
        transformToByteArray?:
          () => Promise<Uint8Array>;
      }
    ).transformToByteArray ===
      "function"
  ) {
    return (
      body as {
        transformToByteArray:
          () => Promise<Uint8Array>;
      }
    ).transformToByteArray();
  }

  throw new Error(
    "S3 response body cannot be converted to bytes."
  );
}

function createAwsS3Client(
  input: {
    readonly endpoint:
      string;

    readonly bucket:
      string;
  }
):
  ManagedS3ClientLike {
  const client =
    new S3Client({
      endpoint:
        input.endpoint,

      forcePathStyle:
        true,
    });

  const bucket =
    input.bucket;

  return {
    async putObject(
      object:
        S3PutObjectInput
    ) {
      const result =
        await client.send(
          new PutObjectCommand({
            Bucket:
              bucket,

            Key:
              object.key,

            Body:
              object.body,

            ContentType:
              object.contentType,

            Metadata:
              object.metadata,
          })
        );

      return {
        etag:
          result.ETag ??
          null,
      };
    },

    async getObject(
      key:
        string
    ):
      Promise<
        S3StoredObject | null
      > {
      try {
        const result =
          await client.send(
            new GetObjectCommand({
              Bucket:
                bucket,

              Key:
                key,
            })
          );

        if (
          result.Body ===
            undefined
        ) {
          return null;
        }

        return {
          key,

          body:
            await bodyToUint8Array(
              result.Body
            ),

          contentType:
            result.ContentType ??
            "application/octet-stream",

          etag:
            result.ETag ??
            null,

          metadata:
            result.Metadata ??
            {},
        };
      } catch (
        error
      ) {
        const status =
          (
            error as {
              $metadata?: {
                httpStatusCode?:
                  number;
              };
            }
          ).$metadata?.httpStatusCode;

        if (
          status ===
            404
        ) {
          return null;
        }

        throw error;
      }
    },

    async deleteObject(
      key:
        string
    ):
      Promise<void> {
      await client.send(
        new DeleteObjectCommand({
          Bucket:
            bucket,

          Key:
            key,
        })
      );
    },

    async headObject(
      key:
        string
    ) {
      try {
        const result =
          await client.send(
            new HeadObjectCommand({
              Bucket:
                bucket,

              Key:
                key,
            })
          );

        return {
          exists:
            true,

          etag:
            result.ETag ??
            null,
        };
      } catch (
        error
      ) {
        const status =
          (
            error as {
              $metadata?: {
                httpStatusCode?:
                  number;
              };
            }
          ).$metadata?.httpStatusCode;

        if (
          status ===
            404
        ) {
          return {
            exists:
              false,

            etag:
              null,
          };
        }

        throw error;
      }
    },

    destroy():
      void {
      client.destroy();
    },
  };
}

function requireStorageValue(
  name:
    string,

  value:
    string | undefined
):
  string {
  const normalized =
    value?.trim();

  if (
    normalized ===
      undefined ||
    normalized.length ===
      0
  ) {
    throw new Error(
      `${name} is required when object storage is enabled.`
    );
  }

  return normalized;
}

export function composeS3ObjectStorageFromEnvironment(
  input: {
    readonly configuration:
      InfrastructureProviderConfiguration;

    readonly source:
      InfrastructureEnvironmentSource;

    readonly clientFactory?:
      S3ClientFactory;
  }
):
  S3ServerComposition {
  if (
    input.configuration.objectStorage.provider ===
      "disabled"
  ) {
    return {
      enabled:
        false,

      storage:
        null,

      authoritative:
        false,

      async close():
        Promise<void> {
        // No S3 client exists.
      },
    };
  }

  if (
    input.configuration.objectStorage.provider !==
      "s3-compatible"
  ) {
    throw new Error(
      "Unsupported object storage provider."
    );
  }

  if (
    input.configuration.objectStorage.endpointReference !==
      "env:OBJECT_STORAGE_ENDPOINT"
  ) {
    throw new Error(
      "Object storage requires env:OBJECT_STORAGE_ENDPOINT."
    );
  }

  if (
    input.configuration.objectStorage.bucketReference !==
      "env:OBJECT_STORAGE_BUCKET"
  ) {
    throw new Error(
      "Object storage requires env:OBJECT_STORAGE_BUCKET."
    );
  }

  const endpoint =
    requireStorageValue(
      "OBJECT_STORAGE_ENDPOINT",
      input.source.OBJECT_STORAGE_ENDPOINT
    );

  const bucket =
    requireStorageValue(
      "OBJECT_STORAGE_BUCKET",
      input.source.OBJECT_STORAGE_BUCKET
    );

  const factory =
    input.clientFactory ??
    createAwsS3Client;

  const client =
    factory({
      endpoint,
      bucket,
    });

  const storage =
    createS3ObjectStorageAdapter(
      client,
      {
        source:
          "s3-compatible",
      }
    );

  let closed =
    false;

  return {
    enabled:
      true,

    storage,

    authoritative:
      false,

    async close():
      Promise<void> {
      if (
        closed
      ) {
        return;
      }

      closed =
        true;

      client.destroy();
    },
  };
}
