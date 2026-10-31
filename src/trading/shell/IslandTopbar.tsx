import {
  ArrowLeft,
  Command,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import {
  ActionButton,
  StatusBadge,
} from "../components";

export type IslandTopbarProps = {
  readonly title: string;
  readonly subtitle?: string;
  readonly sidebarCollapsed: boolean;
  readonly onToggleSidebar: () => void;
  readonly onOpenCommands: () => void;
  readonly onBack?: () => void;
};

export function IslandTopbar({
  title,
  subtitle,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenCommands,
  onBack,
}: IslandTopbarProps) {
  const SidebarIcon =
    sidebarCollapsed
      ? PanelLeftOpen
      : PanelLeftClose;

  return (
    <header className="ti-shell-topbar">
      <div className="ti-shell-topbar__start">
        {onBack ? (
          <ActionButton
            variant="ghost"
            size="compact"
            icon={
              <ArrowLeft
                size={14}
                strokeWidth={1.7}
              />
            }
            onClick={onBack}
            aria-label="Back to DigitalBoost Studio"
          >
            Back
          </ActionButton>
        ) : null}

        <button
          type="button"
          className="ti-shell-topbar__sidebar-toggle"
          aria-expanded={!sidebarCollapsed}
          aria-controls="trading-islands-navigation"
          aria-label={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          onClick={onToggleSidebar}
        >
          <SidebarIcon
            size={16}
            strokeWidth={1.7}
          />
        </button>

        <div className="ti-shell-topbar__identity">
          <strong>{title}</strong>

          {subtitle ? (
            <span>{subtitle}</span>
          ) : null}
        </div>
      </div>

      <div className="ti-shell-topbar__center">
        <StatusBadge tone="info">
          Mock market
        </StatusBadge>

        <StatusBadge tone="neutral">
          Paper only
        </StatusBadge>
      </div>

      <div className="ti-shell-topbar__actions">
        <ActionButton
          variant="ghost"
          size="compact"
          icon={
            <Command
              size={14}
              strokeWidth={1.7}
            />
          }
          onClick={onOpenCommands}
        >
          Commands
        </ActionButton>

        <button
          type="button"
          className="ti-shell-topbar__mobile-menu"
          aria-expanded={!sidebarCollapsed}
          aria-controls="trading-islands-navigation"
          aria-label={
            sidebarCollapsed
              ? "Open navigation"
              : "Close navigation"
          }
          onClick={onToggleSidebar}
        >
          <Menu
            size={17}
            strokeWidth={1.7}
          />
        </button>
      </div>
    </header>
  );
}

export default IslandTopbar;
