#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path.home() / "digitalboost-studio"
SRC = ROOT / "src"

SHELL = SRC / "StoreBuilderStudioShell.tsx"
CSS = SRC / "store-builder-studio-v2.css"

print("=" * 72)
print("DIGITALBOOST — STORE BUILDER STUDIO V2")
print("COMMERCE OS CORE → STORE BUILDER → PROFESSIONAL VISUAL STUDIO")
print("=" * 72)

if not ROOT.exists():
    print("❌ No existe el proyecto:", ROOT)
    sys.exit(1)

SRC.mkdir(parents=True, exist_ok=True)

# ------------------------------------------------------------
# BACKUPS
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

if SHELL.exists():
    backup_shell = SHELL.with_name(
        f"StoreBuilderStudioShell.before_v2_{timestamp}.tsx"
    )
    shutil.copy2(SHELL, backup_shell)
    print(f"✓ Backup Shell: {backup_shell.name}")

if CSS.exists():
    backup_css = CSS.with_name(
        f"store-builder-studio-v2.before_{timestamp}.css"
    )
    shutil.copy2(CSS, backup_css)
    print(f"✓ Backup CSS: {backup_css.name}")

# ------------------------------------------------------------
# STUDIO COMPONENT
# ------------------------------------------------------------

component = r'''import React, { useState } from "react";
import {
  ArrowLeft,
  Bot,
  ChevronDown,
  ChevronRight,
  Code2,
  Eye,
  FileText,
  Globe2,
  Layers3,
  LayoutDashboard,
  Monitor,
  MousePointer2,
  Palette,
  PanelRight,
  Play,
  Plus,
  Rocket,
  Save,
  Settings2,
  Smartphone,
  Sparkles,
  Tablet,
  Type,
  Wand2,
  Zap,
} from "lucide-react";

type Props = {
  children?: React.ReactNode;
  onBack?: () => void;
};

type Device = "desktop" | "tablet" | "mobile";

const blocks = [
  { id: "hero", label: "Hero", icon: Sparkles },
  { id: "section", label: "Section", icon: LayoutDashboard },
  { id: "text", label: "Text", icon: Type },
  { id: "products", label: "Products", icon: Globe2 },
  { id: "features", label: "Features", icon: Zap },
  { id: "media", label: "Media", icon: Eye },
  { id: "cta", label: "Call to action", icon: Rocket },
];

const pages = [
  "Inicio",
  "Productos",
  "Colecciones",
  "Nosotros",
  "Contacto",
];

export default function StoreBuilderStudioShell({
  children,
  onBack,
}: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const [activePage, setActivePage] = useState("Inicio");
  const [selected, setSelected] = useState("hero");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [saved, setSaved] = useState(true);
  const [preview, setPreview] = useState(false);

  const canvasWidth =
    device === "desktop"
      ? "studio-canvas-desktop"
      : device === "tablet"
      ? "studio-canvas-tablet"
      : "studio-canvas-mobile";

  if (preview) {
    return (
      <div className="studio-v2 studio-preview">
        <div className="studio-preview-top">
          <div>
            <span className="studio-eyebrow">DIGITALBOOST</span>
            <span className="studio-preview-title">
              Store Builder Preview
            </span>
          </div>

          <button
            className="studio-button studio-button-primary"
            onClick={() => setPreview(false)}
          >
            <ArrowLeft size={15} />
            Volver al Studio
          </button>
        </div>

        <div className="studio-preview-canvas">
          <div className="preview-site">
            <div className="preview-site-glow" />

            <div className="preview-nav">
              <strong>YOUR BRAND</strong>
              <div>
                <span>Inicio</span>
                <span>Productos</span>
                <span>Nosotros</span>
                <span>Contacto</span>
              </div>
            </div>

            <section className="preview-hero">
              <div className="preview-pill">
                <Sparkles size={13} />
                EXPERIENCIA DIGITAL
              </div>

              <h1>
                Una tienda que
                <br />
                <span>se siente propia.</span>
              </h1>

              <p>
                Diseñá una experiencia memorable, rápida y preparada
                para convertir visitantes en clientes.
              </p>

              <button className="preview-cta">
                Explorar colección
                <ChevronRight size={15} />
              </button>
            </section>

            <section className="preview-products">
              {[1, 2, 3].map((item) => (
                <div className="preview-product" key={item}>
                  <div className="preview-product-image" />
                  <span>Producto destacado</span>
                  <strong>$ 49.900</strong>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-v2">

      {/* TOP SYSTEM BAR */}
      <header className="studio-topbar">

        <div className="studio-brand-zone">

          <button
            className="studio-icon-button"
            onClick={onBack}
            title="Volver a Commerce OS"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="studio-brand-mark">
            <div className="studio-brand-orb">
              <Sparkles size={15} />
            </div>

            <div>
              <div className="studio-brand-name">
                STORE BUILDER
              </div>

              <div className="studio-brand-path">
                COMMERCE OS / VISUAL STUDIO
              </div>
            </div>
          </div>

          <div className="studio-live-badge">
            <span />
            LIVE
          </div>

        </div>

        <div className="studio-device-controls">

          <button
            className={device === "desktop" ? "active" : ""}
            onClick={() => setDevice("desktop")}
          >
            <Monitor size={14} />
          </button>

          <button
            className={device === "tablet" ? "active" : ""}
            onClick={() => setDevice("tablet")}
          >
            <Tablet size={14} />
          </button>

          <button
            className={device === "mobile" ? "active" : ""}
            onClick={() => setDevice("mobile")}
          >
            <Smartphone size={14} />
          </button>

        </div>

        <div className="studio-actions">

          <button
            className="studio-button"
            onClick={() => setPreview(true)}
          >
            <Eye size={14} />
            Preview
          </button>

          <button
            className="studio-button studio-button-save"
            onClick={() => setSaved(true)}
          >
            <Save size={14} />
            Guardar
          </button>

          <button className="studio-publish">
            <Rocket size={14} />
            Publicar
          </button>

        </div>

      </header>

      {/* MAIN STUDIO */}
      <div className="studio-layout">

        {/* LEFT RAIL */}
        <aside
          className={
            leftOpen
              ? "studio-left-panel"
              : "studio-left-panel collapsed"
          }
        >

          <div className="studio-panel-header">
            <div>
              <span className="studio-panel-kicker">
                BUILD
              </span>
              <strong>Crear</strong>
            </div>

            <button
              onClick={() => setLeftOpen(false)}
              className="studio-panel-collapse"
            >
              <ChevronLeftIcon />
            </button>
          </div>

          <div className="studio-tool-section">

            <div className="studio-section-title">
              <span>ELEMENTOS</span>
              <Plus size={13} />
            </div>

            <div className="studio-block-grid">

              {blocks.map((block) => {
                const Icon = block.icon;

                return (
                  <button
                    key={block.id}
                    className={
                      selected === block.id
                        ? "studio-block active"
                        : "studio-block"
                    }
                    onClick={() => setSelected(block.id)}
                  >
                    <Icon size={17} />
                    <span>{block.label}</span>
                  </button>
                );
              })}

            </div>

          </div>

          <div className="studio-tool-section">

            <div className="studio-section-title">
              <span>PÁGINAS</span>
            </div>

            <div className="studio-pages">

              {pages.map((page) => (
                <button
                  key={page}
                  className={
                    activePage === page
                      ? "studio-page active"
                      : "studio-page"
                  }
                  onClick={() => setActivePage(page)}
                >
                  <FileText size={13} />
                  <span>{page}</span>

                  {activePage === page && (
                    <span className="studio-page-dot" />
                  )}
                </button>
              ))}

            </div>

          </div>

          <div className="studio-left-footer">

            <button>
              <Bot size={15} />
              <span>AI Store Operator</span>
              <Sparkles size={11} />
            </button>

            <button>
              <Code2 size={15} />
              <span>Code</span>
            </button>

          </div>

        </aside>

        {!leftOpen && (
          <button
            className="studio-expand-left"
            onClick={() => setLeftOpen(true)}
          >
            <ChevronRight size={15} />
          </button>
        )}

        {/* CANVAS */}
        <main className="studio-canvas-area">

          <div className="studio-canvas-toolbar">

            <div className="studio-breadcrumb">
              <span>Store Builder</span>
              <ChevronRight size={12} />
              <strong>{activePage}</strong>
            </div>

            <div className="studio-canvas-tools">

              <span
                className={
                  saved
                    ? "studio-save-status saved"
                    : "studio-save-status"
                }
              >
                <span />
                {saved ? "Todos los cambios guardados" : "Cambios pendientes"}
              </span>

              <button title="Seleccionar">
                <MousePointer2 size={14} />
              </button>

              <button title="Capas">
                <Layers3 size={14} />
              </button>

            </div>

          </div>

          <div className="studio-canvas">

            <div className="studio-canvas-grid" />

            <div className={`studio-website ${canvasWidth}`}>

              <div className="studio-site-header">

                <div className="studio-site-logo">
                  YOUR BRAND
                </div>

                <div className="studio-site-nav">
                  <span>Inicio</span>
                  <span>Productos</span>
                  <span>Nosotros</span>
                  <span>Contacto</span>
                </div>

                <button className="studio-site-cart">
                  Bag · 0
                </button>

              </div>

              <section
                className={
                  selected === "hero"
                    ? "studio-site-hero selected"
                    : "studio-site-hero"
                }
                onClick={() => setSelected("hero")}
              >

                <div className="studio-selection-label">
                  <MousePointer2 size={11} />
                  Hero section
                </div>

                <div className="studio-hero-content">

                  <div className="studio-hero-chip">
                    <Sparkles size={12} />
                    NUEVA EXPERIENCIA
                  </div>

                  <h1>
                    Diseñá algo que
                    <br />
                    <span>la gente recuerde.</span>
                  </h1>

                  <p>
                    Tu sitio, tu identidad y tu comercio,
                    conectados desde Commerce OS.
                  </p>

                  <div className="studio-hero-actions">
                    <button>
                      Explorar colección
                      <ChevronRight size={14} />
                    </button>

                    <button className="secondary">
                      Ver productos
                    </button>
                  </div>

                </div>

                <div className="studio-hero-art">

                  <div className="studio-orbit orbit-one" />
                  <div className="studio-orbit orbit-two" />

                  <div className="studio-art-card">
                    <div />
                    <span>NEW DROP</span>
                  </div>

                </div>

              </section>

              <section className="studio-site-feature-strip">

                {[
                  ["01", "Identidad", "Una experiencia que representa tu marca."],
                  ["02", "Conversión", "Diseñada para convertir atención en acción."],
                  ["03", "Commerce OS", "Todo conectado con tu operación."],
                ].map(([number, title, text]) => (
                  <div key={number}>
                    <span>{number}</span>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                ))}

              </section>

              <section className="studio-site-product-section">

                <div className="studio-section-heading">
                  <div>
                    <span>COLECCIÓN</span>
                    <h2>Lo nuevo.</h2>
                  </div>

                  <button>Ver todo →</button>
                </div>

                <div className="studio-products">

                  {[1, 2, 3].map((item) => (
                    <article key={item}>
                      <div className="studio-product-image">
                        <div />
                      </div>

                      <div className="studio-product-meta">
                        <span>Digital Collection</span>
                        <strong>Producto {item}</strong>
                        <b>$ 49.900</b>
                      </div>
                    </article>
                  ))}

                </div>

              </section>

              {children}

            </div>

          </div>

          <footer className="studio-bottom-bar">

            <div>
              <span className="studio-bottom-live">
                ●
              </span>
              Canvas conectado
            </div>

            <div>
              <span>Zoom</span>
              <button>−</button>
              <strong>100%</strong>
              <button>+</button>
            </div>

            <div>
              <Wand2 size={13} />
              AI Design Assist
            </div>

          </footer>

        </main>

        {/* RIGHT INSPECTOR */}
        <aside
          className={
            rightOpen
              ? "studio-right-panel"
              : "studio-right-panel collapsed"
          }
        >

          <div className="studio-panel-header">

            <div>
              <span className="studio-panel-kicker">
                INSPECTOR
              </span>
              <strong>{selected}</strong>
            </div>

            <button
              onClick={() => setRightOpen(false)}
              className="studio-panel-collapse"
            >
              <ChevronRightIcon />
            </button>

          </div>

          <div className="studio-inspector-tabs">
            <button className="active">
              <Settings2 size={13} />
              Propiedades
            </button>
            <button>
              <Palette size={13} />
              Diseño
            </button>
          </div>

          <div className="studio-inspector-content">

            <InspectorGroup
              title="Contenido"
              icon={<Type size={13} />}
            >
              <label>
                Título
                <input defaultValue="Diseñá algo que la gente recuerde." />
              </label>

              <label>
                Descripción
                <textarea defaultValue="Tu sitio, tu identidad y tu comercio, conectados desde Commerce OS." />
              </label>

              <label>
                Texto del botón
                <input defaultValue="Explorar colección" />
              </label>
            </InspectorGroup>

            <InspectorGroup
              title="Apariencia"
              icon={<Palette size={13} />}
            >
              <div className="studio-color-row">
                <span>Primario</span>
                <div className="studio-color violet" />
                <code>#8B5CF6</code>
              </div>

              <div className="studio-color-row">
                <span>Accent</span>
                <div className="studio-color cyan" />
                <code>#22D3EE</code>
              </div>

              <div className="studio-color-row">
                <span>Highlight</span>
                <div className="studio-color magenta" />
                <code>#EC4899</code>
              </div>
            </InspectorGroup>

            <InspectorGroup
              title="Layout"
              icon={<PanelRight size={13} />}
            >
              <label>
                Alineación
                <select defaultValue="left">
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                </select>
              </label>

              <label>
                Espaciado
                <input type="range" defaultValue="72" />
              </label>
            </InspectorGroup>

          </div>

          <div className="studio-inspector-ai">
            <div className="studio-ai-icon">
              <Sparkles size={14} />
            </div>

            <div>
              <strong>AI Design Assist</strong>
              <p>
                Pedile a Commerce OS que transforme esta sección.
              </p>
            </div>

            <button>
              <Wand2 size={13} />
            </button>
          </div>

        </aside>

        {!rightOpen && (
          <button
            className="studio-expand-right"
            onClick={() => setRightOpen(true)}
          >
            <ChevronLeft size={15} />
          </button>
        )}

      </div>

    </div>
  );
}

function InspectorGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="studio-inspector-group">
      <div className="studio-inspector-group-title">
        {icon}
        <span>{title}</span>
      </div>

      <div className="studio-inspector-fields">
        {children}
      </div>
    </section>
  );
}

function ChevronLeftIcon() {
  return <ChevronDown size={14} className="-rotate-90" />;
}

function ChevronRightIcon() {
  return <ChevronDown size={14} className="-rotate-90 rotate-90" />;
}
'''

SHELL.write_text(component, encoding="utf-8")
print("✓ StoreBuilderStudioShell.tsx reemplazado por Studio V2")

# ------------------------------------------------------------
# CSS
# ------------------------------------------------------------

css = r'''
.studio-v2 {
  --violet: #8b5cf6;
  --violet-bright: #a78bfa;
  --cyan: #22d3ee;
  --cyan-bright: #67e8f9;
  --magenta: #ec4899;
  --green: #34d399;

  position: relative;
  width: 100%;
  min-height: 820px;
  overflow: hidden;

  color: #f8fafc;

  background:
    radial-gradient(
      circle at 15% 15%,
      rgba(139, 92, 246, .16),
      transparent 28%
    ),
    radial-gradient(
      circle at 85% 20%,
      rgba(34, 211, 238, .12),
      transparent 26%
    ),
    radial-gradient(
      circle at 55% 100%,
      rgba(236, 72, 153, .08),
      transparent 30%
    ),
    #03040b;

  border: 1px solid rgba(255,255,255,.08);
  border-radius: 28px;
  box-shadow:
    0 35px 100px rgba(0,0,0,.55),
    inset 0 1px rgba(255,255,255,.05);

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.studio-v2 *,
.studio-v2 *::before,
.studio-v2 *::after {
  box-sizing: border-box;
}

.studio-topbar {
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 16px;

  background: rgba(5,7,18,.88);
  backdrop-filter: blur(22px);

  border-bottom: 1px solid rgba(255,255,255,.07);

  position: relative;
  z-index: 10;
}

.studio-brand-zone,
.studio-actions,
.studio-device-controls,
.studio-brand-mark {
  display: flex;
  align-items: center;
}

.studio-brand-zone {
  gap: 11px;
  min-width: 280px;
}

.studio-brand-mark {
  gap: 9px;
}

.studio-brand-orb {
  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  border-radius: 9px;

  color: white;

  background:
    linear-gradient(
      135deg,
      var(--violet),
      var(--magenta) 55%,
      var(--cyan)
    );

  box-shadow:
    0 0 24px rgba(139,92,246,.35);
}

.studio-brand-name {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
}

.studio-brand-path {
  margin-top: 2px;
  color: #64748b;
  font-size: 7px;
  letter-spacing: .18em;
}

.studio-live-badge {
  display: flex;
  align-items: center;
  gap: 5px;

  padding: 5px 8px;

  border: 1px solid rgba(52,211,153,.2);
  border-radius: 999px;

  background: rgba(52,211,153,.06);

  color: #6ee7b7;

  font-size: 7px;
  font-weight: 800;
  letter-spacing: .12em;
}

.studio-live-badge span,
.studio-save-status span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 9px var(--green);
}

.studio-icon-button,
.studio-panel-collapse,
.studio-expand-left,
.studio-expand-right,
.studio-canvas-tools button {
  display: grid;
  place-items: center;

  color: #64748b;

  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 9px;

  cursor: pointer;

  transition:
    color .2s,
    border-color .2s,
    background .2s,
    transform .2s;
}

.studio-icon-button {
  width: 32px;
  height: 32px;
}

.studio-icon-button:hover,
.studio-panel-collapse:hover,
.studio-canvas-tools button:hover {
  color: white;
  border-color: rgba(139,92,246,.35);
  background: rgba(139,92,246,.09);
}

.studio-device-controls {
  gap: 2px;

  padding: 3px;

  border: 1px solid rgba(255,255,255,.07);
  border-radius: 10px;

  background: rgba(255,255,255,.025);
}

.studio-device-controls button {
  width: 31px;
  height: 28px;

  display: grid;
  place-items: center;

  border: 0;
  border-radius: 7px;

  background: transparent;
  color: #64748b;

  cursor: pointer;
}

.studio-device-controls button.active {
  color: white;

  background:
    linear-gradient(
      135deg,
      rgba(139,92,246,.28),
      rgba(34,211,238,.12)
    );

  box-shadow:
    inset 0 0 0 1px rgba(167,139,250,.18),
    0 0 18px rgba(139,92,246,.12);
}

.studio-actions {
  gap: 7px;
  min-width: 280px;
  justify-content: flex-end;
}

.studio-button,
.studio-publish {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  height: 32px;
  padding: 0 11px;

  border-radius: 9px;

  font-size: 8px;
  font-weight: 700;

  cursor: pointer;
}

.studio-button {
  color: #cbd5e1;
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.08);
}

.studio-button:hover {
  color: white;
  background: rgba(255,255,255,.065);
}

.studio-button-save {
  color: #a7f3d0;
  border-color: rgba(52,211,153,.18);
  background: rgba(52,211,153,.05);
}

.studio-publish {
  color: white;
  border: 0;

  background:
    linear-gradient(
      100deg,
      var(--violet),
      var(--magenta) 55%,
      var(--cyan)
    );

  box-shadow:
    0 7px 25px rgba(139,92,246,.25);
}

.studio-layout {
  min-height: 754px;
  display: grid;
  grid-template-columns: 218px minmax(0,1fr) 254px;
}

.studio-left-panel,
.studio-right-panel {
  background: rgba(5,7,18,.76);
  backdrop-filter: blur(24px);

  border-color: rgba(255,255,255,.065);

  transition:
    width .25s,
    opacity .25s;
}

.studio-left-panel {
  border-right: 1px solid rgba(255,255,255,.065);
}

.studio-right-panel {
  border-left: 1px solid rgba(255,255,255,.065);
}

.studio-left-panel.collapsed,
.studio-right-panel.collapsed {
  width: 0;
  opacity: 0;
  overflow: hidden;
}

.studio-panel-header {
  min-height: 66px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 12px 13px;

  border-bottom: 1px solid rgba(255,255,255,.055);
}

.studio-panel-header > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.studio-panel-kicker {
  color: #64748b;
  font-size: 6px;
  font-weight: 800;
  letter-spacing: .2em;
}

.studio-panel-header strong {
  font-size: 11px;
}

.studio-panel-collapse {
  width: 27px;
  height: 27px;
}

.studio-tool-section {
  padding: 14px 11px;
  border-bottom: 1px solid rgba(255,255,255,.045);
}

.studio-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 9px;

  color: #64748b;

  font-size: 6px;
  font-weight: 800;
  letter-spacing: .18em;
}

.studio-block-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 6px;
}

.studio-block {
  min-height: 58px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  gap: 7px;

  padding: 9px;

  color: #64748b;

  background: rgba(255,255,255,.022);
  border: 1px solid rgba(255,255,255,.055);
  border-radius: 10px;

  cursor: pointer;

  transition: all .2s;
}

.studio-block svg {
  color: #8b5cf6;
}

.studio-block span {
  font-size: 7px;
  font-weight: 600;
}

.studio-block:hover,
.studio-block.active {
  color: white;

  border-color: rgba(139,92,246,.32);

  background:
    linear-gradient(
      145deg,
      rgba(139,92,246,.13),
      rgba(34,211,238,.035)
    );

  box-shadow:
    inset 0 0 22px rgba(139,92,246,.05),
    0 0 18px rgba(139,92,246,.07);

  transform: translateY(-1px);
}

.studio-pages {
  display: grid;
  gap: 3px;
}

.studio-page {
  height: 33px;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 0 9px;

  border: 0;
  border-radius: 8px;

  background: transparent;

  color: #64748b;

  text-align: left;
  font-size: 8px;

  cursor: pointer;
}

.studio-page:hover {
  color: #cbd5e1;
  background: rgba(255,255,255,.035);
}

.studio-page.active {
  color: white;
  background:
    linear-gradient(
      90deg,
      rgba(139,92,246,.14),
      rgba(34,211,238,.035)
    );
}

.studio-page-dot {
  margin-left: auto;

  width: 4px;
  height: 4px;

  border-radius: 50%;

  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
}

.studio-left-footer {
  margin-top: auto;
  padding: 10px;

  display: grid;
  gap: 5px;
}

.studio-left-footer button {
  height: 34px;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 0 9px;

  color: #64748b;

  border: 1px solid transparent;
  border-radius: 8px;

  background: transparent;

  font-size: 7px;
  text-align: left;

  cursor: pointer;
}

.studio-left-footer button:hover {
  color: white;
  background: rgba(255,255,255,.035);
}

.studio-left-footer button svg:last-child {
  margin-left: auto;
  color: var(--violet-bright);
}

.studio-canvas-area {
  min-width: 0;
  display: flex;
  flex-direction: column;

  background:
    radial-gradient(
      circle at 50% 10%,
      rgba(139,92,246,.08),
      transparent 35%
    ),
    #070913;
}

.studio-canvas-toolbar {
  height: 47px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 13px;

  border-bottom: 1px solid rgba(255,255,255,.055);
  background: rgba(7,9,19,.7);
}

.studio-breadcrumb {
  display: flex;
  align-items: center;
  gap: 5px;

  color: #64748b;

  font-size: 8px;
}

.studio-breadcrumb strong {
  color: #cbd5e1;
}

.studio-canvas-tools {
  display: flex;
  align-items: center;
  gap: 6px;
}

.studio-canvas-tools button {
  width: 27px;
  height: 27px;
}

.studio-save-status {
  display: flex;
  align-items: center;
  gap: 5px;

  margin-right: 3px;

  color: #64748b;
  font-size: 6px;
}

.studio-save-status.saved {
  color: #6ee7b7;
}

.studio-canvas {
  position: relative;
  flex: 1;

  overflow: auto;

  padding: 34px;

  background:
    radial-gradient(
      circle at 50% 35%,
      rgba(139,92,246,.11),
      transparent 32%
    );
}

.studio-canvas-grid {
  position: absolute;
  inset: 0;

  opacity: .22;

  background-image:
    linear-gradient(
      rgba(255,255,255,.035) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.035) 1px,
      transparent 1px
    );

  background-size: 28px 28px;

  mask-image:
    radial-gradient(
      ellipse at center,
      black,
      transparent 82%
    );
}

.studio-website {
  position: relative;

  margin: 0 auto;

  min-height: 640px;

  overflow: hidden;

  border-radius: 16px;

  background: #f7f7fa;

  color: #16131d;

  box-shadow:
    0 30px 80px rgba(0,0,0,.55),
    0 0 0 1px rgba(255,255,255,.12);

  transition: width .3s;
}

.studio-canvas-desktop {
  width: min(100%, 900px);
}

.studio-canvas-tablet {
  width: min(100%, 650px);
}

.studio-canvas-mobile {
  width: min(100%, 390px);
}

.studio-site-header {
  height: 60px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 28px;

  background: rgba(255,255,255,.94);

  border-bottom: 1px solid rgba(0,0,0,.06);
}

.studio-site-logo {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .1em;
}

.studio-site-nav {
  display: flex;
  gap: 22px;

  color: #77727f;

  font-size: 7px;
}

.studio-site-cart {
  border: 0;
  background: transparent;

  font-size: 7px;
  font-weight: 700;
}

.studio-site-hero {
  position: relative;

  min-height: 365px;

  display: flex;
  align-items: center;

  padding: 50px;

  overflow: hidden;

  background:
    radial-gradient(
      circle at 80% 20%,
      rgba(139,92,246,.18),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 80%,
      rgba(34,211,238,.12),
      transparent 28%
    ),
    linear-gradient(
      135deg,
      #ffffff,
      #f1eff9
    );

  cursor: pointer;
}

.studio-site-hero.selected {
  box-shadow:
    inset 0 0 0 2px rgba(139,92,246,.7);
}

.studio-selection-label {
  position: absolute;

  top: 10px;
  left: 10px;

  display: flex;
  align-items: center;
  gap: 5px;

  padding: 5px 7px;

  border-radius: 6px;

  background: #8b5cf6;
  color: white;

  font-size: 6px;
  font-weight: 800;

  opacity: 0;
  transform: translateY(-4px);

  transition: all .2s;
}

.studio-site-hero.selected .studio-selection-label {
  opacity: 1;
  transform: translateY(0);
}

.studio-hero-content {
  position: relative;
  z-index: 2;

  max-width: 470px;
}

.studio-hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  padding: 6px 9px;

  border: 1px solid rgba(139,92,246,.16);
  border-radius: 999px;

  background: rgba(139,92,246,.06);

  color: #7c3aed;

  font-size: 6px;
  font-weight: 900;
  letter-spacing: .1em;
}

.studio-hero-content h1 {
  margin: 17px 0 10px;

  font-size: clamp(32px,4vw,57px);
  line-height: .98;
  letter-spacing: -.055em;
  font-weight: 850;
}

.studio-hero-content h1 span {
  background:
    linear-gradient(
      100deg,
      #7c3aed,
      #ec4899 48%,
      #0891b2
    );

  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.studio-hero-content p {
  max-width: 390px;

  color: #716b79;

  font-size: 9px;
  line-height: 1.7;
}

.studio-hero-actions {
  display: flex;
  gap: 7px;

  margin-top: 22px;
}

.studio-hero-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 10px 13px;

  border: 0;
  border-radius: 8px;

  color: white;

  background:
    linear-gradient(
      100deg,
      #7c3aed,
      #ec4899
    );

  font-size: 7px;
  font-weight: 800;

  cursor: pointer;

  box-shadow:
    0 8px 22px rgba(124,58,237,.2);
}

.studio-hero-actions button.secondary {
  color: #39333f;

  background: rgba(255,255,255,.65);
  border: 1px solid rgba(0,0,0,.08);

  box-shadow: none;
}

.studio-hero-art {
  position: absolute;

  right: -25px;
  top: 40px;

  width: 42%;
  height: 80%;
}

.studio-orbit {
  position: absolute;

  border: 1px solid rgba(139,92,246,.22);

  border-radius: 50%;

  transform: rotate(-18deg);
}

.orbit-one {
  width: 330px;
  height: 150px;

  top: 35px;
  right: -70px;
}

.orbit-two {
  width: 250px;
  height: 110px;

  top: 70px;
  right: -25px;

  border-color: rgba(34,211,238,.23);
}

.studio-art-card {
  position: absolute;

  top: 75px;
  right: 60px;

  width: 150px;
  height: 190px;

  padding: 12px;

  border-radius: 13px;

  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,.85),
      rgba(236,72,153,.12)
    );

  border: 1px solid rgba(255,255,255,.8);

  box-shadow:
    0 25px 50px rgba(88,28,135,.16),
    0 0 60px rgba(34,211,238,.12);

  transform: rotate(7deg);
}

.studio-art-card > div {
  height: 135px;
  border-radius: 8px;

  background:
    radial-gradient(
      circle at 40% 25%,
      #a78bfa,
      transparent 32%
    ),
    linear-gradient(
      135deg,
      #17112b,
      #7c3aed,
      #22d3ee
    );
}

.studio-art-card span {
  display: block;

  margin-top: 10px;

  color: #6b21a8;

  font-size: 6px;
  font-weight: 900;
  letter-spacing: .14em;
}

.studio-site-feature-strip {
  display: grid;
  grid-template-columns: repeat(3,1fr);

  border-top: 1px solid rgba(0,0,0,.06);
  border-bottom: 1px solid rgba(0,0,0,.06);

  background: #fff;
}

.studio-site-feature-strip > div {
  min-height: 100px;
  padding: 19px;

  border-right: 1px solid rgba(0,0,0,.05);
}

.studio-site-feature-strip span {
  color: #8b5cf6;

  font-size: 7px;
  font-weight: 900;
}

.studio-site-feature-strip strong {
  display: block;
  margin-top: 7px;

  font-size: 10px;
}

.studio-site-feature-strip p {
  margin-top: 4px;

  color: #85808c;

  font-size: 7px;
  line-height: 1.5;
}

.studio-site-product-section {
  padding: 34px;

  background: #fafafa;
}

.studio-section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.studio-section-heading span {
  color: #8b5cf6;

  font-size: 6px;
  font-weight: 900;
  letter-spacing: .16em;
}

.studio-section-heading h2 {
  margin: 5px 0 0;

  font-size: 22px;
  letter-spacing: -.04em;
}

.studio-section-heading button {
  border: 0;
  background: transparent;

  color: #7c3aed;

  font-size: 7px;
  font-weight: 800;
}

.studio-products {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 10px;

  margin-top: 20px;
}

.studio-product-image {
  height: 180px;

  display: grid;
  place-items: center;

  border-radius: 10px;

  background:
    radial-gradient(
      circle at 50% 30%,
      rgba(139,92,246,.3),
      transparent 25%
    ),
    linear-gradient(
      145deg,
      #e9e7ef,
      #f7f7fa
    );
}

.studio-product-image div {
  width: 70px;
  height: 90px;

  border-radius: 8px;

  background:
    linear-gradient(
      145deg,
      #18121f,
      #8b5cf6,
      #22d3ee
    );

  box-shadow:
    0 20px 30px rgba(0,0,0,.12);
}

.studio-product-meta {
  display: grid;
  gap: 4px;

  padding-top: 9px;
}

.studio-product-meta span {
  color: #918b97;
  font-size: 6px;
}

.studio-product-meta strong {
  font-size: 8px;
}

.studio-product-meta b {
  font-size: 8px;
}

.studio-bottom-bar {
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 12px;

  color: #64748b;

  border-top: 1px solid rgba(255,255,255,.055);

  background: rgba(4,6,15,.92);

  font-size: 6px;
}

.studio-bottom-bar > div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.studio-bottom-live {
  color: var(--cyan);
}

.studio-bottom-bar button {
  width: 20px;
  height: 20px;

  border: 1px solid rgba(255,255,255,.06);
  border-radius: 5px;

  color: #94a3b8;
  background: rgba(255,255,255,.03);
}

.studio-expand-left,
.studio-expand-right {
  position: absolute;

  top: 95px;

  width: 27px;
  height: 27px;

  z-index: 20;
}

.studio-expand-left {
  left: 7px;
}

.studio-expand-right {
  right: 7px;
}

.studio-inspector-tabs {
  display: grid;
  grid-template-columns: repeat(2,1fr);

  padding: 8px;

  border-bottom: 1px solid rgba(255,255,255,.055);
}

.studio-inspector-tabs button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  height: 29px;

  border: 0;
  border-radius: 7px;

  color: #64748b;
  background: transparent;

  font-size: 7px;
}

.studio-inspector-tabs button.active {
  color: white;
  background: rgba(139,92,246,.1);
}

.studio-inspector-content {
  padding: 10px;
}

.studio-inspector-group {
  padding: 12px 0;

  border-bottom: 1px solid rgba(255,255,255,.045);
}

.studio-inspector-group-title {
  display: flex;
  align-items: center;
  gap: 6px;

  color: #cbd5e1;

  font-size: 8px;
  font-weight: 800;
}

.studio-inspector-group-title svg {
  color: var(--violet-bright);
}

.studio-inspector-fields {
  display: grid;
  gap: 10px;

  margin-top: 11px;
}

.studio-inspector-fields label {
  display: grid;
  gap: 5px;

  color: #64748b;

  font-size: 6px;
  font-weight: 700;
}

.studio-inspector-fields input,
.studio-inspector-fields textarea,
.studio-inspector-fields select {
  width: 100%;

  padding: 8px 9px;

  border: 1px solid rgba(255,255,255,.07);
  border-radius: 7px;

  outline: none;

  color: #cbd5e1;
  background: rgba(255,255,255,.025);

  font-size: 7px;
}

.studio-inspector-fields textarea {
  min-height: 65px;
  resize: vertical;
}

.studio-inspector-fields input:focus,
.studio-inspector-fields textarea:focus,
.studio-inspector-fields select:focus {
  border-color: rgba(139,92,246,.45);
  box-shadow: 0 0 0 2px rgba(139,92,246,.08);
}

.studio-color-row {
  display: grid;
  grid-template-columns: 1fr 18px auto;
  align-items: center;
  gap: 7px;

  color: #64748b;
  font-size: 7px;
}

.studio-color {
  width: 18px;
  height: 18px;

  border-radius: 5px;
}

.studio-color.violet {
  background: #8b5cf6;
  box-shadow: 0 0 12px rgba(139,92,246,.35);
}

.studio-color.cyan {
  background: #22d3ee;
  box-shadow: 0 0 12px rgba(34,211,238,.35);
}

.studio-color.magenta {
  background: #ec4899;
  box-shadow: 0 0 12px rgba(236,72,153,.35);
}

.studio-color-row code {
  color: #475569;
  font-size: 6px;
}

.studio-inspector-ai {
  margin: 12px;

  display: grid;
  grid-template-columns: 30px 1fr 25px;
  align-items: center;
  gap: 8px;

  padding: 10px;

  border: 1px solid rgba(139,92,246,.16);
  border-radius: 10px;

  background:
    linear-gradient(
      135deg,
      rgba(139,92,246,.09),
      rgba(34,211,238,.035)
    );
}

.studio-ai-icon {
  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  border-radius: 8px;

  color: white;

  background:
    linear-gradient(
      135deg,
      var(--violet),
      var(--magenta)
    );

  box-shadow:
    0 0 18px rgba(139,92,246,.2);
}

.studio-inspector-ai strong {
  font-size: 7px;
}

.studio-inspector-ai p {
  margin-top: 3px;

  color: #64748b;

  font-size: 6px;
  line-height: 1.4;
}

.studio-inspector-ai button {
  width: 25px;
  height: 25px;

  display: grid;
  place-items: center;

  border: 0;
  border-radius: 7px;

  color: white;

  background: rgba(139,92,246,.2);
}

.studio-preview {
  min-height: 820px;
  padding: 18px;
}

.studio-preview-top {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 15px;
}

.studio-preview-title {
  margin-left: 9px;
  color: #94a3b8;
  font-size: 10px;
}

.studio-eyebrow {
  color: var(--cyan);
  font-size: 7px;
  font-weight: 900;
  letter-spacing: .2em;
}

.studio-preview-canvas {
  display: flex;
  justify-content: center;

  padding: 30px;

  border-radius: 18px;

  background:
    radial-gradient(
      circle at center,
      rgba(139,92,246,.11),
      transparent 55%
    ),
    #050711;
}

.preview-site {
  position: relative;

  width: min(100%, 1000px);

  min-height: 650px;

  overflow: hidden;

  border-radius: 16px;

  background: white;
  color: #16131d;
}

.preview-site-glow {
  position: absolute;
  width: 350px;
  height: 350px;

  right: -80px;
  top: 30px;

  border-radius: 50%;

  background: rgba(139,92,246,.18);

  filter: blur(60px);
}

.preview-nav {
  height: 62px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 35px;

  border-bottom: 1px solid rgba(0,0,0,.06);
}

.preview-nav strong {
  font-size: 10px;
}

.preview-nav div {
  display: flex;
  gap: 22px;

  color: #77727f;
  font-size: 8px;
}

.preview-hero {
  position: relative;
  z-index: 2;

  padding: 90px 65px;
}

.preview-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 7px 10px;

  border-radius: 999px;

  color: #7c3aed;

  background: rgba(139,92,246,.07);

  font-size: 7px;
  font-weight: 900;
}

.preview-hero h1 {
  margin: 18px 0;

  font-size: clamp(40px,5vw,72px);
  line-height: .95;
  letter-spacing: -.06em;
}

.preview-hero h1 span {
  color: #8b5cf6;
}

.preview-hero p {
  max-width: 430px;

  color: #77727f;

  font-size: 10px;
  line-height: 1.7;
}

.preview-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  margin-top: 25px;

  padding: 12px 15px;

  border: 0;
  border-radius: 9px;

  color: white;

  background:
    linear-gradient(
      100deg,
      #7c3aed,
      #ec4899
    );

  font-size: 8px;
  font-weight: 800;
}

.preview-products {
  display: grid;
  grid-template-columns: repeat(3,1fr);

  gap: 12px;

  padding: 30px 65px;
}

.preview-product-image {
  height: 150px;

  border-radius: 10px;

  background:
    linear-gradient(
      135deg,
      #eeeaf7,
      #d9f8fc
    );
}

.preview-product {
  display: grid;
  gap: 6px;

  font-size: 8px;
}

.preview-product span {
  color: #8a8490;
}

.preview-product strong {
  font-size: 9px;
}

@media (max-width: 1050px) {
  .studio-layout {
    grid-template-columns: 190px minmax(0,1fr) 220px;
  }

  .studio-actions {
    min-width: auto;
  }

  .studio-brand-zone {
    min-width: auto;
  }
}

@media (max-width: 850px) {
  .studio-topbar {
    padding: 0 9px;
  }

  .studio-brand-path,
  .studio-live-badge,
  .studio-actions .studio-button {
    display: none;
  }

  .studio-layout {
    grid-template-columns: 170px minmax(0,1fr);
  }

  .studio-right-panel {
    display: none;
  }

  .studio-canvas {
    padding: 18px;
  }

  .studio-site-nav {
    display: none;
  }
}

@media (max-width: 650px) {
  .studio-v2 {
    min-height: 760px;
    border-radius: 18px;
  }

  .studio-layout {
    grid-template-columns: 1fr;
  }

  .studio-left-panel {
    display: none;
  }

  .studio-device-controls {
    display: none;
  }

  .studio-brand-name {
    font-size: 9px;
  }

  .studio-canvas {
    padding: 10px;
  }

  .studio-site-header {
    padding: 0 15px;
  }

  .studio-site-hero {
    padding: 28px;
  }

  .studio-hero-art {
    opacity: .3;
  }

  .studio-site-feature-strip {
    grid-template-columns: 1fr;
  }

  .studio-site-feature-strip > div {
    border-right: 0;
    border-bottom: 1px solid rgba(0,0,0,.05);
  }

  .studio-products {
    grid-template-columns: 1fr;
  }

  .studio-preview {
    padding: 8px;
  }

  .studio-preview-canvas {
    padding: 8px;
  }

  .preview-hero {
    padding: 55px 28px;
  }

  .preview-products {
    grid-template-columns: 1fr;
    padding: 20px 28px;
  }
}
'''

CSS.write_text(css, encoding="utf-8")
print("✓ CSS Studio V2 creado")

# ------------------------------------------------------------
# IMPORT CSS IN COMPONENT
# ------------------------------------------------------------

source = SHELL.read_text(encoding="utf-8")

if "store-builder-studio-v2.css" not in source:
    marker = 'import React, { useState } from "react";'

    if marker in source:
        source = source.replace(
            marker,
            marker + '\nimport "./store-builder-studio-v2.css";',
            1
        )

        SHELL.write_text(source, encoding="utf-8")
        print("✓ CSS Studio V2 conectado")

    else:
        print("⚠️ No encontré el import React esperado.")
else:
    print("✓ CSS Studio V2 ya estaba conectado")

# ------------------------------------------------------------
# BUILD
# ------------------------------------------------------------

print()
print("=" * 72)
print("BUILD DE VERIFICACIÓN")
print("=" * 72)

try:
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        timeout=180,
    )

except subprocess.TimeoutExpired:
    print("❌ npm run build excedió 180 segundos.")
    sys.exit(1)

except FileNotFoundError:
    print("❌ npm no está disponible.")
    sys.exit(1)

print(result.stdout)

if result.returncode != 0:
    print(result.stderr)
    print("❌ BUILD FALLÓ")
    print("Los backups permanecen disponibles.")
    sys.exit(result.returncode)

print()
print("✅ BUILD CORRECTO")
print("=" * 72)
print("DIGITALBOOST — STORE BUILDER STUDIO V2 INSTALADO")
print("=" * 72)
print("✓ Commerce OS se mantiene como núcleo")
print("✓ Store Builder se mantiene como herramienta")
print("✓ Studio visual completamente renovado")
print("✓ Canvas profesional")
print("✓ Sidebar de componentes")
print("✓ Inspector")
print("✓ Páginas")
print("✓ Desktop / Tablet / Mobile")
print("✓ Preview")
print("✓ Live state")
print("✓ AI Design Assist")
print("✓ Identidad Electric Violet / Cyan / Magenta")
print("✓ Superficies glass / layered")
print("✓ Responsive")
print()
print("Ahora ejecutá:")
print("npm run dev")
print()
print("Y entrá a:")
print("Commerce OS → Store Builder → Website Builder")
print()
print("Backups conservados en src/")
print("=" * 72)
