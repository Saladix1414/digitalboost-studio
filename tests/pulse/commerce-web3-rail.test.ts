import test from "node:test";
import assert from "node:assert/strict";
import {
  createCryptoCheckout,
  hasEthereumProvider,
  validateContractAddress,
  verifyNftContract,
} from "../../src/commerce/DigitalBoostWeb3Rail.ts";

test("node has no ethereum provider", () => {
  assert.equal(hasEthereumProvider(), false);
});

test("contract address format is strict", () => {
  assert.equal(validateContractAddress("0xabc").ok, false);
  assert.equal(
    validateContractAddress("0x0000000000000000000000000000000000000001").ok,
    true,
  );
});

test("nft verify and crypto checkout stay unavailable without rail", async () => {
  const nft = await verifyNftContract("0x0000000000000000000000000000000000000001");
  assert.equal(nft.ok, false);
  assert.match(nft.reason, /no provider|eth_call|not ERC721/);
  assert.equal(createCryptoCheckout().ok, false);
});
