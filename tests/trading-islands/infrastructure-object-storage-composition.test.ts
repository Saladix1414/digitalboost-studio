import assert from "node:assert/strict";
import test from "node:test";

import {
  composeS3ObjectStorageFromEnvironment,
} from "../../src/server/infrastructure/object-storage/S3ServerComposition.ts";

import {
  readInfrastructureEnvironment,
} from "../../src/server/infrastructure/DigitalBoostInfrastructureEnvironment.ts";

import type {
  ManagedS3ClientLike,
  S3ClientFactory,
} from "../../src/server/infrastructure/object-storage/S3ServerComposition.ts";

function fakeClient(
  lifecycle?: {
    destroys:
      number;
  }
):
  ManagedS3ClientLike {
  return {
    async putObject() {
      return {
        etag:
          "etag",
      };
    },

    async getObject() {
      return null;
    },

    async deleteObject() {
      // fixture
    },

    async headObject() {
      return {
        exists:
          false,

        etag:
          null,
      };
    },

    destroy() {
      if (
        lifecycle
      ) {
        lifecycle.destroys +=
          1;
      }
    },
  };
}

test(
  "disabled storage creates no client",
  async () => {
    const config =
      readInfrastructureEnvironment({});

    let calls =
      0;

    const composition =
      composeS3ObjectStorageFromEnvironment({
        configuration:
          config,

        source: {},

        clientFactory:
          () => {
            calls +=
              1;

            return fakeClient();
          },
      });

    assert.equal(
      composition.enabled,
      false
    );

    assert.equal(
      composition.storage,
      null
    );

    assert.equal(
      calls,
      0
    );

    await composition.close();
  }
);

test(
  "enabled storage resolves endpoint and bucket only at server edge",
  async () => {
    const source = {
      DIGITALBOOST_INFRA_OBJECT_STORAGE_PROVIDER:
        "s3-compatible",

      OBJECT_STORAGE_ENDPOINT:
        "https://private.storage.internal",

      OBJECT_STORAGE_BUCKET:
        "private-bucket",
    };

    const config =
      readInfrastructureEnvironment(
        source
      );

    let observed:
      {
        endpoint:
          string;

        bucket:
          string;
      } | null =
      null;

    const factory:
      S3ClientFactory =
      input => {
        observed =
          input;

        return fakeClient();
      };

    const composition =
      composeS3ObjectStorageFromEnvironment({
        configuration:
          config,

        source,

        clientFactory:
          factory,
      });

    assert.equal(
      composition.enabled,
      true
    );

    assert.notEqual(
      composition.storage,
      null
    );

    assert.deepEqual(
      observed,
      {
        endpoint:
          source.OBJECT_STORAGE_ENDPOINT,

        bucket:
          source.OBJECT_STORAGE_BUCKET,
      }
    );

    assert.equal(
      config.authoritative,
      false
    );

    await composition.close();
  }
);

test(
  "storage close is idempotent",
  async () => {
    const lifecycle = {
      destroys:
        0,
    };

    const source = {
      DIGITALBOOST_INFRA_OBJECT_STORAGE_PROVIDER:
        "s3-compatible",

      OBJECT_STORAGE_ENDPOINT:
        "https://storage.example",

      OBJECT_STORAGE_BUCKET:
        "bucket",
    };

    const config =
      readInfrastructureEnvironment(
        source
      );

    const composition =
      composeS3ObjectStorageFromEnvironment({
        configuration:
          config,

        source,

        clientFactory:
          () =>
            fakeClient(
              lifecycle
            ),
      });

    await composition.close();
    await composition.close();

    assert.equal(
      lifecycle.destroys,
      1
    );
  }
);
