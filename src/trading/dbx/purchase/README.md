# Phase 31C1 — DBX Purchase Intent + Quote Engine

DBX purchase begins before any ledger issuance.

Canonical flow:

CREATED
→ QUOTED
→ PAYMENT_PENDING
→ PAYMENT_DETECTED
→ PAYMENT_VERIFIED
→ ISSUANCE_AUTHORIZED
→ LEDGER_POSTED
→ COMPLETED

## Purchase intent

A purchase intent binds:

- user
- DBX account
- requested DBX amount
- payment rail
- idempotency key

## Quote

A quote binds:

- external payment rail
- external currency
- external amount
- DBX amount
- rate
- policy version
- creation time
- expiration time

Historical purchases retain the quote that was used.

## Important boundary

Quote != payment.

Payment detected != verified.

Payment verified != issuance.

Issuance authorized != ledger posted.

Ledger posted != governance authority.

No DBX is issued in Phase 31C1.

No payment provider is called.

No blockchain RPC is called.

No balance is modified.

All records remain:

authoritative:false
