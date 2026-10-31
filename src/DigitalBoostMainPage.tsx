import React from "react";
import BrainBoostLandingSection from "./brain-boost/BrainBoostLandingSection";
import {
  ArrowRight,
  ChevronDown,
  Moon,
  Check,
  Code2,
  ShoppingCart,
  LayoutTemplate,
  Terminal,
  Sparkles,
  Users,
  FolderKanban,
  Gauge,
  MessageCircle,
} from "lucide-react";

const primaryCta = "bg-[#f15b2a] text-white shadow-[0_8px_18px_rgba(241,91,42,.22)]";

const stats = [
  ["01", "Commerce OS", ShoppingCart, "store"],
  ["02", "Web Builder", LayoutTemplate, "websites"],
  ["03", "IA Forge", Code2, "forge"],
  ["04", "Trading Islands", Terminal, "islands"],
  ["05", "Sentinel", Gauge, null],
  ["06", "Nexus", Users, "nexus"],
] as const;

const tools = [
  { tone: "forge", mode: "forge" as ToolMode, image: "/sky-islands/tool-ia-forge.jpg", title: "IA Forge", desc: "Forja sitios y piezas con IA.", accent: "text-violet-700", ring: "hover:border-violet-300" },
  { tone: "stores", mode: "store" as ToolMode, image: "/sky-islands/tool-stores.jpg", title: "Tiendas Virtuales", desc: "Crea tu tienda online profesional al estilo Shopify.", accent: "text-orange-700", ring: "hover:border-orange-300" },
  { tone: "nexus", mode: "nexus" as ToolMode, image: "/sky-islands/tool-nexus.jpg", title: "Nexus", desc: "Hub de landings y campañas.", accent: "text-emerald-700", ring: "hover:border-emerald-300" },
  { tone: "websites", mode: "websites" as ToolMode, image: "/sky-islands/tool-websites-builder.jpg", title: "Websites Builder", desc: "Constructor de sitios. Canvas y páginas.", accent: "text-sky-700", ring: "hover:border-sky-300" },
  { tone: "trading", mode: "islands" as ToolMode, image: "/sky-islands/tool-trading-islands.jpg", title: "Trading Islands", desc: "Islas de intercambio. Rails reales cuando existan.", accent: "text-amber-700", ring: "hover:border-amber-300" },
];

function StatRow({
  purple = false,
  onSelectTool,
}: {
  purple?: boolean;
  onSelectTool: (mode: ToolMode) => void;
}) {
  if (!purple) {
    return (
      <div
        data-sky-dragon-module-banner
        className="sky-dragon-module-banner"
        role="img"
        aria-label="Dragón azul de Sky Islands volando sobre islas flotantes"
      >
        <img
          src="/sky-islands/dragon-arcade-full.png"
          alt=""
          aria-hidden="true"
          className="sky-dragon-module-art"
        />
      </div>
    );
  }

  return (
    <div data-sky-modules-bar={purple ? "secondary" : "primary"} className="grid grid-cols-2 divide-x divide-white/10 overflow-hidden rounded-xl border border-cyan-400/50 bg-gradient-to-r from-[#07132b] via-[#050a19] to-[#100a25] shadow-[0_0_30px_rgba(0,100,255,.10)] md:grid-cols-6">
      {stats.map(([number, label, Icon, mode]) => {
        const iconClass = purple
          ? "text-violet-400"
          : number === "03" ? "text-fuchsia-400"
          : number === "04" ? "text-emerald-300"
          : number === "06" ? "text-fuchsia-400"
          : "text-cyan-300";
        const contents = (
          <>
            <Icon size={purple ? 25 : 28} data-sky-module-icon={number} className={iconClass} />
            <span className="min-w-0 text-left">
              <span className="block text-lg font-medium md:text-xl">{number}</span>
              <span data-sky-module-label className="block text-[10px] text-slate-500 md:text-xs">{label}</span>
            </span>
          </>
        );

        if (!mode) {
          return (
            <button
              key={label}
              type="button"
              disabled
              aria-label="Sentinel, módulo todavía no disponible"
              title="Sentinel todavía no tiene un espacio de trabajo"
              data-sky-module-mode="unavailable"
              className="flex min-w-0 cursor-not-allowed items-center gap-3 bg-transparent px-4 py-4 text-left opacity-45 md:px-5 md:py-5"
            >
              {contents}
            </button>
          );
        }

        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelectTool(mode)}
            aria-label={`Abrir ${label}`}
            data-sky-module-mode={mode}
            className="flex min-w-0 cursor-pointer items-center gap-3 bg-transparent px-4 py-4 text-left transition-colors hover:bg-white/[.07] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300 md:px-5 md:py-5"
          >
            {contents}
          </button>
        );
      })}
    </div>
  );
}

type ToolMode = 'forge' | 'store' | 'nexus' | 'websites' | 'islands';

interface DigitalBoostMainPageProps {
  onSelectTool: (mode: ToolMode) => void;
}

export default function DigitalBoostMainPage({
  onSelectTool,
}: DigitalBoostMainPageProps) {
  const [showLogin, setShowLogin] = React.useState(false);

  const go = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth" });
  };

    const openTool = (mode: ToolMode) => {
      onSelectTool(mode);
    };

  return (
    <main
      id="top"
      data-theme="sky-islands"
      className="db-sky-islands min-h-screen overflow-hidden selection:bg-sky-200"
    >

      {/* HEADER */}
      <header data-sky-header className="sticky top-0 z-50 border-b border-cyan-300/30 bg-[#03091b]/95 shadow-[0_8px_40px_rgba(0,180,255,.15)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[64px] max-w-[1320px] items-center justify-between px-4 sm:px-6">

          <button
            onClick={() => go("top")}
            aria-label=", volver al inicio"
            className="group flex items-center gap-2.5 text-left"
          >
            <img
              src="/sky-islands/originx-foundation-logo.jpg"
              alt=""
              className="h-10 w-[150px] object-contain sm:w-[180px]"
            />
            <span className="text-[11px] font-black tracking-[0.08em] sm:text-lg sm:tracking-[0.12em]">
              
            </span>
          </button>



          <div className="flex items-center gap-1.5 sm:gap-3">
            <button className="hidden p-2 text-slate-300 sm:block">
              <Moon size={17} />
            </button>

            <button
              onClick={() => setShowLogin(true)}
              className="rounded-lg border border-indigo-400/40 px-1.5 py-2.5 text-[10px] transition hover:border-cyan-400/60 hover:text-cyan-300 sm:px-4 sm:text-sm"
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => openTool("forge")}
              data-sky-cta
              className={`rounded-xl px-2.5 py-2.5 text-xs sm:px-5 sm:text-sm font-bold transition duration-200 hover:-translate-y-0.5 ${primaryCta}`}
            >
              Comenzar ahora
            </button>
          </div>
        </div>
      </header>


      {/* HERO */}
      <section data-sky-hero className="relative isolate border-b border-cyan-300/35 bg-[radial-gradient(ellipse_at_75%_45%,rgba(0,114,255,0.20),transparent_52%),linear-gradient(135deg,#020611_0%,#06112a_52%,#0b0620_100%)]">

        <div
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(38,150,255,.20) 1px,transparent 1px),linear-gradient(90deg,rgba(38,150,255,.20) 1px,transparent 1px)",
            backgroundSize: "58px 58px",
            maskImage:
              "linear-gradient(to bottom,black,transparent 90%)",
          }}
        />

        <div aria-hidden="true" className="sky-islands-clouds pointer-events-none absolute right-[3%] top-[52%] h-[340px] w-[340px] -translate-y-1/2 rounded-full" />

        <img
          src="/sky-islands/hero-floating-islands.jpg"
          alt=""
          aria-hidden="true"
          className="sky-island-horizon pointer-events-none absolute bottom-0 right-0 z-[1] h-auto w-[min(55vw,520px)]"
        />

        <div className="relative z-10 mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-6 px-4 py-10 sm:px-6 md:grid-cols-[.92fr_1.08fr] md:gap-4 md:py-12 lg:min-h-[500px]">

          {/* TEXTO HERO */}
          <div className="relative z-20">

            <div data-sky-eyebrow className="mb-4 inline-flex rounded-full border border-cyan-400/50 bg-cyan-400/5 px-4 py-1.5 text-[10px] font-semibold tracking-wider text-cyan-300">
              TODO EN UNO. POTENCIADO POR IA
            </div>

            <h1 className="text-5xl font-semibold leading-[.98] tracking-tight sm:text-6xl md:text-[64px]">
              Crea. Impulsa.
              <br />

              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
                Escala. Innova.
              </span>
            </h1>

            <p className="mt-5 max-w-[570px] text-[15px] leading-6 text-slate-300">
              DigitalBoost es la plataforma todo en uno para desarrolladores,
              emprendedores y creadores.
            </p>

            <p className="mt-2 max-w-[570px] text-[14px] leading-6 text-slate-200">
              Desarrolla web con IA, tiendas virtuales, landing pages, NFTs y
              herramientas profesionales para llevar tus ideas al siguiente nivel.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => openTool("forge")}
                data-sky-cta
                className={`rounded-xl px-7 py-3 font-bold transition hover:-translate-y-0.5 ${primaryCta}`}
              >
                Comenzar gratis
                <ArrowRight
                  className="ml-2 inline"
                  size={16}
                />
              </button>

            </div>

            <div data-sky-benefits className="mt-4 flex flex-wrap gap-3 text-xs sm:gap-5">
              <span>
                <Check
                  size={15}
                  className="mr-1 inline text-cyan-300"
                />
                No se requiere tarjeta
              </span>

              <span>
                <Check
                  size={15}
                  className="mr-1 inline text-cyan-300"
                />
                IA integrada
              </span>

              <span>
                <Check
                  size={15}
                  className="mr-1 inline text-cyan-300"
                />
                Sin límites creativos
              </span>
            </div>
          </div>


          {/* LOGO HERO - ÚNICA APARICIÓN */}
          <div data-sky-dragon className="relative z-10 flex min-h-[300px] items-center justify-center md:min-h-[430px] md:justify-end">

            <img
              src="/sky-islands/hero-dragon-medallion.jpg"
              alt="Dragón azul pixelado de DigitalBoost dentro de un medallón celeste"
              fetchPriority="high"
              className="sky-hero-dragon-art relative z-20 block w-full object-cover"
            />

          </div>

        </div>
      </section>


      {/* STATS */}
      <section className="mx-auto max-w-[1320px] px-4 py-4 sm:px-5">
        <StatRow onSelectTool={onSelectTool} />
      </section>


      {/* TOOLS */}
      <section
        data-sky-tools
        id="tools"
        className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6"
      >
        <h2 className="mb-5 text-center text-sm font-medium tracking-wide text-slate-200">
          TODO LO QUE NECESITAS EN{" "}
          <span className="text-cyan-300">
            UN SOLO LUGAR
          </span>
        </h2>

        <div data-sky-tools-grid className="grid gap-3 md:grid-cols-5">
          {tools.map(({ tone, mode, image, title, desc: description, accent, ring }) => (
            <article
              data-sky-tool={tone}
              key={title}
              role="button"
              tabIndex={0}
              aria-label={`Abrir ${title}`}
              onClick={() => openTool(mode)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openTool(mode);
                }
              }}
              className={`group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 min-h-[174px] overflow-hidden rounded-xl border border-cyan-400/40 bg-gradient-to-br from-[#0b2042] via-[#050d20] to-[#160b32] p-4 shadow-[0_0_28px_rgba(0,170,255,.10)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(34,211,238,.12)] motion-reduce:transition-none ${ring}`}
            >
              <img src={image} alt="" aria-hidden="true" loading="lazy" className="mb-4 h-14 w-14 rounded-xl object-cover shadow-sm" />

              <h3 className="font-semibold">
                {title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                {description}
              </p>

              <span
                className={`mt-3 inline-flex min-h-10 items-center text-xs ${accent}`}
              >
                Explorar
                <ArrowRight
                  size={13}
                  className="inline"
                />
              </span>
            </article>
          ))}
        </div>
      </section>


      {/* BRAIN BOOST */}
      <BrainBoostLandingSection />

      {/* INTEGRACIONES */}
      <section data-sky-integrations className="mx-auto max-w-[1320px] px-5 py-3">
        <div className="rounded-xl border border-cyan-400/30 bg-gradient-to-br from-[#07172c] to-[#100b2a] px-6 py-5 shadow-[0_0_28px_rgba(0,170,255,.08)]">

          <div className="mb-4 text-center text-xs font-semibold tracking-[.18em] text-cyan-300">
            INTEGRACIONES CON LO MEJOR
          </div>

          <div data-sky-integrations-grid className="grid grid-cols-2 items-center gap-5 text-center text-lg font-semibold text-slate-300 md:grid-cols-7">

            <button
              onClick={() => openTool("forge")}
              className="text-cyan-400 transition hover:scale-105 hover:text-cyan-300"
              title="Abrir herramientas de IA"
            >
              ◉ OpenAI
            </button>

            <button
              onClick={() => alert("💳 Stripe será conectado al sistema de pagos de DigitalBoost.")}
              className="transition hover:scale-105 hover:text-white"
              title="Stripe"
            >
              stripe
            </button>

            <button
              onClick={() => alert("💙 PayPal será conectado al checkout de DigitalBoost.")}
              className="text-blue-400 transition hover:scale-105 hover:text-blue-300"
              title="PayPal"
            >
              PayPal
            </button>

            <button
              onClick={() => openTool("islands")}
              className="transition hover:scale-105 hover:text-white"
              title="Herramientas para desarrolladores"
            >
              ◐ MongoDB
            </button>

            <button
              onClick={() => openTool("forge")}
              className="transition hover:scale-105 hover:text-white"
              title="Desarrollo Web"
            >
              ▲ Vercel
            </button>

            <button
              onClick={() => openTool("forge")}
              className="transition hover:scale-105 hover:text-white"
              title="Cloudflare"
            >
              ☁ Cloudflare
            </button>

            <button
              onClick={() => openTool("websites")}
              className="transition hover:scale-105 hover:text-white"
              title="NFTs e IPFS"
            >
              ◇ IPFS
            </button>

          </div>

        </div>
      </section>


      {/* SECOND STATS */}
      <section data-sky-secondary-modules className="mx-auto max-w-[1320px] px-5 py-4">
        <StatRow purple onSelectTool={onSelectTool} />
      </section>



      {/* PRICING */}
      <section
        data-sky-pricing
        id="pricing"
        className="mx-auto max-w-[1320px] px-5 py-10"
      >
        <div data-sky-pricing-panel className="rounded-xl border border-violet-400/30 bg-gradient-to-br from-[#07132a] to-[#100a28] p-7 shadow-[0_0_30px_rgba(100,60,255,.08)]">
          <h2 className="text-center text-2xl font-semibold">
            Planes simples y transparentes
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-400">
            Empieza gratis y escala DigitalBoost cuando tu proyecto lo necesite.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div data-sky-plan="starter" className="rounded-xl border border-indigo-300/25 bg-[#071022] p-5 shadow-[0_0_18px_rgba(60,90,255,.06)]">
              <h3 className="font-bold">Starter</h3>
              <p className="mt-2 text-2xl font-bold">$0</p>
              <p className="mt-2 text-xs text-slate-400">
                Para comenzar a crear.
              </p>
              <button
                data-sky-plan-cta
                onClick={() => openTool("forge")}
                className="mt-5 w-full rounded-lg border border-indigo-400/40 px-4 py-2 text-sm"
              >
                Comenzar
              </button>
            </div>

            <div data-sky-plan="pro" className="rounded-lg border border-cyan-400/40 bg-cyan-400/5 p-5">
              <div className="mb-2 text-[10px] font-bold tracking-wider text-cyan-300">
                MÁS POPULAR
              </div>
              <h3 className="font-bold">Pro</h3>
              <p className="mt-2 text-2xl font-bold">$29</p>
              <p className="mt-2 text-xs text-slate-400">
                Más potencia para tus proyectos.
              </p>
              <button
                data-sky-plan-cta
                onClick={() => openTool("islands")}
                className="mt-5 w-full rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-bold"
              >
                Probar Pro
              </button>
            </div>

            <div data-sky-plan="business" className="rounded-xl border border-indigo-300/25 bg-[#071022] p-5 shadow-[0_0_18px_rgba(60,90,255,.06)]">
              <h3 className="font-bold">Business</h3>
              <p className="mt-2 text-2xl font-bold">$79</p>
              <p className="mt-2 text-xs text-slate-400">
                Para equipos y negocios en crecimiento.
              </p>
              <button
                data-sky-plan-cta
                onClick={() => openTool("store")}
                className="mt-5 w-full rounded-lg border border-indigo-400/40 px-4 py-2 text-sm"
              >
                Crear tienda
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA PRINCIPAL */}
      <section
        data-sky-final-cta
        id="cta"
        className="mx-auto max-w-[1320px] px-5 py-4"
      >
        <div data-sky-final-cta-panel className="relative overflow-hidden rounded-lg border border-indigo-400/25 bg-[#030914] px-7 py-8 md:flex md:items-center md:justify-between">

          <div className="relative z-10 max-w-[600px]">
            <h2 className="text-2xl font-semibold">
              ¿Listo para llevar tus ideas
              <br />
              al siguiente nivel?
            </h2>

            <p className="mt-3 text-sm text-slate-400">
              Únete a miles de creadores, desarrolladores y emprendedores
              que ya están construyendo el futuro con DigitalBoost.
            </p>
          </div>

          <div className="relative z-10 mt-6 text-center md:mt-0">
            <button
              onClick={() => openTool("forge")}
              data-sky-cta
              className={`rounded-xl px-8 py-3 font-bold ${primaryCta}`}
            >
              Comenzar ahora gratis
              <ArrowRight
                className="ml-2 inline"
                size={16}
              />
            </button>

            <div className="mt-2 text-xs text-slate-500">
              No se requiere tarjeta de crédito
            </div>
          </div>

          {/* DRAGÓN CTA - UNA SOLA APARICIÓN */}
          <div className="relative z-10 mt-6 flex h-[100px] w-[130px] shrink-0 items-center justify-center md:mt-0">
            <img
              src="/digitalboost-dragon-logo.png"
              alt="DigitalBoost"
              className="max-h-[76px] max-w-[120px] object-contain drop-shadow-[0_6px_14px_rgba(20,80,150,.18)]"
            />
          </div>

        </div>
      </section>


      {/* FOOTER */}
      <footer
        data-sky-footer
        id="footer"
        className="mt-4 border-t border-white/[.07] bg-[#020711]"
      >

        <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-9 md:grid-cols-5">

          <div>
            <div className="text-lg font-black">
              DIGITAL
              <span className="text-violet-500">
                BOOST
              </span>
            </div>
          </div>

          {[
            [
              "Producto",
              "Herramientas",
              "Precios",
              "Novedades",
              "Roadmap",
            ],
            [
              "Recursos",
              "Docs",
              "Blog",
              "Tutoriales",
              "Comunidad",
            ],
            [
              "Empresa",
              "Sobre nosotros",
              "Contacto",
              "Trabaja con nosotros",
              "Afiliados",
            ],
            [
              "Legal",
              "Términos",
              "Privacidad",
              "Cookies",
              "Licencias",
            ],
          ].map((column) => (
            <div key={column[0]}>
              <h4 className="mb-3 text-sm">
                {column[0]}
              </h4>

              {column.slice(1).map((item) => (
                <div
                  key={item}
                  className="mb-2 cursor-pointer text-xs text-slate-500 transition hover:text-cyan-300"
                  onClick={() => {
                    if (item === "Herramientas") {
                      go("tools");
                    } else if (item === "Precios") {
                      go("pricing");
                    } else if (
                      item === "Docs" ||
                      item === "Blog" ||
                      item === "Tutoriales"
                    ) {
                      go("resources");
                    } else if (item === "Comunidad") {
                      go("footer");
                    } else {
                      alert(`DigitalBoost: ${item} estará disponible próximamente.`);
                    }
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          ))}

        </div>

        <div data-sky-footer-meta className="mx-auto flex max-w-[1320px] items-center justify-between border-t border-white/[.06] px-5 py-5 text-xs text-slate-500">

          <div>
            © 2025 DigitalBoost.
            <br />
            Todos los derechos reservados.
          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => alert("GitHub de DigitalBoost próximamente.")}
              className="transition hover:text-cyan-300"
              title="GitHub"
            >
              GH
            </button>

            <button
              onClick={() => alert("X / Twitter de DigitalBoost próximamente.")}
              className="transition hover:text-cyan-300"
              title="X"
            >
              X
            </button>

            <button
              onClick={() => alert("Comunidad DigitalBoost próximamente.")}
              className="transition hover:text-cyan-300"
              title="Comunidad"
            >
              <MessageCircle size={15} />
            </button>

            <button
              onClick={() => alert("Instagram de DigitalBoost próximamente.")}
              className="transition hover:text-cyan-300"
              title="Instagram"
            >
              IG
            </button>

            <button
              onClick={() => alert("YouTube de DigitalBoost próximamente.")}
              className="transition hover:text-cyan-300"
              title="YouTube"
            >
              YT
            </button>

          </div>

        </div>
      </footer>

      {showLogin && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-indigo-400/30 bg-[#050b16] p-7 shadow-[0_0_80px_rgba(80,60,255,.3)]"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="absolute right-4 top-3 text-2xl text-slate-500 hover:text-white"
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="mb-7">
              <div className="text-xl font-black">
                DIGITAL<span className="text-violet-500">BOOST</span>
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Bienvenido de nuevo
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Iniciá sesión para continuar con tus proyectos.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                alert("🔐 Login preparado. La autenticación real será conectada próximamente.");
              }}
              className="space-y-4"
            >

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Email
                </label>

                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className="w-full rounded-lg border border-white/10 bg-[#02050d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Contraseña
                </label>

                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-[#02050d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60"
                />
              </div>

              <button
                type="submit"
                className={`w-full rounded-lg px-5 py-3 text-sm font-bold ${primaryCta}`}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                onClick={() => alert("👤 Registro de usuarios próximamente.")}
                className="w-full rounded-lg border border-indigo-400/30 px-5 py-3 text-sm font-semibold hover:border-cyan-400/50 hover:text-cyan-300"
              >
                Crear una cuenta
              </button>

            </form>

            <p className="mt-6 text-center text-[11px] text-slate-600">
              Al continuar aceptás los términos y condiciones de DigitalBoost.
            </p>

          </div>
        </div>
      )}

    </main>
  );
}
