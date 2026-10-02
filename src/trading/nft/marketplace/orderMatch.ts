import type {
  NftMarketplaceListing,
  NftMarketplaceOrderIntent,
} from "./types";

import {
  validateMarketplaceOrderIntent,
} from "./orderValidation";

export function matchMarketplaceOrder(
  order:
    NftMarketplaceOrderIntent,
  listing:
    NftMarketplaceListing,
  updatedAt:
    string
): NftMarketplaceOrderIntent {
  const validation =
    validateMarketplaceOrderIntent(
      order,
      listing
    );

  if (!validation.valid) {
    throw new Error(
      "MARKETPLACE_ORDER_INVALID"
    );
  }

  return {
    ...order,

    status:
      "MATCHED",

    updatedAt,
  };
}
