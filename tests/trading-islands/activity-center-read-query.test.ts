import assert from "node:assert/strict";
import test from "node:test";

import {
  buildActivityCenterReadModel,
} from "../../src/trading/activity/readModel/build";

import {
  queryActivityCenterReadModel,
} from "../../src/trading/activity/readModel/query";

test(
  "read model filters legacy and unified sources independently",
  () => {
    const model =
      buildActivityCenterReadModel({
        legacyItems: [
          {
            id:
              "legacy-1",

            sequence:
              1,

            source:
              "runtime",

            authority:
              "none",

            severity:
              "info",

            title:
              "Runtime",

            message:
              "Runtime activity",
          },
        ],

        unifiedEvents: [
          {
            id:
              "unified-1",

            domain:
              "BLOCKCHAIN",

            type:
              "VERIFIED",

            severity:
              "SUCCESS",

            title:
              "Verified",

            description:
              "Blockchain activity",

            actor: {
              type:
                "SYSTEM",

              ref:
                "gateway",
            },

            references:
              [],

            occurredAt:
              "2026-10-03T02:10:00.000Z",

            sequence:
              1,

            authoritative:
              false,
          },
        ],
      });

    assert.equal(
      queryActivityCenterReadModel(
        model,
        {
          sourceModel:
            "LEGACY",
        }
      ).length,
      1
    );

    assert.equal(
      queryActivityCenterReadModel(
        model,
        {
          sourceModel:
            "UNIFIED",
        }
      ).length,
      1
    );
  }
);
