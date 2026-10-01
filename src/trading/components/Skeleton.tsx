import type { CSSProperties } from "react";

export type SkeletonProps = {
  readonly width?: CSSProperties["width"];
  readonly height?: CSSProperties["height"];
  readonly radius?: CSSProperties["borderRadius"];
  readonly className?: string;
  readonly ariaLabel?: string;
};

export function Skeleton({
  width = "100%",
  height = 12,
  radius,
  className = "",
  ariaLabel = "Loading",
}: SkeletonProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={[
        "ti-skeleton",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
}

export default Skeleton;
