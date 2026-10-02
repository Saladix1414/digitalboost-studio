import type {
  NftMarketplaceBuyer,
  NftMarketplaceEligibilityResult,
  NftMarketplaceListing,
  NftMarketplaceOrderIntent,
  NftMarketplacePreSettlement,
  NftMarketplaceSaleIntent,
} from "../types";

import type {
  NftAssetDetail,
} from "../../detail/types";

export type NftMarketplaceEngineStage =
  | "ELIGIBILITY"
  | "SALE_INTENT"
  | "LISTED"
  | "DETAIL"
  | "ORDER_INTENT"
  | "MATCHED"
  | "PRE_SETTLEMENT_READY";

export type NftMarketplaceEnginePresentation = {
  readonly title:
    string;

  readonly subtitle:
    string;

  readonly imageRef:
    string | null;

  readonly featured:
    boolean;
};

export type NftMarketplaceEngineClock = {
  readonly saleIntentAt:
    string;

  readonly listedAt:
    string;

  readonly orderCreatedAt:
    string;

  readonly orderMatchedAt:
    string;

  readonly preSettlementAt:
    string;
};

export type NftMarketplaceEngineInput = {
  readonly listing:
    NftMarketplaceListing;

  readonly buyer:
    NftMarketplaceBuyer;

  readonly orderId:
    string;

  readonly presentation:
    NftMarketplaceEnginePresentation;

  readonly clock:
    NftMarketplaceEngineClock;
};

export type NftMarketplaceEngineSnapshot = {
  readonly stage:
    NftMarketplaceEngineStage;

  readonly eligibility:
    NftMarketplaceEligibilityResult;

  readonly saleIntent:
    NftMarketplaceSaleIntent;

  readonly listing:
    NftMarketplaceListing;

  readonly detail:
    NftAssetDetail;

  readonly order:
    NftMarketplaceOrderIntent;

  readonly preSettlement:
    NftMarketplacePreSettlement;

  readonly execution:
    "NONE";

  readonly authoritative:
    false;
};

export type NftMarketplaceEngineLifecycleStatus =
  | "CREATED"
  | "ELIGIBILITY_VERIFIED"
  | "SALE_INTENT_CREATED"
  | "LISTING_PUBLISHED"
  | "DETAIL_COMPOSED"
  | "ORDER_CREATED"
  | "ORDER_MATCHED"
  | "PRE_SETTLEMENT_READY"
  | "REJECTED"
  | "CANCELLED";

export type NftMarketplaceEngineLifecycleEvent = {
  readonly sequence:
    number;

  readonly from:
    NftMarketplaceEngineLifecycleStatus;

  readonly to:
    NftMarketplaceEngineLifecycleStatus;

  readonly occurredAt:
    string;

  readonly reason:
    string;

  readonly authoritative:
    false;
};

export type NftMarketplaceEngineLifecycle = {
  readonly id:
    string;

  readonly status:
    NftMarketplaceEngineLifecycleStatus;

  readonly version:
    number;

  readonly events:
    readonly NftMarketplaceEngineLifecycleEvent[];

  readonly authoritative:
    false;
};

export type NftMarketplaceEngineTraceKind =
  | "LIFECYCLE"
  | "DOMAIN"
  | "GUARD"
  | "BOUNDARY";

export type NftMarketplaceEngineTraceLevel =
  | "INFO"
  | "WARN"
  | "ERROR";

export type NftMarketplaceEngineTraceEntry = {
  readonly sequence:
    number;

  readonly kind:
    NftMarketplaceEngineTraceKind;

  readonly level:
    NftMarketplaceEngineTraceLevel;

  readonly code:
    string;

  readonly message:
    string;

  readonly occurredAt:
    string;

  readonly authoritative:
    false;
};

export type NftMarketplaceEngineFailureCode =
  | "NONE"
  | "ELIGIBILITY_REJECTED"
  | "INVALID_LIFECYCLE_TRANSITION"
  | "ORDER_VALIDATION_FAILED"
  | "PRE_SETTLEMENT_REJECTED";

export type NftMarketplaceEngineObservability = {
  readonly trace:
    readonly NftMarketplaceEngineTraceEntry[];

  readonly failureCode:
    NftMarketplaceEngineFailureCode;

  readonly failed:
    boolean;

  readonly authoritative:
    false;
};
