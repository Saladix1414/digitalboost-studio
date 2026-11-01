import { randomUUID } from "node:crypto";
import type { DatabasePort, DatabaseTransactionPort } from "../../infrastructure/core/database";
import { createInfrastructureOperationContext } from "../../infrastructure/core/types";
import type { CommercePrincipal } from "./CommerceRepository";

const ETHEREUM_CHAIN_ID = 1;
const USDT_ERC20 = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const CONFIRMATIONS_REQUIRED = 12n;
const INTENT_TTL_MS = 45 * 60 * 1000;

type PaymentConfig = { readonly rpcUrl: string; readonly merchantAddress: string };
type IntentRow = {
  id: string; order_id: string; state: "pending" | "verified" | "expired";
  chain_id: number; token_address: string; merchant_address: string;
  amount_atomic: string; tx_hash: string | null; payer_address: string | null;
  expires_at: string | Date; verified_at: string | Date | null;
};
type OrderRow = { id: string; total_amount: string | number; currency: "USD" | "ARS"; payment_state: string };
type RpcEnvelope<T> = { result?: T; error?: unknown };
type Receipt = {
  transactionHash?: string; status?: string; blockNumber?: string;
  logs?: Array<{ address?: string; topics?: string[]; data?: string }>;
};

function operation(principal: CommercePrincipal, correlationId = randomUUID()) {
  return createInfrastructureOperationContext({
    tenantId: principal.tenantId, actorId: principal.actorId, correlationId,
    requestedAt: new Date().toISOString(),
  });
}

function normalizedAddress(value: string): string {
  const address = value.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("USDT_ETH_NOT_CONFIGURED");
  return address.toLowerCase();
}

function publicIntent(row: IntentRow) {
  return {
    id: row.id,
    state: row.state,
    chainId: ETHEREUM_CHAIN_ID,
    token: "USDT",
    tokenDecimals: 6,
    tokenContract: USDT_ERC20,
    merchantAddress: row.merchant_address,
    amountAtomic: row.amount_atomic,
    amountUsdt: (BigInt(row.amount_atomic) / 1_000_000n).toString() + "." +
      (BigInt(row.amount_atomic) % 1_000_000n).toString().padStart(6, "0"),
    expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString() : new Date(row.expires_at).toISOString(),
    transactionHash: row.tx_hash ?? undefined,
    payerAddress: row.payer_address ?? undefined,
    verifiedAt: row.verified_at instanceof Date ? row.verified_at.toISOString() : row.verified_at ? new Date(row.verified_at).toISOString() : undefined,
  };
}

async function rpc<T>(url: string, method: string, params: unknown[]): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new Error("ETHEREUM_RPC_UNAVAILABLE");
  }
  if (!response.ok) throw new Error("ETHEREUM_RPC_UNAVAILABLE");
  const body = await response.json() as RpcEnvelope<T>;
  if (body.error || body.result === undefined) throw new Error("ETHEREUM_RPC_UNAVAILABLE");
  return body.result;
}

function validateRpcUrl(value: string): string {
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) throw new Error();
    return url.toString();
  } catch {
    throw new Error("USDT_ETH_NOT_CONFIGURED");
  }
}

async function verifyTransfer(input: {
  rpcUrl: string; merchantAddress: string; txHash: string; amountAtomic: string;
}): Promise<{ payerAddress: string; blockNumber: bigint }> {
  const chainId = await rpc<string>(input.rpcUrl, "eth_chainId", []);
  if (BigInt(chainId) !== BigInt(ETHEREUM_CHAIN_ID)) throw new Error("PAYMENT_TX_INVALID");
  const receipt = await rpc<Receipt | null>(input.rpcUrl, "eth_getTransactionReceipt", [input.txHash]);
  if (!receipt) throw new Error("PAYMENT_TX_NOT_CONFIRMED");
  if (receipt.transactionHash?.toLowerCase() !== input.txHash.toLowerCase()
    || !receipt.status || BigInt(receipt.status) !== 1n || !receipt.blockNumber) {
    throw new Error("PAYMENT_TX_INVALID");
  }
  const blockNumber = BigInt(receipt.blockNumber);
  const latestBlock = BigInt(await rpc<string>(input.rpcUrl, "eth_blockNumber", []));
  if (latestBlock < blockNumber || latestBlock - blockNumber + 1n < CONFIRMATIONS_REQUIRED) {
    throw new Error("PAYMENT_TX_NOT_CONFIRMED");
  }
  const recipientTopic = "0x" + input.merchantAddress.slice(2).padStart(64, "0");
  let total = 0n;
  let payerAddress = "";
  for (const log of receipt.logs ?? []) {
    const topics = log.topics ?? [];
    const fromTopic = topics[1] ?? "";
    const toTopic = topics[2] ?? "";
    if (log.address?.toLowerCase() !== USDT_ERC20 || topics[0]?.toLowerCase() !== TRANSFER_TOPIC
      || topics.length < 3 || !/^0x[0-9a-fA-F]{64}$/.test(fromTopic)
      || toTopic.toLowerCase() !== recipientTopic.toLowerCase()
      || !/^0x[0-9a-fA-F]{64}$/.test(log.data ?? "")) continue;
    total += BigInt(log.data!);
    if (!payerAddress) payerAddress = "0x" + fromTopic.slice(-40).toLowerCase();
  }
  if (total !== BigInt(input.amountAtomic) || !payerAddress) throw new Error("PAYMENT_TX_INVALID");
  return { payerAddress, blockNumber };
}

export class CommerceUsdtEthereumPayments {
  constructor(private readonly database: DatabasePort, private readonly config: PaymentConfig) {}

  private configuration() {
    if (!this.config.rpcUrl.trim() || !this.config.merchantAddress.trim()) throw new Error("USDT_ETH_NOT_CONFIGURED");
    return {
      rpcUrl: validateRpcUrl(this.config.rpcUrl),
      merchantAddress: normalizedAddress(this.config.merchantAddress),
    };
  }

  async createIntent(principal: CommercePrincipal, orderId: string) {
    const config = this.configuration();
    return this.database.transaction("read-write", async transaction => {
      const op = operation(principal);
      const orderResult = await transaction.query<OrderRow>({
        statement: "SELECT id, total_amount, currency, payment_state FROM commerce_orders WHERE tenant_id = $1 AND id = $2 FOR UPDATE",
        parameters: [principal.tenantId, orderId], operation: op,
      });
      const order = orderResult.rows[0];
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.currency !== "USD") throw new Error("ORDER_USD_ONLY");
      if (order.payment_state !== "UNPAID" || Number(order.total_amount) <= 0) throw new Error("ORDER_NOT_PAYABLE");
      const amountCents = BigInt(Math.round(Number(order.total_amount) * 100));
      const amountAtomic = (amountCents * 10_000n).toString();
      const now = new Date();
      const current = await transaction.query<IntentRow>({
        statement: "SELECT id, order_id, state, chain_id, token_address, merchant_address, amount_atomic, tx_hash, payer_address, expires_at, verified_at FROM commerce_usdt_payment_intents WHERE tenant_id = $1 AND order_id = $2 AND state = 'pending' AND expires_at > $3 ORDER BY created_at DESC LIMIT 1 FOR UPDATE",
        parameters: [principal.tenantId, orderId, now.toISOString()], operation: op,
      });
      if (current.rows[0]) return publicIntent(current.rows[0]);
      await transaction.mutate({
        statement: "UPDATE commerce_usdt_payment_intents SET state = 'expired' WHERE tenant_id = $1 AND order_id = $2 AND state = 'pending' AND expires_at <= $3",
        parameters: [principal.tenantId, orderId, now.toISOString()], expectedVersion: null, operation: op,
      });
      const intent: IntentRow = {
        id: randomUUID(), order_id: orderId, state: "pending", chain_id: ETHEREUM_CHAIN_ID,
        token_address: USDT_ERC20, merchant_address: config.merchantAddress,
        amount_atomic: amountAtomic, tx_hash: null, payer_address: null,
        expires_at: new Date(now.getTime() + INTENT_TTL_MS), verified_at: null,
      };
      await transaction.mutate({
        statement: "INSERT INTO commerce_usdt_payment_intents (tenant_id, id, order_id, chain_id, token_address, merchant_address, amount_atomic, state, expires_at, created_at) VALUES ($1, $2, $3, 1, $4, $5, $6, 'pending', $7, $8)",
        parameters: [principal.tenantId, intent.id, orderId, USDT_ERC20, config.merchantAddress, amountAtomic, intent.expires_at.toISOString(), now.toISOString()],
        expectedVersion: null, operation: op,
      });
      return publicIntent(intent);
    });
  }

  async verifyIntent(principal: CommercePrincipal, intentId: string, txHash: string) {
    const hash = txHash.trim().toLowerCase();
    if (!/^0x[a-f0-9]{64}$/.test(hash)) throw new Error("INVALID_TX_HASH");
    const config = this.configuration();
    const initial = await this.database.query<IntentRow>({
      statement: "SELECT id, order_id, state, chain_id, token_address, merchant_address, amount_atomic, tx_hash, payer_address, expires_at, verified_at FROM commerce_usdt_payment_intents WHERE tenant_id = $1 AND id = $2",
      parameters: [principal.tenantId, intentId], operation: operation(principal),
    });
    const intent = initial.rows[0];
    if (!intent) throw new Error("PAYMENT_INTENT_NOT_FOUND");
    if (intent.state === "verified") {
      if (intent.tx_hash?.toLowerCase() !== hash) throw new Error("PAYMENT_TX_ALREADY_USED");
      return { ...publicIntent(intent), replayed: true };
    }
    const intentExpiresAt = intent.expires_at instanceof Date ? intent.expires_at.getTime() : new Date(intent.expires_at).getTime();
    if (intent.state !== "pending" || intentExpiresAt <= Date.now()) {
      throw new Error("PAYMENT_INTENT_EXPIRED");
    }
    if (intent.chain_id !== ETHEREUM_CHAIN_ID || intent.token_address.toLowerCase() !== USDT_ERC20
      || intent.merchant_address.toLowerCase() !== config.merchantAddress) throw new Error("PAYMENT_TX_INVALID");
    const chainPayment = await verifyTransfer({
      rpcUrl: config.rpcUrl, merchantAddress: intent.merchant_address,
      txHash: hash, amountAtomic: intent.amount_atomic,
    });
    return this.database.transaction("read-write", async transaction => {
      const op = operation(principal);
      const orderLock = await transaction.query<OrderRow>({
        statement: "SELECT id, total_amount, currency, payment_state FROM commerce_orders WHERE tenant_id = $1 AND id = $2 FOR UPDATE",
        parameters: [principal.tenantId, intent.order_id], operation: op,
      });
      if (!orderLock.rows[0]) throw new Error("ORDER_NOT_FOUND");
      const locked = await transaction.query<IntentRow>({
        statement: "SELECT id, order_id, state, chain_id, token_address, merchant_address, amount_atomic, tx_hash, payer_address, expires_at, verified_at FROM commerce_usdt_payment_intents WHERE tenant_id = $1 AND id = $2 FOR UPDATE",
        parameters: [principal.tenantId, intentId], operation: op,
      });
      const current = locked.rows[0];
      if (!current) throw new Error("PAYMENT_INTENT_NOT_FOUND");
      if (current.state === "verified") {
        if (current.tx_hash?.toLowerCase() !== hash) throw new Error("PAYMENT_TX_ALREADY_USED");
        return { ...publicIntent(current), replayed: true };
      }
      const currentExpiresAt = current.expires_at instanceof Date ? current.expires_at.getTime() : new Date(current.expires_at).getTime();
      if (current.state !== "pending" || currentExpiresAt <= Date.now()) {
        throw new Error("PAYMENT_INTENT_EXPIRED");
      }
      const used = await transaction.query<{ id: string }>({
        statement: "SELECT id FROM commerce_usdt_payment_intents WHERE chain_id = 1 AND tx_hash = $1 FOR UPDATE",
        parameters: [hash], operation: op,
      });
      if (used.rows[0]) throw new Error("PAYMENT_TX_ALREADY_USED");
      const paid = await transaction.mutate({
        statement: "UPDATE commerce_orders SET payment_state = 'PAID', updated_at = $3 WHERE tenant_id = $1 AND id = $2 AND currency = 'USD' AND payment_state = 'UNPAID'",
        parameters: [principal.tenantId, current.order_id, new Date().toISOString()], expectedVersion: null, operation: op,
      });
      if (paid.affectedRows !== 1) throw new Error("ORDER_NOT_PAYABLE");
      const verifiedAt = new Date().toISOString();
      await transaction.mutate({
        statement: "UPDATE commerce_usdt_payment_intents SET state = 'verified', tx_hash = $3, payer_address = $4, verified_at = $5 WHERE tenant_id = $1 AND id = $2 AND state = 'pending'",
        parameters: [principal.tenantId, intentId, hash, chainPayment.payerAddress, verifiedAt], expectedVersion: null, operation: op,
      });
      return { ...publicIntent({ ...current, state: "verified", tx_hash: hash, payer_address: chainPayment.payerAddress, verified_at: verifiedAt }), replayed: false };
    });
  }
}
