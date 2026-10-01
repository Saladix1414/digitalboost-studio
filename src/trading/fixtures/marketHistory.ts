import type {
  MarketSymbol,
} from "../types/trading";

export type MarketHistoryPoint = {
  readonly time: string;
  readonly value: number;
};

export type MarketHistorySeries = {
  readonly symbol: MarketSymbol;
  readonly points: readonly MarketHistoryPoint[];
};

export const mockMarketHistory: readonly MarketHistorySeries[] = [
  {
    symbol: "BTC",
    points: [
      { time: "09:00", value: 66280 },
      { time: "10:00", value: 66540 },
      { time: "11:00", value: 66880 },
      { time: "12:00", value: 66710 },
      { time: "13:00", value: 67240 },
      { time: "14:00", value: 67620 },
      { time: "15:00", value: 68110 },
      { time: "16:00", value: 67920 },
      { time: "17:00", value: 68420 },
    ],
  },
  {
    symbol: "ETH",
    points: [
      { time: "09:00", value: 3478 },
      { time: "10:00", value: 3494 },
      { time: "11:00", value: 3518 },
      { time: "12:00", value: 3506 },
      { time: "13:00", value: 3530 },
      { time: "14:00", value: 3546 },
      { time: "15:00", value: 3538 },
      { time: "16:00", value: 3560 },
      { time: "17:00", value: 3568 },
    ],
  },
  {
    symbol: "SOL",
    points: [
      { time: "09:00", value: 170.2 },
      { time: "10:00", value: 169.8 },
      { time: "11:00", value: 171.1 },
      { time: "12:00", value: 170.4 },
      { time: "13:00", value: 169.2 },
      { time: "14:00", value: 168.8 },
      { time: "15:00", value: 169.1 },
      { time: "16:00", value: 168.6 },
      { time: "17:00", value: 168.42 },
    ],
  },
] as const;
