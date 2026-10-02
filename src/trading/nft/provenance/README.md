# NFT Provenance

Phase 25 introduces the provenance domain.

Provenance is modeled as a graph of evidence references and explicit links.

## Evidence

Initial evidence kinds:

- Origin
- DNA Identity
- DNA Integrity
- Blockchain Proof
- Import Reference
- Creator Assertion

Every evidence reference remains:

`authoritative:false`

## Links

Evidence may be connected using:

- CREATED_FROM
- DERIVED_FROM
- CAPTURED_FROM
- VERIFIED_AGAINST
- REFERENCES

Links describe relationships between evidence.

They do not convert evidence into authority.

## Separation of concerns

Provenance is distinct from:

- ownership
- legal rights
- authorship authority
- authenticity authority
- blockchain finality
- governance approval

A blockchain transaction may contribute evidence.

It does not automatically prove legal ownership.

A creator assertion may contribute evidence.

It does not automatically prove authorship.

Origin may contribute evidence.

Origin itself is not provenance authority.

DNA integrity may contribute evidence.

A hash is not ownership.

## Execution boundary

Phase 25A contains no:

- RPC
- wallet execution
- blockchain writes
- DBX debit
- PULSE approval
- marketplace settlement

All evidence is deterministic domain data.
