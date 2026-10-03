import type {
  DbxSettlementAllocation,
} from "../settlement/types";

import type {
  DbxTreasuryAllocationPlan,
} from "./types";

export function toDbxSettlementAllocations(
  plan:
    DbxTreasuryAllocationPlan
): readonly DbxSettlementAllocation[] {
  return plan.allocations.map(
    (allocation) => {
      if (
        allocation.role ===
          "CREATOR"
      ) {
        return {
          accountId:
            allocation.accountId,

          role:
            "CREATOR",

          amountMinor:
            allocation.amountMinor,
        };
      }

      return {
        accountId:
          allocation.accountId,

        role:
          "PLATFORM",

        amountMinor:
          allocation.amountMinor,
      };
    }
  );
}
