import { useSyncExternalStore } from "react";
import {
  readCommerceStore,
  subscribeCommerceStore,
  getCommerceStoreVersion,
} from "./DigitalBoostCommerceStore";
import { connectCommerceSyncStream } from "./DigitalBoostCommerceSync";
import { useEffect } from "react";

export function useCommerceLive(tenantId = "local-tenant") {
  useEffect(() => connectCommerceSyncStream(), []);
  useSyncExternalStore(
    subscribeCommerceStore,
    getCommerceStoreVersion,
    getCommerceStoreVersion,
  );
  return readCommerceStore(tenantId);
}
