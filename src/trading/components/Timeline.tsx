import type { ReactNode } from "react";

export type TimelineState =
  | "pending"
  | "active"
  | "complete"
  | "warning"
  | "failed";

export type TimelineItem = {
  readonly id: string;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly meta?: ReactNode;
  readonly state?: TimelineState;
};

export type TimelineProps = {
  readonly items: readonly TimelineItem[];
  readonly className?: string;
};

export function Timeline({
  items,
  className = "",
}: TimelineProps) {
  return (
    <ol
      className={[
        "ti-timeline",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className={[
            "ti-timeline__item",
            `ti-timeline__item--${item.state || "pending"}`,
          ].join(" ")}
        >
          <div className="ti-timeline__marker">
            <span />
          </div>

          <div className="ti-timeline__content">
            <div className="ti-timeline__head">
              <strong>
                {item.title}
              </strong>

              {item.meta ? (
                <span>
                  {item.meta}
                </span>
              ) : null}
            </div>

            {item.description ? (
              <div className="ti-timeline__description">
                {item.description}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default Timeline;
