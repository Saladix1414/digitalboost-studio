import type {
  NftOriginCaptureInput,
} from "./types";

import {
  classicOriginCaptureFixture,
  generativeOriginCaptureFixture,
  importedOriginCaptureFixture,
  livingOriginCaptureFixture,
} from "./captureFixtures";

export const nftOriginModeClosureFixtures:
  readonly NftOriginCaptureInput[] = [
    classicOriginCaptureFixture,
    generativeOriginCaptureFixture,
    livingOriginCaptureFixture,
    importedOriginCaptureFixture,
  ];
