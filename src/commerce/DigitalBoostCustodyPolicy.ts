export const CUSTODY_CONTRACT = "cos-custody-v1" as const;
export type CustodyMode = "non_custodial";

export const COMMERCE_CUSTODY_MODE: CustodyMode = "non_custodial";

const BANNED = [
  "mnemonic",
  "seed phrase",
  "privateKey",
  "privkey",
  "wallet.json",
];

export function assertNonCustodialSource(source: string): string[] {
  const hits: string[] = [];
  const lower = source.toLowerCase();
  for (const token of BANNED) {
    if (lower.includes(token.toLowerCase())) hits.push(token);
  }
  return hits;
}

export function createCustodialWallet(): never {
  throw new Error("CUSTODY_FORBIDDEN: Commerce OS does not hold keys");
}
