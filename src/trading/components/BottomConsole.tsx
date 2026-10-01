import type { ReactNode } from "react";

export type BottomConsoleTab = {
  readonly id: string;
  readonly label: ReactNode;
};

export type BottomConsoleProps = {
  readonly tabs: readonly BottomConsoleTab[];
  readonly activeId: string;
  readonly onChange: (id: string) => void;
  readonly status?: ReactNode;
  readonly children?: ReactNode;
  readonly collapsed?: boolean;
  readonly onToggle?: () => void;
  readonly className?: string;
};

export function BottomConsole({
  tabs,
  activeId,
  onChange,
  status,
  children,
  collapsed = false,
  onToggle,
  className = "",
}: BottomConsoleProps) {
  return (
    <section
      className={[
        "ti-bottom-console",
        collapsed
          ? "ti-bottom-console--collapsed"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="ti-bottom-console__bar">
        <div
          role="tablist"
          aria-label="Console panels"
          className="ti-bottom-console__tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={
                activeId === tab.id
              }
              className={[
                "ti-bottom-console__tab",
                activeId === tab.id
                  ? "ti-bottom-console__tab--active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                onChange(tab.id)
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ti-bottom-console__status">
          {status}
        </div>

        {onToggle ? (
          <button
            type="button"
            className="ti-bottom-console__toggle"
            aria-label={
              collapsed
                ? "Expand console"
                : "Collapse console"
            }
            onClick={onToggle}
          >
            {collapsed ? "⌃" : "⌄"}
          </button>
        ) : null}
      </header>

      {!collapsed ? (
        <div className="ti-bottom-console__content">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export default BottomConsole;
