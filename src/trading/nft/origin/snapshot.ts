import {
  deterministicDnaHash,
} from "../dna/hash";

import type {
  NftOriginRecord,
  NftOriginSnapshot,
} from "./types";

export function createNftOriginSnapshot(
  origin:
    NftOriginRecord
): NftOriginSnapshot {
  const identityHash =
    deterministicDnaHash(
      JSON.stringify(
        origin.identity
      )
    );

  const contextHash =
    deterministicDnaHash(
      JSON.stringify(
        origin.context
      )
    );

  const recordHash =
    deterministicDnaHash(
      JSON.stringify({
        id:
          origin.id,

        identity:
          origin.identity,

        context:
          origin.context,

        version:
          origin.version,

        status:
          origin.status,

        capturedAt:
          origin.capturedAt,
      })
    );

  return {
    identityHash,
    contextHash,
    recordHash,
    authoritative:
      false,
  };
}
