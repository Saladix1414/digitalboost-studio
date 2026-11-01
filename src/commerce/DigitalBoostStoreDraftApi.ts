import type { CanvasBlock } from "../DigitalBoostStoreCanvas";
import type { StoreTheme } from "../DigitalBoostTheme";

export type CommerceStoreDraft = {
  readonly siteId: string;
  readonly page: string;
  readonly blocks: CanvasBlock[];
  readonly theme: StoreTheme;
  readonly updatedAt: string;
};

const BASE = "/api/commerce/v1/store/drafts";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    credentials: "same-origin",
    signal: AbortSignal.timeout(5000),
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

export function fetchStoreDraftFromServer(page: string): Promise<{
  draft: CommerceStoreDraft | null;
  source: "postgresql";
  authoritative: false;
}> {
  return request(`/${encodeURIComponent(page)}`);
}

export function saveStoreDraftOnServer(input: {
  page: string; blocks: readonly CanvasBlock[]; theme: StoreTheme;
}): Promise<{ ok: true; draft: CommerceStoreDraft }> {
  return request(`/${encodeURIComponent(input.page)}`, {
    method: "PUT",
    body: JSON.stringify({ blocks: input.blocks, theme: input.theme }),
  });
}
