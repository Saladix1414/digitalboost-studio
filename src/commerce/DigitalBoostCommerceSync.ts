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
