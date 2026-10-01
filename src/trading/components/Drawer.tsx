import {
  useEffect,
  type ReactNode,
} from "react";

export type DrawerSide =
  | "left"
  | "right";

export type DrawerProps = {
  readonly open: boolean;
  readonly title: ReactNode;
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly side?: DrawerSide;
  readonly footer?: ReactNode;
  readonly className?: string;
};

export function Drawer({
  open,
  title,
  children,
  onClose,
  side = "right",
  footer,
  className = "",
}: DrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="ti-drawer-layer"
      role="presentation"
    >
      <button
        type="button"
        className="ti-drawer-layer__backdrop"
        aria-label="Close drawer"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        className={[
          "ti-drawer",
          `ti-drawer--${side}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <header className="ti-drawer__header">
          <h2>{title}</h2>

          <button
            type="button"
            className="ti-overlay-close"
            aria-label="Close drawer"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="ti-drawer__body">
          {children}
        </div>

        {footer ? (
          <footer className="ti-drawer__footer">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

export default Drawer;
