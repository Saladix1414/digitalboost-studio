import type {
  NftProvenanceEvidenceReference,
  NftProvenanceLink,
  NftProvenanceRecord,
} from "./types";

export type BuildNftProvenanceInput = {
  readonly id: string;

  readonly assetId: string;

  readonly collectionId: string;

  readonly creatorRef: string;

  readonly evidence:
    readonly NftProvenanceEvidenceReference[];

  readonly links:
    readonly NftProvenanceLink[];

  readonly createdAt: string;
};

export function buildNftProvenance(
  input:
    BuildNftProvenanceInput
): NftProvenanceRecord {
  return {
    id:
      input.id,

    assetId:
      input.assetId,

    collectionId:
      input.collectionId,

    creatorRef:
      input.creatorRef,

    evidence:
      [...input.evidence],

    links:
      [...input.links],

    version:
      1,

    status:
      "ASSEMBLED",

    createdAt:
      input.createdAt,

    authoritative:
      false,
  };
}
