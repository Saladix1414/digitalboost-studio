import React from "react";
import {
  ArrowRight,
  ChevronDown,
  Moon,
  Check,
  Code2,
  ShoppingCart,
  LayoutTemplate,
  Hexagon,
  Terminal,
  Sparkles,
  Users,
  FolderKanban,
  Gauge,
  MessageCircle,
} from "lucide-react";

const neon =
  "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400";

const stats = [
  ["15K+", "Usuarios activos", Users],
  ["2.5K+", "Proyectos creados", FolderKanban],
  ["850+", "Tiendas online", ShoppingCart],
  ["1.2K+", "NFTs generados", Hexagon],
  ["99.9%", "Uptime garantizado", Gauge],
] as const;

const tools = [
  [
    Code2,
    "Desarrollo Web con IA",
    "Crea sitios web completos con inteligencia artificial.",
  ],
  [
    ShoppingCart,
    "Tiendas Virtuales",
    "Crea tu tienda online profesional al estilo Shopify.",
  ],
  [
    LayoutTemplate,
    "Landing Pages",
    "Diseña landing pages que convierten con la IA.",
  ],
  [
    Hexagon,
    "NFTs & Marketplace",
    "Crea, vende y gestiona tus NFTs con facilidad.",
  ],
  [
    Terminal,
    "Herramientas Pro",
    "Herramientas avanzadas para desarrolladores.",
  ],
];

function StatRow({
  purple = false,
}: {
  purple?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-white/[.08] rounded-lg border border-indigo-400/20 bg-[#030914]/80 md:grid-cols-5">
      {stats.map(([number, label, Icon]) => (
        <div
          key={label}
          className="flex items-center gap-3 px-4 py-4 md:px-5 md:py-5"
        >
          <Icon
            size={purple ? 25 : 28}
            className={purple ? "text-violet-500" : "text-cyan-400"}
          />

          <div>
            <div className="text-lg font-medium md:text-xl">
              {number}
            </div>

            <div className="text-[10px] text-slate-500 md:text-xs">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type ToolMode = 'web' | 'store' | 'landing' | 'nft' | 'pro';

interface DigitalBoostMainPageProps {
  onSelectTool: (mode: ToolMode) => void;
}

export default function DigitalBoostMainPage({
  onSelectTool,
}: DigitalBoostMainPageProps) {
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
      className="min-h-screen overflow-hidden bg-[#02050d] text-white selection:bg-fuchsia-500/30"
    >

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#02050d]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5">

          <button
            onClick={() => go("top")}
            className="text-xl font-black tracking-tight"
          >
            DIGITAL
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              BOOST
            </span>
          </button>

          <nav className="hidden items-center gap-7 text-sm lg:flex">
            <button
              onClick={() => go("top")}
              className="text-cyan-300"
            >
              Inicio
            </button>

            <button
              onClick={() => go("tools")}
              className="flex items-center gap-1"
            >
              Herramientas
              <ChevronDown size={14} />
            </button>

            <button onClick={() => go("pricing")}>
              Precios
            </button>

            <button
              onClick={() => go("resources")}
              className="flex items-center gap-1"
            >
              Recursos
              <ChevronDown size={14} />
            </button>

            <button onClick={() => go("resources")}>
              Docs
            </button>

            <button
              onClick={() => go("footer")}
              className="flex items-center gap-1"
            >
              Empresa
              <ChevronDown size={14} />
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden p-2 text-slate-300 sm:block">
              <Moon size={17} />
            </button>

            <button className="hidden rounded-lg border border-indigo-400/40 px-4 py-2.5 text-sm sm:block">
              Iniciar sesión
            </button>

            <button
              onClick={() => openTool("web")}
              className={`rounded-lg px-5 py-2.5 text-sm font-bold shadow-[0_0_25px_rgba(90,70,255,.35)] ${neon}`}
            >
              Comenzar ahora
            </button>
          </div>
        </div>
      </header>


      {/* HERO */}
      <section className="relative border-b border-white/[.05]">

        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(38,113,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(38,113,255,.12) 1px,transparent 1px)",
            backgroundSize: "58px 58px",
            maskImage:
              "linear-gradient(to bottom,black,transparent 90%)",
          }}
        />

        <div className="pointer-events-none absolute right-[5%] top-[45%] h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-5 px-5 py-12 md:grid-cols-[1.02fr_.98fr] md:py-14 lg:min-h-[465px]">

          {/* TEXTO HERO */}
          <div className="relative z-20">

            <div className="mb-4 inline-flex rounded-full border border-cyan-400/50 bg-cyan-400/5 px-4 py-1.5 text-[10px] font-semibold tracking-wider text-cyan-300">
              TODO EN UNO. POTENCIADO POR IA
            </div>

            <h1 className="text-5xl font-semibold leading-[.98] tracking-tight md:text-[56px]">
              Crea. Impulsa.
              <br />

              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 bg-clip-text text-transparent">
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
                onClick={() => openTool("web")}
                className={`rounded-lg px-7 py-3 font-bold shadow-[0_0_28px_rgba(100,40,255,.3)] ${neon}`}
              >
                Comenzar gratis
                <ArrowRight
                  className="ml-2 inline"
                  size={16}
                />
              </button>

              <button
                onClick={() => go("tools")}
                className="rounded-lg border border-indigo-400/50 px-7 py-3 font-semibold"
              >
                Explorar herramientas
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-300">
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
          <div className="relative z-10 flex min-h-[330px] items-center justify-center md:justify-end">

            <div className="pointer-events-none absolute right-[2%] h-[360px] w-[360px] rounded-full border border-cyan-400/20 shadow-[0_0_80px_rgba(0,150,255,.15),inset_0_0_80px_rgba(80,50,255,.10)]" />

            <div className="pointer-events-none absolute right-[5%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-3xl" />

            <img
              src="/logo.png"
              alt="DigitalBoost"
              className="relative z-20 block w-[290px] max-w-[90%] object-contain drop-shadow-[0_0_35px_rgba(0,160,255,.45)] sm:w-[350px] md:w-[390px] lg:w-[440px] xl:w-[500px]"
            />

          </div>

        </div>
      </section>


      {/* STATS */}
      <section className="mx-auto max-w-[1200px] px-5 py-4">
        <StatRow />
      </section>


      {/* TOOLS */}
      <section
        id="tools"
        className="mx-auto max-w-[1200px] px-5 py-7"
      >
        <h2 className="mb-5 text-center text-sm font-medium tracking-wide text-slate-200">
          TODO LO QUE NECESITAS EN{" "}
          <span className="text-cyan-300">
            UN SOLO LUGAR
          </span>
        </h2>

        <div className="grid gap-3 md:grid-cols-5">
          {tools.map(([Icon, title, description]) => (
            <article
              key={title}
              className="min-h-[174px] rounded-lg border border-indigo-400/20 bg-[#030914] p-4 transition hover:border-cyan-400/50"
            >
              <Icon
                size={34}
                className="mb-5 text-cyan-400"
              />

              <h3 className="font-semibold">
                {title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                {description}
              </p>

              <button
                onClick={() => {
                  if (title === "Desarrollo Web con IA") openTool("web");
                  else if (title === "Tiendas Virtuales") openTool("store");
                  else if (title === "Landing Pages") openTool("landing");
                  else if (title === "NFTs & Marketplace") openTool("nft");
                  else if (title === "Herramientas Pro") openTool("pro");
                }}
                className="mt-3 text-xs text-cyan-300 hover:text-cyan-200"
              >
                Explorar
                <ArrowRight
                  size={13}
                  className="inline"
                />
              </button>
            </article>
          ))}
        </div>
      </section>


      {/* IA */}
      <section
        id="resources"
        className="mx-auto grid max-w-[1200px] gap-8 px-5 py-8 md:grid-cols-[280px_1fr]"
      >

        <div>
          <h2 className="text-xl font-medium">
            IA QUE IMPULSA TU
            <br />
            <span className="text-2xl font-bold text-violet-500">
              CREATIVIDAD
            </span>
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Nuestra IA entiende tus ideas y las convierte en soluciones reales.
            Desde código hasta diseño, contenido y automatización.
          </p>

          {[
            "Generación de código y sitios web",
            "Diseño UI/UX inteligente",
            "Contenido y copys que convierten",
          ].map((item) => (
            <div
              key={item}
              className="mt-5 text-sm text-slate-300"
            >
              <Sparkles
                size={16}
                className="mr-3 inline text-violet-400"
              />
              {item}
            </div>
          ))}

          <button className="mt-7 rounded-lg border border-indigo-400/40 px-6 py-2.5 text-sm">
            Conocer más sobre IA
          </button>
        </div>


        <div className="overflow-hidden rounded-lg border border-indigo-400/25 bg-[#06101d] shadow-[0_0_45px_rgba(0,80,255,.12)]">

          <div className="flex h-8 items-center gap-2 border-b border-white/10 px-3 text-[9px] text-slate-400">
            <span className="text-cyan-300">
              AI WEB BUILDER
            </span>

            <span className="ml-auto">
              ＋　□　◉
            </span>
          </div>

          <div className="grid min-h-[280px] md:grid-cols-2">

            <pre className="overflow-hidden border-r border-white/10 p-5 text-[10px] leading-5 text-slate-400">
{`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport"
    content="width=device-width,
    initial-scale=1.0" />
</head>
<body>
  <header class="hero">
    <h1>Impulsa tu negocio
      al siguiente nivel</h1>
    <p>Herramientas digitales para crear,
      escalar e innovar sin límites.</p>
  </header>
</body>
</html>`}
            </pre>

            <div className="relative p-6">
              <div className="text-[9px] text-slate-500">
                PREVIEW
              </div>

              <div className="mt-8 text-2xl font-semibold leading-tight">
                Impulsa tu negocio
                <br />
                al siguiente nivel
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Herramientas digitales para crear,
                escalar e innovar sin límites.
              </p>

              <button
                className={`mt-5 rounded-md px-5 py-2 text-xs font-bold ${neon}`}
              >
                Comenzar ahora
              </button>

              <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
            </div>

          </div>
        </div>
      </section>


      {/* INTEGRACIONES */}
      <section className="mx-auto max-w-[1200px] px-5 py-3">
        <div className="rounded-lg border border-indigo-400/20 bg-[#030914] px-6 py-5">

          <div className="mb-4 text-center text-xs font-semibold tracking-[.18em] text-cyan-300">
            INTEGRACIONES CON LO MEJOR
          </div>

          <div className="grid grid-cols-2 items-center gap-5 text-center text-lg font-semibold text-slate-300 md:grid-cols-7">

            <button
              onClick={() => openTool("web")}
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
              onClick={() => openTool("pro")}
              className="transition hover:scale-105 hover:text-white"
              title="Herramientas para desarrolladores"
            >
              ◐ MongoDB
            </button>

            <button
              onClick={() => openTool("web")}
              className="transition hover:scale-105 hover:text-white"
              title="Desarrollo Web"
            >
              ▲ Vercel
            </button>

            <button
              onClick={() => openTool("web")}
              className="transition hover:scale-105 hover:text-white"
              title="Cloudflare"
            >
              ☁ Cloudflare
            </button>

            <button
              onClick={() => openTool("nft")}
              className="transition hover:scale-105 hover:text-white"
              title="NFTs e IPFS"
            >
              ◇ IPFS
            </button>

          </div>

        </div>
      </section>


      {/* SECOND STATS */}
      <section className="mx-auto max-w-[1200px] px-5 py-4">
        <StatRow purple />
      </section>



      {/* PRICING */}
      <section
        id="pricing"
        className="mx-auto max-w-[1200px] px-5 py-10"
      >
        <div className="rounded-lg border border-indigo-400/20 bg-[#030914] p-7">
          <h2 className="text-center text-2xl font-semibold">
            Planes simples y transparentes
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-400">
            Empieza gratis y escala DigitalBoost cuando tu proyecto lo necesite.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-[#050b16] p-5">
              <h3 className="font-bold">Starter</h3>
              <p className="mt-2 text-2xl font-bold">$0</p>
              <p className="mt-2 text-xs text-slate-400">
                Para comenzar a crear.
              </p>
              <button
                onClick={() => openTool("web")}
                className="mt-5 w-full rounded-lg border border-indigo-400/40 px-4 py-2 text-sm"
              >
                Comenzar
              </button>
            </div>

            <div className="rounded-lg border border-cyan-400/40 bg-cyan-400/5 p-5">
              <div className="mb-2 text-[10px] font-bold tracking-wider text-cyan-300">
                MÁS POPULAR
              </div>
              <h3 className="font-bold">Pro</h3>
              <p className="mt-2 text-2xl font-bold">$29</p>
              <p className="mt-2 text-xs text-slate-400">
                Más potencia para tus proyectos.
              </p>
              <button
                onClick={() => openTool("pro")}
                className="mt-5 w-full rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-bold"
              >
                Probar Pro
              </button>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#050b16] p-5">
              <h3 className="font-bold">Business</h3>
              <p className="mt-2 text-2xl font-bold">$79</p>
              <p className="mt-2 text-xs text-slate-400">
                Para equipos y negocios en crecimiento.
              </p>
              <button
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
        id="cta"
        className="mx-auto max-w-[1200px] px-5 py-4"
      >
        <div className="relative overflow-hidden rounded-lg border border-indigo-400/25 bg-[#030914] px-7 py-8 md:flex md:items-center md:justify-between">

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
              onClick={() => openTool("web")}
              className={`rounded-lg px-8 py-3 font-bold shadow-[0_0_30px_rgba(100,40,255,.3)] ${neon}`}
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
              src="/cta-dragon.png"
              alt="DigitalBoost"
              className="max-h-[110px] max-w-[125px] object-contain mix-blend-screen drop-shadow-[0_0_25px_rgba(40,100,255,.35)]"
            />
          </div>

        </div>
      </section>


      {/* FOOTER */}
      <footer
        id="footer"
        className="mt-4 border-t border-white/[.07] bg-[#020711]"
      >

        <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-9 md:grid-cols-5">

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
                  className="mb-2 text-xs text-slate-500"
                >
                  {item}
                </div>
              ))}
            </div>
          ))}

        </div>

        <div className="mx-auto flex max-w-[1200px] items-center justify-between border-t border-white/[.06] px-5 py-5 text-xs text-slate-500">

          <div>
            © 2025 DigitalBoost.
            <br />
            Todos los derechos reservados.
          </div>

          <div className="flex gap-3">
            <span>GH</span>
            <span>X</span>
            <MessageCircle size={15} />
            <span>IG</span>
            <span>YT</span>
          </div>

        </div>
      </footer>

    </main>
  );
}
