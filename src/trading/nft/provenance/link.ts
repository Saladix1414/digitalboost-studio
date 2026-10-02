import type {
  NftProvenanceLink,
  NftProvenanceLinkType,
} from "./types";

export type CreateProvenanceLinkInput = {
  readonly id: string;

  readonly fromEvidenceId:
    string;

  readonly toEvidenceId:
    string;

  readonly type:
    NftProvenanceLinkType;
};

export function createProvenanceLink(
  input:
    CreateProvenanceLinkInput
): NftProvenanceLink {
  return {
    id:
      input.id,

    fromEvidenceId:
      input.fromEvidenceId,

    toEvidenceId:
      input.toEvidenceId,

    type:
      input.type,

    authoritative:
      false,
  };
}
