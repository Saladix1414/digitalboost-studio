# Phase 31C3 — DBX Payment Verification

Payment evidence is not automatically accepted as payment.

Phase 31C3 introduces deterministic verification policy contracts.

## FIAT verification

FIAT verification checks:

- purchase binding
- quote binding
- rail binding
- exact amount
- exact currency
- approved provider reference
- settlement reference

## USDT verification

USDT verification checks:

- purchase binding
- quote binding
- rail binding
- exact amount
- USDT quote currency
- expected chain
- expected token
- expected recipient
- transaction hash
- block reference
- confirmation policy

## Important boundaries

Evidence != verification.

Verification != issuance authorization.

Verification != ledger posting.

Verification != balance.

Verification != governance authority.

A VERIFIED result means only that the evidence passed the configured DigitalBoost payment verification contract.

No external provider call is made here.

No RPC call is made here.

No DBX is issued here.

All verification records remain:

authoritative:false
