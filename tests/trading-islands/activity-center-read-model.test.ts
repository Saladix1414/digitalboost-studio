import assert from "node:assert/strict";
import test from "node:test";

import {
  buildActivityCenterReadModel,
} from "../../src/trading/activity/readModel/build";

test(
  "read model preserves historical approval authority without inventing time",
  () => {
    const model =
      buildActivityCenterReadModel({
        legacyItems: [
          {
            id:
              "legacy-review",

            sequence:
              1,

            source:
              "risk-review",

            authority:
              "approval",

            severity:
              "success",

            title:
              "Review approved",

            message:
              "Approved scope.",
          },
        ],

        unifiedEvents:
          [],
      });

    assert.equal(
      model.total,
      1
    );

    assert.equal(
      model.items[0]
        .authority,
      "approval"
    );

    assert.equal(
      model.items[0]
        .occurredAt,
      null
    );

    assert.equal(
      model.authoritative,
      false
    );
  }
);

test(
  "unified event preserves timestamp and remains non-authoritative",
  () => {
    const model =
      buildActivityCenterReadModel({
        legacyItems:
          [],

        unifiedEvents: [
          {
            id:
              "unified-1",

            domain:
              "DBX",

            type:
              "POSTED",

            severity:
              "SUCCESS",

            title:
              "DBX posted",

            description:
              "Posted",

            actor: {
              type:
                "SYSTEM",

              ref:
                "digitalboost",
            },

            references:
              [],

            occurredAt:
              "2026-10-03T02:00:00.000Z",

            sequence:
              1,

            authoritative:
              false,
          },
        ],
      });

    assert.equal(
      model.items[0]
        .occurredAt,
      "2026-10-03T02:00:00.000Z"
    );

    assert.equal(
      model.items[0]
        .authority,
      "none"
    );
  }
);
