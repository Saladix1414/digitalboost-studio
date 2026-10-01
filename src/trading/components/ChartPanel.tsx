import type { ReactNode } from "react";

export type ChartPanelProps = {
  readonly title: ReactNode;
  readonly subtitle?: ReactNode;
  readonly actions?: ReactNode;
  readonly legend?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly className?: string;
};

export function ChartPanel({
  title,
  subtitle,
  actions,
  legend,
  children,
  footer,
  className = "",
}: ChartPanelProps) {
  return (
    <section
      className={[
        "ti-chart-panel",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="ti-chart-panel__header">
        <div className="ti-chart-panel__identity">
          <h2>{title}</h2>

          {subtitle ? (
            <div className="ti-chart-panel__subtitle">
              {subtitle}
            </div>
          ) : null}
        </div>

        {actions ? (
          <div className="ti-chart-panel__actions">
            {actions}
          </div>
        ) : null}
      </header>

      {legend ? (
        <div className="ti-chart-panel__legend">
          {legend}
        </div>
      ) : null}

      <div className="ti-chart-panel__canvas ti-chart-surface">
        {children}
      </div>

      {footer ? (
        <footer className="ti-chart-panel__footer">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

export default ChartPanel;
