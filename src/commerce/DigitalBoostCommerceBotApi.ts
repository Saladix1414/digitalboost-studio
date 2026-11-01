import type { CommerceBot, CommerceBotSkill } from "./DigitalBoostCommerceBots";
import type { BotRule, BotRuleAction, BotRuleTrigger } from "./DigitalBoostCommerceBotRules";

const BASE = "/api/commerce/v1/bots";

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

export function fetchCommerceBotSnapshot(): Promise<{
  tenantId: string; bots: CommerceBot[]; rules: BotRule[];
  source: "postgresql"; authoritative: false;
}> {
  return request("/snapshot");
}

export function createCommerceBotOnServer(input: {
  id: string; name: string; skills: readonly CommerceBotSkill[];
}): Promise<{ ok: true; bot: CommerceBot }> {
  return request("", { method: "POST", body: JSON.stringify(input) });
}

export function updateCommerceBotOnServer(id: string, patch: {
  name?: string; personality?: string; channel?: "in_app" | "mail_draft";
}): Promise<{ ok: true; bot: CommerceBot }> {
  return request(`/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function createCommerceBotRuleOnServer(input: {
  id: string; botId: string; trigger: BotRuleTrigger; action: BotRuleAction;
}): Promise<{ ok: true; rule: BotRule }> {
  const { botId, ...body } = input;
  return request(`/${encodeURIComponent(botId)}/rules`, { method: "POST", body: JSON.stringify(body) });
}
