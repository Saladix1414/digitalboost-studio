/* Commerce OS Core — Vibrant Visual System */
import React, { useEffect, useMemo, useState } from "react";
import "./commerce-os-vibrant-global.css";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  Command,
  Eye,
  Globe2,
  LayoutDashboard,
  Layers3,
  Megaphone,
  Monitor,
  MoreHorizontal,
  Package,
  Palette,
  PanelLeft,
  Play,
  Plus,
  Rocket,
  Search,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Tablet,
  TrendingUp,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";

type CommerceOSOverviewProps = {
  onNavigate?: (section: string) => void;
};

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { id: "dashboard", label: "Overview", icon: LayoutDashboard },
      { id: "products", label: "Productos", icon: Package },
      { id: "inventory", label: "Inventario", icon: Boxes },
      { id: "orders", label: "Pedidos", icon: ShoppingCart },
      { id: "customers", label: "Clientes", icon: Users },
    ],
  },
  {
    title: "Experience",
    items: [
      { id: "website-builder", label: "Website Builder", icon: Globe2, badge: "NEW" },
      { id: "themes", label: "Theme Studio", icon: Palette },
      { id: "campaigns", label: "Growth Studio", icon: Megaphone },
      { id: "analytics", label: "Live Analytics", icon: BarChart3 },
    ],
  },
];

const metrics = [
  { label: "Ventas", value: "$474", delta: "+18,4%", icon: CircleDollarSign, tone: "emerald" },
  { label: "Pedidos", value: "4", delta: "+12,1%", icon: ShoppingCart, tone: "cyan" },
  { label: "Clientes", value: "4", delta: "+9,7%", icon: Users, tone: "violet" },
  { label: "Conversión", value: "25,00%", delta: "+0,64%", icon: TrendingUp, tone: "amber" },
];

const activity = [
  ["Pedido #DB-1048", "Martín González · Pagado", "$190"],
  ["Pedido #DB-1047", "Sofía Rodríguez · En preparación", "$60"],
  ["Pedido #DB-1046", "Lucas Fernández · Enviado", "$129"],
  ["Pedido #DB-1045", "Camila Torres · Entregado", "$95"],
];

function toneClasses(tone: string) {
  return {
    emerald: "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300",
    cyan: "border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-300",
    violet: "border-violet-400/15 bg-violet-400/[0.07] text-violet-300",
    amber: "border-amber-400/15 bg-amber-400/[0.07] text-amber-300",
  }[tone] || "border-white/10 bg-white/[0.04] text-slate-300";
}

export default function CommerceOSOverview({ onNavigate }: CommerceOSOverviewProps) {
  const [booted, setBooted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet">("desktop");
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 850);
    return () => window.clearTimeout(timer);
  }, []);

  const pulse = useMemo(() => [38, 52, 46, 64, 58, 73, 61, 86, 68, 91, 78, 97], []);

  const navigate = (id: string) => {
    setActive(id);
    onNavigate?.(id);
  };

  if (!booted) {
    return (
      <div className="relative min-h-[720px] overflow-hidden rounded-[28px] border border-white/10 bg-[#02050b] text-white shadow-2xl shadow-cyan-950/20" data-commerce-os="true" data-commerce-os-core="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,220,255,.10),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,.12),transparent_35%)]" />
        <div className="relative flex min-h-[720px] items-center justify-center p-8">
          <div className="w-full max-w-xl text-center">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] shadow-[0_0_80px_rgba(34,211,238,.13)]">
              <Rocket className="text-cyan-300" size={30} />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-300">DIGITALBOOST COMMERCE OS</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Inicializando tu workspace</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Preparando el entorno visual, tus módulos comerciales y la capa inteligente.</p>
            <div className="mx-auto mt-8 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
            </div>
            <div className="mt-4 flex justify-center gap-5 text-[10px] uppercase tracking-[0.18em] text-slate-600">
              <span>Shell</span><span>Commerce</span><span>AI</span><span>Live</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[760px] overflow-hidden rounded-[28px] border border-white/10 bg-[#03060d] text-white shadow-2xl shadow-black/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,.08),transparent_24%),radial-gradient(circle_at_100%_0%,rgba(124,58,237,.09),transparent_28%)]" />

      {/* INNER APP CHROME — deliberately makes Commerce OS feel like a web app living inside DigitalBoost. */}
      <header className="relative z-20 flex h-14 items-center justify-between border-b border-white/[0.07] bg-[#050914]/90 px-3 backdrop-blur-xl sm:px-5">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-slate-400 hover:text-white" aria-label="Panel">
            <PanelLeft size={15} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-cyan-300"><Store size={14} /></div>
            <div>
              <div className="text-[11px] font-semibold tracking-wide text-white">Commerce OS</div>
              <div className="text-[9px] text-slate-600">/ workspace / tienda principal</div>
            </div>
          </div>
          <span className="hidden rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 text-[9px] font-medium text-emerald-300 sm:inline-flex">LIVE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setSearchOpen(true)} className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-slate-500 hover:text-white sm:flex"><Search size={13} /> Buscar <span className="rounded border border-white/10 px-1.5 py-0.5 text-[8px]">⌘K</span></button>
          <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.04] hover:text-white"><Bell size={14} /></button>
          <button type="button" className="rounded-lg border border-violet-400/15 bg-violet-400/[0.06] px-2.5 py-2 text-[10px] text-violet-200"><Sparkles size={12} className="mr-1 inline" /> AI Operator</button>
          <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-[9px] font-bold text-white">DB</div>
        </div>
      </header>

      <div className="relative z-10 grid min-h-[704px] lg:grid-cols-[218px_minmax(0,1fr)]">
        {/* SIDEBAR */}
        <aside className="hidden border-r border-white/[0.06] bg-[#040811]/75 p-3 lg:block">
          <div className="mb-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-violet-500/20" />
              <div className="min-w-0"><div className="truncate text-[11px] font-semibold">Mi tienda</div><div className="truncate text-[9px] text-slate-600">digitalboost.shop</div></div>
            </div>
            <div className="mt-3 h-px bg-white/[0.06]" />
            <div className="mt-2 flex items-center justify-between text-[9px] text-slate-600"><span>Estado</span><span className="text-emerald-300">● Online</span></div>
          </div>
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <div className="mb-2 px-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-700">{group.title}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const selected = active === item.id;
                  return <button key={item.id} type="button" onClick={() => navigate(item.id)} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[10px] transition ${selected ? "border border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-200" : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200"}`}><Icon size={13} /><span className="flex-1">{item.label}</span>{item.badge && <span className="rounded bg-violet-400/10 px-1.5 py-0.5 text-[7px] font-bold text-violet-300">{item.badge}</span>}</button>;
                })}
              </div>
            </div>
          ))}
          <div className="mt-auto rounded-xl border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.07] to-cyan-500/[0.04] p-3">
            <div className="flex items-center gap-2 text-violet-200"><WandSparkles size={13} /><span className="text-[9px] font-semibold">AI Site Copilot</span></div>
            <p className="mt-2 text-[9px] leading-4 text-slate-600">Diseñá, optimizá y publicá cambios sin salir del workspace.</p>
          </div>
        </aside>

        {/* MAIN WORKSPACE */}
        <main className="min-w-0 p-3 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-300"><Command size={12} /> Control plane</div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Tu comercio, en movimiento.</h1>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">Una nueva capa para operar, diseñar y transformar tu tienda desde el mismo lugar.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => navigate("website-builder")} className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-2 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-300/[0.1]"><Plus size={13} className="mr-1 inline" /> Crear experiencia</button>
              <button type="button" className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-400 hover:text-white"><MoreHorizontal size={15} /></button>
            </div>
          </div>

          {/* Store-in-store visual */}
          <section className="relative mb-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050a13] p-3 sm:p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(34,211,238,.08),transparent_25%),radial-gradient(circle_at_20%_90%,rgba(139,92,246,.08),transparent_30%)]" />
            <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /><span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Store live</span></div>
                <h2 className="mt-2 text-lg font-semibold">Tu experiencia está lista para evolucionar.</h2>
                <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-500">Visualizá el sitio, editá bloques y probá nuevas experiencias sin abandonar Commerce OS.</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPreviewMode("desktop")} className={`rounded-lg border px-2.5 py-2 text-[9px] ${previewMode === "desktop" ? "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-200" : "border-white/10 text-slate-600"}`}><Monitor size={13} className="mr-1 inline" /> Desktop</button>
                <button type="button" onClick={() => setPreviewMode("tablet")} className={`rounded-lg border px-2.5 py-2 text-[9px] ${previewMode === "tablet" ? "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-200" : "border-white/10 text-slate-600"}`}><Tablet size={13} className="mr-1 inline" /> Tablet</button>
                <button type="button" onClick={() => navigate("website-builder")} className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-2 text-[9px] font-semibold text-white"><Eye size={13} className="mr-1 inline" /> Abrir editor</button>
              </div>
            </div>

            <div className="relative mt-4 rounded-xl border border-white/[0.07] bg-[#02050a] p-2 shadow-2xl shadow-black/30">
              <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-2 pb-2"><span className="h-1.5 w-1.5 rounded-full bg-rose-400/70"/><span className="h-1.5 w-1.5 rounded-full bg-amber-400/70"/><span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70"/><div className="ml-2 flex-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[8px] text-slate-700">https://mi-tienda.digitalboost.app</div></div>
              <div className={`mx-auto mt-2 overflow-hidden rounded-lg border border-cyan-400/10 bg-gradient-to-br from-[#07121d] via-[#070916] to-[#11091d] transition-all ${previewMode === "tablet" ? "max-w-[620px]" : "max-w-none"}`}>
                <div className="grid min-h-[118px] grid-cols-[1fr_.8fr] gap-3 p-4 sm:min-h-[150px] sm:p-6">
                  <div><div className="text-[8px] font-semibold tracking-[0.18em] text-cyan-300">DIGITALBOOST STORE</div><div className="mt-3 text-lg font-bold sm:text-2xl">Diseñá una tienda que se sienta viva.</div><p className="mt-2 max-w-sm text-[8px] leading-4 text-slate-500 sm:text-[10px]">Contenido, catálogo y conversión unidos en una experiencia visual.</p><div className="mt-3 inline-flex rounded-md bg-gradient-to-r from-violet-500 to-cyan-400 px-2.5 py-1.5 text-[8px] font-semibold">Explorar colección</div></div>
                  <div className="relative hidden overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] sm:block"><div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl"/><div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl"/><div className="relative grid h-full place-items-center"><ShoppingBag size={36} className="text-cyan-300/70"/></div></div>
                </div>
              </div>
            </div>
          </section>

          {/* KPIs */}
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => { const Icon = metric.icon; return <button key={metric.label} type="button" onClick={() => navigate(metric.label === "Ventas" ? "analytics" : metric.label === "Pedidos" ? "orders" : metric.label === "Clientes" ? "customers" : "analytics")} className="group rounded-2xl border border-white/[0.07] bg-[#050912] p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-400/15 hover:bg-[#07101a]"><div className="flex items-start justify-between"><div className={`rounded-xl border p-2.5 ${toneClasses(metric.tone)}`}><Icon size={16}/></div><span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-300"><ArrowUpRight size={11}/>{metric.delta}</span></div><div className="mt-4 text-xl font-semibold tracking-tight">{metric.value}</div><div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-600">{metric.label}</div></button> })}
          </section>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_.55fr]">
            {/* Pulse chart */}
            <section className="rounded-2xl border border-white/[0.07] bg-[#050912] p-4 sm:p-5">
              <div className="flex items-center justify-between"><div><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600"><Activity size={12}/> Business Pulse</div><h2 className="mt-2 text-sm font-semibold">Rendimiento de la tienda</h2></div><button type="button" onClick={() => navigate("analytics")} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[9px] text-slate-500 hover:text-white">Live Analytics <ChevronRight size={11} className="inline"/></button></div>
              <div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl border border-white/[0.06] bg-black/20 p-3"><div className="text-[8px] uppercase tracking-[0.13em] text-slate-700">Ticket promedio</div><div className="mt-2 text-sm font-semibold">$118</div><div className="mt-1 text-[8px] text-emerald-300">+7,3%</div></div><div className="rounded-xl border border-white/[0.06] bg-black/20 p-3"><div className="text-[8px] uppercase tracking-[0.13em] text-slate-700">Entregados</div><div className="mt-2 text-sm font-semibold">1</div><div className="mt-1 text-[8px] text-cyan-300">flujo activo</div></div><div className="rounded-xl border border-white/[0.06] bg-black/20 p-3"><div className="text-[8px] uppercase tracking-[0.13em] text-slate-700">Enviados</div><div className="mt-2 text-sm font-semibold">1</div><div className="mt-1 text-[8px] text-violet-300">en tránsito</div></div></div>
              <div className="mt-5 flex h-32 items-end gap-1.5 rounded-xl border border-white/[0.05] bg-gradient-to-b from-cyan-400/[0.035] to-transparent px-3 pb-3 pt-5 sm:h-40">{pulse.map((height, index) => <div key={index} className="flex-1 rounded-t bg-gradient-to-t from-violet-500/40 to-cyan-300/70 transition hover:from-violet-400 hover:to-cyan-200" style={{height: `${height}%`}} />)}</div>
            </section>

            {/* AI panel */}
            <section className="relative overflow-hidden rounded-2xl border border-violet-400/10 bg-gradient-to-br from-[#0a0714] via-[#070912] to-[#041019] p-4 sm:p-5">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />
              <div className="relative"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-violet-200"><Sparkles size={14}/><span className="text-[9px] font-semibold uppercase tracking-[0.16em]">AI Store Operator</span></div><span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 text-[8px] text-emerald-300">READY</span></div><h2 className="mt-5 text-lg font-semibold">¿Qué querés mejorar?</h2><p className="mt-2 text-[10px] leading-5 text-slate-600">La capa inteligente puede convertir una intención en una acción dentro de tu tienda.</p><div className="mt-5 space-y-2"><button type="button" onClick={() => navigate("website-builder")} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left hover:border-violet-400/20"><div className="flex items-center gap-2 text-[10px] font-medium"><WandSparkles size={13} className="text-violet-300"/> Mejorar mi homepage</div><div className="mt-1 text-[8px] text-slate-700">Diseño + copy + conversión</div></button><button type="button" onClick={() => navigate("campaigns")} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left hover:border-cyan-400/20"><div className="flex items-center gap-2 text-[10px] font-medium"><Zap size={13} className="text-cyan-300"/> Crear una campaña</div><div className="mt-1 text-[8px] text-slate-700">Segmentación + propuesta</div></button></div></div>
            </section>
          </div>

          {/* Activity */}
          <section className="mt-4 rounded-2xl border border-white/[0.07] bg-[#050912] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between"><div><div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">Live Feed</div><h2 className="mt-1 text-sm font-semibold">Actividad reciente</h2></div><button type="button" onClick={() => navigate("orders")} className="text-[9px] text-cyan-300">Ver pedidos →</button></div>
            <div className="space-y-2">{activity.map(([title, subtitle, amount]) => <button key={title} type="button" onClick={() => navigate("orders")} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-black/15 p-3 text-left transition hover:border-cyan-400/10 hover:bg-cyan-400/[0.02]"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.04] text-cyan-300"><ShoppingCart size={13}/></div><div className="min-w-0 flex-1"><div className="truncate text-[10px] font-medium">{title}</div><div className="truncate text-[8px] text-slate-700">{subtitle}</div></div><div className="text-[10px] font-semibold text-cyan-300">{amount}</div><ChevronRight size={12} className="text-slate-700"/></button>)}</div>
          </section>

          {/* Mobile nav */}
          <div className="mt-4 grid grid-cols-4 gap-2 lg:hidden">
            {[{id:"dashboard",label:"Inicio",icon:LayoutDashboard},{id:"products",label:"Productos",icon:Package},{id:"orders",label:"Pedidos",icon:ShoppingCart},{id:"website-builder",label:"Builder",icon:Globe2}].map((item)=>{const I=item.icon;return <button key={item.id} type="button" onClick={()=>navigate(item.id)} className={`rounded-xl border p-2 text-[8px] ${active===item.id?"border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-200":"border-white/[0.06] bg-white/[0.02] text-slate-600"}`}><I size={14} className="mx-auto mb-1"/>{item.label}</button>})}
          </div>
        </main>
      </div>

      {searchOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-md" onClick={() => setSearchOpen(false)}><div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#070b14] p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center gap-2 border-b border-white/[0.06] px-2 pb-3"><Search size={15} className="text-slate-600"/><input autoFocus className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-700" placeholder="Buscar productos, pedidos, páginas..."/><kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[8px] text-slate-600">ESC</kbd></div><div className="p-2 text-[9px] text-slate-600">Comandos rápidos</div><div className="grid gap-1 sm:grid-cols-2"><button type="button" onClick={()=>{setSearchOpen(false);navigate("website-builder")}} className="rounded-lg p-3 text-left text-[10px] hover:bg-white/[0.04]"><Globe2 size={13} className="mr-2 inline text-cyan-300"/>Abrir Website Builder</button><button type="button" onClick={()=>{setSearchOpen(false);navigate("products")}} className="rounded-lg p-3 text-left text-[10px] hover:bg-white/[0.04]"><Package size={13} className="mr-2 inline text-violet-300"/>Gestionar productos</button></div></div></div>}
    </div>
  );
}
