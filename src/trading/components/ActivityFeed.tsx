import type { ReactNode } from "react";

export type ActivityTone =
  | "neutral"
  | "info"
  | "positive"
  | "warning"
  | "negative";

export type ActivityItem = {
  readonly id: string;
  readonly title: ReactNode;
  readonly detail?: ReactNode;
  readonly time?: ReactNode;
  readonly icon?: ReactNode;
  readonly tone?: ActivityTone;
};

export type ActivityFeedProps = {
  readonly items: readonly ActivityItem[];
  readonly empty?: ReactNode;
  readonly className?: string;
};

export function ActivityFeed({
  items,
  empty = "No recent activity",
  className = "",
}: ActivityFeedProps) {
  return (
    <div
      className={[
        "ti-activity-feed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.length === 0 ? (
        <div className="ti-activity-feed__empty">
          {empty}
        </div>
      ) : (
        items.map((item) => (
          <article
            key={item.id}
            className={[
              "ti-activity-feed__item",
              `ti-activity-feed__item--${item.tone || "neutral"}`,
            ].join(" ")}
          >
            <div className="ti-activity-feed__rail">
              <span className="ti-activity-feed__dot">
                {item.icon}
              </span>
            </div>

            <div className="ti-activity-feed__content">
              <div className="ti-activity-feed__headline">
                <strong>
                  {item.title}
                </strong>

                {item.time ? (
                  <time>
                    {item.time}
                  </time>
                ) : null}
              </div>

              {item.detail ? (
                <div className="ti-activity-feed__detail">
                  {item.detail}
                </div>
              ) : null}
            </div>
          </article>
        ))
      )}
    </div>
  );
}

export default ActivityFeed;
