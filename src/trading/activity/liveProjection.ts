import type {
  DbxConsumptionPostingRecord,
} from "../dbx/consumption/types";

import type {
  DbxMarketplaceSettlementResult,
} from "../dbx/settlement/types";

import type {
  NftBlockchainGatewayState,
  NftBlockchainIndexEvidence,
  NftBlockchainSubmissionEvidence,
  NftBlockchainVerificationEvidence,
} from "../nft/blockchain/types";

import type {
  NftMarketplaceEngineLifecycle,
  NftMarketplaceEngineLifecycleEvent,
} from "../nft/marketplace/orchestration/types";

import {
  activityFromDbxConsumptionPosting,
} from "./adapters/dbxConsumption";

import {
  activityFromDbxMarketplaceSettlement,
} from "./adapters/dbxSettlement";

import {
  activityFromBlockchainGatewayState,
  activityFromBlockchainIndex,
  activityFromBlockchainSubmission,
  activityFromBlockchainVerification,
} from "./adapters/blockchain";

import {
  activityFromNftMarketplaceLifecycleEvent,
} from "./adapters/nftMarketplace";

import {
  getNextTradingActivitySequence,
  recordTradingActivityEvent,
} from "./sharedActivityStore";

export function projectDbxConsumptionActivity(
  record:
    DbxConsumptionPostingRecord
) {
  return recordTradingActivityEvent(
    activityFromDbxConsumptionPosting(
      record,
      getNextTradingActivitySequence()
    )
  );
}

export function projectDbxMarketplaceSettlementActivity(
  result:
    DbxMarketplaceSettlementResult
) {
  return recordTradingActivityEvent(
    activityFromDbxMarketplaceSettlement(
      result,
      getNextTradingActivitySequence()
    )
  );
}

export function projectBlockchainSubmissionActivity(
  evidence:
    NftBlockchainSubmissionEvidence
) {
  return recordTradingActivityEvent(
    activityFromBlockchainSubmission(
      evidence,
      getNextTradingActivitySequence()
    )
  );
}

export function projectBlockchainVerificationActivity(
  evidence:
    NftBlockchainVerificationEvidence,

  occurredAt:
    string
) {
  return recordTradingActivityEvent(
    activityFromBlockchainVerification(
      evidence,
      occurredAt,
      getNextTradingActivitySequence()
    )
  );
}

export function projectBlockchainIndexActivity(
  evidence:
    NftBlockchainIndexEvidence
) {
  return recordTradingActivityEvent(
    activityFromBlockchainIndex(
      evidence,
      getNextTradingActivitySequence()
    )
  );
}

export function projectBlockchainGatewayStateActivity(
  state:
    NftBlockchainGatewayState,

  occurredAt:
    string
) {
  return recordTradingActivityEvent(
    activityFromBlockchainGatewayState(
      state,
      occurredAt,
      getNextTradingActivitySequence()
    )
  );
}

export function projectNftMarketplaceLifecycleActivity(
  lifecycle:
    NftMarketplaceEngineLifecycle,

  event:
    NftMarketplaceEngineLifecycleEvent
) {
  return recordTradingActivityEvent(
    activityFromNftMarketplaceLifecycleEvent(
      lifecycle,
      event,
      getNextTradingActivitySequence()
    )
  );
}
