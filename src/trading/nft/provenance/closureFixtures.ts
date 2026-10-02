import {
  nftDnaLineageFixture,
  nftDnaLineageRecordsFixture,
} from "../dna/lineageFixtures";

import {
  nftOriginDnaBridgeOriginFixture,
} from "../origin/dnaBridgeFixtures";

import {
  nftProvenanceHistoryFixture,
  nftProvenanceHistoryRecordsFixture,
} from "./historyFixtures";

export const nftProvenanceClosureFixture = {
  provenance:
    nftProvenanceHistoryRecordsFixture.archived,

  history:
    nftProvenanceHistoryFixture,

  origin:
    nftOriginDnaBridgeOriginFixture,

  dna:
    nftDnaLineageRecordsFixture.proofAttached,

  lineage:
    nftDnaLineageFixture,
} as const;
