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
  "remote retry is explicitly bounded",
  () => {
    const content =
      source(
        "approvalRemoteRetry.ts"
      );

    assert.match(
      content,
      /APPROVAL_REMOTE_MUTATION_MAX_ATTEMPTS/
    );

    assert.match(
      content,
      /=\s*2/
    );

    assert.match(
      content,
      /attempt-limit/
    );
  }
);


test(
  "remote retry requires idempotency",
  () => {
    const content =
      source(
        "approvalRemoteRetry.ts"
      );

    assert.match(
      content,
      /hasIdempotencyKey/
    );

    assert.match(
      content,
      /missing-idempotency/
    );
  }
);


test(
  "retry follows existing backend and HTTP retryability",
  () => {
    const content =
      source(
        "approvalRemoteRetry.ts"
      );

    assert.match(
      content,
      /isRetryableApprovalBackendError/
    );

    assert.match(
      content,
      /ApprovalHttpClientError/
    );

    assert.match(
      content,
      /error\.retryable/
    );
  }
);


test(
  "remote persistence derives idempotency once before retry execution",
  () => {
    const content =
      source(
        "remoteApprovalPersistence.ts"
      );

    assert.match(
      content,
      /const idempotencyKey =/
    );

    assert.match(
      content,
      /runApprovalRemoteMutationWithRetry/
    );

    assert.match(
      content,
      /client\.write\(\{[\s\S]*?idempotencyKey/
    );

    assert.match(
      content,
      /client\.clear\(\{[\s\S]*?idempotencyKey/
    );
  }
);


test(
  "retry metadata never becomes approval authority",
  () => {
    const content =
      source(
        "approvalRemoteRetry.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);
