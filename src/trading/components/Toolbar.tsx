import type { ReactNode } from "react";

export type ToolbarProps = {
  readonly start?: ReactNode;
  readonly center?: ReactNode;
  readonly end?: ReactNode;
  readonly className?: string;
  readonly ariaLabel?: string;
};

export function Toolbar({
  start,
  center,
  end,
  className = "",
  ariaLabel = "Trading toolbar",
}: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className={[
        "ti-toolbar",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="ti-toolbar__start">
        {start}
      </div>

      {center ? (
        <div className="ti-toolbar__center">
          {center}
        </div>
      ) : null}

      <div className="ti-toolbar__end">
        {end}
      </div>
    </div>
  );
}

export default Toolbar;
