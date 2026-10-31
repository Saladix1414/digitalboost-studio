import { Database } from "lucide-react";

import {
  DataTable,
  StatusBadge,
  type DataColumn,
} from "../components";

import {
  useMarketData,
} from "./MarketDataContext";

import type {
  MarketAsset,
} from "../types/trading";

import MarketPulseChart from "../overview/MarketPulseChart";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const columns: readonly DataColumn<MarketAsset>[] = [
  {
    id: "market",
    header: "Market",
    width: "1.2fr",
    render: (market) => (
      <div className="ti-overview-market">
        <strong>{market.symbol} <span className="ti-markets__name">{market.name}</span></strong>
        <span>{market.pair}</span>
      </div>
    ),
  },
  {
    id: "price",
    header: "Price",
    align: "right",
    render: (market) => <span className="ti-number">{currency.format(market.price)}</span>,
  },
  {
    id: "change",
    header: "24H",
    align: "right",
    render: (market) => (
      <span className={market.change24h >= 0 ? "ti-positive" : "ti-negative"}>
        {market.change24h >= 0 ? "+" : ""}{market.change24h.toFixed(2)}%
      </span>
    ),
  },
  {
    id: "range",
    header: "24H range",
    align: "right",
    render: (market) => (
      <span className="ti-number">{currency.format(market.low24h)} – {currency.format(market.high24h)}</span>
    ),
  },
  {
    id: "volume",
    header: "Volume",
    align: "right",
    render: (market) => <span className="ti-number">{compactCurrency.format(market.volume24h)}</span>,
  },
];

export function MarketsWorkspace() {
  const marketData = useMarketData();
  const markets = marketData.getMarkets();
  const health = marketData.getHealth();

  return (
    <div className="ti-markets">
      <header className="ti-markets__intro">
        <div>
          <span className="ti-label">LOCAL MARKET UNIVERSE</span>
          <h2>Core markets</h2>
          <p>Review the deterministic market fixtures used by Trading Islands. This is not a live quote feed.</p>
        </div>
        <StatusBadge tone="info">Local demo</StatusBadge>
      </header>

      <div className="ti-markets__source" role="note">
        <Database size={15} aria-hidden="true" />
        <span>{health.sourceLabel}. {health.message}</span>
      </div>

      <MarketPulseChart />

      <section className="ti-markets__table-panel" aria-labelledby="ti-markets-table-title">
        <header className="ti-markets__table-head">
          <div>
            <span className="ti-label">FIXTURE DATA</span>
            <h3 id="ti-markets-table-title">Market overview</h3>
          </div>
          <span>{markets.length} simulated markets</span>
        </header>
        <DataTable
          columns={columns}
          rows={markets}
          rowKey={(market) => market.symbol}
        />
      </section>
    </div>
  );
}

export default MarketsWorkspace;
