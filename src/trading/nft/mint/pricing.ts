import type {
  NftMintMode,
  NftMintPricingIntent,
} from "./types";

export function getNftMintPricingIntent(
  mode: NftMintMode
): NftMintPricingIntent {
  if (mode === "BASIC") {
    return {
      mode,
      upfrontDbx: 150,
      gasRequired: true,
      authoritative: false,
    };
  }

  return {
    mode,
    upfrontDbx: 0,
    gasRequired: true,
    authoritative: false,
  };
}
