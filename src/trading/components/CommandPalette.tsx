import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CommandPaletteItem = {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly group?: string;
  readonly icon?: ReactNode;
  readonly keywords?: readonly string[];
  readonly disabled?: boolean;
};

export type CommandPaletteProps = {
  readonly open: boolean;
  readonly items: readonly CommandPaletteItem[];
  readonly onClose: () => void;
  readonly onSelect: (
    item: CommandPaletteItem
  ) => void;
  readonly placeholder?: string;
};

export function CommandPalette({
  open,
  items,
  onClose,
  onSelect,
  placeholder = "Search commands…",
}: CommandPaletteProps) {
  const [query, setQuery] =
    useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
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

  const filteredItems =
    useMemo(() => {
      const normalized =
        query.trim().toLowerCase();

      if (!normalized) {
        return items;
      }

      return items.filter((item) => {
        const haystack = [
          item.label,
          item.description || "",
          item.group || "",
          ...(item.keywords || []),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(
          normalized
        );
      });
    }, [items, query]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="ti-command-layer"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="ti-command-palette"
      >
        <div className="ti-command-palette__search">
          <span aria-hidden="true">
            /
          </span>

          <input
            autoFocus
            value={query}
            placeholder={placeholder}
            aria-label="Search commands"
            onChange={(event) => {
              setQuery(
                event.target.value
              );
            }}
          />

          <kbd>ESC</kbd>
        </div>

        <div className="ti-command-palette__results">
          {filteredItems.length === 0 ? (
            <div className="ti-command-palette__empty">
              No matching commands
            </div>
          ) : (
            filteredItems.map(
              (item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={
                    item.disabled
                  }
                  className="ti-command-palette__item"
                  onClick={() => {
                    if (
                      !item.disabled
                    ) {
                      onSelect(item);
                    }
                  }}
                >
                  {item.icon ? (
                    <span
                      className="ti-command-palette__icon"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                  ) : null}

                  <span className="ti-command-palette__content">
                    <strong>
                      {item.label}
                    </strong>

                    {item.description ? (
                      <small>
                        {
                          item.description
                        }
                      </small>
                    ) : null}
                  </span>

                  {item.group ? (
                    <span className="ti-command-palette__group">
                      {item.group}
                    </span>
                  ) : null}
                </button>
              )
            )
          )}
        </div>
      </section>
    </div>
  );
}

export default CommandPalette;
