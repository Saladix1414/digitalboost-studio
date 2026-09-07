
export type LogItem = {
  id: string;
  at: number;
  actor: string;
  action: string;
  resource: string;
  status: "completed" | "running" | "failed";
  result: string;
};
const KEY = "db-ops-console-v1";
export function loadLog(): LogItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return [
        { id: "l1", at: Date.now() - 3600000, actor: "AI Operator", action: "Updated product price", resource: "Campera Nimbus", status: "completed", result: "Precio actualizado" },
        { id: "l2", at: Date.now() - 1800000, actor: "Store Builder", action: "Publish store", resource: "Home", status: "completed", result: "Version publicada" },
        { id: "l3", at: Date.now() - 600000, actor: "Automations", action: "Add VIP tag", resource: "Order DB-1048", status: "completed", result: "Tag VIP" },
      ];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
export function saveLog(list: LogItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50))); } catch {}
}
export function pushLog(partial: Omit<LogItem, "id" | "at">): LogItem[] {
  const item: LogItem = { id: "l-" + Date.now().toString(36), at: Date.now(), ...partial };
  const list = [item].concat(loadLog()).slice(0, 50);
  saveLog(list);
  return list;
}
export function formatWhen(at: number) {
  try { return new Date(at).toLocaleString("es-AR"); } catch { return String(at); }
}
