import type { ReactNode } from "react";

export type ToastTone =
  | "neutral"
  | "info"
  | "positive"
  | "warning"
  | "negative";

export type ToastProps = {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly tone?: ToastTone;
  readonly action?: ReactNode;
  readonly onClose?: () => void;
  readonly className?: string;
};

export function Toast({
  title,
  description,
  tone = "neutral",
  action,
  onClose,
  className = "",
}: ToastProps) {
  return (
    <div
      role={
        tone === "negative"
          ? "alert"
          : "status"
      }
      className={[
        "ti-toast",
        `ti-toast--${tone}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className="ti-toast__indicator"
        aria-hidden="true"
      />

      <div className="ti-toast__content">
        <strong>
          {title}
        </strong>

        {description ? (
          <div className="ti-toast__description">
            {description}
          </div>
        ) : null}
      </div>

      {action ? (
        <div className="ti-toast__action">
          {action}
        </div>
      ) : null}

      {onClose ? (
        <button
          type="button"
          className="ti-toast__close"
          aria-label="Dismiss notification"
          onClick={onClose}
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

export default Toast;
