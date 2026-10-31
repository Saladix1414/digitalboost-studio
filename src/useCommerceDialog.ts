import { useEffect, useRef } from "react";
export function useCommerceDialog(onClose: () => void) {
 const ref = useRef<HTMLDivElement>(null);
 const close = useRef(onClose); close.current = onClose;
 useEffect(() => {
  const previous = document.activeElement as HTMLElement | null;
  const panel = ref.current;
  const controls = () => Array.from(panel?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') ?? []).filter(el => el.getClientRects().length > 0);
  (controls()[0] ?? panel)?.focus();
  function key(event: KeyboardEvent) {
   if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close.current(); }
   if (event.key !== "Tab") return;
   const list = controls(), first = list[0], last = list[list.length - 1];
   if (!first) { event.preventDefault(); panel?.focus(); return; }
   if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last.focus(); }
   else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  document.addEventListener("keydown", key, true);
  return () => { document.removeEventListener("keydown", key, true); if (previous?.isConnected) previous.focus(); };
 }, []);
 return ref;
}
