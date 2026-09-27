import { emitCommerceSync, pingCommerceSyncPeers } from "./DigitalBoostCommerceSync";
export const SITE_BINDING_CONTRACT = "cos-l1-site-binding-v1" as const;
const LS_KEY = "db-commerce-site-binding-v1";

export type SiteBinding = {
  readonly contract: typeof SITE_BINDING_CONTRACT;
  readonly tenantId: string;
  readonly siteId: string;
  readonly hostname: string | null;
  readonly published: boolean;
};

const bindings = new Map<string, SiteBinding>();

function readAll(): void {
  if (bindings.size) return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as SiteBinding[];
    if (!Array.isArray(parsed)) return;
    for (const item of parsed) {
      if (item && item.tenantId) bindings.set(item.tenantId, item);
    }
  } catch {}
}

function writeAll(): void {
  emitCommerceSync("binding");
  pingCommerceSyncPeers();
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...bindings.values()]));
  } catch {}
}

export function resetSiteBindings(): void {
  bindings.clear();
  try { localStorage.removeItem(LS_KEY); } catch {}
}

export function getSiteBinding(tenantId: string): SiteBinding | null {
  const id = tenantId.trim();
  if (!id) throw new Error("tenantId is required");
  readAll();
  return bindings.get(id) ?? null;
}

export function recordSiteBinding(input: {
  tenantId: string;
  siteId: string;
  hostname?: string | null;
  published?: boolean;
}): SiteBinding {
  const tenantId = input.tenantId.trim();
  const siteId = input.siteId.trim();
  if (!tenantId || !siteId) throw new Error("tenantId and siteId are required");
  readAll();
  const binding: SiteBinding = {
    contract: SITE_BINDING_CONTRACT,
    tenantId,
    siteId,
    hostname: input.hostname?.trim() || null,
    published: input.published === true,
  };
  bindings.set(tenantId, binding);
  writeAll();
  return binding;
}
