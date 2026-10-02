import type {
  NftOriginMode,
  NftOriginRecord,
  NftOriginSourceReference,
} from "./types";

export type ReviseNftOriginInput = {
  readonly forgeConfig?: string;
  readonly mode?: NftOriginMode;
  readonly source?:
    NftOriginSourceReference;
  readonly capturedAt: string;
};

export function reviseNftOrigin(
  origin:
    NftOriginRecord,
  input:
    ReviseNftOriginInput
): NftOriginRecord {
  if (
    origin.status ===
      "ARCHIVED"
  ) {
    throw new Error(
      "ORIGIN_ARCHIVED"
    );
  }

  return {
    ...origin,

    context: {
      ...origin.context,

      forgeConfig:
        input.forgeConfig ??
        origin.context.forgeConfig,

      mode:
        input.mode ??
        origin.context.mode,

      source:
        input.source ??
        origin.context.source,
    },

    version:
      origin.version + 1,

    capturedAt:
      input.capturedAt,
  };
}
