
export type Snapshot = {
  id: string; at: number; label: string; source: "user" | "publish"; blocks: any[]; theme?: any;
};
const KEY = "db-store-history-v1";
export function loadHistory(): Snapshot[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
export function saveHistory(list: Snapshot[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30))); } catch {}
}
export function pushSnapshot(partial: Omit<Snapshot, "id" | "at">): Snapshot[] {
  const next: Snapshot = { id: "v-" + Date.now().toString(36), at: Date.now(), ...partial };
  const list = [next].concat(loadHistory()).slice(0, 30);
  saveHistory(list);
  return list;
}
export function formatWhen(at: number) {
  try { return new Date(at).toLocaleString("es-AR"); } catch { return String(at); }
}
