import {
  getMockCandles,
} from "../fixtures/candles";

import type {
  Candle,
} from "../types/trading";

import type {
  HistoricalDataSource,
  HistoricalSeries,
  HistoricalSeriesRequest,
} from "./types";

function repeatCandles(
  candles: readonly Candle[],
  targetLength: number
): readonly Candle[] {
  if (candles.length === 0) {
    return [];
  }

  const result: Candle[] = [];

  for (
    let index = 0;
    index < targetLength;
    index += 1
  ) {
    const base =
      candles[
        index %
        candles.length
      ];

    result.push({
      ...base,
      time:
        `${base.time}-${Math.floor(index / candles.length)}`,
    });
  }

  return result;
}

export const localHistoricalData:
  HistoricalDataSource = {
    getSeries(
      request:
        HistoricalSeriesRequest
    ): HistoricalSeries {
      const base =
        getMockCandles(
          request.symbol,
          request.timeframe
        );

      const expanded =
        repeatCandles(
          base,
          request.window
        );

      return {
        symbol:
          request.symbol,
        timeframe:
          request.timeframe,
        window:
          request.window,
        candles:
          expanded,
      };
    },
  };

export default localHistoricalData;
