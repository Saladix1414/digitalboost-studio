import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/server/infrastructure/object-storage/",
    import.meta.url
  );

function source(
  file:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      file,
      root
    ),
    "utf8"
  );
}

test(
  "object storage foundation has no concrete cloud SDK",
  () => {
    const content =
      source(
        "S3DriverTypes.ts"
      ) +
      source(
        "S3ObjectStorageAdapter.ts"
      ) +
      source(
        "index.ts"
      );

    assert.doesNotMatch(
      content,
      /@aws-sdk|aws-sdk|minio|cloudflare|r2\b|supabase/
    );
  }
);

test(
  "object storage cannot grant authority",
  () => {
    const content =
      source(
        "S3ObjectStorageAdapter.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true|grantsAuthority:\s*true|sourceOfTruth:\s*true/
    );
  }
);

test(
  "object storage does not make provenance claims",
  () => {
    const content =
      source(
        "S3ObjectStorageAdapter.ts"
      );

    assert.doesNotMatch(
      content,
      /authenticityVerified|ownershipVerified|provenanceVerified|legalOwner|certifiedAuthentic/
    );
  }
);

test(
  "object storage exposes no product execution primitive",
  () => {
    const content =
      source(
        "S3ObjectStorageAdapter.ts"
      );

    assert.doesNotMatch(
      content,
      /executeTrade|executeOrder|placeOrder|sendTransaction|eth_sendTransaction|runLiveBot|mintNFT/
    );
  }
);

test(
  "object storage validates object keys",
  () => {
    const content =
      source(
        "S3ObjectStorageAdapter.ts"
      );

    assert.match(
      content,
      /assertObjectKey/
    );

    assert.match(
      content,
      /includes\(\s*"\.\."\s*\)/
    );
  }
);
