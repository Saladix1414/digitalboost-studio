import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CandlestickChart,
  Info,
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
  mockBots,
  mockOverviewActivity,
  mockPortfolio,
} from "../fixtures/overview";

import type {
  MarketAsset,
  PaperBotSummary,
  PortfolioPosition,
} from "../types/trading";

import {
  useMarketData,
} from "../market-data";

import type {
  TradingSection,
} from "../shell/IslandSidebar";

import MarketPulseChart from "./MarketPulseChart";

export type TradingOverviewProps = {
  readonly onNavigate: (
    section: TradingSection
  ) => void;
};

const currency =
  new Intl.NumberFormat(
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
        <strong>
          {market.symbol}
        </strong>

        <span>
          {market.pair}
        </span>
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
        {market.change24h.toFixed(
          2
        )}
        %
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
        {position.pnl.toFixed(2)}
        %
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
        <strong>
          {bot.name}
        </strong>

        <span>
          {bot.strategy}
        </span>
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
        {bot.pnl.toFixed(2)}
        %
      </span>
    ),
  },
];

const quickActions = [
  {
    id: "terminal" as const,
    label: "Open Terminal",
    description:
      "Inspect market structure and prepare analysis.",
    icon: CandlestickChart,
  },
  {
    id: "markets" as const,
    label: "Explore Markets",
    description:
      "Review the deterministic BTC, ETH and SOL universe.",
    icon: BarChart3,
  },
  {
    id: "bot-forge" as const,
    label: "Open Bot Forge",
    description:
      "Continue toward simulated strategy automation.",
    icon: Bot,
  },
];

export function TradingOverview({
  onNavigate,
}: TradingOverviewProps) {
  const marketData =
    useMarketData();

  const mockMarkets =
    marketData.getMarkets();

  const marketHealth =
    marketData.getHealth();
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
      <section className="ti-overview__harbor" aria-labelledby="ti-exchange-harbor-title">
        <div className="ti-overview__harbor-copy">
          <span className="ti-overview__harbor-kicker">TRADING ISLANDS</span>
          <h2 id="ti-exchange-harbor-title">
            Exchange <span className="ti-overview__harbor-accent">Harbor</span>
          </h2>
          <p>Simulate. Explore. Refine your strategies in a risk-free island environment.</p>
          <span className="ti-overview__disclaimer">
            <Info size={13} aria-hidden="true" />
            All data shown is local simulation. Not live trading.
          </span>
        </div>
        <span className="ti-overview__demo-flag">
          <span aria-hidden="true" />
          <span className="ti-overview__demo-copy">
            LOCAL DEMO
            <small>Simulated market data</small>
          </span>
        </span>
      </section>

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
          label="Market source"
          value={
            marketHealth.status === "ready"
              ? "Ready"
              : marketHealth.status
          }
          secondary={
            marketHealth.sourceLabel
          }
          trend="Local"
          tone={
            marketHealth.status === "ready"
              ? "positive"
              : marketHealth.status === "stale"
                ? "warning"
                : marketHealth.status === "error"
                  ? "negative"
                  : "info"
          }
          icon={
            <Activity
              size={15}
            />
          }
        />
      </section>

      <section className="ti-overview__quick-actions">
        {quickActions.map(
          (action) => {
            const Icon =
              action.icon;

            return (
              <button
                key={action.id}
                type="button"
                className="ti-overview__quick-action"
                onClick={() =>
                  onNavigate(
                    action.id
                  )
                }
              >
                <span className="ti-overview__quick-action-icon">
                  <Icon
                    size={16}
                    strokeWidth={1.7}
                  />
                </span>

                <span className="ti-overview__quick-action-copy">
                  <strong>
                    {action.label}
                  </strong>

                  <span>
                    {
                      action.description
                    }
                  </span>
                </span>

                <ArrowRight
                  size={14}
                  strokeWidth={1.7}
                />
              </button>
            );
          }
        )}
      </section>

      <MarketPulseChart />

      <section className="ti-overview__grid">
        <div className="ti-overview__panel ti-overview__panel--markets">
          <div className="ti-overview__panel-head">
            <div>
              <span className="ti-label">
                Market universe
              </span>

              <h2>
                Core markets
              </h2>
            </div>

            <StatusBadge tone="info">
              Mock feed · local
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
            <StatusBadge tone="neutral">Simulated</StatusBadge>
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
            <StatusBadge tone="neutral">Demo activity</StatusBadge>
          </div>

          <ActivityFeed
            items={
              mockOverviewActivity
            }
          />
        </div>
      </section>

      <p className="ti-overview__dbx-note" role="note">
        DBX workspace is not available in this build. Portfolio values and
        activity above are deterministic local simulations.
      </p>

</div>
  );
}

export default TradingOverview;
