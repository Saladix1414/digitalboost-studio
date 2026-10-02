import {
  appendNftOriginHistory,
  createInitialNftOriginHistory,
} from "./history";

import {
  reviseNftOrigin,
} from "./revision";

import {
  archiveNftOrigin,
} from "./engine";

import {
  nftOriginCapturedFixture,
} from "./fixtures";

const initial = {
  ...nftOriginCapturedFixture,
  id:
    "origin-history-asset-001",
};

const contextUpdated =
  reviseNftOrigin(
    initial,
    {
      forgeConfig:
        "forge:classic:v2",

      capturedAt:
        "2026-10-07T12:01:00.000Z",
    }
  );

const sourceUpdated =
  reviseNftOrigin(
    contextUpdated,
    {
      source: {
        type:
          "GENERATOR",

        reference:
          "generator-session-002",

        authoritative:
          false,
      },

      capturedAt:
        "2026-10-07T12:02:00.000Z",
    }
  );

const archived =
  archiveNftOrigin(
    sourceUpdated
  );

let history =
  createInitialNftOriginHistory(
    initial
  );

history =
  appendNftOriginHistory(
    history,
    initial,
    contextUpdated
  );

history =
  appendNftOriginHistory(
    history,
    contextUpdated,
    sourceUpdated
  );

history =
  appendNftOriginHistory(
    history,
    sourceUpdated,
    archived
  );

export const nftOriginHistoryFixture =
  history;

export const nftOriginHistoryRecordsFixture = {
  initial,
  contextUpdated,
  sourceUpdated,
  archived,
} as const;
