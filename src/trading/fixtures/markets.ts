import type {
  MarketAsset,
} from "../types/trading";

export const mockMarkets: readonly MarketAsset[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    pair: "BTC/USDT",
    price: 68420.35,
    change24h: 2.84,
    volume24h: 28400000000,
    high24h: 69118.42,
    low24h: 65780.14,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    pair: "ETH/USDT",
    price: 3568.18,
    change24h: 1.72,
    volume24h: 13200000000,
    high24h: 3612.88,
    low24h: 3440.21,
  },
  {
    symbol: "SOL",
    name: "Solana",
    pair: "SOL/USDT",
    price: 168.42,
    change24h: -0.86,
    volume24h: 3480000000,
    high24h: 173.10,
    low24h: 164.72,
  },
] as const;
