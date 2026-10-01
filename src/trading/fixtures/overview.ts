import type {
  OverviewActivity,
  PaperBotSummary,
  PortfolioPosition,
} from "../types/trading";

export const mockPortfolio: readonly PortfolioPosition[] = [
  {
    symbol: "BTC",
    amount: 0.18,
    value: 12315.66,
    allocation: 51.8,
    pnl: 4.42,
  },
  {
    symbol: "ETH",
    amount: 2.1,
    value: 7493.18,
    allocation: 31.5,
    pnl: 2.16,
  },
  {
    symbol: "SOL",
    amount: 23.6,
    value: 3974.71,
    allocation: 16.7,
    pnl: -1.28,
  },
] as const;

export const mockBots: readonly PaperBotSummary[] = [
  {
    id: "bot-btc-momentum",
    name: "BTC Momentum",
    symbol: "BTC",
    strategy: "EMA Trend",
    state: "running",
    pnl: 3.84,
    trades: 14,
  },
  {
    id: "bot-eth-range",
    name: "ETH Range",
    symbol: "ETH",
    strategy: "Mean Reversion",
    state: "running",
    pnl: 1.47,
    trades: 22,
  },
  {
    id: "bot-sol-breakout",
    name: "SOL Breakout",
    symbol: "SOL",
    strategy: "Volatility Breakout",
    state: "paused",
    pnl: -0.62,
    trades: 8,
  },
] as const;

export const mockOverviewActivity: readonly OverviewActivity[] = [
  {
    id: "activity-1",
    title: "BTC Momentum evaluated",
    detail:
      "Paper bot completed its latest deterministic strategy cycle.",
    time: "2m",
    tone: "positive",
  },
  {
    id: "activity-2",
    title: "SOL risk threshold reached",
    detail:
      "Simulation paused new entries after the configured mock exposure limit.",
    time: "11m",
    tone: "warning",
  },
  {
    id: "activity-3",
    title: "ETH market snapshot updated",
    detail:
      "Fixture market state advanced to the latest local deterministic snapshot.",
    time: "18m",
    tone: "info",
  },
] as const;
