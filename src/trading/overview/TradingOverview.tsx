import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CandlestickChart,
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

      {/* DBX_ACTIONS_START */}
      <div
        data-testid="dbx-overview-actions"
        aria-label="DBX actions"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          maxWidth: 300,
          marginTop: 18,
        }}
      >
        <button
          type="button"
          data-dbx-action="purchase"
          aria-label="Comprar DBX"
          title="Comprar DBX"
          style={{
            appearance: "none",
            width: "100%",
            minHeight: 48,
            padding: "0 18px",
            borderRadius: 12,
            border:
              "1px solid rgba(56,189,248,0.42)",
            background:
              "linear-gradient(180deg, rgba(14,165,233,0.22) 0%, rgba(3,105,161,0.13) 100%)",
            color: "#effaff",
            fontSize: 14,
            fontWeight: 750,
            letterSpacing: "0.01em",
            cursor: "pointer",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(2,132,199,0.08)",
            transition:
              "border-color 160ms ease, background 160ms ease, transform 160ms ease",
          }}
        >
          Comprar DBX
        </button>

        <button
          type="button"
          data-dbx-action="rewards"
          data-dbx-rewards-type="usage-credit"
          aria-label="DBX Rewards"
          title="DBX Rewards"
          style={{
            appearance: "none",
            width: "100%",
            minHeight: 48,
            padding: "0 18px",
            borderRadius: 12,
            border:
              "1px solid rgba(45,212,191,0.30)",
            background:
              "linear-gradient(180deg, rgba(15,118,110,0.13) 0%, rgba(15,23,42,0.74) 100%)",
            color: "#e4fffb",
            fontSize: 14,
            fontWeight: 750,
            letterSpacing: "0.01em",
            cursor: "pointer",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.035)",
            transition:
              "border-color 160ms ease, background 160ms ease, transform 160ms ease",
          }}
        >
          DBX Rewards
        </button>
      </div>
      {/* DBX_ACTIONS_END */}

</div>
  );
}

export default TradingOverview;
