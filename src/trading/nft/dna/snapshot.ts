import {
  deterministicDnaHash,
} from "./hash";

import type {
  NftDnaRecord,
} from "./types";

export type NftDnaSnapshotHashes = {
  readonly identityHash: string;
  readonly integrityHash: string;
  readonly blockchainProofHash:
    string | null;
};

export function createNftDnaSnapshotHashes(
  dna:
    NftDnaRecord
): NftDnaSnapshotHashes {
  const identityHash =
    deterministicDnaHash(
      JSON.stringify(
        dna.identity
      )
    );

  const integrityHash =
    deterministicDnaHash(
      JSON.stringify(
        dna.integrity
      )
    );

  const blockchainProofHash =
    dna.blockchainProof
      ? deterministicDnaHash(
          JSON.stringify(
            dna.blockchainProof
          )
        )
      : null;

  return {
    identityHash,
    integrityHash,
    blockchainProofHash,
  };
}
