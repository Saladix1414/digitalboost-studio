import assert from "node:assert/strict";
import test from "node:test";

import {
  validateNftProvenanceClosure,
} from "../../src/trading/nft/provenance/closure";

import {
  nftProvenanceClosureFixture,
} from "../../src/trading/nft/provenance/closureFixtures";

test(
  "full provenance closure passes for coherent evidence chain",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    const result =
      validateNftProvenanceClosure(
        fixture.provenance,
        fixture.history,
        fixture.origin,
        fixture.dna,
        fixture.lineage
      );

    assert.equal(
      result.provenanceValid,
      true
    );

    assert.equal(
      result.historyValid,
      true
    );

    assert.equal(
      result.originValid,
      true
    );

    assert.equal(
      result.dnaValid,
      true
    );

    assert.equal(
      result.consistencyValid,
      true
    );

    assert.equal(
      result.valid,
      true
    );

    assert.equal(
      result.authoritative,
      false
    );

    assert.equal(
      result.issueCount,
      0
    );
  }
);

test(
  "full provenance closure fails when current provenance is tampered",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    const result =
      validateNftProvenanceClosure(
        {
          ...fixture.provenance,

          creatorRef:
            "tampered-creator",
        },
        fixture.history,
        fixture.origin,
        fixture.dna,
        fixture.lineage
      );

    assert.equal(
      result.valid,
      false
    );

    assert.equal(
      result.consistencyValid,
      false
    );

    assert.ok(
      result.issueCount > 0
    );
  }
);
