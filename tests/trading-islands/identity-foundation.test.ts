import assert from "node:assert/strict";
import test from "node:test";

import {
  createIdentityContext,
  createIdentityEvidenceId,
  createSessionId,
  createSubjectId,
  createTenantId,
  createUserId,
  hasIdentityCapability,
  isAuthenticatedIdentityContext,
} from "../../src/trading/identity/index.ts";

const CREATED_AT =
  "2026-10-07T12:00:00.000Z";

const VALIDATED_AT =
  "2026-10-07T12:01:00.000Z";

function fixture() {
  const userId =
    createUserId(
      "usr_german001"
    );

  const tenantId =
    createTenantId(
      "ten_digitalboost"
    );

  const subjectId =
    createSubjectId(
      "sub_primary001"
    );

  const sessionId =
    createSessionId(
      "ses_browser001"
    );

  return {
    userId,
    tenantId,
    subjectId,
    sessionId,
  };
}

test(
  "canonical identity uses opaque internal identifiers",
  () => {
    const identity =
      fixture();

    assert.equal(
      identity.userId,
      "usr_german001"
    );

    assert.equal(
      identity.tenantId,
      "ten_digitalboost"
    );

    assert.equal(
      identity.subjectId,
      "sub_primary001"
    );

    assert.equal(
      identity.sessionId,
      "ses_browser001"
    );
  }
);

test(
  "raw email cannot become canonical UserId",
  () => {
    assert.throws(
      () =>
        createUserId(
          "german@example.com"
        ),
      /canonical prefix|email/i
    );
  }
);

test(
  "wallet address cannot become canonical UserId",
  () => {
    assert.throws(
      () =>
        createUserId(
          "0x1111111111111111111111111111111111111111"
        ),
      /canonical prefix|wallet/i
    );
  }
);

test(
  "authenticated identity context is isolated from authorization",
  () => {
    const {
      userId,
      tenantId,
      subjectId,
      sessionId,
    } = fixture();

    const context =
      createIdentityContext({
        identity: {
          userId,
          tenantId,
          subjectId,

          source:
            "server-session",

          state:
            "active",

          createdAt:
            CREATED_AT,
        },

        sessionId,

        authentication: {
          status:
            "authenticated",

          subjectId,

          authenticatedAt:
            CREATED_AT,

          checkedAt:
            VALIDATED_AT,

          assurance:
            "standard",
        },

        authorization:
          null,

        evidence:
          [],

        lastValidatedAt:
          VALIDATED_AT,
      });

    assert.equal(
      isAuthenticatedIdentityContext(
        context
      ),
      true
    );

    assert.equal(
      hasIdentityCapability(
        context,
        "trade.execute"
      ),
      false
    );
  }
);

test(
  "server authorization is scoped to canonical user and tenant",
  () => {
    const {
      userId,
      tenantId,
      subjectId,
      sessionId,
    } = fixture();

    const context =
      createIdentityContext({
        identity: {
          userId,
          tenantId,
          subjectId,

          source:
            "server-session",

          state:
            "active",

          createdAt:
            CREATED_AT,
        },

        sessionId,

        authentication: {
          status:
            "authenticated",

          subjectId,

          authenticatedAt:
            CREATED_AT,

          checkedAt:
            VALIDATED_AT,

          assurance:
            "strong",
        },

        authorization: {
          userId,
          tenantId,

          roles: [
            "trader",
            "trader",
          ],

          capabilities: [
            "market.read",
            "trade.prepare",
            "market.read",
          ],

          evaluatedAt:
            VALIDATED_AT,

          policyVersion:
            "identity-policy-v1",

          authoritySource:
            "server-policy",
        },

        evidence:
          [],

        lastValidatedAt:
          VALIDATED_AT,
      });

    assert.deepEqual(
      context.authorization
        ?.roles,
      ["trader"]
    );

    assert.deepEqual(
      context.authorization
        ?.capabilities,
      [
        "market.read",
        "trade.prepare",
      ]
    );

    assert.equal(
      hasIdentityCapability(
        context,
        "trade.prepare"
      ),
      true
    );

    assert.equal(
      hasIdentityCapability(
        context,
        "trade.execute"
      ),
      false
    );
  }
);

test(
  "cross-tenant authorization is rejected",
  () => {
    const {
      userId,
      subjectId,
      sessionId,
    } = fixture();

    const identityTenant =
      createTenantId(
        "ten_primary001"
      );

    const foreignTenant =
      createTenantId(
        "ten_foreign001"
      );

    assert.throws(
      () =>
        createIdentityContext({
          identity: {
            userId,

            tenantId:
              identityTenant,

            subjectId,

            source:
              "server-session",

            state:
              "active",

            createdAt:
              CREATED_AT,
          },

          sessionId,

          authentication: {
            status:
              "authenticated",

            subjectId,

            authenticatedAt:
              CREATED_AT,

            checkedAt:
              VALIDATED_AT,

            assurance:
              "strong",
          },

          authorization: {
            userId,

            tenantId:
              foreignTenant,

            roles:
              ["trader"],

            capabilities:
              ["market.read"],

            evaluatedAt:
              VALIDATED_AT,

            policyVersion:
              "identity-policy-v1",

            authoritySource:
              "server-policy",
          },

          evidence:
            [],

          lastValidatedAt:
            VALIDATED_AT,
        }),
      /tenant does not match/i
    );
  }
);

test(
  "identity evidence is descriptive and grants no authority",
  () => {
    const {
      userId,
      tenantId,
      subjectId,
      sessionId,
    } = fixture();

    const evidenceId =
      createIdentityEvidenceId(
        "iev_login001"
      );

    const context =
      createIdentityContext({
        identity: {
          userId,
          tenantId,
          subjectId,

          source:
            "server-session",

          state:
            "active",

          createdAt:
            CREATED_AT,
        },

        sessionId,

        authentication: {
          status:
            "authenticated",

          subjectId,

          authenticatedAt:
            CREATED_AT,

          checkedAt:
            VALIDATED_AT,

          assurance:
            "standard",
        },

        authorization:
          null,

        evidence: [
          {
            evidenceId,

            source:
              "server-session",

            subjectId,

            observedAt:
              CREATED_AT,

            verifiedAt:
              VALIDATED_AT,

            assertions: [
              "session-observed",
            ],

            grantsAuthority:
              false,
          },
        ],

        lastValidatedAt:
          VALIDATED_AT,
      });

    assert.equal(
      context.evidence[0]
        ?.grantsAuthority,
      false
    );

    assert.equal(
      hasIdentityCapability(
        context,
        "anything"
      ),
      false
    );
  }
);
