import {
  useState,
} from "react";

import {
  mockPaperOrders,
  mockPaperPositions,
} from "../fixtures/paperTrading";

export function TerminalActivityPanel() {
  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "positions" | "orders"
  >("positions");

  return (
    <section className="ti-terminal-activity">
      <header className="ti-terminal-activity__tabs">
        <button
          type="button"
          aria-pressed={
            activeTab ===
            "positions"
          }
          className={
            activeTab ===
            "positions"
              ? "ti-terminal-activity__tab ti-terminal-activity__tab--active"
              : "ti-terminal-activity__tab"
          }
          onClick={() =>
            setActiveTab(
              "positions"
            )
          }
        >
          Positions
        </button>

        <button
          type="button"
          aria-pressed={
            activeTab ===
            "orders"
          }
          className={
            activeTab ===
            "orders"
              ? "ti-terminal-activity__tab ti-terminal-activity__tab--active"
              : "ti-terminal-activity__tab"
          }
          onClick={() =>
            setActiveTab(
              "orders"
            )
          }
        >
          Orders
        </button>
      </header>

      {activeTab ===
      "positions" ? (
        <div className="ti-terminal-activity__rows">
          {mockPaperPositions.map(
            (position) => (
              <div
                key={
                  position.id
                }
                className="ti-terminal-activity__row"
              >
                <span>
                  <strong>
                    {
                      position.symbol
                    }
                  </strong>

                  <small>
                    {
                      position.side
                    }
                  </small>
                </span>

                <span>
                  Qty
                  <strong>
                    {
                      position.quantity
                    }
                  </strong>
                </span>

                <span>
                  Entry
                  <strong>
                    {
                      position.entryPrice
                    }
                  </strong>
                </span>

                <span>
                  P/L
                  <strong
                    className={
                      position.pnl >=
                      0
                        ? "ti-positive"
                        : "ti-negative"
                    }
                  >
                    {position.pnl.toFixed(
                      2
                    )}
                  </strong>
                </span>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="ti-terminal-activity__rows">
          {mockPaperOrders.map(
            (order) => (
              <div
                key={order.id}
                className="ti-terminal-activity__row"
              >
                <span>
                  <strong>
                    {
                      order.symbol
                    }
                  </strong>

                  <small>
                    {
                      order.side
                    }
                  </small>
                </span>

                <span>
                  Type
                  <strong>
                    {
                      order.type
                    }
                  </strong>
                </span>

                <span>
                  Price
                  <strong>
                    {
                      order.price
                    }
                  </strong>
                </span>

                <span>
                  Status
                  <strong>
                    {
                      order.status
                    }
                  </strong>
                </span>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

export default TerminalActivityPanel;
