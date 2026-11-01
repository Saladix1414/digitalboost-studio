import React, { useState } from "react";
import { createCommerceUsdtEthereumIntent, verifyCommerceUsdtEthereumPayment, type CommerceUsdtEthereumPayment } from "./DigitalBoostCommerceApi";

function explain(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  const labels: Record<string, string> = {
    USDT_ETH_NOT_CONFIGURED: "USDT en Ethereum aún no está configurado.",
    PAYMENT_INTENT_EXPIRED: "La solicitud venció; crea otra.",
    PAYMENT_TX_NOT_CONFIRMED: "La transacción aún no tiene 12 confirmaciones.",
    PAYMENT_TX_INVALID: "La transacción no coincide con token, destino o importe.",
    PAYMENT_TX_ALREADY_USED: "Este hash ya se utilizó.",
    ORDER_NOT_PAYABLE: "El pedido ya no está disponible para pago.",
    ORDER_USD_ONLY: "USDT solo está disponible para pedidos en USD.",
    ETHEREUM_RPC_UNAVAILABLE: "No se pudo consultar Ethereum; intenta más tarde.",
  };
  return labels[code] || (code ? "No se pudo completar: " + code : "Ocurrió un error inesperado.");
}

export default function CommerceUsdtPaymentPanel({ orderId, onVerified }: { orderId: string; onVerified: () => void }) {
  const [payment, setPayment] = useState<CommerceUsdtEthereumPayment | null>(null);
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function createIntent() {
    setBusy(true); setNotice("");
    try { setPayment((await createCommerceUsdtEthereumIntent(orderId)).payment); setHash(""); }
    catch (error) { setNotice(explain(error)); }
    finally { setBusy(false); }
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!payment || busy) return;
    setBusy(true); setNotice("");
    try {
      const next = (await verifyCommerceUsdtEthereumPayment(payment.id, hash.trim())).payment;
      setPayment(next);
      if (next.state === "verified") {
        setNotice("Pago verificado en Ethereum; pedido marcado como pagado.");
        onVerified();
      } else setNotice("La transacción sigue pendiente de confirmaciones.");
    } catch (error) { setNotice(explain(error)); }
    finally { setBusy(false); }
  }

  async function copy(value: string, name: string) {
    try { await navigator.clipboard.writeText(value); setNotice(name + " copiado."); }
    catch { setNotice("No se pudo copiar; selecciona el texto."); }
  }

  return <section className="rounded-xl border border-emerald-400/20 bg-emerald-400/[.04] p-5" aria-labelledby="usdt-payment-title">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 id="usdt-payment-title" className="text-sm font-semibold text-white">Pagar con USDT · Ethereum</h3>
        <p className="mt-1 text-xs leading-5 text-slate-400">Transferencia manual desde una wallet externa. No compartas claves privadas ni frase semilla.</p></div>
      {!payment && <button type="button" disabled={busy} onClick={createIntent} className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50">{busy ? "Preparando…" : "Mostrar datos de pago"}</button>}
    </div>
    {payment && <div className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3"><p className="text-[10px] uppercase text-slate-500">Importe exacto · USDT</p><div className="mt-1 flex justify-between gap-2"><code className="break-all text-sm font-semibold text-white">{payment.amountUsdt}</code><button type="button" onClick={() => void copy(payment.amountUsdt, "Importe")} className="text-xs text-cyan-300">Copiar</button></div></div>
        <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3"><p className="text-[10px] uppercase text-slate-500">Red</p><p className="mt-1 text-sm font-semibold text-white">Ethereum Mainnet · ERC-20</p></div>
      </div>
      <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3"><p className="text-[10px] uppercase text-slate-500">Dirección receptora</p><div className="mt-1 flex items-start justify-between gap-2"><code className="break-all text-xs text-slate-200">{payment.merchantAddress}</code><button type="button" onClick={() => void copy(payment.merchantAddress, "Dirección")} className="text-xs text-cyan-300">Copiar</button></div><p className="mt-2 break-all text-[10px] text-slate-500">Contrato USDT: {payment.tokenContract}</p></div>
      <p className="text-[11px] text-slate-400">Estado: {payment.state} · vence {new Date(payment.expiresAt).toLocaleString("es-AR")}{payment.state === "pending" ? " · requiere 12 confirmaciones" : ""}</p>
      {payment.state === "pending" && <form onSubmit={verify} className="space-y-2"><label htmlFor={"usdt-hash-" + payment.id} className="block text-xs text-slate-300">Hash de transacción</label><div className="flex flex-col gap-2 sm:flex-row"><input id={"usdt-hash-" + payment.id} value={hash} onChange={event => setHash(event.target.value)} placeholder="0x…" autoComplete="off" spellCheck={false} required className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white" /><button type="submit" disabled={busy || !hash.trim()} className="rounded-lg border border-cyan-300/30 px-4 py-2 text-xs text-cyan-200 disabled:opacity-50">{busy ? "Verificando…" : "Verificar pago"}</button></div><p className="text-[10px] text-slate-500">El servidor verifica en cadena token, destino e importe antes de marcar el pedido pagado.</p></form>}
      {payment.state === "expired" && <button type="button" disabled={busy} onClick={createIntent} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200">Crear nueva solicitud</button>}
    </div>}
    {notice && <p role="status" aria-live="polite" className="mt-4 rounded-lg border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-300">{notice}</p>}
  </section>;
}
