# Phase 31C4 — DBX Issuance Authorization

Payment verification does not directly create DBX.

Canonical flow:

PAYMENT_VERIFIED
→ ISSUANCE_AUTHORIZED
→ LEDGER_POSTED
→ COMPLETED

Phase 31C4 stops at ISSUANCE_AUTHORIZED.

## Authorization requires

- PAYMENT_VERIFIED purchase
- purchase binding
- quote binding
- payment verification binding
- VERIFIED payment result
- destination DBX account
- exact DBX amount binding
- enabled issuance policy
- configured min/max issuance bounds
- explicit system issuance account
- idempotency

## Economic boundary

AUTHORIZED != POSTED.

No account balance changes in this phase.

No DBX ledger transaction is created here.

No external payment provider is called.

No blockchain RPC is called.

An issuance authorization is permission for the next accounting step.

It is not the accounting step itself.

DBX balance != governance authority.
