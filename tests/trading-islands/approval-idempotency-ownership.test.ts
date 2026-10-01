import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function source(
  file:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/risk/${file}`,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "persistence port carries optional mutation identity",
  () => {
    const content =
      source(
        "approvalPersistence.ts"
      );

    assert.match(
      content,
      /ApprovalPersistenceMutationContext/
    );

    assert.match(
      content,
      /readonly mutationId:/
    );

    assert.match(
      content,
      /mutation\?:[\s\S]*?ApprovalPersistenceMutationContext/
    );
  }
);


test(
  "store owns write and clear mutation identity",
  () => {
    const content =
      source(
        "approvalStore.ts"
      );

    assert.match(
      content,
      /createApprovalPersistenceMutationContext/
    );

    assert.match(
      content,
      /createApprovalPersistenceMutationContext\([\s\S]*?"write"/
    );

    assert.match(
      content,
      /adapter\.save\([\s\S]*?mutationContext/
    );

    assert.match(
      content,
      /createApprovalPersistenceMutationContext\([\s\S]*?"clear"/
    );

    assert.match(
      content,
      /adapter\.clear\([\s\S]*?mutationContext/
    );
  }
);


test(
  "remote persistence derives backend idempotency keys",
  () => {
    const content =
      source(
        "remoteApprovalPersistence.ts"
      );

    assert.match(
      content,
      /createApprovalBackendIdempotencyKey/
    );

    assert.match(
      content,
      /operation:[\s\S]*?"write"/
    );

    assert.match(
      content,
      /operation:[\s\S]*?"clear"/
    );

    assert.match(
      content,
      /mutation\.mutationId/
    );
  }
);


test(
  "mutation identity is non-authoritative metadata",
  () => {
    const content =
      source(
        "approvalPersistence.ts"
      );

    assert.match(
      content,
      /ApprovalPersistenceMutationContext[\s\S]*?readonly authoritative:[\s\S]*?false/
    );
  }
);
