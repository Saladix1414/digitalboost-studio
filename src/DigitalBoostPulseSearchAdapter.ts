export type PulseSearchRow = { query: string; clicks?: number; impressions?: number; position?: number; page?: string };
export type PulseSearchSnapshot = {
  status: "available" | "partial" | "unavailable";
  source: string; capturedAt?: string; rows: PulseSearchRow[];
  note: string;
};
const KEY = "db-pulse-search-v1";
export function loadSearchAdapter(): PulseSearchSnapshot {
  if (typeof localStorage === "undefined") {
    return { status: "unavailable", source: "none", rows: [], note: "No runtime store." };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { status: "unavailable", source: "db-pulse-search-v1", rows: [], note: "Sin export de Search Console." };
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed.rows) ? parsed.rows.filter(function (r: any) { return r && typeof r.query === "string"; }) : [];
    if (!rows.length) return { status: "unavailable", source: "db-pulse-search-v1", rows: [], note: "JSON sin queries." };
    return {
      status: rows.length >= 3 ? "available" : "partial",
      source: String(parsed.source || "manual-gsc-export"),
      capturedAt: parsed.capturedAt || new Date().toISOString(),
      rows: rows.slice(0, 50),
      note: "Datos cargados por el merchant. No es un crawl en vivo.",
    };
  } catch {
    return { status: "unavailable", source: "db-pulse-search-v1", rows: [], note: "JSON invalido." };
  }
}
export function saveSearchAdapter(input: { source?: string; rows: PulseSearchRow[] }): PulseSearchSnapshot {
  const snap = {
    source: input.source || "manual-gsc-export",
    capturedAt: new Date().toISOString(),
    rows: input.rows.slice(0, 50),
  };
  try { localStorage.setItem(KEY, JSON.stringify(snap)); } catch {}
  return loadSearchAdapter();
}
export function clearSearchAdapter() {
  try { localStorage.removeItem(KEY); } catch {}
}
