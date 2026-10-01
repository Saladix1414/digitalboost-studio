import type { ReactNode } from "react";

export type FilterBarProps = {
  readonly label?: ReactNode;
  readonly children: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string;
};

export function FilterBar({
  label,
  children,
  actions,
  className = "",
}: FilterBarProps) {
  return (
    <div
      className={[
        "ti-filter-bar",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label ? (
        <div className="ti-filter-bar__label">
          {label}
        </div>
      ) : null}

      <div className="ti-filter-bar__controls">
        {children}
      </div>

      {actions ? (
        <div className="ti-filter-bar__actions">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export default FilterBar;
