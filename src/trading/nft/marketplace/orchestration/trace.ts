import type {
  NftMarketplaceEngineTraceEntry,
  NftMarketplaceEngineTraceKind,
  NftMarketplaceEngineTraceLevel,
} from "./types";

export function appendMarketplaceEngineTrace(
  trace:
    readonly NftMarketplaceEngineTraceEntry[],
  input: {
    readonly kind:
      NftMarketplaceEngineTraceKind;

    readonly level:
      NftMarketplaceEngineTraceLevel;

    readonly code:
      string;

    readonly message:
      string;

    readonly occurredAt:
      string;
  }
): readonly NftMarketplaceEngineTraceEntry[] {
  return [
    ...trace,

    {
      sequence:
        trace.length + 1,

      kind:
        input.kind,

      level:
        input.level,

      code:
        input.code,

      message:
        input.message,

      occurredAt:
        input.occurredAt,

      authoritative:
        false,
    },
  ];
}
