import type { CommerceCampaignStatus } from "./DigitalBoostCommerceCampaignTypes";

export type CommerceCampaignConfiguration = {
  readonly id: string;
  readonly name: string;
  readonly audience: string;
  readonly discount: number;
  readonly status: CommerceCampaignStatus;
  readonly source: string;
  readonly sequence: readonly string[];
};

const BASE = "/api/commerce/v1/campaigns";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    credentials: "same-origin",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(typeof payload?.error === "string" ? payload.error : `http_${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchCommerceCampaigns(): Promise<{
  campaigns: CommerceCampaignConfiguration[];
  source: "postgresql";
  authoritative: false;
}> {
  return request("");
}

export function saveCommerceCampaign(input: CommerceCampaignConfiguration): Promise<{
  ok: true; campaign: CommerceCampaignConfiguration;
}> {
  const { id, ...body } = input;
  return request(`/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) });
}

export function deleteCommerceCampaign(id: string): Promise<{ ok: true }> {
  return request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
}
