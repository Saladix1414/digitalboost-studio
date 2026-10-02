import type {
  NftProvenanceEvidenceKind,
  NftProvenanceEvidenceReference,
} from "./types";

export type CreateProvenanceEvidenceInput = {
  readonly id: string;

  readonly kind:
    NftProvenanceEvidenceKind;

  readonly reference:
    string;

  readonly observedAt:
    string;
};

export function createProvenanceEvidence(
  input:
    CreateProvenanceEvidenceInput
): NftProvenanceEvidenceReference {
  return {
    id:
      input.id,

    kind:
      input.kind,

    reference:
      input.reference,

    observedAt:
      input.observedAt,

    authoritative:
      false,
  };
}
