import { useMemo } from "react";
import { rangeMul, useOsRange } from "./DigitalBoostOsRangeData";
import "./commerce-os-core.css";
import {
  ArrowUpRight,
  ChevronRight,
  Eye,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";

type CommerceOSOverviewProps = {
  onNavigate?: (section: string) => void;
  products?: any[];
  orders?: any[];
  customers?: any[];
};

function money(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function SignalRing({ value, tone }: { value: number; tone: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0.12, Math.min(1, value)) * c;
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(247,250,255,0.08)" strokeWidth="3" />
      <circle cx="24" cy="24" r={r} fill="none" stroke={tone} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} transform="rotate(-90 24 24)" />
    </svg>
  );
}

function PrismMark() {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden>
      <path d="M60 8 108 36v48L60 112 12 84V36Z" fill="none" stroke="#22d3ee" strokeWidth="2" />
      <path d="M60 8v104M12 36l96 48M108 36 12 84" stroke="#8b5cf6" strokeWidth="1.2" opacity="0.7" />
      <circle cx="60" cy="60" r="7" fill="#ec4899" />
    </svg>
  );
}

function StoreIso() {
  return (
    <svg viewBox="0 0 280 180" className="h-full w-full" aria-hidden>
      <path d="M40 110 140 60l100 50v40L140 200 40 150Z" fill="#14233f" />
      <path d="M140 60 240 110 140 160 40 110Z" fill="#183052" stroke="#22d3ee" strokeWidth="1.2" />
      <path d="M90 95h40v36H90Z" fill="#0a1020" stroke="#67e8f9" strokeWidth="1" />
      <path d="M145 88h50v18h-50Z" fill="#8b5cf6" opacity="0.85" />
      <circle cx="210" cy="78" r="16" fill="#22d3ee" opacity="0.35" />
    </svg>
  );
}

export default function CommerceOSOverview({
  onNavigate,
  products = [],
  orders = [],
  customers = [],
}: CommerceOSOverviewProps) {
  const osRange = useOsRange();
  const osMul = rangeMul(osRange);
  const osSales = Math.round(474 * osMul);
  const osOrders = Math.max(1, Math.round(4 * osMul));
  const osClients = Math.max(1, Math.round(4 * osMul));

  const sales = orders.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0);
  const ticket = orders.length ? Math.round(sales / orders.length) : 0;
  const conv = customers.length ? (orders.length / customers.length) * 100 : 0;
  const pulse = useMemo(() => [38, 52, 46, 64, 58, 73, 61, 86, 68, 91, 78, 97], []);

  const metrics = [
    { label: "Ventas", value: money(sales || 474), delta: "+18,4%", tone: "#34d399", pct: 0.74, go: "analytics" },
    { label: "Pedidos", value: String(orders.length || 4), delta: "+12,1%", tone: "#22d3ee", pct: 0.42, go: "orders" },
    { label: "Clientes", value: String(customers.length || 4), delta: "+9,7%", tone: "#a78bfa", pct: 0.51, go: "customers" },
    { label: "Conversión", value: `${conv.toFixed(0) || 25}%`, delta: "live", tone: "#fbbf24", pct: Math.min(1, conv / 100 || 0.25), go: "analytics" },
  ];

  const feed = (orders.length ? orders : [
    { id: "DB-1048", customer: "Martín González", status: "Pagado", total: 190 },
    { id: "DB-1047", customer: "Sofía Rodríguez", status: "En preparación", total: 60 },
    { id: "DB-1046", customer: "Lucas Fernández", status: "Enviado", total: 129 },
    { id: "DB-1045", customer: "Camila Torres", status: "Entregado", total: 95 },
  ]).slice(0, 4);

  return (
    <div
      data-commerce-os="true"
      data-commerce-os-core="true"
      data-commerce-os-vibrant="true"
      className="relative min-h-[760px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0A1020] text-[#F7FAFF]"
    >
      <div className="db-grid-field pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="mb-6 grid items-end gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">DigitalBoost · Control plane</div>
            <h1 className="mt-3 text-4xl font-semibold leading-[0.95] tracking-tight text-white sm:text-5xl">
              Tu comercio
              <span className="mt-1 block text-cyan-300">en movimiento.</span>
            </h1>
            <div className="mt-4 h-1 w-24 bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500" />
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              Operá, diseñá y publicá desde un OS navy. El Store Builder es el estudio; este plano es el cerebro.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => onNavigate?.("website-builder")} className="inline-flex h-11 items-center rounded-lg bg-cyan-400 px-5 text-sm font-semibold text-[#070d18]">
                Abrir Store Builder
              </button>
              <button type="button" onClick={() => onNavigate?.("orders")} className="inline-flex h-11 items-center rounded-lg border border-white/10 px-5 text-sm">
                Ver pedidos
              </button>
            </div>
          </div>
          <div className="relative hidden overflow-hidden rounded-2xl border border-white/10 bg-[#070d18] p-4 lg:block">
            <div className="absolute -right-4 -top-4 opacity-50"><PrismMark /></div>
            <StoreIso />
          </div>
        </section>

        <section className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-[#14233F]">
          <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Store live · nimbus.digitalboost.shop
              </div>
              <h2 className="mt-2 text-xl font-semibold">Experiencia lista para evolucionar</h2>
            </div>
            <button type="button" onClick={() => onNavigate?.("website-builder")} className="inline-flex h-11 items-center gap-2 rounded-lg bg-violet-500 px-4 text-sm font-medium">
              <Eye size={15} /> Editar en el studio
            </button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <button key={m.label} type="button" onClick={() => onNavigate?.(m.go)} className="rounded-xl border border-white/10 bg-[#101B32] p-4 text-left hover:border-cyan-400/40">
              <div className="flex items-center justify-between">
                <SignalRing value={m.pct} tone={m.tone} />
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <ArrowUpRight size={12} /> {m.delta}
                </span>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{m.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-400">{m.label}</div>
            </button>
          ))}
        </section>

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
          <section className="rounded-xl border border-white/10 bg-[#101B32] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Rendimiento</h2>
              <button type="button" onClick={() => onNavigate?.("analytics")} className="text-xs text-slate-400">
                Analytics <ChevronRight size={12} className="inline" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[["Ticket", money(ticket || 118)], ["Productos", String(products.length || 4)], ["Conv.", `${(conv || 25).toFixed(0)}%`]].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-white/10 bg-[#070d18] p-3">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{l}</div>
                  <div className="mt-2 text-sm font-semibold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex h-36 items-end gap-1.5 rounded-lg border border-white/10 bg-[#070d18] px-3 pb-3 pt-5">
              {pulse.map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-violet-500 to-cyan-400" style={{ height: `${h}%` }} />
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-[#14233F] p-4 sm:p-5">
            <div className="absolute -right-6 -top-8 opacity-30"><PrismMark /></div>
            <div className="relative">
              <div className="flex items-center gap-2 text-violet-300">
                <Sparkles size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">AI Operator</span>
              </div>
              <h2 className="mt-5 text-lg font-semibold">¿Qué querés mejorar?</h2>
              <div className="mt-5 space-y-2">
                <button type="button" onClick={() => onNavigate?.("website-builder")} className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-left hover:border-violet-400/45">
                  <div className="flex items-center gap-2 text-sm font-medium"><WandSparkles size={14} className="text-violet-300" /> Mejorar homepage</div>
                </button>
                <button type="button" onClick={() => onNavigate?.("campaigns")} className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-left hover:border-cyan-400/40">
                  <div className="flex items-center gap-2 text-sm font-medium"><Zap size={14} className="text-cyan-300" /> Crear campaña</div>
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-xl border border-white/10 bg-[#101B32] p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Actividad reciente</h2>
            <button type="button" onClick={() => onNavigate?.("orders")} className="text-xs text-cyan-300">Ver pedidos</button>
          </div>
          <div className="space-y-2">
            {feed.map((o: any) => (
              <button key={o.id} type="button" onClick={() => onNavigate?.("orders")} className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-[#070d18] px-3 py-3 text-left hover:border-cyan-400/30">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">#{o.id}</div>
                  <div className="truncate text-xs text-slate-500">{o.customer} · {o.status || o.state || ""}</div>
                </div>
                <div className="text-sm font-semibold tabular-nums text-cyan-300">{money(Number(o.total) || 0)}</div>
                <ChevronRight size={14} className="text-slate-600" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
