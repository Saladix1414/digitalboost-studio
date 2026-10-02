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

import type {
  NftMarketplaceEngineInput,
  NftMarketplaceEngineSnapshot,
} from "./types";

export function runMarketplaceEngine(
  input:
    NftMarketplaceEngineInput
): NftMarketplaceEngineSnapshot {
  /*
   * Marketplace Engine orchestrates existing
   * deterministic domain functions.
   *
   * It does not own payment, settlement,
   * wallet signing or blockchain execution.
   */

  const eligibility =
    evaluateFixtureMarketplaceEligibility(
      input.listing
    );

  if (!eligibility.eligible) {
    throw new Error(
      "MARKETPLACE_ENGINE_NOT_ELIGIBLE"
    );
  }

  const saleIntent =
    createMarketplaceSaleIntent(
      input.listing,
      eligibility,
      input.clock.saleIntentAt
    );

  const listed =
    updateMarketplaceListingStatus(
      input.listing,
      "LISTED",
      input.clock.listedAt
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

  const orderIntent =
    createMarketplaceOrderIntent(
      input.orderId,
      listed,
      input.buyer,
      input.clock.orderCreatedAt
    );

  const matchedOrder =
    matchMarketplaceOrder(
      orderIntent,
      listed,
      input.clock.orderMatchedAt
    );

  const preSettlement =
    createMarketplacePreSettlement(
      matchedOrder,
      input.clock.preSettlementAt
    );

  return {
    stage:
      "PRE_SETTLEMENT_READY",

    eligibility,

    saleIntent,

    listing:
      listed,

    detail,

    order:
      matchedOrder,

    preSettlement,

    execution:
      "NONE",

    authoritative:
      false,
  };
}
