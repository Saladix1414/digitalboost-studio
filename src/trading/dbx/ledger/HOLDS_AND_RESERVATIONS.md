# Phase 31B — DBX Holds & Reservations

A DBX ledger balance is not always fully spendable.

DigitalBoost separates:

Ledger Balance
- Reserved Balance
= Available Balance

## Holds

A hold temporarily reserves DBX for a future economic action.

Examples:

- marketplace purchase
- AI runtime
- bot runtime
- tools
- services

A hold does not move DBX between ledger accounts.

It reduces available balance until the hold is:

- captured
- released
- expired

## Capture

Capture marks a hold as consumed by a real ledger transaction.

HOLD CAPTURE != LEDGER POSTING.

The associated ledger transaction remains the accounting movement.

## Release

Release returns reserved capacity to available balance.

## Expiration

Expired holds automatically cease reserving DBX.

## Double-spend protection

New holds are permitted only against currently available DBX.

Reserved DBX cannot be reserved again.

## Authority boundary

Ledger balance is accounting truth.

Hold state is reservation state.

Available balance is derived.

DBX BALANCE != GOVERNANCE AUTHORITY.

HOLD != PAYMENT.

CAPTURE != SETTLEMENT.

RESERVATION != OWNERSHIP.
