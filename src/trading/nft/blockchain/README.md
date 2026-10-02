# Phase 30A — Blockchain Gateway Foundation

Phase 30 establishes the only blockchain execution boundary for NFT Marketplace flows.

Canonical gateway responsibilities:

READ
→ SIMULATE
→ SEND
→ VERIFY
→ INDEX
→ RETRY / FALLBACK

## Current 30A scope

Phase 30A implements:

- gateway contracts
- gateway request types
- deterministic state machine
- simulation contract
- explicit failure vocabulary
- execution boundary documentation

## Not implemented yet

30A does not include:

- ethers
- viem
- wagmi
- RPC calls
- wallet signing
- raw transaction submission
- contract execution
- DBX debit
- ownership transfer

Simulation is not execution.

Submission is not verification.

Verification is not legal ownership.

Indexing is not authority.

All gateway evidence remains:

`authoritative:false`
