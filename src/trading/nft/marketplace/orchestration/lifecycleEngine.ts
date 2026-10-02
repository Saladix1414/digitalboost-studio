import {
  buildNftAssetDetail,
} from "../../detail/builder";

import type {
  NftMarketplaceCatalogItem,
} from "../catalog/types";

import {
  evaluateFixtureMarketplaceEligibility,
} from "../eligibilityBridge";

import {
  updateMarketplaceListingStatus,
} from "../engine";

import {
  createMarketplaceOrderIntent,
} from "../orderIntent";

import {
  matchMarketplaceOrder,
} from "../orderMatch";

import {
  createMarketplacePreSettlement,
} from "../preSettlement";

import {
  createMarketplaceSaleIntent,
} from "../saleIntent";

import {
  createMarketplaceEngineLifecycle,
  transitionMarketplaceEngineLifecycle,
} from "./lifecycle";

import type {
  NftMarketplaceEngineInput,
} from "./types";

export function runMarketplaceLifecycleEngine(
  input:
    NftMarketplaceEngineInput
) {
  let lifecycle =
    createMarketplaceEngineLifecycle(
      `lifecycle:${input.orderId}`
    );

  const eligibility =
    evaluateFixtureMarketplaceEligibility(
      input.listing
    );

  if (!eligibility.eligible) {
    lifecycle =
      transitionMarketplaceEngineLifecycle(
        lifecycle,
        "REJECTED",
        input.clock.saleIntentAt,
        "eligibility rejected"
      );

    return {
      lifecycle,
      eligibility,
      authoritative:
        false as const,
    };
  }

  lifecycle =
    transitionMarketplaceEngineLifecycle(
      lifecycle,
      "ELIGIBILITY_VERIFIED",
      input.clock.saleIntentAt,
      "eligibility verified"
    );

  const saleIntent =
    createMarketplaceSaleIntent(
      input.listing,
      eligibility,
      input.clock.saleIntentAt
    );

  lifecycle =
    transitionMarketplaceEngineLifecycle(
      lifecycle,
      "SALE_INTENT_CREATED",
      input.clock.saleIntentAt,
      "sale intent created"
    );

  const listed =
    updateMarketplaceListingStatus(
      input.listing,
      "LISTED",
      input.clock.listedAt
    );

  lifecycle =
    transitionMarketplaceEngineLifecycle(
      lifecycle,
      "LISTING_PUBLISHED",
      input.clock.listedAt,
      "listing published"
    );

  const catalogItem:
    NftMarketplaceCatalogItem = {
      listing:
        listed,

      title:
        input.presentation.title,

      subtitle:
        input.presentation.subtitle,

      imageRef:
        input.presentation.imageRef,

      featured:
        input.presentation.featured,

      authoritative:
        false,
    };

  const detail =
    buildNftAssetDetail({
      catalogItem,
    });

  lifecycle =
    transitionMarketplaceEngineLifecycle(
      lifecycle,
      "DETAIL_COMPOSED",
      input.clock.listedAt,
      "detail composed"
    );

  const order =
    createMarketplaceOrderIntent(
      input.orderId,
      listed,
      input.buyer,
      input.clock.orderCreatedAt
    );

  lifecycle =
    transitionMarketplaceEngineLifecycle(
      lifecycle,
      "ORDER_CREATED",
      input.clock.orderCreatedAt,
      "order intent created"
    );

  const matched =
    matchMarketplaceOrder(
      order,
      listed,
      input.clock.orderMatchedAt
    );

  lifecycle =
    transitionMarketplaceEngineLifecycle(
      lifecycle,
      "ORDER_MATCHED",
      input.clock.orderMatchedAt,
      "order matched"
    );

  const preSettlement =
    createMarketplacePreSettlement(
      matched,
      input.clock.preSettlementAt
    );

  lifecycle =
    transitionMarketplaceEngineLifecycle(
      lifecycle,
      "PRE_SETTLEMENT_READY",
      input.clock.preSettlementAt,
      "pre-settlement prepared"
    );

  return {
    lifecycle,

    eligibility,

    saleIntent,

    listing:
      listed,

    detail,

    order:
      matched,

    preSettlement,

    authoritative:
      false as const,
  };
}
