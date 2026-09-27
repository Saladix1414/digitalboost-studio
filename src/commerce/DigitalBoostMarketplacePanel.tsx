import { useMemo, useState } from "react";
import {
  activateMarketSeller,
  addMarketListing,
  getMarketplaceSnapshot,
  listPublicMarketListings,
  MARKET_TAKE_RATE,
  registerMarketSeller,
  type MarketRail,
} from "./DigitalBoostMarketplace";
import { requestWalletAccount } from "./DigitalBoostWeb3Rail";
import { useCommerceStore } from "./DigitalBoostCommerceContext";
import DigitalBoostMarketBotsPanel from "./DigitalBoostMarketBotsPanel";

const RAILS: { id: MarketRail | "all"; label: string }[] = [
  { id: "all", label: "Todo" },
  { id: "physical", label: "Físico" },
  { id: "digital", label: "Digital" },
  { id: "nft", label: "NFT" },
  { id: "crypto", label: "Cripto" },
  { id: "gift_card", label: "Gift card" },
];

export default function DigitalBoostMarketplacePanel() {
  const store = useCommerceStore();
  const tenantId = store.tenantId;
  const [tab, setTab] = useState<"explore" | "sell" | "bots">("explore");
  const [rail, setRail] = useState<MarketRail | "all">("all");
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [sellRail, setSellRail] = useState<MarketRail>("physical");
  const [note, setNote] = useState("");
  const [wallet, setWallet] = useState("");
  const [tick, setTick] = useState(0);
  const market = useMemo(() => getMarketplaceSnapshot(tenantId), [tenantId, tick, store.tick]);
  const seller = market.sellers[0];
  const publicItems = useMemo(() => listPublicMarketListings(), [tick, store.tick]);
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
    <div className="relative z-20 isolate bg-[#0E1420] text-[#E8EEF7]">
      <div className="border-b border-white/8 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Market · tenant {tenantId}</span>
          <span>Take {Math.round(MARKET_TAKE_RATE * 100)}% · escrow off</span>
        </div>
        <h1 className="mt-3 text-[28px] font-semibold tracking-tight">Encontrá o publicá</h1>
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            setTab("explore");
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar publicaciones"
            className="h-12 w-full rounded-md border border-white/10 bg-[#161D2B] px-4 text-[15px] outline-none ring-cyan-400/0 focus:ring-2"
          />
        </form>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {RAILS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { setRail(item.id); setTab("explore"); }}
              className={`h-8 shrink-0 rounded-md px-3 text-[11px] ${rail === item.id ? "bg-cyan-400 text-[#0E1420]" : "bg-[#161D2B] text-slate-300"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-white/8 text-center">
        <div className="px-2 py-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Listings</div>
          <div className="mt-1 font-medium tabular-nums">{market.listings.length}</div>
        </div>
        <div className="border-x border-white/8 px-2 py-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Seller</div>
          <div className="mt-1 truncate text-sm">{seller ? seller.state : "ninguno"}</div>
        </div>
        <div className="px-2 py-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">GMV</div>
          <div className="mt-1 font-medium tabular-nums">{market.gmv === null ? "—" : market.gmv}</div>
        </div>
      </div>

      <div className="flex border-b border-white/8">
        {(["explore", "sell", "bots"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`h-11 flex-1 text-sm ${tab === id ? "border-b-2 border-cyan-400 text-white" : "text-slate-500"}`}
          >
            {id === "explore" ? "Comprar" : id === "sell" ? "Vender" : "Bots"}
          </button>
        ))}
      </div>

      {note && (
        <p className="mx-4 mt-3 rounded-md bg-[#161D2B] px-3 py-2 text-[12px] text-slate-300 sm:mx-6">{note}</p>
      )}

      {tab === "explore" && (
        <div className="px-4 py-4 sm:px-6">
          {items.length === 0 ? (
            <div className="space-y-8">
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400">Tu vitrina está vacía.</p>
                <button type="button" onClick={() => setTab("sell")} className="mt-4 h-10 rounded-md bg-cyan-400 px-4 text-sm font-semibold text-[#0E1420]">
                  Publicar primero
                </button>
              </div>
              <div>
                <div className="flex items-end justify-between">
                  <h2 className="text-sm font-medium">Catálogo global</h2>
                  <span className="text-[11px] text-slate-500">{publicItems.length} listed</span>
                </div>
                {publicItems.length === 0 ? (
                  <p className="mt-3 bg-[#161D2B] px-3 py-8 text-center text-sm text-slate-500">
                    Todavía no hay publicaciones listed de ningún tenant.
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                    {publicItems.map((item) => (
                      <article key={item.tenantId + item.id} className="bg-[#161D2B]">
                        <div className="flex aspect-square items-end bg-[#1C2433] p-2 text-[10px] uppercase text-slate-500">{item.rail}</div>
                        <div className="p-2">
                          <p className="truncate text-xs">{item.title}</p>
                          <p className="text-[11px] tabular-nums">USD {item.price}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="bg-[#161D2B]">
                  <div className="flex aspect-square items-end bg-[#1C2433] p-3 text-[10px] uppercase tracking-wide text-slate-500">
                    {item.rail}
                  </div>
                  <div className="space-y-1 p-3">
                    <h2 className="truncate text-sm">{item.title}</h2>
                    <p className="text-[11px] text-slate-500">{item.state}{item.railReady ? "" : " · rail off"}</p>
                    <p className="text-sm tabular-nums">USD {item.price}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "sell" && (
        <div className="space-y-6 px-4 py-5 sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Escritorio seller</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#161D2B] px-2 py-3">¿Órdenes nuevas?<br /><span className="text-slate-500">—</span></div>
              <div className="bg-[#161D2B] px-2 py-3">¿Cobré?<br /><span className="text-slate-500">—</span></div>
              <div className="bg-[#161D2B] px-2 py-3">¿Listings?<br /><span>{market.listings.length}</span></div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Identidad</p>
            {seller ? (
              <div className="mt-2 flex items-center justify-between bg-[#161D2B] px-3 py-3 text-sm">
                <span>{seller.name} · {seller.state}</span>
                {seller.state === "pending" && (
                  <button type="button" className="text-cyan-300" onClick={() => {
                    const result = activateMarketSeller(tenantId, seller.id);
                    refresh("ok" in result && "reason" in result ? result.reason : "Seller activo");
                  }}>Activar</button>
                )}
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="h-11 flex-1 rounded-md border border-white/10 bg-[#161D2B] px-3 text-sm" />
                <button type="button" className="h-11 rounded-md bg-cyan-400 px-3 text-sm font-semibold text-[#0E1420]" onClick={() => {
                  const result = registerMarketSeller({ tenantId, name });
                  refresh("ok" in result && result.ok === false ? result.reason : "Seller pending");
                  setName("");
                }}>Alta</button>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium">Nueva publicación</p>
            <div className="mt-2 space-y-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="h-11 w-full rounded-md border border-white/10 bg-[#161D2B] px-3 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <select value={sellRail} onChange={(e) => setSellRail(e.target.value as MarketRail)} className="h-11 rounded-md border border-white/10 bg-[#161D2B] px-3 text-sm">
                  {RAILS.filter((r) => r.id !== "all").map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="USD" inputMode="decimal" className="h-11 rounded-md border border-white/10 bg-[#161D2B] px-3 text-sm" />
              </div>
              <button
                type="button"
                className="h-11 w-full rounded-md bg-cyan-400 text-sm font-semibold text-[#0E1420]"
                onClick={() => {
                  if (!seller) return refresh("Alta de seller primero");
                  const result = addMarketListing({ tenantId, sellerId: seller.id, title, rail: sellRail, price: Number(price) });
                  if ("ok" in result && result.ok === false) refresh(result.reason);
                  else {
                    refresh(result.state === "listed" ? "Publicado" : "Draft");
                    setTitle("");
                    setPrice("");
                    setTab("explore");
                  }
                }}
              >
                Publicar
              </button>
            </div>
          </div>

          <button
            type="button"
            className="text-xs text-slate-500"
            onClick={async () => {
              const result = await requestWalletAccount();
              setWallet(result.ok ? result.value : "");
              setNote(result.ok ? result.value : result.reason);
            }}
          >
            {wallet ? wallet.slice(0, 12) + "…" : "Conectar wallet (opcional)"}
          </button>
        </div>
      )}

      {tab === "bots" && <DigitalBoostMarketBotsPanel tenantId={tenantId} />}
    </div>
  );
}
