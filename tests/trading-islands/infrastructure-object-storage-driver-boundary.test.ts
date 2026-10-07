import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const composition =
  fs.readFileSync(
    new URL(
      "../../src/server/infrastructure/object-storage/S3ServerComposition.ts",
      import.meta.url
    ),
    "utf8"
  );

const core =
  fs.readFileSync(
    new URL(
      "../../src/infrastructure/core/objectStorage.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "concrete S3 SDK stays server-side",
  () => {
    assert.match(
      composition,
      /@aws-sdk\/client-s3/
    );

    assert.doesNotMatch(
      core,
      /@aws-sdk/
    );
  }
);

test(
  "storage composition cannot grant authority",
  () => {
    assert.doesNotMatch(
      composition,
      /authoritative:\s*true|grantsAuthority:\s*true|sourceOfTruth:\s*true/
    );
  }
);

test(
  "storage composition makes no provenance claims",
  () => {
    assert.doesNotMatch(
      composition,
      /provenanceVerified|ownershipVerified|authenticityVerified|legalOwner|certifiedAuthentic/
    );
  }
);

test(
  "storage composition exposes no execution primitives",
  () => {
    assert.doesNotMatch(
      composition,
      /executeTrade|executeOrder|placeOrder|sendTransaction|runLiveBot|mintNFT/
    );
  }
);
