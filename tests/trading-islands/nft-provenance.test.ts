import assert from "node:assert/strict";
import test from "node:test";

import {
  validateNftProvenance,
} from "../../src/trading/nft/provenance/validation";

import {
  nftProvenanceFixture,
} from "../../src/trading/nft/provenance/fixtures";

test(
  "provenance fixture validates",
  () => {
    const result =
      validateNftProvenance(
        nftProvenanceFixture
      );

    assert.equal(
      result.valid,
      true
    );

    assert.deepEqual(
      result.issues,
      []
    );
  }
);

test(
  "provenance fixture includes Origin DNA and blockchain evidence",
  () => {
    const kinds =
      new Set(
        nftProvenanceFixture.evidence.map(
          (evidence) =>
            evidence.kind
        )
      );

    assert.equal(
      kinds.has("ORIGIN"),
      true
    );

    assert.equal(
      kinds.has("DNA_IDENTITY"),
      true
    );

    assert.equal(
      kinds.has("DNA_INTEGRITY"),
      true
    );

    assert.equal(
      kinds.has("BLOCKCHAIN_PROOF"),
      true
    );
  }
);

test(
  "duplicate evidence ids are rejected",
  () => {
    const duplicate =
      nftProvenanceFixture.evidence[0];

    const result =
      validateNftProvenance({
        ...nftProvenanceFixture,

        evidence: [
          ...nftProvenanceFixture.evidence,
          duplicate,
        ],
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "DUPLICATE_EVIDENCE_ID"
      )
    );
  }
);

test(
  "broken provenance link source is rejected",
  () => {
    const broken = {
      ...nftProvenanceFixture.links[0],

      fromEvidenceId:
        "missing-evidence",
    };

    const result =
      validateNftProvenance({
        ...nftProvenanceFixture,

        links: [
          broken,
          ...nftProvenanceFixture.links.slice(1),
        ],
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "BROKEN_LINK_SOURCE"
      )
    );
  }
);

test(
  "broken provenance link target is rejected",
  () => {
    const broken = {
      ...nftProvenanceFixture.links[0],

      toEvidenceId:
        "missing-evidence",
    };

    const result =
      validateNftProvenance({
        ...nftProvenanceFixture,

        links: [
          broken,
          ...nftProvenanceFixture.links.slice(1),
        ],
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "BROKEN_LINK_TARGET"
      )
    );
  }
);

test(
  "self-referential provenance links are rejected",
  () => {
    const evidenceId =
      nftProvenanceFixture.evidence[0].id;

    const selfLink = {
      ...nftProvenanceFixture.links[0],

      fromEvidenceId:
        evidenceId,

      toEvidenceId:
        evidenceId,
    };

    const result =
      validateNftProvenance({
        ...nftProvenanceFixture,

        links: [
          selfLink,
          ...nftProvenanceFixture.links.slice(1),
        ],
      });

    assert.equal(
      result.valid,
      false
    );

    assert.ok(
      result.issues.some(
        (issue) =>
          issue.code ===
          "SELF_REFERENTIAL_LINK"
      )
    );
  }
);

test(
  "provenance remains explicitly non-authoritative",
  () => {
    assert.equal(
      nftProvenanceFixture.authoritative,
      false
    );

    for (
      const evidence
      of nftProvenanceFixture.evidence
    ) {
      assert.equal(
        evidence.authoritative,
        false
      );
    }

    for (
      const link
      of nftProvenanceFixture.links
    ) {
      assert.equal(
        link.authoritative,
        false
      );
    }
  }
);
