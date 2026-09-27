import { useEffect, useState } from "react";
import { getCommerceSnapshot } from "./DigitalBoostCommerceLedger";
import { getSiteBinding } from "./DigitalBoostSiteBinding";
import { connectCommerceSyncStream, subscribeCommerceSync } from "./DigitalBoostCommerceSync";

export function useCommerceLive(tenantId = "local-tenant") {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const off = subscribeCommerceSync(() => setTick((n) => n + 1));
    const close = connectCommerceSyncStream();
    return () => { off(); close(); };
  }, []);
  return {
    tick,
    snap: getCommerceSnapshot(tenantId),
    binding: getSiteBinding(tenantId),
  };
}
