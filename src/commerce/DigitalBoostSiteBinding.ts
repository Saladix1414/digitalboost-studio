export const SITE_BINDING_CONTRACT = "cos-l1-site-binding-v1" as const;

export type SiteBinding = {
  readonly contract: typeof SITE_BINDING_CONTRACT;
  readonly tenantId: string;
  readonly siteId: string;
  readonly hostname: string | null;
  readonly published: boolean;
};

const bindings = new Map<string, SiteBinding>();

export function resetSiteBindings(): void {
  bindings.clear();
}

export function getSiteBinding(tenantId: string): SiteBinding | null {
  const id = tenantId.trim();
  if (!id) throw new Error("tenantId is required");
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
  const binding: SiteBinding = {
    contract: SITE_BINDING_CONTRACT,
    tenantId,
    siteId,
    hostname: input.hostname?.trim() || null,
    published: input.published === true,
  };
  bindings.set(tenantId, binding);
  return binding;
}
