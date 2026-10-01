import type {
  PaperOrder,
  PaperPosition,
} from "../types/trading";

export const mockPaperPositions: readonly PaperPosition[] = [
  {
    id: "position-btc-1",
    symbol: "BTC",
    side: "buy",
    quantity: 0.08,
    entryPrice: 67120,
    markPrice: 68420.35,
    pnl: 104.03,
  },
  {
    id: "position-eth-1",
    symbol: "ETH",
    side: "buy",
    quantity: 1.4,
    entryPrice: 3494,
    markPrice: 3568.18,
    pnl: 103.85,
  },
] as const;

export const mockPaperOrders: readonly PaperOrder[] = [
  {
    id: "order-sol-1",
    symbol: "SOL",
    side: "buy",
    type: "limit",
    quantity: 8,
    price: 165.5,
    status: "open",
  },
] as const;
