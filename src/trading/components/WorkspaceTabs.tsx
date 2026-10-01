import type { ReactNode } from "react";

export type WorkspaceTab = {
  readonly id: string;
  readonly label: ReactNode;
  readonly icon?: ReactNode;
  readonly badge?: ReactNode;
  readonly disabled?: boolean;
};

export type WorkspaceTabsProps = {
  readonly tabs: readonly WorkspaceTab[];
  readonly activeId: string;
  readonly onChange: (id: string) => void;
  readonly ariaLabel?: string;
  readonly className?: string;
};

export function WorkspaceTabs({
  tabs,
  activeId,
  onChange,
  ariaLabel = "Workspace tabs",
  className = "",
}: WorkspaceTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={[
        "ti-workspace-tabs",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {tabs.map((tab) => {
        const active =
          tab.id === activeId;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={
              tab.disabled || undefined
            }
            disabled={tab.disabled}
            className={[
              "ti-workspace-tabs__item",
              active
                ? "ti-workspace-tabs__item--active"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              if (!tab.disabled) {
                onChange(tab.id);
              }
            }}
          >
            {tab.icon ? (
              <span
                className="ti-workspace-tabs__icon"
                aria-hidden="true"
              >
                {tab.icon}
              </span>
            ) : null}

            <span className="ti-workspace-tabs__label">
              {tab.label}
            </span>

            {tab.badge ? (
              <span className="ti-workspace-tabs__badge">
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default WorkspaceTabs;
