import type {
  HTMLAttributes,
  ReactNode,
} from "react";

export type StatusTone =
  | "neutral"
  | "info"
  | "positive"
  | "warning"
  | "negative";

export type StatusBadgeProps =
  HTMLAttributes<HTMLSpanElement> & {
    readonly tone?: StatusTone;
    readonly pulse?: boolean;
    readonly children: ReactNode;
  };

export function StatusBadge({
  tone = "neutral",
  pulse = false,
  children,
  className = "",
  ...props
}: StatusBadgeProps) {
  const classes = [
    "ti-status",
    `ti-status--${tone}`,
    pulse ? "ti-status--pulse" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      {...props}
      className={classes}
      data-tone={tone}
    >
      {children}
    </span>
  );
}

export default StatusBadge;
