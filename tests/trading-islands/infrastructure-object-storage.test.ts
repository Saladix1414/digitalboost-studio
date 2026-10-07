import assert from "node:assert/strict";
import test from "node:test";

import {
  createS3ObjectStorageAdapter,
} from "../../src/server/infrastructure/object-storage/index.ts";

import {
  createInfrastructureOperationContext,
} from "../../src/infrastructure/core/index.ts";

import type {
  S3ObjectStorageClientLike,
  S3PutObjectInput,
  S3StoredObject,
} from "../../src/server/infrastructure/object-storage/index.ts";

class FakeStorage
  implements S3ObjectStorageClientLike {
  readonly objects =
    new Map<
      string,
      S3StoredObject
    >();

  async putObject(
    input:
      S3PutObjectInput
  ) {
    const stored: S3StoredObject = {
      key:
        input.key,

      body:
        input.body,

      contentType:
        input.contentType,

      etag:
        "etag-fixture",

      metadata:
        input.metadata,
    };

    this.objects.set(
      input.key,
      stored
    );

    return {
      etag:
        "etag-fixture",
    };
  }

  async getObject(
    key:
      string
  ) {
    return this.objects.get(
      key
    ) ??
      null;
  }

  async deleteObject(
    key:
      string
  ):
    Promise<void> {
    this.objects.delete(
      key
    );
  }

  async headObject(
    key:
      string
  ) {
    const object =
      this.objects.get(
        key
      );

    return {
      exists:
        object !==
          undefined,

      etag:
        object?.etag ??
        null,
    };
  }
}

const operation =
  createInfrastructureOperationContext({
    requestedAt:
      "2026-10-07T23:50:00.000Z",
  });

test(
  "object storage adapter stores and reads bytes without authority",
  async () => {
    const driver =
      new FakeStorage();

    const storage =
      createS3ObjectStorageAdapter(
        driver,
        {
          now:
            () =>
              "2026-10-07T23:51:00.000Z",
        }
      );

    const body =
      new Uint8Array([
        1,
        2,
        3,
      ]);

    const result =
      await storage.put(
        {
          key:
            "assets/example.bin",

          body,

          contentType:
            "application/octet-stream",

          etag:
            null,

          metadata: {
            purpose:
              "test",
          },

          authoritative:
            false,
        },
        operation
      );

    assert.equal(
      result.authoritative,
      false
    );

    assert.equal(
      result.etag,
      "etag-fixture"
    );

    assert.equal(
      await storage.exists(
        "assets/example.bin",
        operation
      ),
      true
    );

    const loaded =
      await storage.get(
        "assets/example.bin",
        operation
      );

    assert.notEqual(
      loaded,
      null
    );

    assert.deepEqual(
      Array.from(
        loaded?.body ??
          []
      ),
      [
        1,
        2,
        3,
      ]
    );

    assert.equal(
      loaded?.authoritative,
      false
    );
  }
);

test(
  "object storage deletion removes object",
  async () => {
    const driver =
      new FakeStorage();

    const storage =
      createS3ObjectStorageAdapter(
        driver
      );

    await storage.put(
      {
        key:
          "tmp/delete-me.txt",

        body:
          new TextEncoder().encode(
            "delete"
          ),

        contentType:
          "text/plain",

        etag:
          null,

        metadata: {},

        authoritative:
          false,
      },
      operation
    );

    await storage.delete(
      "tmp/delete-me.txt",
      operation
    );

    assert.equal(
      await storage.exists(
        "tmp/delete-me.txt",
        operation
      ),
      false
    );
  }
);

test(
  "object storage rejects unsafe keys",
  async () => {
    const storage =
      createS3ObjectStorageAdapter(
        new FakeStorage()
      );

    await assert.rejects(
      () =>
        storage.exists(
          "../secret",
          operation
        ),
      /key is invalid/
    );

    await assert.rejects(
      () =>
        storage.exists(
          "/absolute",
          operation
        ),
      /key is invalid/
    );
  }
);

test(
  "object storage enforces payload size",
  async () => {
    const storage =
      createS3ObjectStorageAdapter(
        new FakeStorage(),
        {
          maxObjectBytes:
            2,
        }
      );

    await assert.rejects(
      () =>
        storage.put(
          {
            key:
              "oversized.bin",

            body:
              new Uint8Array([
                1,
                2,
                3,
              ]),

            contentType:
              "application/octet-stream",

            etag:
              null,

            metadata: {},

            authoritative:
              false,
          },
          operation
        ),
      /size limit/
    );
  }
);
