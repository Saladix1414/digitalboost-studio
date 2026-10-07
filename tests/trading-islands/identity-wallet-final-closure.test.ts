import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const closure =
  fs.readFileSync(
    new URL(
      "../../src/trading/identity/PHASE33-CLOSURE.md",
      import.meta.url
    ),
    "utf8"
  );

const walletWorkspace =
  fs.readFileSync(
    new URL(
      "../../src/trading/identity/WalletWorkspace.tsx",
      import.meta.url
    ),
    "utf8"
  );

const activityAdapter =
  fs.readFileSync(
    new URL(
      "../../src/trading/activity/adapters/identityWallet.ts",
      import.meta.url
    ),
    "utf8"
  );

const security =
  fs.readFileSync(
    new URL(
      "../../src/trading/identity/security.ts",
      import.meta.url
    ),
    "utf8"
  );

test(
  "Phase 33 closure declares canonical trust boundaries",
  () => {
    for (const statement of [
      "wallet possession is not canonical user identity",
      "wallet connection is not ownership proof",
      "ownership evidence is not authorization",
      "blockchain observation is not legal ownership",
      "Activity Center evidence is observational",
    ]) {
      assert.match(
        closure,
        new RegExp(
          statement.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          ),
          "i"
        )
      );
    }
  }
);

test(
  "Phase 33 closure explicitly defers production wallet execution",
  () => {
    assert.match(
      closure,
      /production browser wallet provider adapter/i
    );

    assert.match(
      closure,
      /transaction signing/i
    );

    assert.match(
      closure,
      /transaction broadcasting/i
    );
  }
);

test(
  "canonical wallet workspace remains isolated from direct browser provider",
  () => {
    assert.doesNotMatch(
      walletWorkspace,
      /window\.ethereum|globalThis\.ethereum|eth_requestAccounts|wallet_switchEthereumChain/
    );

    assert.doesNotMatch(
      walletWorkspace,
      /eth_sendTransaction|sendTransaction|submitTransaction/
    );
  }
);

test(
  "identity wallet Activity adapter remains projection only",
  () => {
    assert.match(
      activityAdapter,
      /createTradingActivityEvent/
    );

    assert.doesNotMatch(
      activityAdapter,
      /recordTradingActivityEvent|appendTradingActivityEvent/
    );
  }
);

test(
  "security layer retains fail-closed controls",
  () => {
    for (const control of [
      "PROOF_REPLAY",
      "TENANT_MISMATCH",
      "WALLET_MISMATCH",
      "CHAIN_MISMATCH",
      "SESSION_MISMATCH",
      "OWNERSHIP_STALE",
    ]) {
      assert.match(
        security,
        new RegExp(control)
      );
    }

    assert.doesNotMatch(
      security,
      /grantsAuthority:\s*true/
    );
  }
);

test(
  "Phase 33 formally points to Infrastructure Core next",
  () => {
    assert.match(
      closure,
      /Phase 34 — Infrastructure Core/
    );
  }
);
