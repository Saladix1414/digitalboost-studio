import { useSyncExternalStore } from "react";
import {
  readCommerceStore,
  subscribeCommerceStore,
  getCommerceStoreVersion,
} from "./DigitalBoostCommerceStore";
import { connectCommerceSyncStream } from "./DigitalBoostCommerceSync";
import { useEffect } from "react";
import { fetchCommerceSnapshot } from "./DigitalBoostCommerceApi";
import { hydrateCommerceSnapshot } from "./DigitalBoostCommerceLedger";
import { COMMERCE_SYNC_EVENT } from "./DigitalBoostCommerceSync";

export function useCommerceLive(tenantId = "local-tenant") {
  useEffect(() => {
    if (tenantId !== "local-tenant") return;
    let active = true;
    const refresh = () => {
      void fetchCommerceSnapshot()
        .then(snapshot => {
          if (active && snapshot.tenantId === tenantId) {
            hydrateCommerceSnapshot(snapshot);
          }
        })
        .catch(() => {
          // Local ledger remains available when the server database is disabled.
        });
    };
    const disconnect = connectCommerceSyncStream();
    const onServerChange = (event: Event) => {
      const reason = (event as CustomEvent<{ reason?: string }>).detail?.reason;
      if (reason === "sse" || reason === "sse-hello") refresh();
    };
    window.addEventListener(COMMERCE_SYNC_EVENT, onServerChange);
    refresh();
    return () => {
      active = false;
      disconnect();
      window.removeEventListener(COMMERCE_SYNC_EVENT, onServerChange);
    };
  }, [tenantId]);
  useSyncExternalStore(
    subscribeCommerceStore,
    getCommerceStoreVersion,
    getCommerceStoreVersion,
  );
  return readCommerceStore(tenantId);
}
