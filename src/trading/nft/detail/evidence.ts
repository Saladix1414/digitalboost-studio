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

  const provenanceLinked =
    detail.integrity.provenanceId ===
    fixture.provenance.id;

  const dnaLinked =
    detail.integrity.dnaId ===
    fixture.dna.id;

  const originLinked =
    detail.integrity.originId === null
      ? provenanceLinked
      : detail.integrity.originId ===
        fixture.origin.id;

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
          originLinked
            ? fixture.origin.id
            : "",

        status:
          originLinked
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
          dnaLinked
            ? fixture.dna.id
            : "",

        status:
          dnaLinked
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
          dnaLinked
            ? fixture.dna.integrity
                .metadataHash
            : "",

        status:
          dnaLinked &&
          Boolean(
            fixture.dna.integrity
              .metadataHash
          )
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
          dnaLinked
            ? (
                fixture.dna
                  .blockchainProof
                  ?.txHash ??
                ""
              )
            : "",

        status:
          dnaLinked &&
          Boolean(
            fixture.dna
              .blockchainProof
          )
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
          provenanceLinked
            ? fixture.history.id
            : "",

        status:
          provenanceLinked &&
          fixture.history.entries
            .length > 0
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
      present ===
      items.length,

    authoritative:
      false,
  };
}
