import type {
  NftMintEvidenceRegistry,
} from "./types";

export function createEmptyMintEvidenceRegistry():
  NftMintEvidenceRegistry {
  return {
    claims: [],
  };
}
