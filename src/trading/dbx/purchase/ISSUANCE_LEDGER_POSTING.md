# Phase 31C5 — Authorized DBX Issuance → Ledger Posting

This phase connects verified DBX purchases to the canonical DBX Ledger.

Canonical flow:

PAYMENT_VERIFIED
→ ISSUANCE_AUTHORIZED
→ LEDGER_POSTED
→ COMPLETED

## Ledger transaction

An authorized issuance creates one balanced transaction:

SYSTEM_ISSUANCE
DEBIT X DBX

DESTINATION_ACCOUNT
CREDIT X DBX

Debit total equals credit total.

Net ledger movement is zero.

## Separation of responsibilities

Purchase domain owns:

- purchase binding
- quote binding
- payment verification binding
- issuance authorization
- prevention of authorization reuse
- purchase lifecycle

Ledger owns:

- account validation
- double-entry validation
- transaction idempotency
- atomic append
- immutable posted transaction history
- accounting system of record

## Replay protection

A purchase cannot be posted twice.

An authorization cannot be consumed twice.

A ledger transaction uses a deterministic transaction id and idempotency key derived from the authorization id.

## Economic boundaries

PAYMENT_VERIFIED != DBX ISSUED.

ISSUANCE_AUTHORIZED != DBX ISSUED.

LEDGER_POSTED is the accounting event that creates the DBX balance effect.

DBX balance != governance authority.

External payment evidence remains outside the DBX ledger.

FIAT and USDT assets are not fabricated as DBX ledger assets.

No payment provider is called here.

No blockchain RPC is called here.
