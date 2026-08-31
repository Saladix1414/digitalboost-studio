import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  Globe2,
  LayoutTemplate,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

type Section = "top" | "tools" | "ai" | "pricing" | "footer";

const scrollToSection = (section: Section) => {
  document.getElementById(section)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const tools = [
  {
    icon: Store,
    title: "Store Builder",
    description:
      "Creá y administrá tu tienda virtual desde un único Commerce OS.",
    tag: "COMMERCE",
  },
  {
    icon: LayoutTemplate,
    title: "Website Builder",
    description:
      "Construí páginas y tiendas profesionales utilizando temas diseñados para cada tipo de negocio.",
    tag: "WEB",
  },
  {
    icon: ShoppingBag,
    title: "Product Intelligence",
    description:
      "Organizá productos, inventario, colecciones y oportunidades de venta.",
    tag: "PRODUCTOS",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Convertí pedidos, ventas y comportamiento comercial en decisiones.",
    tag: "DATOS",
  },
  {
    icon: Search,
    title: "SEO Manager",
    description:
      "Optimizá tu tienda y tu sitio para crecer orgánicamente con inteligencia.",
    tag: "VIP",
  },
];

const integrations = [
  "Temu",
  "SHEIN",
  "Alibaba",
  "Website Builder",
  "AI Store Operator",
  "SEO Manager",
];

export default function DigitalBoostMainPage() {
  const [menu, setMenu] = useState(false);

  const go = (section: Section) => {
    setMenu(false);
    scrollToSection(section);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#02050c] text-white">
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        .db-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        .db-glow {
          box-shadow:
            0 0 0 1px rgba(139,92,246,.10),
            0 30px 100px rgba(76,29,149,.18);
        }

        .db-card {
          transition:
            transform .25s ease,
            border-color .25s ease,
            background .25s ease,
            box-shadow .25s ease;
        }

        .db-card:hover {
          transform: translateY(-5px);
          border-color: rgba(103,232,249,.24);
          box-shadow: 0 20px 70px rgba(8,145,178,.08);
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="db-grid absolute inset-0 opacity-70" />

        <div className="absolute left-1/2 top-[-320px] h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-violet-700/10 blur-[150px]" />

        <div className="absolute right-[-250px] top-[35%] h-[500px] w-[500px] rounded-full bg-cyan-500/[.06] blur-[130px]" />

        <div className="absolute bottom-[-250px] left-[-200px] h-[500px] w-[500px] rounded-full bg-blue-600/[.05] blur-[130px]" />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#02050c]/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5">
          <button
            type="button"
            onClick={() => go("top")}
            className="flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="DigitalBoost"
              className="h-9 w-9 object-contain"
            />

            <div className="text-left">
              <div className="text-sm font-black tracking-tight">
                DIGITAL<span className="text-cyan-400">BOOST</span>
              </div>
              <div className="text-[8px] font-semibold tracking-[.28em] text-slate-500">
                COMMERCE OS
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-7 text-sm text-slate-400 lg:flex">
            <button
              onClick={() => go("top")}
              className="text-cyan-300 transition hover:text-white"
            >
              Inicio
            </button>

            <button
              onClick={() => go("tools")}
              className="transition hover:text-white"
            >
              Ecosistema
            </button>

            <button
              onClick={() => go("ai")}
              className="transition hover:text-white"
            >
              Inteligencia
            </button>

            <button
              onClick={() => go("pricing")}
              className="transition hover:text-white"
            >
              Planes
            </button>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-300 transition hover:border-white/25 hover:bg-white/5 hover:text-white"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => go("tools")}
              className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-violet-900/20 transition hover:scale-[1.02]"
            >
              Comenzar ahora
            </button>
          </div>

          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menu && (
          <div className="border-t border-white/10 bg-[#030712] p-5 lg:hidden">
            <div className="flex flex-col gap-4 text-sm text-slate-300">
              <button onClick={() => go("top")} className="text-left">
                Inicio
              </button>

              <button onClick={() => go("tools")} className="text-left">
                Ecosistema
              </button>

              <button onClick={() => go("ai")} className="text-left">
                Inteligencia
              </button>

              <button onClick={() => go("pricing")} className="text-left">
                Planes
              </button>

              <button
                onClick={() => go("tools")}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-3 font-semibold"
              >
                Comenzar ahora
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <main>
        <section
          id="top"
          className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-14 sm:pb-28 sm:pt-20"
        >
          <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[.05] px-4 py-2 text-[10px] font-semibold tracking-[.18em] text-cyan-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.9)]" />
                EL COMMERCE OS DE DIGITALBOOST
              </div>

              <h1 className="max-w-[720px] text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">
                Crea.
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-white bg-clip-text text-transparent">
                  Impulsa.
                </span>
                <br />
                Escala.
                <br />
                <span className="text-slate-500">Innova.</span>
              </h1>

              <p className="mt-7 max-w-[620px] text-base leading-7 text-slate-400 sm:text-lg">
                DigitalBoost reúne todo lo que necesitás para crear,
                administrar y hacer crecer un negocio digital en un solo
                ecosistema.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go("tools")}
                  className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3.5 text-sm font-bold shadow-xl shadow-violet-900/20 transition hover:scale-[1.02]"
                >
                  Comenzar ahora
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => go("tools")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.025] px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[.06] hover:text-white"
                >
                  Explorar DigitalBoost
                  <ChevronDown size={15} />
                </button>
              </div>

              <div className="mt-9 grid max-w-[620px] grid-cols-3 gap-3">
                {[
                  ["01", "Crear"],
                  ["02", "Vender"],
                  ["03", "Escalar"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="rounded-xl border border-white/[.07] bg-white/[.02] p-4"
                  >
                    <p className="text-[10px] font-bold text-cyan-300">
                      {number}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-300">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="relative">
              <div className="absolute -inset-8 rounded-[40px] bg-violet-600/[.07] blur-3xl" />

              <div className="db-glow relative overflow-hidden rounded-[28px] border border-white/10 bg-[#070b14]/90 p-4 backdrop-blur-xl sm:p-5">
                <div className="flex items-center justify-between border-b border-white/[.07] pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-semibold tracking-widest text-slate-500">
                      DIGITALBOOST OS
                    </span>
                  </div>

                  <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-2.5 py-1 text-[9px] text-cyan-300">
                    LIVE
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_.72fr]">
                  <div className="rounded-2xl border border-white/[.07] bg-[#030711] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-500">
                          Ventas actuales
                        </p>
                        <p className="mt-1 text-3xl font-bold text-white">
                          $18.420
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
                        <TrendingUp size={18} />
                      </div>
                    </div>

                    <div className="mt-7 flex h-28 items-end gap-2">
                      {[28, 42, 34, 57, 51, 73, 66, 86, 78, 96].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-violet-600/20 to-cyan-400/80"
                            style={{ height: `${height}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[.06] p-4">
                      <div className="flex items-center gap-2">
                        <Bot size={16} className="text-violet-300" />
                        <p className="text-xs font-semibold text-white">
                          AI Operator
                        </p>
                      </div>

                      <p className="mt-3 text-[10px] leading-5 text-slate-400">
                        Detecté 6 oportunidades para mejorar tus ventas.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[.07] bg-[#030711] p-4">
                      <div className="flex items-center gap-2">
                        <Search size={15} className="text-cyan-300" />
                        <p className="text-xs font-semibold text-white">
                          SEO Score
                        </p>
                      </div>

                      <div className="mt-3 flex items-end justify-between">
                        <p className="text-2xl font-bold text-white">82</p>
                        <p className="text-[10px] text-emerald-300">
                          +14%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    ["1.284", "Pedidos"],
                    ["86%", "Conversión"],
                    ["24", "Productos"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[.07] bg-[#030711] p-3"
                    >
                      <p className="text-sm font-bold text-white">{value}</p>
                      <p className="mt-1 text-[9px] text-slate-600">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <img
                src="/logo.png"
                alt=""
                className="pointer-events-none absolute -bottom-10 -right-8 hidden h-28 w-28 object-contain opacity-80 sm:block"
              />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-y border-white/[.07] bg-white/[.015]">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 px-5 sm:grid-cols-4">
            {[
              ["01", "Commerce OS"],
              ["∞", "Herramientas conectadas"],
              ["AI", "Inteligencia integrada"],
              ["VIP", "SEO Manager"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="border-white/[.07] px-4 py-7 text-center sm:border-r last:border-r-0"
              >
                <p className="text-xl font-black text-white">{value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ECOSYSTEM */}
        <section
          id="tools"
          className="mx-auto max-w-[1240px] scroll-mt-24 px-5 py-24"
        >
          <div className="max-w-[760px]">
            <p className="text-[10px] font-bold tracking-[.22em] text-cyan-300">
              EL ECOSISTEMA
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Todo lo que necesitás.
              <br />
              <span className="text-slate-500">
                Un solo lugar para hacerlo crecer.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-base">
              En lugar de saltar entre plataformas, DigitalBoost conecta las
              piezas de tu negocio dentro de una misma experiencia.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => {
              const Icon = tool.icon;

              return (
                <div
                  key={tool.title}
                  className={`db-card rounded-2xl border border-white/[.08] bg-[#070b14] p-6 ${
                    index === 0 ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                      <Icon size={20} />
                    </div>

                    <span className="rounded-full border border-white/[.08] px-2.5 py-1 text-[9px] font-semibold tracking-wider text-slate-600">
                      {tool.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-base font-bold text-white">
                    {tool.title}
                  </h3>

                  <p className="mt-2 max-w-[560px] text-xs leading-6 text-slate-500">
                    {tool.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold text-cyan-300">
                    Explorar módulo
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI */}
        <section
          id="ai"
          className="relative overflow-hidden border-y border-white/[.07] bg-[#030711] py-24"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/[.07] blur-[130px]" />

          <div className="relative mx-auto max-w-[1240px] px-5">
            <div className="grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                  <Sparkles size={22} />
                </div>

                <p className="mt-6 text-[10px] font-bold tracking-[.22em] text-violet-300">
                  INTELIGENCIA DIGITALBOOST
                </p>

                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                  Tu negocio
                  <br />
                  <span className="text-slate-500">
                    también piensa.
                  </span>
                </h2>

                <p className="mt-5 text-sm leading-7 text-slate-500">
                  La IA deja de ser una herramienta aislada y comienza a
                  trabajar con los datos reales de tu comercio.
                </p>

                <button
                  type="button"
                  onClick={() => go("tools")}
                  className="mt-7 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-slate-200"
                >
                  Conocer AI Store Operator
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [
                    Bot,
                    "Analizar",
                    "Detecta patrones y oportunidades.",
                  ],
                  [
                    TrendingUp,
                    "Predecir",
                    "Convierte datos en decisiones.",
                  ],
                  [
                    Zap,
                    "Automatizar",
                    "Reduce tareas repetitivas.",
                  ],
                  [
                    Users,
                    "Entender",
                    "Conoce mejor a tus clientes.",
                  ],
                ].map(([Icon, title, description]) => {
                  const Component = Icon as React.ElementType;

                  return (
                    <div
                      key={title as string}
                      className="db-card rounded-2xl border border-white/[.08] bg-white/[.02] p-5"
                    >
                      <Component
                        size={18}
                        className="text-cyan-300"
                      />

                      <p className="mt-5 text-sm font-semibold text-white">
                        {title as string}
                      </p>

                      <p className="mt-2 text-[11px] leading-5 text-slate-500">
                        {description as string}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="mx-auto max-w-[1240px] px-5 py-24">
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-[.22em] text-cyan-300">
              CONECTADO
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Un ecosistema que trabaja junto.
            </h2>

            <p className="mx-auto mt-4 max-w-[620px] text-sm leading-6 text-slate-500">
              Productos, tiendas, inteligencia, datos y crecimiento forman
              parte de una misma arquitectura.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {integrations.map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/[.08] bg-white/[.02] px-5 py-3 text-[11px] font-medium text-slate-400 transition hover:border-cyan-400/20 hover:text-cyan-300"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* PLANS */}
        <section
          id="pricing"
          className="border-y border-white/[.07] bg-[#030711] py-24"
        >
          <div className="mx-auto max-w-[1000px] px-5">
            <div className="text-center">
              <p className="text-[10px] font-bold tracking-[.22em] text-violet-300">
                DIGITALBOOST
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Empezá gratis.
                <br />
                <span className="text-slate-500">
                  Escalá cuando estés listo.
                </span>
              </h2>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "Free",
                  description: "Para comenzar.",
                  items: [
                    "Store Builder",
                    "Productos e inventario",
                    "Pedidos y clientes",
                    "Analytics básico",
                  ],
                },
                {
                  name: "Pro",
                  description: "Para crecer.",
                  items: [
                    "Todo Free",
                    "Website Builder",
                    "Biblioteca de temas",
                    "Automatizaciones",
                  ],
                },
                {
                  name: "VIP",
                  description: "Para dominar el crecimiento.",
                  items: [
                    "Todo Pro",
                    "SEO Manager",
                    "AI SEO",
                    "Inteligencia avanzada",
                  ],
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-6 ${
                    plan.name === "VIP"
                      ? "border-violet-400/30 bg-violet-500/[.06]"
                      : "border-white/[.08] bg-[#070b14]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-white">
                      {plan.name}
                    </p>

                    {plan.name === "VIP" && (
                      <span className="rounded-full bg-violet-500/15 px-2 py-1 text-[9px] font-bold text-violet-300">
                        RECOMENDADO
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {plan.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    {plan.items.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-[11px] text-slate-400"
                      >
                        <Check
                          size={13}
                          className="text-emerald-300"
                        />
                        {item}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => go("tools")}
                    className={`mt-7 w-full rounded-xl px-4 py-3 text-xs font-bold ${
                      plan.name === "VIP"
                        ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                        : "border border-white/10 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    Comenzar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-[1240px] px-5 py-24">
          <div className="relative overflow-hidden rounded-[30px] border border-violet-400/20 bg-gradient-to-br from-violet-600/[.12] via-[#070b14] to-cyan-500/[.08] p-8 sm:p-12">
            <div className="pointer-events-none absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-cyan-400/[.07] blur-[90px]" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-[10px] font-bold tracking-[.22em] text-cyan-300">
                  TU PRÓXIMO NIVEL
                </p>

                <h2 className="mt-4 max-w-[700px] text-3xl font-black tracking-tight sm:text-5xl">
                  Tu negocio merece
                  <br />
                  <span className="text-slate-500">
                    algo más que una tienda.
                  </span>
                </h2>

                <p className="mt-5 max-w-[650px] text-sm leading-7 text-slate-400">
                  Construí tu ecosistema digital con DigitalBoost.
                </p>
              </div>

              <img
                src="/cta-dragon.png"
                alt="DigitalBoost"
                className="mx-auto h-40 w-40 object-contain opacity-90 sm:h-48 sm:w-48"
              />
            </div>

            <button
              type="button"
              onClick={() => go("tools")}
              className="relative mt-8 flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:bg-slate-200"
            >
              Comenzar con DigitalBoost
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        id="footer"
        className="border-t border-white/[.07] bg-[#01030a]"
      >
        <div className="mx-auto max-w-[1240px] px-5 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="DigitalBoost"
                  className="h-9 w-9 object-contain"
                />

                <div>
                  <p className="text-sm font-black">
                    DIGITAL<span className="text-cyan-400">BOOST</span>
                  </p>
                  <p className="text-[8px] tracking-[.25em] text-slate-600">
                    COMMERCE OS
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-[460px] text-xs leading-6 text-slate-600">
                Un ecosistema digital para crear, vender, administrar y
                hacer crecer negocios.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Ecosistema
              </p>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <p>Store Builder</p>
                <p>Website Builder</p>
                <p>Theme Library</p>
                <p>Analytics</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Inteligencia
              </p>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <p>AI Store Operator</p>
                <p>SEO Manager</p>
                <p>AI SEO</p>
                <p>Commerce Intelligence</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/[.06] pt-6 text-[10px] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} DigitalBoost.</p>
            <p>Construí. Impulsá. Escalá.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
