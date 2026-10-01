import type {
  IndicatorPoint,
} from "../indicators";

export type RsiPanelProps = {
  readonly points:
    readonly IndicatorPoint[];
};

const WIDTH = 860;
const HEIGHT = 140;
const PAD_X = 42;
const PAD_Y = 18;

function mapY(
  value: number
) {
  const bounded =
    Math.max(
      0,
      Math.min(
        100,
        value
      )
    );

  return (
    PAD_Y +
    (
      1 -
      bounded / 100
    ) *
      (
        HEIGHT -
        PAD_Y * 2
      )
  );
}

export function RsiPanel({
  points,
}: RsiPanelProps) {
  if (points.length === 0) {
    return null;
  }

  const slot =
    (
      WIDTH -
      PAD_X * 2
    ) /
    Math.max(
      1,
      points.length
    );

  const path =
    points
      .map(
        (
          point,
          index
        ) => {
          const x =
            PAD_X +
            slot * index +
            slot / 2;

          const command =
            index === 0
              ? "M"
              : "L";

          return `${command} ${x} ${mapY(point.value)}`;
        }
      )
      .join(" ");

  const y70 =
    mapY(70);

  const y50 =
    mapY(50);

  const y30 =
    mapY(30);

  return (
    <div className="ti-terminal-rsi">
      <div className="ti-terminal-rsi__head">
        <span>
          RSI 14
        </span>

        <strong>
          {points[
            points.length - 1
          ]?.value.toFixed(1)}
        </strong>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="RSI 14 deterministic indicator"
      >
        <rect
          className="ti-terminal-rsi__zone ti-terminal-rsi__zone--upper"
          x={PAD_X}
          y={PAD_Y}
          width={
            WIDTH -
            PAD_X * 2
          }
          height={
            y70 -
            PAD_Y
          }
        />

        <rect
          className="ti-terminal-rsi__zone ti-terminal-rsi__zone--lower"
          x={PAD_X}
          y={y30}
          width={
            WIDTH -
            PAD_X * 2
          }
          height={
            HEIGHT -
            PAD_Y -
            y30
          }
        />

        {[70, 50, 30].map(
          (level) => (
            <line
              key={level}
              className="ti-terminal-rsi__guide"
              x1={PAD_X}
              x2={
                WIDTH -
                PAD_X
              }
              y1={mapY(level)}
              y2={mapY(level)}
            />
          )
        )}

        <path
          className="ti-terminal-rsi__line"
          d={path}
          fill="none"
        />

        <text
          className="ti-terminal-rsi__label"
          x={8}
          y={y70 + 3}
        >
          70
        </text>

        <text
          className="ti-terminal-rsi__label"
          x={8}
          y={y50 + 3}
        >
          50
        </text>

        <text
          className="ti-terminal-rsi__label"
          x={8}
          y={y30 + 3}
        >
          30
        </text>
      </svg>
    </div>
  );
}

export default RsiPanel;
