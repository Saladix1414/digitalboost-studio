import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import localMarketData from "./localMarketData";

import type {
  MarketDataSource,
} from "./types";

const MarketDataContext =
  createContext<MarketDataSource | null>(
    null
  );

export type MarketDataProviderProps = {
  readonly children: ReactNode;
  readonly source?: MarketDataSource;
};

export function MarketDataProvider({
  children,
  source = localMarketData,
}: MarketDataProviderProps) {
  return (
    <MarketDataContext.Provider
      value={source}
    >
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData():
  MarketDataSource {
  const context =
    useContext(
      MarketDataContext
    );

  if (!context) {
    throw new Error(
      "useMarketData must be used inside MarketDataProvider"
    );
  }

  return context;
}
