import {
  nftProvenanceClosureFixture,
} from "../provenance/closureFixtures";

import type {
  NftAssetDetail,
  NftDetailEvidenceItem,
  NftDetailEvidenceSummary,
} from "./types";

export function composeNftDetailEvidence(
  detail:
    NftAssetDetail
): NftDetailEvidenceSummary {
  const fixture =
    nftProvenanceClosureFixture;

  const items:
    NftDetailEvidenceItem[] = [
      {
        id:
          "detail-evidence-origin",

        kind:
          "ORIGIN",

        label:
          "Origin record",

        reference:
          fixture.origin.id,

        status:
          fixture.origin.id
            ? "PRESENT"
            : "ABSENT",

        authoritative:
          false,
      },

      {
        id:
          "detail-evidence-dna-identity",

        kind:
          "DNA_IDENTITY",

        label:
          "DNA identity",

        reference:
          detail.integrity.dnaId ??
          "",

        status:
          detail.integrity.dnaId
            ? "PRESENT"
            : "ABSENT",

        authoritative:
          false,
      },

      {
        id:
          "detail-evidence-dna-integrity",

        kind:
          "DNA_INTEGRITY",

        label:
          "DNA integrity",

        reference:
          fixture.dna.integrity.metadataHash,

        status:
          fixture.dna.integrity.metadataHash
            ? "PRESENT"
            : "ABSENT",

        authoritative:
          false,
      },

      {
        id:
          "detail-evidence-blockchain-proof",

        kind:
          "BLOCKCHAIN_PROOF",

        label:
          "Blockchain proof",

        reference:
          fixture.dna.blockchainProof?.txHash ??
          "",

        status:
          fixture.dna.blockchainProof
            ? "PRESENT"
            : "ABSENT",

        authoritative:
          false,
      },

      {
        id:
          "detail-evidence-provenance-history",

        kind:
          "PROVENANCE_HISTORY",

        label:
          "Provenance history",

        reference:
          fixture.history.id,

        status:
          fixture.history.entries.length > 0
            ? "PRESENT"
            : "ABSENT",

        authoritative:
          false,
      },
    ];

  const present =
    items.filter(
      (item) =>
        item.status ===
        "PRESENT"
    ).length;

  return {
    items,

    total:
      items.length,

    present,

    complete:
      present === items.length,

    authoritative:
      false,
  };
}
