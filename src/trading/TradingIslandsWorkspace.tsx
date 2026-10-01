import {
  useMemo,
  useState,
} from "react";

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

import {
  CommandPalette,
  EmptyState,
  StatusBadge,
  WorkspaceTabs,
  type CommandPaletteItem,
} from "./components";

import {
  IslandShell,
} from "./shell/IslandShell";

import type {
  TradingSection,
} from "./shell/IslandSidebar";

import TradingOverview from "./overview/TradingOverview";
import TradingTerminal from "./terminal/TradingTerminal";
import StrategyBuilder from "./strategy/StrategyBuilder";
import BacktestWorkspace from "./backtest/BacktestWorkspace";
import PaperTradingWorkspace from "./paper/PaperTradingWorkspace";
import BotForgeWorkspace from "./bots/BotForgeWorkspace";

import {
  MarketDataProvider,
} from "./market-data";

import "./trading-islands.css";

export type TradingIslandsWorkspaceProps = {
  readonly onBack?: () => void;
};

const sectionMeta: Record<
  TradingSection,
  {
    title: string;
    subtitle: string;
    icon: typeof Gauge;
  }
> = {
  overview: {
    title: "Overview",
    subtitle:
      "Trading operations, assets and system state.",
    icon: Gauge,
  },

  terminal: {
    title: "Trading Terminal",
    subtitle:
      "Market analysis and execution workspace.",
    icon: CandlestickChart,
  },

  markets: {
    title: "Markets",
    subtitle:
      "Discover and inspect market structure.",
    icon: BarChart3,
  },

  strategies: {
    title: "Strategies",
    subtitle:
      "Design and evaluate trading logic.",
    icon: LineChart,
  },

  "bot-forge": {
    title: "Bot Forge",
    subtitle:
      "Compose automated trading systems.",
    icon: Bot,
  },

  backtests: {
    title: "Backtests",
    subtitle:
      "Evaluate strategies against deterministic history.",
    icon: Activity,
  },

  paper: {
    title: "Paper Trading",
    subtitle:
      "Simulated execution without live capital.",
    icon: Coins,
  },

  risk: {
    title: "Risk",
    subtitle:
      "Review exposure, controls and operational limits.",
    icon: ShieldCheck,
  },

  "nft-forge": {
    title: "NFT Forge",
    subtitle:
      "Create digital assets and collection structures.",
    icon: Sparkles,
  },

  marketplace: {
    title: "Marketplace",
    subtitle:
      "Digital asset discovery and market surfaces.",
    icon: Store,
  },

  dbx: {
    title: "DBX",
    subtitle:
      "DigitalBoost internal operating economy.",
    icon: Boxes,
  },

  activity: {
    title: "Activity",
    subtitle:
      "Workspace events and operational history.",
    icon: Activity,
  },
};

const consoleTabs = [
  {
    id: "events",
    label: "Events",
  },
  {
    id: "logs",
    label: "Logs",
  },
  {
    id: "runtime",
    label: "Runtime",
  },
] as const;

const workspaceTabs = [
  {
    id: "workspace",
    label: "Workspace",
  },
  {
    id: "research",
    label: "Research",
  },
  {
    id: "notes",
    label: "Notes",
  },
] as const;

export function TradingIslandsWorkspace({
  onBack,
}: TradingIslandsWorkspaceProps) {
  const [
    activeSection,
    setActiveSection,
  ] = useState<TradingSection>(
    "overview"
  );

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [
    commandsOpen,
    setCommandsOpen,
  ] = useState(false);

  const [
    activeConsole,
    setActiveConsole,
  ] = useState("events");

  const [
    consoleCollapsed,
    setConsoleCollapsed,
  ] = useState(true);

  const [
    activeWorkspaceTab,
    setActiveWorkspaceTab,
  ] = useState("workspace");

  const activeMeta =
    sectionMeta[activeSection];

  const commands =
    useMemo<CommandPaletteItem[]>(
      () =>
        (
          Object.entries(
            sectionMeta
          ) as Array<
            [
              TradingSection,
              (typeof sectionMeta)[TradingSection]
            ]
          >
        ).map(
          ([
            id,
            meta,
          ]) => ({
            id,
            label: meta.title,
            description:
              meta.subtitle,
            group:
              id === "nft-forge" ||
              id === "marketplace"
                ? "Digital Assets"
                : id === "dbx" ||
                    id === "activity"
                  ? "Economy"
                  : "Trading",
          })
        ),
      []
    );

  const ActiveIcon =
    activeMeta.icon;

  return (
    <MarketDataProvider>
      <>
        <IslandShell
        activeSection={activeSection}
        onSectionChange={
          setActiveSection
        }
        sidebarCollapsed={
          sidebarCollapsed
        }
        onToggleSidebar={() =>
          setSidebarCollapsed(
            (value) => !value
          )
        }
        onOpenCommands={() =>
          setCommandsOpen(true)
        }
        title={activeMeta.title}
        subtitle={
          activeMeta.subtitle
        }
        consoleTabs={consoleTabs}
        activeConsole={
          activeConsole
        }
        onConsoleChange={
          setActiveConsole
        }
        consoleCollapsed={
          consoleCollapsed
        }
        onToggleConsole={() =>
          setConsoleCollapsed(
            (value) => !value
          )
        }
        consoleContent={
          <div className="ti-shell-console-placeholder">
            <span className="ti-positive">
              ready
            </span>
            {" · "}
            deterministic local workspace
            {" · "}
            {activeConsole}
          </div>
        }
        onBack={onBack}
      >
        <div className="ti-shell-page">
          <div className="ti-shell-page__head">
            <div>
              <div className="ti-label">
                Trading Islands
              </div>

              <h1 className="ti-title">
                {activeMeta.title}
              </h1>

              <p className="ti-shell-page__subtitle">
                {activeMeta.subtitle}
              </p>
            </div>

            <StatusBadge tone="neutral">
              Foundation
            </StatusBadge>
          </div>

          <WorkspaceTabs
            tabs={workspaceTabs}
            activeId={
              activeWorkspaceTab
            }
            onChange={
              setActiveWorkspaceTab
            }
            ariaLabel={`${activeMeta.title} workspace`}
          />

          <section className="ti-shell-stage">
            {activeSection === "overview" &&
            activeWorkspaceTab === "workspace" ? (
              <TradingOverview
                onNavigate={setActiveSection}
              />
            ) : activeSection === "terminal" &&
              activeWorkspaceTab === "workspace" ? (
              <TradingTerminal />
            ) : activeSection === "strategies" &&
              activeWorkspaceTab === "workspace" ? (
              <StrategyBuilder />
            ) : activeSection === "backtests" &&
              activeWorkspaceTab === "workspace" ? (
              <BacktestWorkspace />
            ) : activeSection === "paper" &&
              activeWorkspaceTab === "workspace" ? (
              <PaperTradingWorkspace />
            ) : activeSection === "bot-forge" &&
              activeWorkspaceTab === "workspace" ? (
              <BotForgeWorkspace />
            ) : (
              <EmptyState
                icon={
                  <ActiveIcon
                    size={21}
                    strokeWidth={1.5}
                  />
                }
                title={`${activeMeta.title} workspace ready`}
                description={
                  activeWorkspaceTab ===
                  "workspace"
                    ? "This workspace is prepared for the next product phase."
                    : `${activeWorkspaceTab} is reserved for the upcoming product workflow.`
                }
              />
            )}
          </section>
        </div>
      </IslandShell>

      <CommandPalette
        open={commandsOpen}
        items={commands}
        onClose={() =>
          setCommandsOpen(false)
        }
        onSelect={(item) => {
          setActiveSection(
            item.id as TradingSection
          );

          setCommandsOpen(false);
        }}
        placeholder="Navigate Trading Islands…"
      />
      </>
    </MarketDataProvider>
  );
}

export default TradingIslandsWorkspace;
