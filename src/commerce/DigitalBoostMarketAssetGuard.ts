import type { MarketRail } from "./DigitalBoostMarketplace";
import { validateContractAddress } from "./DigitalBoostWeb3Rail";

export type MarketAssetInput = {
  readonly title: string;
  readonly rail: MarketRail;
  readonly price: number;
  readonly assetRef?: string;
};

export type MarketAssetReport = {
  readonly ok: boolean;
  readonly listedAllowed: boolean;
  readonly issues: readonly string[];
};

export function validateMarketAsset(input: MarketAssetInput): MarketAssetReport {
  const issues: string[] = [];
  const title = (input.title || "").trim();
  if (title.length < 3) issues.push("title too short");
  if (title.length > 80) issues.push("title too long");
  if (!(input.price > 0)) issues.push("price must be positive");

  const ref = (input.assetRef || "").trim();
  if (input.rail === "nft") {
    issues.push("nft rail pending: no contract verification");
    if (ref.startsWith("0x")) {
      const contract = validateContractAddress(ref);
      if (!contract.ok) issues.push(contract.reason);
    }
  }
  if (input.rail === "crypto") {
    issues.push("crypto rail pending: no chain balance check");
    if (ref && !/^[A-Z0-9]{2,12}$/i.test(ref)) {
      issues.push("crypto assetRef must look like a ticker");
    }
  }
  if (input.rail === "gift_card" && input.price > 5000) {
    issues.push("gift card face exceeds local limit");
  }

  const blocking = issues.filter((item) => !item.includes("rail pending"));
  return {
    ok: blocking.length === 0,
    listedAllowed: blocking.length === 0 && input.rail !== "nft" && input.rail !== "crypto",
    issues,
  };
}
