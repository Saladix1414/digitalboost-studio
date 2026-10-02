import assert from "node:assert/strict";
import test from "node:test";

import {
  validateProvenanceConsistency,
} from "../../src/trading/nft/provenance/consistency";

import {
  nftProvenanceClosureFixture,
} from "../../src/trading/nft/provenance/closureFixtures";

test(
  "provenance cross-domain fixture is consistent",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    const result =
      validateProvenanceConsistency(
        fixture.provenance,
        fixture.history,
        fixture.origin,
        fixture.dna
      );

    assert.equal(
      result.consistent,
      true
    );

    assert.deepEqual(
      result.issues,
      []
    );
  }
);

test(
  "asset mismatch is rejected",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    const result =
      validateProvenanceConsistency(
        {
          ...fixture.provenance,

          assetId:
            "tampered-asset",
        },
        fixture.history,
        fixture.origin,
        fixture.dna
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "ASSET_ID_MISMATCH"
      )
    );
  }
);

test(
  "collection mismatch is rejected",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    const result =
      validateProvenanceConsistency(
        {
          ...fixture.provenance,

          collectionId:
            "tampered-collection",
        },
        fixture.history,
        fixture.origin,
        fixture.dna
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "COLLECTION_ID_MISMATCH"
      )
    );
  }
);

test(
  "creator mismatch is rejected",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    const result =
      validateProvenanceConsistency(
        {
          ...fixture.provenance,

          creatorRef:
            "tampered-creator",
        },
        fixture.history,
        fixture.origin,
        fixture.dna
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "CREATOR_REF_MISMATCH"
      )
    );
  }
);

test(
  "missing Origin evidence is rejected",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    const evidence =
      fixture.provenance.evidence.filter(
        (entry) =>
          entry.kind !==
          "ORIGIN"
      );

    const result =
      validateProvenanceConsistency(
        {
          ...fixture.provenance,
          evidence,
        },
        fixture.history,
        fixture.origin,
        fixture.dna
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "ORIGIN_EVIDENCE_MISSING"
      )
    );
  }
);

test(
  "missing blockchain proof evidence is rejected when DNA carries proof",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    const evidence =
      fixture.provenance.evidence.filter(
        (entry) =>
          entry.kind !==
          "BLOCKCHAIN_PROOF"
      );

    const result =
      validateProvenanceConsistency(
        {
          ...fixture.provenance,
          evidence,
        },
        fixture.history,
        fixture.origin,
        fixture.dna
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "BLOCKCHAIN_PROOF_EVIDENCE_MISSING"
      )
    );
  }
);

test(
  "history latest version mismatch is rejected",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    const result =
      validateProvenanceConsistency(
        {
          ...fixture.provenance,

          version:
            99,
        },
        fixture.history,
        fixture.origin,
        fixture.dna
      );

    assert.equal(
      result.consistent,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "HISTORY_LATEST_VERSION_MISMATCH"
      )
    );
  }
);
