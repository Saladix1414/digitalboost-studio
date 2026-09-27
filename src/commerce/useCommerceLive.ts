import { useEffect, useState } from "react";
import { getCommerceSnapshot } from "./DigitalBoostCommerceLedger";
import { getSiteBinding } from "./DigitalBoostSiteBinding";
import { subscribeCommerceSync } from "./DigitalBoostCommerceSync";

export function useCommerceLive(tenantId = "local-tenant") {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeCommerceSync(() => setTick((n) => n + 1)), []);
  return {
    tick,
    snap: getCommerceSnapshot(tenantId),
    binding: getSiteBinding(tenantId),
  };
}
