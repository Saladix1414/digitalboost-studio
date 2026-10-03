import type {
  TradingActivityTimeline,
  TradingActivityTimelineSummary,
} from "./types";

export function summarizeTradingActivityTimeline(
  timeline:
    TradingActivityTimeline
): TradingActivityTimelineSummary {
  const latest =
    timeline.events[
      timeline.events.length - 1
    ] ?? null;

  return {
    timelineId:
      timeline.id,

    correlation:
      timeline.correlation,

    eventCount:
      timeline.events.length,

    domains:
      timeline.domains,

    latestEventId:
      latest?.id ?? null,

    latestType:
      latest?.type ?? null,

    latestSeverity:
      latest?.severity ?? null,

    authoritative:
      false,
  };
}
