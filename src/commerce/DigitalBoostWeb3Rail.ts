export const WEB3_RAIL_CONTRACT = "cos-web3-rail-v1" as const;

export type Web3RailResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly reason: string };

export function hasEthereumProvider(): boolean {
  try {
    return typeof window !== "undefined" && Boolean((window as any).ethereum);
  } catch {
    return false;
  }
}

export function validateContractAddress(address: string): Web3RailResult<string> {
  const value = (address || "").trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    return { ok: false, reason: "contract address must be 0x + 40 hex" };
  }
  return { ok: true, value: value.toLowerCase() };
}

export function validateTxHash(hash: string): Web3RailResult<string> {
  const value = (hash || "").trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(value)) {
    return { ok: false, reason: "tx hash must be 0x + 64 hex" };
  }
  return { ok: true, value: value.toLowerCase() };
}

export async function requestWalletAccount(): Promise<Web3RailResult<string>> {
  if (!hasEthereumProvider()) {
    return { ok: false, reason: "WEB3_PROVIDER_MISSING" };
  }
  try {
    const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts?.[0]) return { ok: false, reason: "wallet rejected" };
    return { ok: true, value: String(accounts[0]) };
  } catch {
    return { ok: false, reason: "wallet request failed" };
  }
}

export async function readOnChainBalance(address: string): Promise<Web3RailResult<string>> {
  const parsed = validateContractAddress(address);
  if (!parsed.ok) return parsed;
  if (!hasEthereumProvider()) {
    return { ok: false, reason: "WEB3_PROVIDER_MISSING" };
  }
  try {
    const balance = await (window as any).ethereum.request({
      method: "eth_getBalance",
      params: [parsed.value, "latest"],
    });
    return { ok: true, value: String(balance) };
  } catch {
    return { ok: false, reason: "eth_getBalance failed" };
  }
}

const ERC165_SUPPORTS = "0x01ffc9a7";
const ERC721_ID = "0x80ac58cd";
const SUPPORTS_ERC721_DATA =
  ERC165_SUPPORTS + "00000000000000000000000000000000000000000000000000000000" + ERC721_ID.slice(2);

export async function verifyNftContract(address: string): Promise<Web3RailResult<string>> {
  const parsed = validateContractAddress(address);
  if (!parsed.ok) return parsed;
  if (!hasEthereumProvider()) {
    return { ok: false, reason: "NFT_CONTRACT_UNVERIFIED: no provider" };
  }
  try {
    const result = await (window as any).ethereum.request({
      method: "eth_call",
      params: [{ to: parsed.value, data: SUPPORTS_ERC721_DATA }, "latest"],
    });
    const hex = String(result || "").toLowerCase();
    const supported = hex.endsWith("1") && !hex.endsWith("01ffc9a7");
    if (!supported) {
      return { ok: false, reason: "NFT_CONTRACT_UNVERIFIED: not ERC721" };
    }
    return { ok: true, value: parsed.value };
  } catch {
    return { ok: false, reason: "NFT_CONTRACT_UNVERIFIED: eth_call failed" };
  }
}

export function createCryptoCheckout(): Web3RailResult<never> {
  return { ok: false, reason: "CRYPTO_GATEWAY_UNAVAILABLE" };
}
