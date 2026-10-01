import type {
  Candle,
  MarketCandleSeries,
  MarketSymbol,
  TradingTimeframe,
} from "../types/trading";

function candle(
  time: string,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
): Candle {
  return {
    time,
    open,
    high,
    low,
    close,
    volume,
  };
}

const btc = [
  candle("10:00", 66620, 66880, 66440, 66790, 121),
  candle("11:00", 66790, 67120, 66610, 67040, 144),
  candle("12:00", 67040, 67210, 66820, 66920, 118),
  candle("13:00", 66920, 67480, 66890, 67390, 177),
  candle("14:00", 67390, 67840, 67210, 67680, 192),
  candle("15:00", 67680, 68260, 67520, 68120, 221),
  candle("16:00", 68120, 68310, 67780, 67940, 184),
  candle("17:00", 67940, 68620, 67890, 68420, 248),
] as const;

const eth = [
  candle("10:00", 3488, 3506, 3472, 3498, 684),
  candle("11:00", 3498, 3531, 3491, 3520, 729),
  candle("12:00", 3520, 3530, 3501, 3509, 612),
  candle("13:00", 3509, 3548, 3502, 3538, 801),
  candle("14:00", 3538, 3562, 3528, 3552, 844),
  candle("15:00", 3552, 3571, 3536, 3542, 756),
  candle("16:00", 3542, 3579, 3538, 3561, 803),
  candle("17:00", 3561, 3584, 3550, 3568, 875),
] as const;

const sol = [
  candle("10:00", 170.4, 171.1, 169.7, 170.1, 1420),
  candle("11:00", 170.1, 171.7, 169.9, 171.2, 1580),
  candle("12:00", 171.2, 171.8, 170.0, 170.5, 1390),
  candle("13:00", 170.5, 170.9, 168.9, 169.3, 1740),
  candle("14:00", 169.3, 170.1, 168.4, 168.9, 1820),
  candle("15:00", 168.9, 169.8, 168.1, 169.2, 1650),
  candle("16:00", 169.2, 169.6, 167.9, 168.7, 1715),
  candle("17:00", 168.7, 169.2, 167.8, 168.42, 1880),
] as const;

const source: Record<
  MarketSymbol,
  readonly Candle[]
> = {
  BTC: btc,
  ETH: eth,
  SOL: sol,
};

export const mockCandleSeries: readonly MarketCandleSeries[] = (
  Object.entries(source) as Array<
    [MarketSymbol, readonly Candle[]]
  >
).flatMap(
  ([symbol, candles]) =>
    (
      [
        "1m",
        "5m",
        "15m",
        "1h",
        "4h",
        "1d",
      ] as const
    ).map(
      (
        timeframe
      ): MarketCandleSeries => ({
        symbol,
        timeframe,
        candles,
      })
    )
);

export function getMockCandles(
  symbol: MarketSymbol,
  timeframe: TradingTimeframe
): readonly Candle[] {
  return (
    mockCandleSeries.find(
      (series) =>
        series.symbol === symbol &&
        series.timeframe === timeframe
    )?.candles ?? []
  );
}
