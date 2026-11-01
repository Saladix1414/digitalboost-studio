import type { PostgresMigration } from "../PostgresMigrationTypes";

export const commerceUsdtEthereumPaymentsMigration: PostgresMigration = {
  version: 10,
  name: "commerce-usdt-ethereum-payment-intents",
  async up(transaction) {
    const operation = {
      correlationId: "migration:10", tenantId: null, actorId: null,
      requestedAt: new Date().toISOString(), authoritative: false as const,
    };
    await transaction.mutate({
      statement: "CREATE TABLE IF NOT EXISTS commerce_usdt_payment_intents (tenant_id TEXT NOT NULL, id TEXT NOT NULL, order_id TEXT NOT NULL, chain_id INTEGER NOT NULL CHECK (chain_id = 1), token_address TEXT NOT NULL, merchant_address TEXT NOT NULL, amount_atomic NUMERIC(78,0) NOT NULL CHECK (amount_atomic > 0), state TEXT NOT NULL CHECK (state IN ('pending', 'verified', 'expired')), tx_hash TEXT, payer_address TEXT, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL, verified_at TIMESTAMPTZ, PRIMARY KEY (tenant_id, id), FOREIGN KEY (tenant_id, order_id) REFERENCES commerce_orders (tenant_id, id) ON DELETE CASCADE)",
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: "CREATE UNIQUE INDEX IF NOT EXISTS commerce_usdt_payment_tx_unique ON commerce_usdt_payment_intents (chain_id, tx_hash) WHERE tx_hash IS NOT NULL",
      parameters: [], expectedVersion: null, operation,
    });
    await transaction.mutate({
      statement: "CREATE INDEX IF NOT EXISTS commerce_usdt_payment_order_idx ON commerce_usdt_payment_intents (tenant_id, order_id, created_at DESC)",
      parameters: [], expectedVersion: null, operation,
    });
  },
  authoritative: false,
};
