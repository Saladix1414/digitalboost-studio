export const COMMERCE_SYNC_EVENT = "db-commerce-sync";

export function emitCommerceSync(reason: string): void {
  try {
    window.dispatchEvent(
      new CustomEvent(COMMERCE_SYNC_EVENT, { detail: { reason, at: Date.now() } }),
    );
  } catch {}
}

export function subscribeCommerceSync(onChange: () => void): () => void {
  const onCustom = () => onChange();
  const onStorage = (event: StorageEvent) => {
    if (!event.key || !event.key.startsWith("db-commerce-")) return;
    onChange();
  };
  try {
    window.addEventListener(COMMERCE_SYNC_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
  } catch {}
  return () => {
    try {
      window.removeEventListener(COMMERCE_SYNC_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    } catch {}
  };
}

export function connectCommerceSyncStream(): () => void {
  let source: EventSource | null = null;
  try {
    source = new EventSource("/api/commerce/sync");
    source.addEventListener("commerce", () => emitCommerceSync("sse"));
    source.addEventListener("hello", () => emitCommerceSync("sse-hello"));
  } catch {}
  return () => {
    try { source?.close(); } catch {}
  };
}

export function pingCommerceSyncPeers(): void {
  try {
    if (typeof fetch !== "function") return;
    if (typeof window === "undefined") return;
    void fetch("/api/commerce/sync/ping", { method: "POST" }).catch(() => {});
  } catch {}
}
