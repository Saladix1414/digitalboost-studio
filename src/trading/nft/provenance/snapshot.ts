import {
  deterministicDnaHash,
} from "../dna/hash";

import type {
  NftProvenanceRecord,
  NftProvenanceSnapshot,
} from "./types";

function stableEvidencePayload(
  record:
    NftProvenanceRecord
): string {
  return JSON.stringify(
    record.evidence.map(
      (evidence) => ({
        id:
          evidence.id,

        kind:
          evidence.kind,

        reference:
          evidence.reference,

        observedAt:
          evidence.observedAt,
      })
    )
  );
}

function stableLinksPayload(
  record:
    NftProvenanceRecord
): string {
  return JSON.stringify(
    record.links.map(
      (link) => ({
        id:
          link.id,

        fromEvidenceId:
          link.fromEvidenceId,

        toEvidenceId:
          link.toEvidenceId,

        type:
          link.type,
      })
    )
  );
}

export function snapshotNftProvenance(
  record:
    NftProvenanceRecord
): NftProvenanceSnapshot {
  const evidenceHash =
    deterministicDnaHash(
      stableEvidencePayload(
        record
      )
    );

  const linksHash =
    deterministicDnaHash(
      stableLinksPayload(
        record
      )
    );

  const recordHash =
    deterministicDnaHash(
      JSON.stringify({
        id:
          record.id,

        assetId:
          record.assetId,

        collectionId:
          record.collectionId,

        creatorRef:
          record.creatorRef,

        evidenceHash,

        linksHash,

        version:
          record.version,

        status:
          record.status,

        createdAt:
          record.createdAt,
      })
    );

  return {
    evidenceHash,
    linksHash,
    recordHash,
    authoritative:
      false,
  };
}
