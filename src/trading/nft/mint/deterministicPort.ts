import type {
  NftMintIntent,
  NftMintPrepared,
  NftMintTransactionEvidence,
} from "./types";

export type DeterministicMintPort = {
  readonly prepare:
    (
      intent:
        NftMintIntent,
      preparedAt: string
    ) => NftMintPrepared;

  readonly submit:
    (
      prepared:
        NftMintPrepared,
      evidence:
        NftMintTransactionEvidence
    ) =>
      NftMintTransactionEvidence;
};

export const deterministicMintPort:
  DeterministicMintPort = {
    prepare(
      intent,
      preparedAt
    ) {
      return {
        intentId:
          intent.id,
        assetId:
          intent.assetId,
        collectionId:
          intent.collectionId,
        mode:
          intent.mode,
        expectedOwner:
          intent.expectedOwner,
        expectedMetadataRef:
          intent.expectedMetadataRef,
        preparedAt,
        authoritative: false,
      };
    },

    submit(
      _prepared,
      evidence
    ) {
      /**
       * This adapter does not call RPC.
       * It only accepts deterministic
       * transaction evidence supplied
       * by tests or local fixtures.
       */
      return {
        ...evidence,
        authoritative: false,
      };
    },
  };
