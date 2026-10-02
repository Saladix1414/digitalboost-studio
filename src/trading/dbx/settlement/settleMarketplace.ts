import {
  postDbxLedgerTransaction,
} from "../ledger/ledger";

import {
  buildDbxMarketplaceSettlementLedgerTransaction,
} from "./ledgerTransaction";

import {
  addDbxMarketplaceSettlementResult,
  assertDbxMarketplaceOrderNotSettled,
} from "./registry";

import type {
  DbxMarketplaceSettlementPlan,
  DbxMarketplaceSettlementRegistry,
  DbxMarketplaceSettlementResult,
} from "./types";

export function settleDbxMarketplaceOrder<
  TLedger
>(
  ledger:
    TLedger,
  registry:
    DbxMarketplaceSettlementRegistry,
  plan:
    DbxMarketplaceSettlementPlan,
  settledAt:
    string
): {
  readonly ledger:
    unknown;

  readonly registry:
    DbxMarketplaceSettlementRegistry;

  readonly result:
    DbxMarketplaceSettlementResult;
} {
  assertDbxMarketplaceOrderNotSettled(
    registry,
    plan.marketplaceOrderId
  );

  const transaction =
    buildDbxMarketplaceSettlementLedgerTransaction(
      plan,
      settledAt
    );

  const nextLedger =
    postDbxLedgerTransaction(
      ledger as any,
      transaction as any
    );

  const result:
    DbxMarketplaceSettlementResult = {
      planId:
        plan.id,

      marketplaceOrderId:
        plan.marketplaceOrderId,

      transactionId:
        transaction.id,

      status:
        "SETTLED",

      settledAt,

      systemOfRecord:
        "DBX_LEDGER",

      governanceAuthority:
        false,
    };

  return {
    ledger:
      nextLedger,

    registry:
      addDbxMarketplaceSettlementResult(
        registry,
        result
      ),

    result,
  };
}
