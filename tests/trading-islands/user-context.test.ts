import assert from "node:assert/strict";
import test from "node:test";

import {
  createAccountSelection,
  createIdentityContext,
  createSessionId,
  createSubjectId,
  createTenantId,
  createTradingUserContext,
  createUserId,
  createWalletSelection,
  createWorkspaceId,
  selectTradingAccount,
  selectTradingWallet,
} from "../../src/trading/identity/index.ts";

const NOW =
  "2026-10-07T15:00:00.000Z";

const LATER =
  "2026-10-07T15:01:00.000Z";

function identityContext(
  authorized = true
) {
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

  return createIdentityContext({
    identity: {
      userId,
      tenantId,
      subjectId,
      source:
        "server-session",
      state:
        "active",
      createdAt:
        NOW,
    },

    sessionId:
      createSessionId(
        "ses_browser001"
      ),

    authentication: {
      status:
        "authenticated",
      subjectId,
      authenticatedAt:
        NOW,
      checkedAt:
        NOW,
      assurance:
        "strong",
    },

    authorization:
      authorized
        ? {
            userId,
            tenantId,

            roles: [
              "trader",
            ],

            capabilities: [
              "market.read",
              "strategy.prepare",
            ],

            evaluatedAt:
              NOW,

            policyVersion:
              "identity-policy-v1",

            authoritySource:
              "server-policy",
          }
        : null,

    evidence: [],

    lastValidatedAt:
      NOW,
  });
}

test(
  "user context projects canonical identity",
  () => {
    const context =
      createTradingUserContext({
        identityContext:
          identityContext(),

        workspaceId:
          createWorkspaceId(
            "wsp_trading001"
          ),

        environment:
          "development",

        createdAt:
          NOW,

        lastValidatedAt:
          NOW,
      });

    assert.equal(
      context.userId,
      "usr_german001"
    );

    assert.equal(
      context.tenantId,
      "ten_digitalboost"
    );

    assert.equal(
      context.sessionId,
      "ses_browser001"
    );

    assert.equal(
      context.workspaceId,
      "wsp_trading001"
    );

    assert.equal(
      context.grantsAuthority,
      false
    );
  }
);

test(
  "roles and capabilities come from authorization context",
  () => {
    const context =
      createTradingUserContext({
        identityContext:
          identityContext(),

        workspaceId:
          createWorkspaceId(
            "wsp_trading001"
          ),

        environment:
          "test",

        createdAt:
          NOW,

        lastValidatedAt:
          NOW,
      });

    assert.deepEqual(
      context.roles,
      ["trader"]
    );

    assert.deepEqual(
      context.capabilities,
      [
        "market.read",
        "strategy.prepare",
      ]
    );
  }
);

test(
  "authenticated context without authorization receives no capabilities",
  () => {
    const context =
      createTradingUserContext({
        identityContext:
          identityContext(false),

        workspaceId:
          createWorkspaceId(
            "wsp_trading001"
          ),

        environment:
          "test",

        createdAt:
          NOW,

        lastValidatedAt:
          NOW,
      });

    assert.deepEqual(
      context.roles,
      []
    );

    assert.deepEqual(
      context.capabilities,
      []
    );
  }
);

test(
  "account and wallet selections remain descriptive",
  () => {
    let context =
      createTradingUserContext({
        identityContext:
          identityContext(),

        workspaceId:
          createWorkspaceId(
            "wsp_trading001"
          ),

        environment:
          "development",

        createdAt:
          NOW,

        lastValidatedAt:
          NOW,
      });

    context =
      selectTradingAccount(
        context,
        createAccountSelection(
          "acct_primary001",
          LATER
        )
      );

    context =
      selectTradingWallet(
        context,
        createWalletSelection(
          "wallet-binding-pending-001",
          LATER
        )
      );

    assert.equal(
      context.selectedAccount
        ?.accountRef,
      "acct_primary001"
    );

    assert.equal(
      context.selectedWallet
        ?.walletRef,
      "wallet-binding-pending-001"
    );

    assert.equal(
      context.grantsAuthority,
      false
    );
  }
);

test(
  "raw wallet address cannot become selected wallet reference",
  () => {
    assert.throws(
      () =>
        createWalletSelection(
          "0x1111111111111111111111111111111111111111",
          NOW
        ),
      /wallet address|opaque/i
    );
  }
);

test(
  "invalid workspace identity is rejected",
  () => {
    assert.throws(
      () =>
        createWorkspaceId(
          "overview"
        ),
      /wsp_/i
    );
  }
);
