import type { ReactNode } from "react";

export type EmptyStateProps = {
  readonly icon?: ReactNode;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly compact?: boolean;
  readonly className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "ti-empty-state",
        compact
          ? "ti-empty-state--compact"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? (
        <div className="ti-empty-state__icon">
          {icon}
        </div>
      ) : null}

      <strong className="ti-empty-state__title">
        {title}
      </strong>

      {description ? (
        <p className="ti-empty-state__description">
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="ti-empty-state__action">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export default EmptyState;
