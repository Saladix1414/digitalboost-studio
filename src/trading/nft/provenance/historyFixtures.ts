import {
  createProvenanceEvidence,
} from "./evidence";

import {
  createProvenanceLink,
} from "./link";

import {
  nftProvenanceFixture,
} from "./fixtures";

import {
  appendNftProvenanceHistory,
  createInitialNftProvenanceHistory,
} from "./history";

const evidenceAdded = {
  ...nftProvenanceFixture,

  version:
    2,

  evidence: [
    ...nftProvenanceFixture.evidence,

    createProvenanceEvidence({
      id:
        "evidence-creator-assertion-001",

      kind:
        "CREATOR_ASSERTION",

      reference:
        "creator-assertion:asset-origin-001",

      observedAt:
        "2026-10-13T10:00:00.000Z",
    }),
  ],
};

const linkAdded = {
  ...evidenceAdded,

  version:
    3,

  links: [
    ...evidenceAdded.links,

    createProvenanceLink({
      id:
        "link-creator-origin-001",

      fromEvidenceId:
        "evidence-creator-assertion-001",

      toEvidenceId:
        "evidence-origin-001",

      type:
        "REFERENCES",
    }),
  ],
};

const archived = {
  ...linkAdded,

  version:
    4,

  status:
    "ARCHIVED" as const,
};

const initialHistory =
  createInitialNftProvenanceHistory(
    nftProvenanceFixture,
    "2026-10-12T12:05:00.000Z"
  );

const historyV2 =
  appendNftProvenanceHistory(
    initialHistory,
    nftProvenanceFixture,
    evidenceAdded,
    "2026-10-13T10:05:00.000Z"
  );

const historyV3 =
  appendNftProvenanceHistory(
    historyV2,
    evidenceAdded,
    linkAdded,
    "2026-10-13T11:05:00.000Z"
  );

export const nftProvenanceHistoryFixture =
  appendNftProvenanceHistory(
    historyV3,
    linkAdded,
    archived,
    "2026-10-13T12:05:00.000Z"
  );

export const nftProvenanceHistoryRecordsFixture = {
  initial:
    nftProvenanceFixture,

  evidenceAdded,

  linkAdded,

  archived,
} as const;
