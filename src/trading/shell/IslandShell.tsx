import type { ReactNode } from "react";

import {
  BottomConsole,
  type BottomConsoleTab,
} from "../components";

import {
  IslandSidebar,
  type TradingSection,
} from "./IslandSidebar";

import {
  IslandTopbar,
} from "./IslandTopbar";

export type IslandShellProps = {
  readonly activeSection: TradingSection;
  readonly onSectionChange: (
    section: TradingSection
  ) => void;
  readonly sidebarCollapsed: boolean;
  readonly onToggleSidebar: () => void;
  readonly onOpenCommands: () => void;
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
  readonly consoleTabs: readonly BottomConsoleTab[];
  readonly activeConsole: string;
  readonly onConsoleChange: (
    id: string
  ) => void;
  readonly consoleCollapsed: boolean;
  readonly onToggleConsole: () => void;
  readonly consoleContent?: ReactNode;
  readonly onBack?: () => void;
};

export function IslandShell({
  activeSection,
  onSectionChange,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenCommands,
  title,
  subtitle,
  children,
  consoleTabs,
  activeConsole,
  onConsoleChange,
  consoleCollapsed,
  onToggleConsole,
  consoleContent,
  onBack,
}: IslandShellProps) {
  return (
    <div
      data-trading-islands="true"
      className={[
        "ti-shell",
        sidebarCollapsed
          ? "ti-shell--sidebar-collapsed"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <IslandTopbar
        title={title}
        subtitle={subtitle}
        sidebarCollapsed={
          sidebarCollapsed
        }
        onToggleSidebar={
          onToggleSidebar
        }
        onOpenCommands={
          onOpenCommands
        }
        onBack={onBack}
      />

      <div className="ti-shell__workspace">
        <IslandSidebar
          activeSection={activeSection}
          onSectionChange={
            onSectionChange
          }
          collapsed={
            sidebarCollapsed
          }
        />

        <main className="ti-shell__main">
          {children}
        </main>
      </div>

      <BottomConsole
        tabs={consoleTabs}
        activeId={activeConsole}
        onChange={onConsoleChange}
        collapsed={consoleCollapsed}
        onToggle={onToggleConsole}
        status={
          <span>
            Trading Islands · local deterministic state
          </span>
        }
      >
        {consoleContent}
      </BottomConsole>
    </div>
  );
}

export default IslandShell;
