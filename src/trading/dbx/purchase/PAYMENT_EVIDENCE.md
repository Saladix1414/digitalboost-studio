# Phase 31C2 — DBX Payment Evidence

Payment evidence records what an external payment system appears to report.

Evidence is not economic authority.

Canonical flow:

Purchase Intent
→ Quote
→ Payment Evidence
→ Verification
→ Issuance Authorization
→ Ledger Posting

Phase 31C2 stops at Payment Evidence.

## FIAT evidence

FIAT evidence binds:

- purchase intent
- quote
- provider reference
- settlement reference
- currency
- exact external amount
- observation time

## USDT evidence

USDT evidence binds:

- purchase intent
- quote
- chain
- token
- recipient
- transaction hash
- block reference
- exact external amount
- observation time

## Replay protection

The same external payment reference cannot be accepted twice.

FIAT replay identity:

providerRef + settlementRef

USDT replay identity:

chainRef + txHash

## Important boundaries

Webhook != payment verification.

Provider event != settlement authority.

txHash != valid payment.

Block reference != payment acceptance.

Payment evidence != DBX issuance.

Payment evidence != ledger balance.

All evidence remains:

authoritative:false

Phase 31C3 owns verification policy.
