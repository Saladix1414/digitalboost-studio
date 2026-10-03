import type {
  DbxHoldStore,
  DbxLedger,
} from "../ledger/types";

import type {
  DbxConsumptionRegistry,
} from "../consumption/types";

import type {
  DbxRewardPoolRegistry,
} from "../rewardPool/types";

import type {
  DbxMarketplaceSettlementRegistry,
} from "../settlement/types";

import {
  reconcileDbxLedger,
} from "./ledger";

import {
  reconcileDbxHolds,
} from "./holds";

import {
  reconcileDbxConsumption,
} from "./consumption";

import {
  reconcileDbxMarketplaceSettlements,
} from "./marketplace";

import {
  reconcileDbxRewardPool,
} from "./rewardPool";

import type {
  DbxEconomyReconciliationReport,
  DbxReconciliationIssue,
  DbxReconciliationSection,
} from "./types";

export function reconcileDbxEconomy(
  input: {
    readonly id:
      string;

    readonly ledger:
      DbxLedger;

    readonly holdStore:
      DbxHoldStore;

    readonly consumptionRegistry:
      DbxConsumptionRegistry;

    readonly marketplaceRegistry:
      DbxMarketplaceSettlementRegistry;

    readonly rewardPoolRegistry:
      DbxRewardPoolRegistry;

    readonly reconciledAt:
      string;
  }
): DbxEconomyReconciliationReport {
  const ledger =
    reconcileDbxLedger(
      input.ledger
    );

  const holds =
    reconcileDbxHolds(
      input.ledger,
      input.holdStore
    );

  const consumption =
    reconcileDbxConsumption(
      input.ledger,
      input.consumptionRegistry
    );

  const marketplace =
    reconcileDbxMarketplaceSettlements(
      input.ledger,
      input.marketplaceRegistry
    );

  const rewardPool =
    reconcileDbxRewardPool(
      input.ledger,
      input.rewardPoolRegistry
    );

  const issues:
    DbxReconciliationIssue[] = [
    ...ledger.issues,
    ...holds.issues,
    ...consumption.issues,
    ...marketplace.issues,
    ...rewardPool.issues,
  ];

  const sections:
    DbxReconciliationSection[] = [
    {
      name:
        "LEDGER",

      checked:
        ledger.checked,

      issueCount:
        ledger.issues.length,

      healthy:
        ledger.issues.length === 0,

      authoritative:
        false,
    },

    {
      name:
        "HOLDS",

      checked:
        holds.checked,

      issueCount:
        holds.issues.length,

      healthy:
        holds.issues.length === 0,

      authoritative:
        false,
    },

    {
      name:
        "CONSUMPTION",

      checked:
        consumption.checked,

      issueCount:
        consumption.issues.length,

      healthy:
        consumption.issues.length === 0,

      authoritative:
        false,
    },

    {
      name:
        "MARKETPLACE",

      checked:
        marketplace.checked,

      issueCount:
        marketplace.issues.length,

      healthy:
        marketplace.issues.length === 0,

      authoritative:
        false,
    },

    {
      name:
        "REWARD_POOL",

      checked:
        rewardPool.checked,

      issueCount:
        rewardPool.issues.length,

      healthy:
        rewardPool.issues.length === 0,

      authoritative:
        false,
    },
  ];

  return {
    id:
      input.id,

    reconciledAt:
      input.reconciledAt,

    healthy:
      issues.length === 0,

    sections,

    issues,

    accountingSystemOfRecord:
      "DBX_LEDGER",

    authoritative:
      false,
  };
}
