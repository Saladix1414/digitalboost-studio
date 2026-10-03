# Phase 31C9 — DBX Spending / Consumption Engine

Phase 31C9 models economic DBX consumption for DigitalBoost services.

Examples:

- AI runtime
- Tool usage
- Bot runtime
- Hosting
- Paid DigitalBoost services

## Canonical flow

User DBX
→ consumption intent
→ validation
→ balanced ledger transaction
→ DigitalBoost service account

## Ledger model

User:

DEBIT X DBX

Destination service account:

CREDIT X DBX

Debit must always equal credit.

No DBX is created.

## Marketplace boundary

Marketplace asset settlement is handled by the dedicated marketplace settlement subsystem.

This consumption engine must not replace marketplace settlement.

## DBX Rewards boundary

DBX Rewards are non-economic usage credits.

They do not use this module.

DBX Rewards:

- have no monetary value
- do not enter the economic DBX Ledger
- cannot be transferred
- cannot be withdrawn
- cannot buy marketplace assets
- cannot convert into DBX

A future usage-credit engine may decide whether a Free user can consume DBX Rewards for eligible tools.

That decision must remain separate from economic DBX consumption.

## Authority

Consumption records are accounting evidence.

They do not provide governance authority.

systemOfRecord = DBX_LEDGER

governanceAuthority = false
