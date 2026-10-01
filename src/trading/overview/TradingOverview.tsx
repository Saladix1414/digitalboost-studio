import {
  Activity,
  Bot,
  BriefcaseBusiness,
  TrendingUp,
} from "lucide-react";

import {
  ActivityFeed,
  DataTable,
  MetricCard,
  StatusBadge,
  type DataColumn,
} from "../components";

import {
  mockMarkets,
} from "../fixtures/markets";

import {
  mockBots,
  mockOverviewActivity,
  mockPortfolio,
} from "../fixtures/overview";

import type {
  MarketAsset,
  PaperBotSummary,
  PortfolioPosition,
} from "../types/trading";

const currency = new Intl.NumberFormat(
  "en-US",
  {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }
);

const compactCurrency =
  new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }
  );

const marketColumns: readonly DataColumn<MarketAsset>[] = [
  {
    id: "pair",
    header: "Market",
    width: "1.2fr",
    render: (market) => (
      <div className="ti-overview-market">
        <strong>{market.symbol}</strong>
        <span>{market.pair}</span>
      </div>
    ),
  },
  {
    id: "price",
    header: "Price",
    align: "right",
    render: (market) => (
      <span className="ti-number">
        {currency.format(
          market.price
        )}
      </span>
    ),
  },
  {
    id: "change",
    header: "24H",
    align: "right",
    render: (market) => (
      <span
        className={
          market.change24h >= 0
            ? "ti-positive"
            : "ti-negative"
        }
      >
        {market.change24h >= 0
          ? "+"
          : ""}
        {market.change24h.toFixed(2)}%
      </span>
    ),
  },
  {
    id: "volume",
    header: "Volume",
    align: "right",
    render: (market) => (
      <span className="ti-number">
        {compactCurrency.format(
          market.volume24h
        )}
      </span>
    ),
  },
];

const portfolioColumns: readonly DataColumn<PortfolioPosition>[] = [
  {
    id: "asset",
    header: "Asset",
    render: (position) => (
      <strong>
        {position.symbol}
      </strong>
    ),
  },
  {
    id: "value",
    header: "Value",
    align: "right",
    render: (position) => (
      <span className="ti-number">
        {currency.format(
          position.value
        )}
      </span>
    ),
  },
  {
    id: "allocation",
    header: "Allocation",
    align: "right",
    render: (position) => (
      <span>
        {position.allocation.toFixed(
          1
        )}
        %
      </span>
    ),
  },
  {
    id: "pnl",
    header: "P/L",
    align: "right",
    render: (position) => (
      <span
        className={
          position.pnl >= 0
            ? "ti-positive"
            : "ti-negative"
        }
      >
        {position.pnl >= 0
          ? "+"
          : ""}
        {position.pnl.toFixed(2)}%
      </span>
    ),
  },
];

const botColumns: readonly DataColumn<PaperBotSummary>[] = [
  {
    id: "bot",
    header: "Bot",
    width: "1.4fr",
    render: (bot) => (
      <div className="ti-overview-market">
        <strong>{bot.name}</strong>
        <span>{bot.strategy}</span>
      </div>
    ),
  },
  {
    id: "symbol",
    header: "Market",
    render: (bot) =>
      `${bot.symbol}/USDT`,
  },
  {
    id: "state",
    header: "State",
    render: (bot) => (
      <StatusBadge
        tone={
          bot.state === "running"
            ? "positive"
            : bot.state === "paused"
              ? "warning"
              : "negative"
        }
      >
        {bot.state}
      </StatusBadge>
    ),
  },
  {
    id: "pnl",
    header: "P/L",
    align: "right",
    render: (bot) => (
      <span
        className={
          bot.pnl >= 0
            ? "ti-positive"
            : "ti-negative"
        }
      >
        {bot.pnl >= 0
          ? "+"
          : ""}
        {bot.pnl.toFixed(2)}%
      </span>
    ),
  },
];

export function TradingOverview() {
  const portfolioValue =
    mockPortfolio.reduce(
      (total, position) =>
        total + position.value,
      0
    );

  const runningBots =
    mockBots.filter(
      (bot) =>
        bot.state === "running"
    ).length;

  const averageMarketChange =
    mockMarkets.reduce(
      (total, market) =>
        total + market.change24h,
      0
    ) / mockMarkets.length;

  return (
    <div className="ti-overview">
      <section className="ti-overview__metrics">
        <MetricCard
          label="Paper portfolio"
          value={currency.format(
            portfolioValue
          )}
          secondary="Deterministic mock portfolio"
          trend="+2.31%"
          tone="positive"
          icon={
            <BriefcaseBusiness
              size={15}
            />
          }
        />

        <MetricCard
          label="Market pulse"
          value={`${averageMarketChange >= 0 ? "+" : ""}${averageMarketChange.toFixed(2)}%`}
          secondary="BTC · ETH · SOL average"
          trend="24H"
          tone={
            averageMarketChange >= 0
              ? "positive"
              : "negative"
          }
          icon={
            <TrendingUp
              size={15}
            />
          }
        />

        <MetricCard
          label="Paper bots"
          value={`${runningBots}/${mockBots.length}`}
          secondary="Active simulated strategies"
          trend="Paper only"
          tone="info"
          icon={
            <Bot size={15} />
          }
        />

        <MetricCard
          label="Workspace"
          value="Healthy"
          secondary="Local deterministic state"
          trend="Mock"
          tone="neutral"
          icon={
            <Activity
              size={15}
            />
          }
        />
      </section>

      <section className="ti-overview__grid">
        <div className="ti-overview__panel ti-overview__panel--markets">
          <div className="ti-overview__panel-head">
            <div>
              <span className="ti-label">
                Market pulse
              </span>
              <h2>
                Core markets
              </h2>
            </div>

            <StatusBadge tone="info">
              Mock feed
            </StatusBadge>
          </div>

          <DataTable
            columns={marketColumns}
            rows={mockMarkets}
            rowKey={(market) =>
              market.symbol
            }
          />
        </div>

        <div className="ti-overview__panel">
          <div className="ti-overview__panel-head">
            <div>
              <span className="ti-label">
                Portfolio
              </span>
              <h2>
                Paper allocation
              </h2>
            </div>
          </div>

          <DataTable
            columns={
              portfolioColumns
            }
            rows={mockPortfolio}
            rowKey={(position) =>
              position.symbol
            }
          />
        </div>

        <div className="ti-overview__panel ti-overview__panel--bots">
          <div className="ti-overview__panel-head">
            <div>
              <span className="ti-label">
                Automation
              </span>
              <h2>
                Paper bots
              </h2>
            </div>

            <StatusBadge tone="neutral">
              Simulation
            </StatusBadge>
          </div>

          <DataTable
            columns={botColumns}
            rows={mockBots}
            rowKey={(bot) =>
              bot.id
            }
          />
        </div>

        <div className="ti-overview__panel">
          <div className="ti-overview__panel-head">
            <div>
              <span className="ti-label">
                Activity
              </span>
              <h2>
                Recent events
              </h2>
            </div>
          </div>

          <ActivityFeed
            items={
              mockOverviewActivity
            }
          />
        </div>
      </section>
    </div>
  );
}

export default TradingOverview;
