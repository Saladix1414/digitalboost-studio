# Phase 31C7 — Platform Fees + Treasury Allocation

Phase 31C7 moves settlement percentages into versioned economic policy.

Settlement remains a redistribution of existing DBX.

No new DBX is issued.

## Example policy

A marketplace payment may be distributed across:

- Creator earnings
- Platform revenue
- Treasury
- Infrastructure pool
- Economic reward pool

The exact percentages are policy data, not hard-coded settlement behavior.

## Important distinction

The DBX economic Reward Pool belongs to the DBX economy.

DBX Rewards is a separate non-economic usage-credit system.

They are not interchangeable.

DBX Rewards:

- cannot be traded
- cannot be withdrawn
- cannot purchase marketplace assets
- cannot convert to DBX
- does not participate in DBX settlement

## Economic invariant

Every fee policy must total exactly 10,000 basis points.

10000 BPS = 100%

For every settlement:

buyer debit
=
sum of all credits

## Policy versioning

Historical settlements preserve:

- policy id
- policy version
- settlement reference
- exact allocations

Changing a policy never rewrites historical settlements.

## Boundaries

Treasury allocation != DBX issuance.

Treasury != governance authority.

Reward Pool != DBX Rewards.

Economic policy != payment verification.

Policy != ledger posting.
