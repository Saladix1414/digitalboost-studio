import type {
  NftMarketplaceEngineLifecycle,
  NftMarketplaceEngineLifecycleEvent,
} from "../../nft/marketplace/orchestration/types";

import {
  createTradingActivityEvent,
} from "../factory";

function mapLifecycleType(
  event:
    NftMarketplaceEngineLifecycleEvent
) {
  switch (
    event.to
  ) {
    case "LISTING_PUBLISHED":
      return "LISTED" as const;

    case "ORDER_MATCHED":
      return "MATCHED" as const;

    case "CANCELLED":
      return "CANCELLED" as const;

    case "REJECTED":
      return "FAILED" as const;

    case "PRE_SETTLEMENT_READY":
      return "VERIFIED" as const;

    default:
      return "UPDATED" as const;
  }
}

export function activityFromNftMarketplaceLifecycleEvent(
  lifecycle:
    NftMarketplaceEngineLifecycle,
  event:
    NftMarketplaceEngineLifecycleEvent,
  sequence:
    number
) {
  const failure =
    event.to ===
      "REJECTED";

  const warning =
    event.to ===
      "CANCELLED";

  return createTradingActivityEvent({
    id:
      `activity-nft-marketplace:${lifecycle.id}:${event.sequence}`,

    domain:
      "MARKETPLACE",

    type:
      mapLifecycleType(
        event
      ),

    severity:
      failure
        ? "ERROR"
        : warning
          ? "WARNING"
          : "INFO",

    title:
      `NFT marketplace ${event.to.toLowerCase().replaceAll("_", " ")}`,

    description:
      event.reason,

    actor: {
      type:
        "SYSTEM",

      ref:
        "digitalboost:nft-marketplace-engine",
    },

    references: [
      {
        kind:
          "marketplaceLifecycle",

        ref:
          lifecycle.id,
      },

      {
        kind:
          "lifecycleVersion",

        ref:
          String(
            lifecycle.version
          ),
      },
    ],

    occurredAt:
      event.occurredAt,

    sequence,
  });
}

export function activitiesFromNftMarketplaceLifecycle(
  lifecycle:
    NftMarketplaceEngineLifecycle,
  startSequence:
    number
) {
  return lifecycle.events.map(
    (
      event,
      index
    ) =>
      activityFromNftMarketplaceLifecycleEvent(
        lifecycle,
        event,
        startSequence +
          index
      )
  );
}
