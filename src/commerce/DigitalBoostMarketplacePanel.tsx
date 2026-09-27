import { useMemo, useState } from "react";
import {
  activateMarketSeller,
  addMarketListing,
  getMarketplaceSnapshot,
  MARKET_TAKE_RATE,
  registerMarketSeller,
  type MarketRail,
} from "./DigitalBoostMarketplace";
import { useCommerceLive } from "./useCommerceLive";
import { requestWalletAccount } from "./DigitalBoostWeb3Rail";

const RAILS: { id: MarketRail | "all"; label: string }[] = [
  { id: "all", label: "Todo" },
  { id: "physical", label: "Físico" },
  { id: "digital", label: "Digital" },
  { id: "nft", label: "NFT" },
  { id: "crypto", label: "Cripto" },
  { id: "gift_card", label: "Gift card" },
];

export default function DigitalBoostMarketplacePanel({
  tenantId = "local-tenant",
}: {
  tenantId?: string;
}) {
  useCommerceLive(tenantId);
  const [tab, setTab] = useState<"explore" | "sell">("explore");
  const [rail, setRail] = useState<MarketRail | "all">("all");
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [sellRail, setSellRail] = useState<MarketRail>("physical");
  const [note, setNote] = useState("Plaza vacía. GMV unavailable.");
  const [wallet, setWallet] = useState("sin wallet");
  const [tick, setTick] = useState(0);
  const market = useMemo(() => getMarketplaceSnapshot(tenantId), [tenantId, tick]);
  const seller = market.sellers[0];

  const items = market.listings.filter((item) => {
    if (rail !== "all" && item.rail !== rail) return false;
    if (q.trim() && !item.title.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  });

  function refresh(msg: string) {
    setTick((n) => n + 1);
    setNote(msg);
  }

  return (
    <div className="relative z-20 isolate overflow-hidden rounded-2xl border border-white/10 bg-[#0A1020] text-[#F7FAFF]">
      <div className="border-b border-white/10 px-4 py-4 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">DigitalBoost Market</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Comprá y publicá</h1>
            <p className="mt-1 max-w-lg text-sm text-slate-400">
              Estilo plaza + studio. Take {Math.round(MARKET_TAKE_RATE * 100)}%. NFT/cripto quedan draft hasta tener rail.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#070d18] px-4 py-2 text-right">
            <div className="text-[10px] uppercase tracking-wide text-slate-500">GMV</div>
            <div className="font-semibold tabular-nums text-slate-300">{market.gmv === null ? "—" : market.gmv}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setTab("explore")} className={`h-10 rounded-lg px-4 text-sm ${tab === "explore" ? "bg-cyan-400 text-[#070d18]" : "border border-white/10"}`}>Explorar</button>
          <button type="button" onClick={() => setTab("sell")} className={`h-10 rounded-lg px-4 text-sm ${tab === "sell" ? "bg-cyan-400 text-[#070d18]" : "border border-white/10"}`}>Vender</button>
          <button
            type="button"
            className="h-10 rounded-lg border border-white/10 px-4 text-sm"
            onClick={async () => {
              const result = await requestWalletAccount();
              if (!result.ok) {
                setWallet("sin wallet");
                setNote(result.reason);
                return;
              }
              setWallet(result.value);
              setNote("Wallet " + result.value);
            }}
          >
            {wallet === "sin wallet" ? "Conectar wallet" : wallet.slice(0, 10) + "…"}
          </button>
        </div>
      </div>

      <p className="mx-4 mt-4 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[12px] text-cyan-100 sm:mx-6">{note}</p>

      {tab === "explore" && (
        <div className="space-y-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar publicación" className="h-11 flex-1 rounded-lg border border-white/10 bg-[#070d18] px-3 text-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {RAILS.map((item) => (
              <button key={item.id} type="button" onClick={() => setRail(item.id)} className={`h-9 shrink-0 rounded-full px-3 text-xs ${rail === item.id ? "bg-white text-[#070d18]" : "border border-white/10 text-slate-300"}`}>
                {item.label}
              </button>
            ))}
          </div>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#070d18] px-4 py-16 text-center text-sm text-slate-500">
              No hay publicaciones en este riel. No se muestran colecciones demo.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-[#1f2937] bg-[#0d1721]">
                  <div className="flex aspect-square items-center justify-center bg-[#101B32] text-[11px] uppercase tracking-wide text-slate-500">
                    {item.rail}
                  </div>
                  <div className="space-y-1 p-3">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="text-[11px] uppercase text-slate-500">{item.state}{item.railReady ? "" : " · rail pending"}</div>
                    <div className="text-sm tabular-nums text-cyan-300">USD {item.price}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "sell" && (
        <div className="space-y-4 px-4 py-4 sm:px-6">
          <section className="rounded-2xl border border-white/10 bg-[#101B32] p-4">
            <h2 className="text-sm font-semibold">1. Seller</h2>
            {seller ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#070d18] px-3 py-3 text-sm">
                <span>{seller.name} · {seller.state}</span>
                {seller.state === "pending" && (
                  <button type="button" className="h-9 rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-[#070d18]" onClick={() => {
                    const result = activateMarketSeller(tenantId, seller.id);
                    refresh("ok" in result && "reason" in result ? result.reason : "Seller activo");
                  }}>Activar</button>
                )}
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del seller" className="h-11 flex-1 rounded-lg border border-white/10 bg-[#070d18] px-3 text-sm" />
                <button type="button" className="h-11 rounded-lg bg-cyan-400 px-4 text-xs font-semibold text-[#070d18]" onClick={() => {
                  const result = registerMarketSeller({ tenantId, name });
                  refresh("ok" in result && result.ok === false ? result.reason : "Seller pending");
                  setName("");
                }}>Registrar</button>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#101B32] p-4">
            <h2 className="text-sm font-semibold">2. Publicar</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="h-11 rounded-lg border border-white/10 bg-[#070d18] px-3 text-sm sm:col-span-2" />
              <select value={sellRail} onChange={(e) => setSellRail(e.target.value as MarketRail)} className="h-11 rounded-lg border border-white/10 bg-[#070d18] px-3 text-sm">
                {RAILS.filter((r) => r.id !== "all").map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio USD" inputMode="decimal" className="h-11 rounded-lg border border-white/10 bg-[#070d18] px-3 text-sm" />
            </div>
            <button
              type="button"
              className="mt-3 h-11 w-full rounded-lg bg-cyan-400 text-sm font-semibold text-[#070d18]"
              onClick={() => {
                if (!seller) {
                  refresh("Registrá un seller primero");
                  return;
                }
                const result = addMarketListing({
                  tenantId,
                  sellerId: seller.id,
                  title,
                  rail: sellRail,
                  price: Number(price),
                });
                if ("ok" in result && result.ok === false) refresh(result.reason);
                else {
                  refresh(result.state === "listed" ? "Publicado" : "Draft. NFT/cripto o seller pending.");
                  setTitle("");
                  setPrice("");
                  setTab("explore");
                }
              }}
            >
              Publicar
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
