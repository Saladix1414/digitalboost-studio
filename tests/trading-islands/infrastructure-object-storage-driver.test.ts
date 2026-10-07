import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/object-storage/S3ServerComposition.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "object storage driver uses AWS S3 client",
  () => {
    assert.match(
      source,
      /@aws-sdk\/client-s3/
    );

    assert.match(
      source,
      /S3Client/
    );
  }
);

test(
  "object storage maps core commands",
  () => {
    assert.match(
      source,
      /PutObjectCommand/
    );

    assert.match(
      source,
      /GetObjectCommand/
    );

    assert.match(
      source,
      /HeadObjectCommand/
    );

    assert.match(
      source,
      /DeleteObjectCommand/
    );
  }
);
