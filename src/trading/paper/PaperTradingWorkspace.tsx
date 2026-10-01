import {
  useMemo,
  useState,
} from "react";

import {
  useMarketData,
} from "../market-data";

import type {
  MarketSymbol,
} from "../types/trading";

import {
  createPaperAccount,
  fillPaperMarketOrder,
} from "./engine";

import {
  defaultPaperRiskLimits,
  evaluatePaperRisk,
} from "../risk";

import type {
  PaperAccountState,
  PaperOrderSide,
} from "./types";

const symbols:
  readonly MarketSymbol[] = [
    "BTC",
    "ETH",
    "SOL",
  ];

export function PaperTradingWorkspace() {
  const marketData =
    useMarketData();

  const [
    account,
    setAccount,
  ] =
    useState<PaperAccountState>(
      () =>
        createPaperAccount(
          10_000
        )
    );

  const [
    symbol,
    setSymbol,
  ] = useState<MarketSymbol>(
    "BTC"
  );

  const [
    side,
    setSide,
  ] =
    useState<PaperOrderSide>(
      "buy"
    );

  const [
    quantity,
    setQuantity,
  ] = useState(
    "0.01"
  );

  const [
    message,
    setMessage,
  ] = useState(
    "Paper account ready."
  );

  const market =
    marketData.getMarket(
      symbol
    );

  const numericQuantity =
    Number(
      quantity
    );

  const validQuantity =
    Number.isFinite(
      numericQuantity
    ) &&
    numericQuantity > 0;

  const estimatedNotional =
    market &&
    validQuantity
      ? market.price *
        numericQuantity
      : 0;

  const totalEquity =
    useMemo(
      () =>
        account.cash +
        account.positions.reduce(
          (
            total,
            position
          ) => {
            const current =
              marketData.getMarket(
                position.symbol
              );

            return (
              total +
              position.quantity *
                (
                  current?.price ??
                  position.markPrice
                )
            );
          },
          0
        ),
      [
        account,
        marketData,
      ]
    );

  const submitPaperOrder =
    () => {
      if (
        !market ||
        !validQuantity
      ) {
        setMessage(
          "Enter a valid paper quantity."
        );

        return;
      }

      const riskDecision =
        evaluatePaperRisk({
          account,

          intent: {
            symbol,
            side,

            quantity:
              numericQuantity,

            marketPrice:
              market.price,
          },

          limits:
            defaultPaperRiskLimits,
        });

      if (
        !riskDecision.approved
      ) {
        setMessage(
          riskDecision.reason
        );

        return;
      }

      const result =
        fillPaperMarketOrder(
          account,
          {
            id:
              `paper-order-${account.orders.length + 1}`,

            symbol,

            side,

            quantity:
              numericQuantity,

            marketPrice:
              market.price,

            feePercent:
              0.10,
          }
        );

      if (
        !result.accepted
      ) {
        setMessage(
          result.reason ??
            "Paper order rejected."
        );

        return;
      }

      setAccount(
        result.state
      );

      setMessage(
        `${side.toUpperCase()} ${numericQuantity} ${symbol} filled in paper mode.`
      );
    };

  return (
    <section className="ti-paper">
      <header className="ti-paper__header">
        <div>
          <span className="ti-label">
            Paper Trading
          </span>

          <h2>
            Local simulated execution
          </h2>

          <p>
            Orders update a local paper ledger only.
            No exchange connection or live capital is available.
          </p>
        </div>

        <div className="ti-paper__mode">
          PAPER ONLY
        </div>
      </header>

      <div className="ti-paper__metrics">
        <article>
          <span>
            Cash
          </span>

          <strong>
            {account.cash.toLocaleString(
              "en-US",
              {
                style:
                  "currency",
                currency:
                  "USD",
              }
            )}
          </strong>
        </article>

        <article>
          <span>
            Paper equity
          </span>

          <strong>
            {totalEquity.toLocaleString(
              "en-US",
              {
                style:
                  "currency",
                currency:
                  "USD",
              }
            )}
          </strong>
        </article>

        <article>
          <span>
            Positions
          </span>

          <strong>
            {account.positions.length}
          </strong>
        </article>

        <article>
          <span>
            Filled orders
          </span>

          <strong>
            {account.orders.filter(
              (
                order
              ) =>
                order.status ===
                "filled"
            ).length}
          </strong>
        </article>
      </div>

      <div className="ti-paper__layout">
        <section className="ti-paper__ticket">
          <header>
            <span className="ti-label">
              Paper order ticket
            </span>

            <strong>
              Market simulation
            </strong>
          </header>

          <label>
            Market

            <select
              value={symbol}
              onChange={(
                event
              ) =>
                setSymbol(
                  event.target
                    .value as MarketSymbol
                )
              }
            >
              {symbols.map(
                (
                  item
                ) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}/USDT
                  </option>
                )
              )}
            </select>
          </label>

          <div className="ti-paper__sides">
            {(
              [
                "buy",
                "sell",
              ] as const
            ).map(
              (
                item
              ) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={
                    side ===
                    item
                  }
                  className={
                    side ===
                    item
                      ? `ti-paper__side ti-paper__side--${item} ti-paper__side--active`
                      : `ti-paper__side ti-paper__side--${item}`
                  }
                  onClick={() =>
                    setSide(
                      item
                    )
                  }
                >
                  {item.toUpperCase()}
                </button>
              )
            )}
          </div>

          <label>
            Quantity

            <input
              type="number"
              min="0"
              step="0.001"
              value={quantity}
              onChange={(
                event
              ) =>
                setQuantity(
                  event.target.value
                )
              }
            />
          </label>

          <div className="ti-paper__quote">
            <span>
              Reference price
            </span>

            <strong>
              {market
                ? market.price.toLocaleString(
                    "en-US",
                    {
                      style:
                        "currency",
                      currency:
                        "USD",
                    }
                  )
                : "—"}
            </strong>
          </div>

          <div className="ti-paper__quote">
            <span>
              Estimated notional
            </span>

            <strong>
              {estimatedNotional.toLocaleString(
                "en-US",
                {
                  style:
                    "currency",
                  currency:
                    "USD",
                }
              )}
            </strong>
          </div>

          <button
            type="button"
            className="ti-paper__submit"
            disabled={
              !market ||
              !validQuantity
            }
            onClick={
              submitPaperOrder
            }
          >
            Fill paper order
          </button>

          <div
            className="ti-paper__message"
            role="status"
          >
            {message}
          </div>
        </section>

        <section className="ti-paper__panel">
          <header>
            <span className="ti-label">
              Open positions
            </span>

            <strong>
              Local holdings
            </strong>
          </header>

          {account.positions.length ===
          0 ? (
            <div className="ti-paper__empty">
              No paper positions.
            </div>
          ) : (
            <div className="ti-paper__table-wrap">
              <table className="ti-paper__table">
                <thead>
                  <tr>
                    <th>
                      Asset
                    </th>

                    <th>
                      Qty
                    </th>

                    <th>
                      Avg entry
                    </th>

                    <th>
                      Mark
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {account.positions.map(
                    (
                      position
                    ) => {
                      const current =
                        marketData.getMarket(
                          position.symbol
                        );

                      return (
                        <tr
                          key={
                            position.symbol
                          }
                        >
                          <td>
                            {position.symbol}
                          </td>

                          <td>
                            {position.quantity.toFixed(
                              6
                            )}
                          </td>

                          <td>
                            {position.averageEntryPrice.toFixed(
                              2
                            )}
                          </td>

                          <td>
                            {(
                              current?.price ??
                              position.markPrice
                            ).toFixed(
                              2
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="ti-paper__panel">
        <header>
          <span className="ti-label">
            Paper orders
          </span>

          <strong>
            Simulated fills
          </strong>
        </header>

        {account.orders.length ===
        0 ? (
          <div className="ti-paper__empty">
            No paper orders yet.
          </div>
        ) : (
          <div className="ti-paper__table-wrap">
            <table className="ti-paper__table">
              <thead>
                <tr>
                  <th>
                    ID
                  </th>

                  <th>
                    Asset
                  </th>

                  <th>
                    Side
                  </th>

                  <th>
                    Qty
                  </th>

                  <th>
                    Fill
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {[...account.orders]
                  .reverse()
                  .map(
                    (
                      order
                    ) => (
                      <tr
                        key={
                          order.id
                        }
                      >
                        <td>
                          {order.id}
                        </td>

                        <td>
                          {order.symbol}
                        </td>

                        <td>
                          {order.side}
                        </td>

                        <td>
                          {order.quantity}
                        </td>

                        <td>
                          {order.filledPrice?.toFixed(
                            2
                          ) ??
                            "—"}
                        </td>

                        <td>
                          {order.status}
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="ti-paper__panel">
        <header>
          <span className="ti-label">
            Paper ledger
          </span>

          <strong>
            Local account activity
          </strong>
        </header>

        <div className="ti-paper__ledger">
          {[...account.ledger]
            .reverse()
            .map(
              (
                entry
              ) => (
                <article
                  key={
                    entry.id
                  }
                >
                  <div>
                    <strong>
                      {entry.note}
                    </strong>

                    <span>
                      {entry.kind}
                    </span>
                  </div>

                  <div>
                    <strong>
                      {entry.amount.toFixed(
                        2
                      )}
                    </strong>

                    <span>
                      Balance{" "}
                      {entry.balanceAfter.toFixed(
                        2
                      )}
                    </span>
                  </div>
                </article>
              )
            )}
        </div>
      </section>

      <footer className="ti-paper__notice">
        Paper Trading is a local simulation. No order shown here
        is transmitted to an exchange or executed against live capital.
      </footer>
    </section>
  );
}

export default PaperTradingWorkspace;
