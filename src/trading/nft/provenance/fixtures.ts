import {
  nftOriginDnaBridgeDnaFixture,
  nftOriginDnaBridgeOriginFixture,
} from "../origin/dnaBridgeFixtures";

import {
  createProvenanceEvidence,
} from "./evidence";

import {
  createProvenanceLink,
} from "./link";

import {
  buildNftProvenance,
} from "./builder";

const originEvidence =
  createProvenanceEvidence({
    id:
      "evidence-origin-001",

    kind:
      "ORIGIN",

    reference:
      `origin:${nftOriginDnaBridgeOriginFixture.id}`,

    observedAt:
      nftOriginDnaBridgeOriginFixture.capturedAt,
  });

const dnaIdentityEvidence =
  createProvenanceEvidence({
    id:
      "evidence-dna-identity-001",

    kind:
      "DNA_IDENTITY",

    reference:
      `dna:${nftOriginDnaBridgeDnaFixture.id}:identity`,

    observedAt:
      nftOriginDnaBridgeDnaFixture.identity.createdAt,
  });

const dnaIntegrityEvidence =
  createProvenanceEvidence({
    id:
      "evidence-dna-integrity-001",

    kind:
      "DNA_INTEGRITY",

    reference:
      `dna:${nftOriginDnaBridgeDnaFixture.id}:integrity:${nftOriginDnaBridgeDnaFixture.integrity.metadataHash}`,

    observedAt:
      nftOriginDnaBridgeDnaFixture.identity.createdAt,
  });

const blockchainProofEvidence =
  createProvenanceEvidence({
    id:
      "evidence-blockchain-proof-001",

    kind:
      "BLOCKCHAIN_PROOF",

    reference:
      `dna:${nftOriginDnaBridgeDnaFixture.id}:blockchain-proof`,

    observedAt:
      nftOriginDnaBridgeDnaFixture.identity.createdAt,
  });

export const nftProvenanceEvidenceFixture = [
  originEvidence,
  dnaIdentityEvidence,
  dnaIntegrityEvidence,
  blockchainProofEvidence,
] as const;

export const nftProvenanceLinksFixture = [
  createProvenanceLink({
    id:
      "link-origin-identity-001",

    fromEvidenceId:
      originEvidence.id,

    toEvidenceId:
      dnaIdentityEvidence.id,

    type:
      "CREATED_FROM",
  }),

  createProvenanceLink({
    id:
      "link-identity-integrity-001",

    fromEvidenceId:
      dnaIdentityEvidence.id,

    toEvidenceId:
      dnaIntegrityEvidence.id,

    type:
      "VERIFIED_AGAINST",
  }),

  createProvenanceLink({
    id:
      "link-integrity-proof-001",

    fromEvidenceId:
      dnaIntegrityEvidence.id,

    toEvidenceId:
      blockchainProofEvidence.id,

    type:
      "VERIFIED_AGAINST",
  }),
] as const;

export const nftProvenanceFixture =
  buildNftProvenance({
    id:
      "provenance-asset-origin-001",

    assetId:
      nftOriginDnaBridgeOriginFixture.identity.assetId,

    collectionId:
      nftOriginDnaBridgeOriginFixture.identity.collectionId,

    creatorRef:
      nftOriginDnaBridgeOriginFixture.identity.creator,

    evidence:
      nftProvenanceEvidenceFixture,

    links:
      nftProvenanceLinksFixture,

    createdAt:
      "2026-10-12T12:00:00.000Z",
  });
