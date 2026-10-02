import type {
  NftMarketplaceEngineLifecycle,
  NftMarketplaceEngineLifecycleStatus,
} from "./types";

const transitions:
  Record<
    NftMarketplaceEngineLifecycleStatus,
    readonly NftMarketplaceEngineLifecycleStatus[]
  > = {
    CREATED: [
      "ELIGIBILITY_VERIFIED",
      "REJECTED",
      "CANCELLED",
    ],

    ELIGIBILITY_VERIFIED: [
      "SALE_INTENT_CREATED",
      "REJECTED",
      "CANCELLED",
    ],

    SALE_INTENT_CREATED: [
      "LISTING_PUBLISHED",
      "REJECTED",
      "CANCELLED",
    ],

    LISTING_PUBLISHED: [
      "DETAIL_COMPOSED",
      "CANCELLED",
    ],

    DETAIL_COMPOSED: [
      "ORDER_CREATED",
      "CANCELLED",
    ],

    ORDER_CREATED: [
      "ORDER_MATCHED",
      "REJECTED",
      "CANCELLED",
    ],

    ORDER_MATCHED: [
      "PRE_SETTLEMENT_READY",
      "REJECTED",
      "CANCELLED",
    ],

    PRE_SETTLEMENT_READY: [],

    REJECTED: [],

    CANCELLED: [],
  };

export function canTransitionMarketplaceEngineLifecycle(
  from:
    NftMarketplaceEngineLifecycleStatus,
  to:
    NftMarketplaceEngineLifecycleStatus
): boolean {
  return transitions[from].includes(
    to
  );
}

export function createMarketplaceEngineLifecycle(
  id:
    string
): NftMarketplaceEngineLifecycle {
  return {
    id,

    status:
      "CREATED",

    version:
      1,

    events:
      [],

    authoritative:
      false,
  };
}

export function transitionMarketplaceEngineLifecycle(
  lifecycle:
    NftMarketplaceEngineLifecycle,
  to:
    NftMarketplaceEngineLifecycleStatus,
  occurredAt:
    string,
  reason:
    string
): NftMarketplaceEngineLifecycle {
  if (
    !canTransitionMarketplaceEngineLifecycle(
      lifecycle.status,
      to
    )
  ) {
    throw new Error(
      "MARKETPLACE_ENGINE_INVALID_LIFECYCLE_TRANSITION"
    );
  }

  const event = {
    sequence:
      lifecycle.events.length +
      1,

    from:
      lifecycle.status,

    to,

    occurredAt,

    reason,

    authoritative:
      false as const,
  };

  return {
    ...lifecycle,

    status:
      to,

    version:
      lifecycle.version + 1,

    events: [
      ...lifecycle.events,
      event,
    ],
  };
}
