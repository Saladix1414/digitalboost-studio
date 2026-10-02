import {
  classicOriginModeFixture,
  generativeOriginModeFixture,
  importedOriginModeFixture,
  livingOriginModeFixture,
} from "./modeFixtures";

import type {
  NftOriginCaptureInput,
} from "./types";

const base = {
  assetId:
    "asset-origin-mode-001",

  collectionId:
    "collection-origin-mode-001",

  creator:
    "creator-origin-mode-001",

  forgeConfig:
    "forge:origin-mode:v1",

  createdAt:
    "2026-10-11T10:00:00.000Z",

  capturedAt:
    "2026-10-11T10:05:00.000Z",
};

export const classicOriginCaptureFixture:
  NftOriginCaptureInput = {
    ...base,

    id:
      "origin-classic-001",

    modeConfig:
      classicOriginModeFixture,

    source: {
      type:
        "FORGE",

      reference:
        "forge-session:classic-001",

      authoritative:
        false,
    },
  };

export const generativeOriginCaptureFixture:
  NftOriginCaptureInput = {
    ...base,

    id:
      "origin-generative-001",

    modeConfig:
      generativeOriginModeFixture,

    source: {
      type:
        "GENERATOR",

      reference:
        "generator-run:001",

      authoritative:
        false,
    },
  };

export const livingOriginCaptureFixture:
  NftOriginCaptureInput = {
    ...base,

    id:
      "origin-living-001",

    modeConfig:
      livingOriginModeFixture,

    source: {
      type:
        "FORGE",

      reference:
        "forge-session:living-001",

      authoritative:
        false,
    },
  };

export const importedOriginCaptureFixture:
  NftOriginCaptureInput = {
    ...base,

    id:
      "origin-imported-001",

    modeConfig:
      importedOriginModeFixture,

    source: {
      type:
        "IMPORT",

      reference:
        "external-source:asset-001",

      authoritative:
        false,
    },
  };
