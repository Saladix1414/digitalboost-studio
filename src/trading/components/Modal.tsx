import {
  useEffect,
  type ReactNode,
} from "react";

export type ModalProps = {
  readonly open: boolean;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose: () => void;
  readonly closeOnBackdrop?: boolean;
  readonly className?: string;
};

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  closeOnBackdrop = true,
  className = "",
}: ModalProps) {
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
      className="ti-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (
          closeOnBackdrop &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        className={[
          "ti-modal",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <header className="ti-modal__header">
          <div>
            <h2>{title}</h2>

            {description ? (
              <p>{description}</p>
            ) : null}
          </div>

          <button
            type="button"
            className="ti-overlay-close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="ti-modal__body">
          {children}
        </div>

        {footer ? (
          <footer className="ti-modal__footer">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}

export default Modal;
