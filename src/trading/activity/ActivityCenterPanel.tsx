import {
  useMemo,
  useState,
} from "react";

import {
  buildActivityCenterReadModel,
} from "./readModel/build";

import {
  queryActivityCenterReadModel,
} from "./readModel/query";

import {
  summarizeActivityCenterReadModel,
} from "./readModel/summary";

import type {
  TradingActivityEvent,
  TradingActivityItem,
} from "./types";

type ActivityCenterPanelProps = {
  readonly legacyItems:
    readonly TradingActivityItem[];

  readonly unifiedEvents?:
    readonly TradingActivityEvent[];
};

type ViewMode =
  | "ALL"
  | "LEGACY"
  | "UNIFIED";

function severityClass(
  severity:
    "INFO" |
    "SUCCESS" |
    "WARNING" |
    "ERROR"
) {
  switch (
    severity
  ) {
    case "SUCCESS":
      return "success";

    case "WARNING":
      return "warning";

    case "ERROR":
      return "danger";

    default:
      return "info";
  }
}

export function ActivityCenterPanel({
  legacyItems,
  unifiedEvents = [],
}:
  ActivityCenterPanelProps
) {
  const [
    viewMode,
    setViewMode,
  ] =
    useState<ViewMode>(
      "ALL"
    );

  const model =
    useMemo(
      () =>
        buildActivityCenterReadModel({
          legacyItems,
          unifiedEvents,
        }),
      [
        legacyItems,
        unifiedEvents,
      ]
    );

  const summary =
    useMemo(
      () =>
        summarizeActivityCenterReadModel(
          model
        ),
      [model]
    );

  const visibleItems =
    useMemo(
      () =>
        viewMode === "ALL"
          ? model.items
          : queryActivityCenterReadModel(
              model,
              {
                sourceModel:
                  viewMode,
              }
            ),
      [
        model,
        viewMode,
      ]
    );

  return (
    <section className="ti-activity__panel">
      <header>
        <div>
          <span className="ti-label">
            Unified Activity Center
          </span>

          <strong>
            {summary.total} observable events
          </strong>
        </div>

        <div className="ti-activity__mode">
          READ MODEL · NON-AUTHORITATIVE
        </div>
      </header>

      <div
        aria-label="Activity Center filters"
        role="group"
      >
        <button
          type="button"
          aria-pressed={
            viewMode === "ALL"
          }
          onClick={
            () =>
              setViewMode(
                "ALL"
              )
          }
        >
          ALL · {summary.total}
        </button>

        <button
          type="button"
          aria-pressed={
            viewMode === "LEGACY"
          }
          onClick={
            () =>
              setViewMode(
                "LEGACY"
              )
          }
        >
          LEGACY · {summary.legacy}
        </button>

        <button
          type="button"
          aria-pressed={
            viewMode === "UNIFIED"
          }
          onClick={
            () =>
              setViewMode(
                "UNIFIED"
              )
          }
        >
          UNIFIED · {summary.unified}
        </button>
      </div>

      <p>
        Approval-authority evidence:{" "}
        <strong>
          {summary.approvalAuthority}
        </strong>
        . Activity visibility never grants authority.
      </p>

      <div className="ti-activity__timeline">
        {visibleItems.length ===
        0 ? (
          <p>
            No activity matches this view.
          </p>
        ) : (
          visibleItems.map(
            item => (
              <article
                key={
                  `${item.sourceModel}:${item.id}`
                }
                className={`ti-activity__item ti-activity__item--${severityClass(
                  item.severity
                )}`}
              >
                <div className="ti-activity__sequence">
                  {String(
                    item.sourceSequence
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div className="ti-activity__body">
                  <div className="ti-activity__title-row">
                    <div>
                      <strong>
                        {item.title}
                      </strong>

                      <p>
                        {item.message}
                      </p>
                    </div>

                    <span
                      className={`ti-activity__authority ti-activity__authority--${item.authority}`}
                    >
                      {item.authority ===
                      "approval"
                        ? "APPROVAL AUTHORITY"
                        : "NON-AUTHORITATIVE"}
                    </span>
                  </div>

                  <div className="ti-activity__meta">
                    <span>
                      MODEL · {item.sourceModel}
                    </span>

                    <span>
                      SOURCE · {item.source}
                    </span>

                    {item.domain && (
                      <span>
                        DOMAIN · {item.domain}
                      </span>
                    )}

                    <span>
                      TIME ·{" "}
                      {item.occurredAt ??
                        "SOURCE DOES NOT PROVIDE TIMESTAMP"}
                    </span>

                    {item.actorRef && (
                      <span>
                        ACTOR · {item.actorRef}
                      </span>
                    )}

                    {item.references.map(
                      reference => (
                        <span
                          key={
                            `${reference.kind}:${reference.ref}`
                          }
                        >
                          {reference.kind.toUpperCase()} ·{" "}
                          {reference.ref}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </article>
            )
          )
        )}
      </div>
    </section>
  );
}

export default ActivityCenterPanel;
