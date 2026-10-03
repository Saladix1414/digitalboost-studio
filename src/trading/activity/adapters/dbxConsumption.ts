import type {
  DbxConsumptionPostingRecord,
} from "../../dbx/consumption/types";

import {
  createTradingActivityEvent,
} from "../factory";

export function activityFromDbxConsumptionPosting(
  record:
    DbxConsumptionPostingRecord,
  sequence:
    number
) {
  return createTradingActivityEvent({
    id:
      `activity-dbx-consumption:${record.id}`,

    domain:
      "DBX",

    type:
      "POSTED",

    severity:
      "SUCCESS",

    title:
      "DBX consumption posted",

    description:
      `${record.purpose} consumption posted to the DBX Ledger.`,

    actor: {
      type:
        "USER",

      ref:
        record.userAccountId,
    },

    references: [
      {
        kind:
          "consumptionIntent",

        ref:
          record.intentId,
      },

      {
        kind:
          "transaction",

        ref:
          record.transactionId,
      },

      {
        kind:
          "destinationAccount",

        ref:
          record.destinationAccountId,
      },
    ],

    occurredAt:
      record.postedAt,

    sequence,
  });
}
