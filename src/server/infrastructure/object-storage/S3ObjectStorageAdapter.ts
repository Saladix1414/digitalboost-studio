import type {
  ObjectStorageObject,
  ObjectStoragePort,
} from "../../../infrastructure/core/objectStorage";

import type {
  InfrastructureOperationContext,
  InfrastructureResultMetadata,
} from "../../../infrastructure/core/types";

import type {
  S3ObjectStorageClientLike,
} from "./S3DriverTypes";

export type S3ObjectStorageAdapterOptions = {
  readonly source?:
    string;

  readonly now?:
    () => string;

  readonly maxObjectBytes?:
    number;
};

const DEFAULT_MAX_OBJECT_BYTES =
  25 * 1024 * 1024;

function resultMetadata(
  source:
    string,

  now:
    () => string
):
  InfrastructureResultMetadata {
  return {
    observedAt:
      now(),

    source,

    authoritative:
      false,
  };
}

function assertObjectKey(
  key:
    string
):
  void {
  const normalized =
    key.trim();

  if (
    normalized.length ===
      0
  ) {
    throw new Error(
      "Object storage key is required."
    );
  }

  if (
    normalized.startsWith(
      "/"
    ) ||
    normalized.includes(
      ".."
    ) ||
    normalized.includes(
      "\\"
    )
  ) {
    throw new Error(
      "Object storage key is invalid."
    );
  }
}

function assertContentType(
  contentType:
    string
):
  void {
  if (
    contentType.trim().length ===
      0
  ) {
    throw new Error(
      "Object storage content type is required."
    );
  }
}

function assertObjectSize(
  body:
    Uint8Array,

  maxObjectBytes:
    number
):
  void {
  if (
    body.byteLength >
      maxObjectBytes
  ) {
    throw new Error(
      "Object storage payload exceeds configured size limit."
    );
  }
}

export function createS3ObjectStorageAdapter(
  client:
    S3ObjectStorageClientLike,

  options:
    S3ObjectStorageAdapterOptions = {}
):
  ObjectStoragePort {
  const source =
    options.source ??
    "s3-compatible";

  const now =
    options.now ??
    (() =>
      new Date().toISOString());

  const maxObjectBytes =
    options.maxObjectBytes ??
    DEFAULT_MAX_OBJECT_BYTES;

  if (
    !Number.isSafeInteger(
      maxObjectBytes
    ) ||
    maxObjectBytes <=
      0
  ) {
    throw new Error(
      "Object storage maxObjectBytes must be a positive integer."
    );
  }

  return {
    async put(
      object:
        ObjectStorageObject,

      _operation:
        InfrastructureOperationContext
    ) {
      assertObjectKey(
        object.key
      );

      assertContentType(
        object.contentType
      );

      assertObjectSize(
        object.body,
        maxObjectBytes
      );

      const result =
        await client.putObject({
          key:
            object.key,

          body:
            object.body,

          contentType:
            object.contentType,

          metadata:
            object.metadata,
        });

      return {
        key:
          object.key,

        etag:
          result.etag,

        metadata:
          resultMetadata(
            source,
            now
          ),

        authoritative:
          false,
      };
    },

    async get(
      key:
        string,

      _operation:
        InfrastructureOperationContext
    ) {
      assertObjectKey(
        key
      );

      const stored =
        await client.getObject(
          key
        );

      if (
        stored ===
          null
      ) {
        return null;
      }

      return {
        key:
          stored.key,

        body:
          stored.body,

        contentType:
          stored.contentType,

        etag:
          stored.etag,

        metadata:
          stored.metadata,

        authoritative:
          false,
      };
    },

    async delete(
      key:
        string,

      _operation:
        InfrastructureOperationContext
    ):
      Promise<void> {
      assertObjectKey(
        key
      );

      await client.deleteObject(
        key
      );
    },

    async exists(
      key:
        string,

      _operation:
        InfrastructureOperationContext
    ):
      Promise<boolean> {
      assertObjectKey(
        key
      );

      const result =
        await client.headObject(
          key
        );

      return result.exists;
    },
  };
}
