# NFT DNA

NFT DNA is intentionally split into three independent layers.

## Identity

Identity describes the NFT domain object:

- asset
- collection
- creator
- traits
- asset version
- collection version
- creation time

Identity does not prove blockchain ownership.

## Integrity

Integrity records deterministic hashes for:

- media
- metadata
- forge configuration

Integrity detects changes.

Integrity does not establish provenance, ownership or blockchain finality.

## Blockchain Proof

Blockchain proof is populated only from a mint record that reached VERIFIED.

It may contain:

- chain
- contract
- token id
- transaction
- block
- owner
- metadata reference
- mint event evidence

Blockchain proof remains evidence and does not redefine identity.

## Authority

NFT DNA is non-authoritative.

It must not:

- approve a mint
- execute a transaction
- debit DBX
- infer provenance
- replace blockchain verification
- become governance authority
