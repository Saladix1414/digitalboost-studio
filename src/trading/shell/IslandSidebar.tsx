import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  CandlestickChart,
  Coins,
  Gauge,
  LineChart,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

export type TradingSection =
  | "overview"
  | "terminal"
  | "markets"
  | "strategies"
  | "bot-forge"
  | "backtests"
  | "paper"
  | "risk"
  | "nft-forge"
  | "marketplace"
  | "dbx"
  | "activity";

export type IslandSidebarProps = {
  readonly activeSection: TradingSection;
  readonly onSectionChange: (
    section: TradingSection
  ) => void;
  readonly collapsed?: boolean;
};

const groups = [
  {
    label: "Trading",
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: Gauge,
      },
      {
        id: "terminal",
        label: "Terminal",
        icon: CandlestickChart,
      },
      {
        id: "markets",
        label: "Markets",
        icon: BarChart3,
      },
      {
        id: "strategies",
        label: "Strategies",
        icon: LineChart,
      },
      {
        id: "bot-forge",
        label: "Bot Forge",
        icon: Bot,
      },
      {
        id: "backtests",
        label: "Backtests",
        icon: Activity,
      },
      {
        id: "paper",
        label: "Paper Trading",
        icon: Coins,
      },
      {
        id: "risk",
        label: "Risk",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Digital Assets",
    items: [
      {
        id: "nft-forge",
        label: "NFT Forge",
        icon: Sparkles,
      },
      {
        id: "marketplace",
        label: "Marketplace",
        icon: Store,
      },
    ],
  },
  {
    label: "Economy",
    items: [
      {
        id: "dbx",
        label: "DBX",
        icon: Boxes,
      },
      {
        id: "activity",
        label: "Activity",
        icon: Activity,
      },
    ],
  },
] as const;

export function IslandSidebar({
  activeSection,
  onSectionChange,
  collapsed = false,
}: IslandSidebarProps) {
  return (
    <aside
      className={[
        "ti-shell-sidebar",
        collapsed
          ? "ti-shell-sidebar--collapsed"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Trading Islands navigation"
    >
      <div className="ti-shell-sidebar__brand">
        <div
          className="ti-shell-sidebar__mark"
          aria-hidden="true"
        >
          TI
        </div>

        {!collapsed ? (
          <div className="ti-shell-sidebar__identity">
            <strong>Trading Islands</strong>
            <span>DigitalBoost Studio</span>
          </div>
        ) : null}
      </div>

      <nav className="ti-shell-sidebar__nav">
        {groups.map((group) => (
          <div
            key={group.label}
            className="ti-shell-sidebar__group"
          >
            {!collapsed ? (
              <div className="ti-shell-sidebar__group-label">
                {group.label}
              </div>
            ) : null}

            {group.items.map((item) => {
              const Icon = item.icon;
              const active =
                activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  title={
                    collapsed
                      ? item.label
                      : undefined
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={[
                    "ti-shell-sidebar__item",
                    active
                      ? "ti-shell-sidebar__item--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    onSectionChange(
                      item.id
                    )
                  }
                >
                  <Icon
                    size={16}
                    strokeWidth={1.7}
                  />

                  {!collapsed ? (
                    <span>
                      {item.label}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="ti-shell-sidebar__footer">
        <span className="ti-shell-sidebar__status-dot" />

        {!collapsed ? (
          <div>
            <strong>Local workspace</strong>
            <span>Mock environment</span>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export default IslandSidebar;
