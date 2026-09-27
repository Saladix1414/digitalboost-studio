import { getSiteBinding } from "./DigitalBoostSiteBinding";

export const COMMERCE_UTM_CONTRACT = "cos-utm-v1" as const;

export type CommerceUtmInput = {
  readonly path: string;
  readonly source: string;
  readonly medium: string;
  readonly campaign: string;
  readonly term?: string;
  readonly content?: string;
  readonly tenantId?: string;
};

export type CommerceUtmResult =
  | { readonly ok: true; readonly url: string }
  | { readonly ok: false; readonly reason: string };

function clean(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function buildCommerceUtm(input: CommerceUtmInput): CommerceUtmResult {
  const source = clean(input.source);
  const medium = clean(input.medium);
  const campaign = clean(input.campaign);
  if (!source || !medium || !campaign) {
    return { ok: false, reason: "source, medium and campaign are required" };
  }

  const binding = getSiteBinding(input.tenantId || "local-tenant");
  if (!binding || !binding.published) {
    return { ok: false, reason: "site is not published" };
  }
  if (!binding.hostname) {
    return { ok: false, reason: "published site has no hostname" };
  }

  const path = input.path.startsWith("/") ? input.path : "/" + input.path;
  const url = new URL(path, "https://" + binding.hostname);
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  if (input.term?.trim()) url.searchParams.set("utm_term", clean(input.term));
  if (input.content?.trim()) url.searchParams.set("utm_content", clean(input.content));
  return { ok: true, url: url.toString() };
}

export function parseCommerceUtm(url: string): Record<string, string> {
  try {
    const parsed = new URL(url);
    const out: Record<string, string> = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      const value = parsed.searchParams.get(key);
      if (value) out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}
