import type { ReactNode } from "react";

export type MetricTone =
  | "neutral"
  | "positive"
  | "negative"
  | "warning"
  | "info";

export type MetricCardProps = {
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly secondary?: ReactNode;
  readonly trend?: ReactNode;
  readonly tone?: MetricTone;
  readonly icon?: ReactNode;
  readonly footer?: ReactNode;
  readonly className?: string;
};

export function MetricCard({
  label,
  value,
  secondary,
  trend,
  tone = "neutral",
  icon,
  footer,
  className = "",
}: MetricCardProps) {
  return (
    <section
      className={[
        "ti-metric-card",
        `ti-metric-card--${tone}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="ti-metric-card__head">
        <span className="ti-metric-card__label">
          {label}
        </span>

        {icon ? (
          <span
            className="ti-metric-card__icon"
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>

      <div className="ti-metric-card__body">
        <strong className="ti-metric-card__value ti-number">
          {value}
        </strong>

        {trend ? (
          <span className="ti-metric-card__trend">
            {trend}
          </span>
        ) : null}
      </div>

      {secondary ? (
        <div className="ti-metric-card__secondary">
          {secondary}
        </div>
      ) : null}

      {footer ? (
        <div className="ti-metric-card__footer">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

export default MetricCard;
