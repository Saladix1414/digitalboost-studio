import { subscribeCommerceSync } from "./DigitalBoostCommerceSync";
import { getCommerceSnapshot } from "./DigitalBoostCommerceLedger";
import { getSiteBinding } from "./DigitalBoostSiteBinding";

let version = 0;

subscribeCommerceSync(() => {
  version += 1;
});

export function getCommerceStoreVersion(): number {
  return version;
}

export function subscribeCommerceStore(onChange: () => void): () => void {
  return subscribeCommerceSync(onChange);
}

export function readCommerceStore(tenantId = "local-tenant") {
  return {
    version: getCommerceStoreVersion(),
    snap: getCommerceSnapshot(tenantId),
    binding: getSiteBinding(tenantId),
  };
}
