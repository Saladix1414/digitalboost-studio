import type {
  DbxMarketplaceSettlementRegistry,
  DbxMarketplaceSettlementResult,
} from "./types";

export function createDbxMarketplaceSettlementRegistry():
  DbxMarketplaceSettlementRegistry {
  return {
    results:
      [],
  };
}

export function assertDbxMarketplaceOrderNotSettled(
  registry:
    DbxMarketplaceSettlementRegistry,
  marketplaceOrderId:
    string
) {
  if (
    registry.results.some(
      (result) =>
        result.marketplaceOrderId ===
        marketplaceOrderId
    )
  ) {
    throw new Error(
      "DBX_MARKETPLACE_ORDER_ALREADY_SETTLED"
    );
  }
}

export function addDbxMarketplaceSettlementResult(
  registry:
    DbxMarketplaceSettlementRegistry,
  result:
    DbxMarketplaceSettlementResult
): DbxMarketplaceSettlementRegistry {
  assertDbxMarketplaceOrderNotSettled(
    registry,
    result.marketplaceOrderId
  );

  return {
    results: [
      ...registry.results,
      result,
    ],
  };
}
