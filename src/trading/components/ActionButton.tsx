import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type ActionButtonVariant =
  | "default"
  | "primary"
  | "danger"
  | "ghost";

export type ActionButtonSize =
  | "compact"
  | "standard"
  | "comfortable";

export type ActionButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    readonly variant?: ActionButtonVariant;
    readonly size?: ActionButtonSize;
    readonly icon?: ReactNode;
    readonly trailingIcon?: ReactNode;
    readonly loading?: boolean;
  };

export function ActionButton({
  variant = "default",
  size = "standard",
  icon,
  trailingIcon,
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ActionButtonProps) {
  const classes = [
    "ti-button",
    `ti-button--${variant}`,
    `ti-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      {loading ? (
        <span
          className="ti-button__spinner"
          aria-hidden="true"
        />
      ) : (
        icon
      )}

      {children ? (
        <span className="ti-button__label">
          {children}
        </span>
      ) : null}

      {!loading ? trailingIcon : null}
    </button>
  );
}

export default ActionButton;
