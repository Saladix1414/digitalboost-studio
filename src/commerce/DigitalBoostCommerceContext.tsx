import { createContext, useContext, type ReactNode } from "react";
import { useCommerceLive } from "./useCommerceLive";
import type { CommerceSnapshot } from "./DigitalBoostCommerceLedger";
import type { SiteBinding } from "./DigitalBoostSiteBinding";

type CommerceStoreValue = {
  tenantId: string;
  tick: number;
  snap: CommerceSnapshot;
  binding: SiteBinding | null;
};

const CommerceStoreContext = createContext<CommerceStoreValue | null>(null);

export function CommerceStoreProvider({
  tenantId = "local-tenant",
  children,
}: {
  tenantId?: string;
  children: ReactNode;
}) {
  const live = useCommerceLive(tenantId);
  return (
    <CommerceStoreContext.Provider value={{ tenantId, ...live }}>
      {children}
    </CommerceStoreContext.Provider>
  );
}

export function useCommerceStore(): CommerceStoreValue {
  const value = useContext(CommerceStoreContext);
  if (!value) throw new Error("CommerceStoreProvider required");
  return value;
}
