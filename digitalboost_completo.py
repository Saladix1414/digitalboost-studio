
#!/usr/bin/env python3
# DIGITALBOOST COMPLETO
# Guardar como digitalboost_completo.py y correr: python3 digitalboost_completo.py
from __future__ import annotations
import re, shutil, subprocess, sys
from datetime import datetime
from pathlib import Path

FILES = {}
FILES['src/CommerceOSOverview.tsx'] = r'''import { useMemo } from "react";
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
            <h1 className="mt-3 text-4xl font-semibold leading-[0.95] tracking-tight sm:text-5xl">
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
                Store live · aura.digitalboost.shop
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
'''

FILES['src/DigitalBoostStoreCanvas.ts'] = r'''export type BlockType = "hero" | "features" | "products" | "text" | "cta" | "media";

export type CanvasBlock = {
  id: string;
  type: BlockType;
  title: string;
  body: string;
  cta: string;
};

export const BLOCK_META: Record<BlockType, { label: string; hint: string }> = {
  hero: { label: "Hero", hint: "Titular + CTA de portada" },
  features: { label: "Section", hint: "Tres pilares de confianza" },
  products: { label: "Productos", hint: "Grilla de destacados" },
  text: { label: "Text", hint: "Historia de marca" },
  cta: { label: "CTA", hint: "Banda de conversión" },
  media: { label: "Media", hint: "Campo visual" },
};

export function newId() {
  return "b-" + Math.random().toString(36).slice(2, 9);
}

export function defaultBlock(type: BlockType): CanvasBlock {
  const map: Record<BlockType, Omit<CanvasBlock, "id" | "type">> = {
    hero: {
      title: "Creá algo extraordinario.",
      body: "Diseñá una tienda con la identidad de tu marca y una experiencia pensada para vender.",
      cta: "Comprar ahora",
    },
    features: {
      title: "Por qué Aura",
      body: "Envíos simples · Checkout seguro · Soporte humano",
      cta: "",
    },
    products: {
      title: "Destacados",
      body: "Campera Aura · Tote Cyan · Hoodie Violet",
      cta: "Ver todo",
    },
    text: {
      title: "Una tienda también puede contar quién sos.",
      body: "Usa contenido, imágenes y mensajes para convertir identidad en experiencia.",
      cta: "",
    },
    cta: {
      title: "Listo para publicar.",
      body: "Lanzá la colección de temporada en un clic.",
      cta: "Publicar tienda",
    },
    media: {
      title: "Drop Studio 09",
      body: "Lookbook en movimiento",
      cta: "",
    },
  };
  return { id: newId(), type, ...map[type] };
}

export function seedHome(): CanvasBlock[] {
  return [defaultBlock("hero"), defaultBlock("features"), defaultBlock("products"), defaultBlock("text")];
}

const KEY = "db-store-canvas-v1";

export function loadCanvas(): CanvasBlock[] {
  if (typeof localStorage === "undefined") return seedHome();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedHome();
    const parsed = JSON.parse(raw) as CanvasBlock[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedHome();
    return parsed;
  } catch {
    return seedHome();
  }
}

export function saveCanvas(blocks: CanvasBlock[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(blocks));
  } catch {
    /* ignore */
  }
}
'''

FILES['src/DigitalBoostStoreStudio.tsx'] = r'''import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  Monitor,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import {
  BLOCK_META,
  defaultBlock,
  loadCanvas,
  saveCanvas,
  seedHome,
  type BlockType,
  type CanvasBlock,
} from "./DigitalBoostStoreCanvas";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function CanvasView({
  blocks,
  selected,
  onSelect,
}: {
  blocks: CanvasBlock[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="bg-[#F4F1EA] text-[#101820]">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-[11px] font-semibold tracking-[0.18em]">AURA</span>
        <span className="text-[10px] text-black/40">Inicio · Productos · Contacto</span>
      </div>
      {blocks.map((b) => {
        const active = selected === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelect(b.id)}
            className={cx("block w-full text-left", active && "ring-2 ring-cyan-400 ring-inset")}
          >
            {b.type === "hero" && (
              <div className="bg-gradient-to-b from-violet-200 via-[#F4F1EA] to-cyan-100 px-6 py-10">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600">Nueva colección</div>
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">{b.title}</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-black/70">{b.body}</p>
                {b.cta ? <span className="mt-6 inline-flex rounded-full bg-[#101820] px-4 py-2 text-xs font-medium text-[#F4F1EA]">{b.cta}</span> : null}
              </div>
            )}
            {b.type === "features" && (
              <div className="grid grid-cols-3 gap-px bg-black/10 text-center text-[10px]">
                {b.body.split("·").map((t) => (
                  <div key={t} className="bg-[#F4F1EA] px-2 py-4 font-medium">{t.trim()}</div>
                ))}
              </div>
            )}
            {b.type === "products" && (
              <div className="px-6 py-8">
                <div className="mb-4 flex items-end justify-between">
                  <div className="text-lg font-semibold">{b.title}</div>
                  <div className="text-[11px] text-black/40">{b.cta || "Ver todo"}</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["from-cyan-300", "from-violet-300", "from-pink-300"].map((g, i) => (
                    <div key={i}>
                      <div className={`aspect-[3/4] rounded-lg bg-gradient-to-b ${g} to-slate-200`} />
                      <div className="mt-2 text-[11px]">{b.body.split("·")[i]?.trim() || "Producto"}</div>
                      <div className="text-[11px] font-semibold tabular-nums">$ 49.900</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {b.type === "text" && (
              <div className="px-6 py-10">
                <h3 className="text-2xl font-semibold tracking-tight">{b.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-black/70">{b.body}</p>
              </div>
            )}
            {b.type === "cta" && (
              <div className="mx-5 my-6 rounded-2xl bg-[#101820] px-5 py-8 text-[#F4F1EA]">
                <div className="text-xl font-semibold">{b.title}</div>
                <p className="mt-2 text-sm text-white/70">{b.body}</p>
                {b.cta ? <span className="mt-4 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-[#070d18]">{b.cta}</span> : null}
              </div>
            )}
            {b.type === "media" && (
              <div className="relative mx-5 my-6 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 px-5 py-16 text-white">
                <div className="text-[10px] uppercase tracking-[0.2em]">{b.body}</div>
                <div className="mt-2 text-2xl font-semibold">{b.title}</div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function DigitalBoostStoreStudio({ onBack }: { onBack?: () => void }) {
  const catalog: BlockType[] = ["hero", "features", "products", "text", "cta", "media"];
  const pages = ["Inicio", "Productos", "Colecciones", "Nosotros", "Contacto"];
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("mobile");
  const [page, setPage] = useState("Inicio");
  const [blocks, setBlocks] = useState<CanvasBlock[]>(() => seedHome());
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBlocks(loadCanvas());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveCanvas(blocks);
  }, [blocks, ready]);

  const current = useMemo(() => blocks.find((b) => b.id === selected) ?? null, [blocks, selected]);

  function add(type: BlockType) {
    const next = defaultBlock(type);
    setBlocks((list) => {
      if (!selected) return [...list, next];
      const i = list.findIndex((b) => b.id === selected);
      const copy = [...list];
      copy.splice(i + 1, 0, next);
      return copy;
    });
    setSelected(next.id);
  }

  function patch(partial: Partial<CanvasBlock>) {
    if (!selected) return;
    setBlocks((list) => list.map((b) => (b.id === selected ? { ...b, ...partial } : b)));
  }

  function move(dir: -1 | 1) {
    if (!selected) return;
    setBlocks((list) => {
      const i = list.findIndex((b) => b.id === selected);
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      const [item] = copy.splice(i, 1);
      copy.splice(j, 0, item);
      return copy;
    });
  }

  function remove() {
    if (!selected) return;
    setBlocks((list) => list.filter((b) => b.id !== selected));
    setSelected(null);
  }

  function publish() {
    saveCanvas(blocks);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#070d18] text-[#F7FAFF]">
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-slate-400" aria-label="Volver">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-xs font-semibold tracking-[0.14em] text-cyan-300">STORE BUILDER</div>
            <div className="text-[10px] text-slate-500">Visual Studio · {page}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {([
            ["desktop", Monitor],
            ["tablet", Tablet],
            ["mobile", Smartphone],
          ] as const).map(([id, Icon]) => (
            <button key={id} type="button" onClick={() => setDevice(id)} className={cx("grid h-10 w-10 place-items-center rounded-md", device === id ? "bg-[#101B32] text-cyan-300" : "text-slate-500")} aria-label={id}>
              <Icon size={15} />
            </button>
          ))}
          <button type="button" onClick={() => setPreview((v) => !v)} className="ml-2 hidden h-10 items-center gap-1 rounded-md border border-white/10 px-3 text-xs text-slate-400 sm:inline-flex">
            <Eye size={13} /> {preview ? "Editar" : "Preview"}
          </button>
          <button type="button" onClick={publish} className="ml-1 h-10 rounded-md bg-emerald-400 px-3 text-xs font-semibold text-[#070d18]">
            {saved ? "Guardado" : "Publicar"}
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[220px_minmax(0,1fr)_250px]">
        <aside className="hidden overflow-y-auto border-r border-white/10 p-3 lg:block">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Bloques</div>
          <div className="space-y-1.5">
            {catalog.map((type) => (
              <button key={type} type="button" onClick={() => add(type)} className="flex w-full items-center justify-between rounded-md border border-white/10 bg-[#101B32] px-3 py-2.5 text-left hover:border-cyan-400/30">
                <span>
                  <span className="block text-xs">{BLOCK_META[type].label}</span>
                  <span className="block text-[10px] text-slate-500">{BLOCK_META[type].hint}</span>
                </span>
                <Plus size={13} className="text-slate-500" />
              </button>
            ))}
          </div>
          <div className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Páginas</div>
          {pages.map((p) => (
            <button key={p} type="button" onClick={() => setPage(p)} className={cx("mb-1 w-full rounded-md px-3 py-2 text-left text-xs", page === p ? "bg-violet-500/20 text-violet-300" : "text-slate-400")}>
              {p}
            </button>
          ))}
        </aside>

        <div className="flex min-h-0 flex-col overflow-auto bg-[#0A1020] p-3 sm:p-6">
          <div className="mb-3 flex gap-2 overflow-x-auto lg:hidden">
            {catalog.map((type) => (
              <button key={type} type="button" onClick={() => add(type)} className="shrink-0 rounded-full border border-white/10 bg-[#101B32] px-3 py-2 text-xs">
                + {BLOCK_META[type].label}
              </button>
            ))}
          </div>
          <div className={cx("mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl", device === "mobile" && "w-full max-w-sm", device === "tablet" && "w-full max-w-xl", device === "desktop" && "w-full max-w-3xl")}>
            <CanvasView blocks={blocks} selected={preview ? null : selected} onSelect={(id) => { if (!preview) setSelected(id); }} />
          </div>
        </div>

        <aside className="hidden overflow-y-auto border-l border-white/10 p-3 lg:block">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Inspector</div>
          {!current ? (
            <p className="mt-4 text-xs leading-5 text-slate-400">Seleccioná un bloque en el canvas o agregá uno desde la izquierda.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-white/10 bg-[#101B32] p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-cyan-300">{BLOCK_META[current.type].label}</div>
                <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-slate-500">Título</label>
                <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm outline-none" value={current.title} onChange={(e) => patch({ title: e.target.value })} />
                <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-slate-500">Texto</label>
                <textarea className="mt-1 min-h-20 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 py-2 text-sm outline-none" value={current.body} onChange={(e) => patch({ body: e.target.value })} />
                <label className="mt-3 block text-[10px] uppercase tracking-[0.14em] text-slate-500">CTA</label>
                <input className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#0A1020] px-2 text-sm outline-none" value={current.cta} onChange={(e) => patch({ cta: e.target.value })} />
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(-1)} className="grid h-11 w-11 place-items-center rounded-md border border-white/10" aria-label="Subir"><ChevronUp size={16} /></button>
                <button type="button" onClick={() => move(1)} className="grid h-11 w-11 place-items-center rounded-md border border-white/10" aria-label="Bajar"><ChevronDown size={16} /></button>
                <button type="button" onClick={remove} className="ml-auto grid h-11 w-11 place-items-center rounded-md border border-pink-500/40 text-pink-400" aria-label="Eliminar"><Trash2 size={16} /></button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
'''

FILES['src/commerce-os-core.css'] = r'''/* DIGITALBOOST Commerce OS — núcleo visual */

[data-commerce-os="true"] {
  color-scheme: dark;
  --db-bg: #0a1020;
  --db-deep: #070d18;
  --db-surface: #101b32;
  --db-cyan: #22d3ee;
  --db-violet: #8b5cf6;
  --db-magenta: #ec4899;
  background:
    radial-gradient(900px 420px at 0% -10%, rgba(34, 211, 238, 0.16), transparent 55%),
    radial-gradient(720px 480px at 100% 0%, rgba(139, 92, 246, 0.18), transparent 50%),
    radial-gradient(640px 360px at 70% 110%, rgba(236, 72, 153, 0.08), transparent 45%),
    var(--db-bg) !important;
  color: #f7faff;
}

.db-grid-field {
  background-image:
    linear-gradient(rgba(103, 232, 249, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(103, 232, 249, 0.06) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
}
'''


def find_root() -> Path:
    for p in [Path.cwd(), Path.home() / "digitalboost-studio", Path("/home/ubuntu/digitalboost-studio")]:
        if (p / "src" / "StoreBuilderWorkspace.tsx").is_file() and (p / "package.json").is_file():
            return p.resolve()
    sys.exit("No encuentro digitalboost-studio. Entra a esa carpeta y corre python3 digitalboost_completo.py")

def say(m):
    print(m, flush=True)

def bak(root: Path, bdir: Path, rel: str):
    src = root / rel
    if src.is_file():
        dest = bdir / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)

def patch_workspace(text: str) -> str:
    if "DigitalBoostStoreStudio from" not in text:
        needle = 'import CommerceOSOverview from "./CommerceOSOverview";'
        if needle in text:
            text = text.replace(needle, needle + "\nimport DigitalBoostStoreStudio from \"./DigitalBoostStoreStudio\";", 1)
    text = text.replace("bg-[#02050A]", "bg-[#0A1020]").replace("bg-[#02050a]", "bg-[#0A1020]")
    text = re.sub(
        r'case "website-builder":\s*return \(\s*<StoreBuilderDirectFinal[\s\S]*?/>\s*\);',
        'case "website-builder":\n        return (\n          <DigitalBoostStoreStudio\n            onBack={() => setSection("dashboard")}\n          />\n        );',
        text,
        count=1,
    )
    return text

def patch_index(text: str) -> str:
    text = re.sub(r'<style id="digitalboost-white-root">[\s\S]*?</style>', "", text, count=1)
    text = re.sub(r'<style id="digitalboost-store-builder-final-root">[\s\S]*?</style>', "", text, count=1)
    return text.replace(
        'class="bg-[#F5F7FB] text-[#172033] m-0 p-0 min-h-screen"',
        'class="bg-[#0A1020] text-[#F7FAFF] m-0 p-0 min-h-screen"',
    )

def restore(root: Path, bdir: Path):
    for p in bdir.rglob("*"):
        if p.is_file():
            shutil.copy2(p, root / p.relative_to(bdir))

def main() -> int:
    root = find_root()
    bdir = root / "_backup" / ("completo-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
    say("===== DIGITALBOOST COMPLETO =====")
    say("root " + str(root))
    bdir.mkdir(parents=True, exist_ok=True)
    try:
        for rel, content in FILES.items():
            bak(root, bdir, rel)
            dest = root / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(content, encoding="utf-8")
            say("  write  " + rel)
        for rel in ["src/StoreBuilderWorkspace.tsx", "index.html"]:
            bak(root, bdir, rel)
        ws = root / "src" / "StoreBuilderWorkspace.tsx"
        ws.write_text(patch_workspace(ws.read_text(encoding="utf-8")), encoding="utf-8")
        say("  patch  src/StoreBuilderWorkspace.tsx")
        idx = root / "index.html"
        if idx.is_file():
            idx.write_text(patch_index(idx.read_text(encoding="utf-8")), encoding="utf-8")
            say("  patch  index.html")
        if "data-commerce-os" not in (root / "src/CommerceOSOverview.tsx").read_text(encoding="utf-8"):
            raise RuntimeError("overview incompleto")
        if "Inspector" not in (root / "src/DigitalBoostStoreStudio.tsx").read_text(encoding="utf-8"):
            raise RuntimeError("studio incompleto")
        if (root / "node_modules").is_dir():
            say("npm run build")
            if subprocess.run(["npm", "run", "build"], cwd=root).returncode != 0:
                raise RuntimeError("build fallo")
        else:
            say("  skip build (no node_modules)")
    except Exception as e:
        say("ERROR " + str(e))
        restore(root, bdir)
        return 1
    say("===== LISTO =====")
    say("backup: " + str(bdir))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
