import React from "react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Bot,
  ChevronRight,
  Globe2,
  LayoutDashboard,
  LineChart,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Zap,
} from "lucide-react";

interface DigitalBoostMainPageProps {
  onStart?: () => void;
  onSelectTool?: (mode: any) => void;
}

export default function DigitalBoostMainPage({
  onStart,
  onSelectTool,
}: DigitalBoostMainPageProps) {

  const go = (mode?: any) => {
    if (mode && onSelectTool) {
      onSelectTool(mode);
      return;
    }

    onStart?.();
  };

  const ecosystem = [
    {
      icon: Bot,
      title: "DigitalBoost AI",
      text: "Creá, analizá y optimizá tu ecosistema digital con inteligencia artificial.",
      badge: "AI ENGINE",
    },
    {
      icon: Store,
      title: "Commerce OS",
      text: "Productos, inventario, pedidos, clientes, campañas y operaciones desde un solo lugar.",
      badge: "COMMERCE",
    },
    {
      icon: BarChart3,
      title: "Live Analytics",
      text: "Convertí los datos de tu negocio en decisiones accionables en tiempo real.",
      badge: "LIVE DATA",
    },
    {
      icon: Search,
      title: "SEO Manager VIP",
      text: "Optimización avanzada para la tienda interna y las webs creadas con DigitalBoost.",
      badge: "VIP",
    },
  ];

  const metrics = [
    ["01", "Crear", "Webs, tiendas y experiencias digitales"],
    ["02", "Medir", "Datos y comportamiento en tiempo real"],
    ["03", "Optimizar", "IA, conversión y SEO"],
    ["04", "Escalar", "Un ecosistema conectado"],
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#02050b] text-white">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[-20%] top-[-15%] h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute right-[-15%] top-[10%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="absolute bottom-[-20%] left-[25%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <header className="relative z-20 border-b border-white/[.07] bg-[#02050b]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4">

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,.08)]">
              <Rocket size={19} className="text-cyan-300 transition group-hover:scale-110" />
            </div>

            <div className="text-left">
              <div className="text-sm font-bold tracking-wide">
                Digital<span className="text-cyan-300">Boost</span>
              </div>
              <div className="text-[9px] uppercase tracking-[.24em] text-slate-500">
                Digital ecosystem
              </div>
            </div>
          </button>

          <div className="hidden items-center gap-7 md:flex">
            <a href="#ecosistema" className="text-xs text-slate-400 transition hover:text-white">
              Ecosistema
            </a>
            <a href="#analytics" className="text-xs text-slate-400 transition hover:text-white">
              Analytics
            </a>
            <a href="#ai" className="text-xs text-slate-400 transition hover:text-white">
              AI
            </a>
            <a href="#seo" className="text-xs text-slate-400 transition hover:text-white">
              SEO Manager
            </a>
          </div>

          <button
            type="button"
            onClick={() => go("tools")}
            className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
          >
            Entrar al ecosistema
          </button>
        </div>
      </header>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative z-10 mx-auto max-w-[1280px] px-5 pb-20 pt-20 md:pb-28 md:pt-28">

        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">

          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-300">
              <Sparkles size={12} />
              The digital growth operating system
            </div>

            <h1 className="max-w-[780px] text-5xl font-black leading-[.96] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              Tu negocio digital.
              <span className="block bg-gradient-to-r from-violet-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Un solo ecosistema.
              </span>
            </h1>

            <p className="mt-7 max-w-[650px] text-base leading-7 text-slate-400 md:text-lg">
              DigitalBoost conecta creación, comercio, inteligencia artificial,
              analytics y crecimiento en una experiencia diseñada para que
              puedas crear, medir, optimizar y escalar sin saltar entre
              plataformas.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={() => go("tools")}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3.5 text-sm font-bold shadow-[0_0_40px_rgba(99,102,241,.18)] transition hover:-translate-y-0.5 hover:shadow-[0_0_55px_rgba(34,211,238,.18)]"
              >
                Comenzar con DigitalBoost
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => document.getElementById("ecosistema")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.025] px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[.05]"
              >
                Explorar ecosistema
                <ChevronRight size={16} />
              </button>

            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-[.16em] text-slate-600">
              <span>AI powered</span>
              <span>Live data</span>
              <span>Commerce</span>
              <span>SEO</span>
              <span>Growth</span>
            </div>
          </div>

          {/* HERO CONTROL CENTER */}

          <div className="relative">
            <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#050914]/90 shadow-2xl">

              <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">
                    DigitalBoost Control Center
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    Ecosystem overview
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  LIVE
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5">

                {[
                  [LayoutDashboard, "Store", "Active"],
                  [ShoppingBag, "Commerce", "Ready"],
                  [LineChart, "Analytics", "Live"],
                  [Search, "SEO Manager", "VIP"],
                ].map(([Icon, title, status]) => (
                  <div
                    key={String(title)}
                    className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4 transition hover:border-cyan-400/20 hover:bg-white/[.045]"
                  >
                    <Icon size={18} className="text-cyan-300" />
                    <div className="mt-5 text-xs font-semibold">{title}</div>
                    <div className="mt-1 text-[10px] text-slate-500">{status}</div>
                  </div>
                ))}

              </div>

              <div className="mx-5 mb-5 rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[.08] to-cyan-500/[.04] p-5">

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] uppercase tracking-[.18em] text-violet-300">
                      AI Growth Engine
                    </div>
                    <div className="mt-1 text-sm font-semibold">
                      Tu próximo crecimiento empieza aquí.
                    </div>
                  </div>

                  <Bot size={24} className="text-violet-300" />
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    ["SEO", "↑"],
                    ["Sales", "↑"],
                    ["Conversion", "↑"],
                  ].map(([name, value]) => (
                    <div
                      key={name}
                      className="rounded-xl border border-white/[.06] bg-black/20 p-3"
                    >
                      <div className="text-[9px] text-slate-500">{name}</div>
                      <div className="mt-1 text-sm font-bold text-emerald-300">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================
          ECOSYSTEM
      ====================================================== */}

      <section id="ecosistema" className="relative z-10 mx-auto max-w-[1280px] px-5 py-20">

        <div className="max-w-[700px]">
          <div className="text-[10px] font-bold uppercase tracking-[.22em] text-cyan-300">
            Ecosistema DigitalBoost
          </div>

          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Todo conectado.
            <span className="text-slate-500"> Todo trabajando para vos.</span>
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            La diferencia no está en tener más herramientas. Está en hacer que
            todas compartan contexto y datos.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">

          {ecosystem.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-[24px] border border-white/[.08] bg-[#050914]/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-[#07101d]"
              >

                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[.05]">
                    <Icon size={20} className="text-cyan-300" />
                  </div>

                  <span className="rounded-full border border-white/[.07] px-2.5 py-1 text-[8px] font-bold tracking-[.16em] text-slate-500">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold">{item.title}</h3>

                <p className="mt-2 max-w-[520px] text-sm leading-6 text-slate-400">
                  {item.text}
                </p>

                <div className="mt-6 inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 opacity-70 transition group-hover:opacity-100">
                  Explorar
                  <ArrowRight size={12} />
                </div>

              </div>
            );
          })}

        </div>
      </section>

      {/* ======================================================
          LIVE ANALYTICS
      ====================================================== */}

      <section id="analytics" className="relative z-10 mx-auto max-w-[1280px] px-5 py-20">

        <div className="overflow-hidden rounded-[28px] border border-cyan-400/10 bg-[#050914]">

          <div className="grid lg:grid-cols-[.8fr_1.2fr]">

            <div className="border-b border-white/[.07] p-8 lg:border-b-0 lg:border-r lg:p-10">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/[.07]">
                <LineChart size={20} className="text-cyan-300" />
              </div>

              <div className="mt-6 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">
                Live Analytics
              </div>

              <h2 className="mt-3 text-3xl font-bold">
                Los datos dejan de ser números.
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Cada métrica puede convertirse en una acción. Tendencias,
                productos destacados, precios, pedidos, clientes y señales de
                crecimiento reunidos en un mismo entorno.
              </p>

              <button
                type="button"
                onClick={() => go("tools")}
                className="mt-7 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[.05] px-4 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/10"
              >
                Ver el centro de datos
                <ArrowRight size={14} />
              </button>

            </div>

            <div className="p-6 lg:p-10">

              <div className="grid grid-cols-2 gap-3">

                {[
                  ["Ventas", "+24.8%", "vs. período anterior"],
                  ["Pedidos", "+18.2%", "actividad reciente"],
                  ["Conversión", "+7.4%", "optimización"],
                  ["Tendencia", "↑", "señal positiva"],
                ].map(([name, value, description]) => (
                  <div
                    key={name}
                    className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"
                  >
                    <div className="text-[10px] uppercase tracking-[.12em] text-slate-500">
                      {name}
                    </div>

                    <div className="mt-3 text-2xl font-bold text-white">
                      {value}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-600">
                      {description}
                    </div>
                  </div>
                ))}

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          AI + SEO
      ====================================================== */}

      <section id="ai" className="relative z-10 mx-auto max-w-[1280px] px-5 py-20">

        <div className="grid gap-4 lg:grid-cols-2">

          <div className="rounded-[28px] border border-violet-400/10 bg-gradient-to-br from-violet-500/[.08] to-transparent p-8">

            <Bot size={24} className="text-violet-300" />

            <div className="mt-7 text-[10px] font-bold uppercase tracking-[.2em] text-violet-300">
              DigitalBoost AI
            </div>

            <h2 className="mt-3 text-2xl font-bold">
              Una inteligencia que entiende tu negocio.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Analiza tu tienda, tus productos, tus campañas y tus datos para
              ayudarte a decidir qué hacer después.
            </p>

            <div className="mt-7 space-y-2">
              {[
                "Detectar oportunidades",
                "Analizar productos",
                "Optimizar campañas",
                "Encontrar señales de crecimiento",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-slate-300"
                >
                  <ShieldCheck size={14} className="text-violet-300" />
                  {item}
                </div>
              ))}
            </div>

          </div>

          <div id="seo" className="rounded-[28px] border border-amber-300/10 bg-gradient-to-br from-amber-400/[.07] to-transparent p-8">

            <Search size={24} className="text-amber-200" />

            <div className="mt-7 flex items-center gap-2">
              <div className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-200">
                SEO Manager
              </div>

              <span className="rounded-full border border-amber-300/20 bg-amber-300/[.06] px-2 py-0.5 text-[8px] font-bold tracking-wider text-amber-200">
                VIP
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-bold">
              Que tu tienda no solo exista.
              <span className="text-slate-500"> Que sea encontrada.</span>
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Optimización avanzada para la tienda interna y las páginas web
              que el usuario genere dentro de DigitalBoost.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-2">
              {[
                "Keywords",
                "Meta titles",
                "Schema",
                "Sitemap",
                "Contenido",
                "Technical SEO",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/[.06] bg-black/20 px-3 py-2.5 text-[10px] text-slate-400"
                >
                  {item}
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================
          FOUR STEPS
      ====================================================== */}

      <section className="relative z-10 mx-auto max-w-[1280px] px-5 py-20">

        <div className="grid gap-3 md:grid-cols-4">

          {metrics.map(([number, title, text]) => (
            <div
              key={number}
              className="rounded-2xl border border-white/[.07] bg-[#050914] p-5"
            >
              <div className="text-[10px] font-bold tracking-[.18em] text-cyan-300">
                {number}
              </div>

              <div className="mt-5 text-base font-bold">{title}</div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {text}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative z-10 mx-auto max-w-[1280px] px-5 pb-24 pt-16">

        <div className="relative overflow-hidden rounded-[32px] border border-violet-400/15 bg-gradient-to-br from-violet-600/[.12] via-[#050914] to-cyan-500/[.08] p-8 text-center md:p-14">

          <div className="absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[80px]" />

          <div className="relative">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/[.05]">
              <Zap size={21} className="text-violet-200" />
            </div>

            <h2 className="mx-auto mt-6 max-w-[700px] text-3xl font-black tracking-tight md:text-5xl">
              Dejá de administrar herramientas.
              <span className="block text-slate-500">
                Empezá a construir un ecosistema.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-[600px] text-sm leading-6 text-slate-400">
              DigitalBoost reúne las piezas para crear, vender, analizar y
              hacer crecer tu negocio digital.
            </p>

            <button
              type="button"
              onClick={() => go("tools")}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-7 py-3.5 text-sm font-bold shadow-[0_0_45px_rgba(99,102,241,.2)] transition hover:-translate-y-0.5"
            >
              Comenzar con DigitalBoost
              <ArrowRight size={16} />
            </button>

          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="relative z-10 border-t border-white/[.07] bg-[#010308]">

        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-8 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">

          <div>
            © {new Date().getFullYear()} DigitalBoost.
            <span className="ml-1">
              Digital ecosystem for creators, entrepreneurs and businesses.
            </span>
          </div>

          <div className="flex gap-5">
            <span>AI</span>
            <span>Commerce OS</span>
            <span>Analytics</span>
            <span>SEO Manager VIP</span>
          </div>

        </div>

      </footer>

    </main>
  );
}
