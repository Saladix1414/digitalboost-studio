import {
  createTradingActivityEvent,
} from "./factory";

export const tradingActivityFixture =
  createTradingActivityEvent({
    id:
      "activity-dbx-consumption-001",

    domain:
      "DBX",

    type:
      "COMPLETED",

    severity:
      "SUCCESS",

    title:
      "DBX consumption completed",

    description:
      "Economic DBX consumption completed successfully.",

    actor: {
      type:
        "USER",

      ref:
        "user-001",
    },

    references: [
      {
        kind:
          "consumptionIntent",

        ref:
          "consumption-001",
      },

      {
        kind:
          "transaction",

        ref:
          "dbx-consumption:consumption-001",
      },
    ],

    occurredAt:
      "2026-10-03T00:00:00.000Z",

    sequence:
      1,
  });
