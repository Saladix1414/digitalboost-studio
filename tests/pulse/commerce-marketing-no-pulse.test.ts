import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

test("Marketing hub does not open PULSE or invent 1047", () => {
  const src = readFileSync(join(root, "src", "DigitalBoostMarketingHub.tsx"), "utf8");
  assert.equal(src.includes("db-open-pulse"), false);
  assert.equal(src.includes("1047 en preparacion"), false);
  assert.match(src, /draftPulseBotMessage/);
  assert.match(src, /buildCommerceUtm/);
});

test("Marketing nav mounts MarketingHub not SEO Center", () => {
  const src = readFileSync(
    join(root, "src", "StoreBuilderWorkspace.tsx"),
    "utf8",
  );

  const start =
    src.indexOf('case "marketing":');

  const end =
    src.indexOf('case "seo":', start);

  assert.notEqual(
    start,
    -1,
    "marketing route must exist",
  );

  assert.notEqual(
    end,
    -1,
    "seo route must follow marketing route",
  );

  const marketingBlock =
    src.slice(start, end);

  assert.match(
    marketingBlock,
    /DigitalBoostMarketingHub/,
  );

  assert.equal(
    marketingBlock.includes(
      "DigitalBoostSeoCenter",
    ),
    false,
  );
});
