import assert from "node:assert/strict";
import test from "node:test";

import {
  validateNftProvenanceClosure,
} from "../../src/trading/nft/provenance/closure";

import {
  nftProvenanceClosureFixture,
} from "../../src/trading/nft/provenance/closureFixtures";

test(
  "PHASE 25 closes with complete coherent provenance evidence",
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
      result.valid,
      true
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
      result.issueCount,
      0
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);

test(
  "PHASE 25 closure remains non-authoritative",
  () => {
    const fixture =
      nftProvenanceClosureFixture;

    assert.equal(
      fixture.provenance.authoritative,
      false
    );

    assert.equal(
      fixture.history.authoritative,
      false
    );

    assert.equal(
      fixture.origin.authoritative,
      false
    );

    assert.equal(
      fixture.dna.authoritative,
      false
    );
  }
);
