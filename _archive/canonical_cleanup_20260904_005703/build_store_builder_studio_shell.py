from pathlib import Path
import shutil
import subprocess
from datetime import datetime

ROOT = Path.home() / "digitalboost-studio"
SRC = ROOT / "src"

WORKSPACE = SRC / "StoreBuilderWorkspace.tsx"
SHELL = SRC / "StoreBuilderStudioShell.tsx"
CSS = SRC / "store-builder-studio-shell.css"

print("=" * 70)
print("DIGITALBOOST — STORE BUILDER STUDIO SHELL")
print("COMMERCE OS CORE → STORE BUILDER VISUAL STUDIO")
print("=" * 70)

if not WORKSPACE.exists():
    print("❌ No existe StoreBuilderWorkspace.tsx")
    raise SystemExit(1)

# ------------------------------------------------------------
# BACKUP
# ------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = SRC / f"StoreBuilderWorkspace.before_studio_shell_{timestamp}.tsx"
shutil.copy2(WORKSPACE, backup)

print(f"✓ Backup creado: {backup.name}")

# ------------------------------------------------------------
# NUEVA CAPA VISUAL
# ------------------------------------------------------------

shell_code = r'''
import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  Globe2,
  Layers3,
  LayoutTemplate,
  Monitor,
  MousePointer2,
  Palette,
  PanelRight,
  Play,
  Redo2,
  Rocket,
  Settings2,
  Smartphone,
  Sparkles,
  Tablet,
  Undo2,
  WandSparkles,
  Zap,
} from "lucide-react";

import WebsiteBuilderV1 from "./WebsiteBuilderV1";
import "./store-builder-studio-shell.css";

type Props = {
  onBack?: () => void;
};

type Device = "desktop" | "tablet" | "mobile";

export default function StoreBuilderStudioShell({ onBack }: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [preview, setPreview] = useState(false);

  return (
    <div className="db-store-studio">

      {/* ======================================================
          AMBIENT SYSTEM
          ====================================================== */}

      <div className="db-studio-ambient db-studio-ambient-violet" />
      <div className="db-studio-ambient db-studio-ambient-cyan" />
      <div className="db-studio-ambient db-studio-ambient-pink" />

      {/* ======================================================
          APPLICATION HEADER
          ====================================================== */}

      <header className="db-studio-topbar">

        <div className="db-studio-brand">

          <button
            type="button"
            className="db-studio-back"
            onClick={onBack}
            title="Volver a Commerce OS"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="db-studio-brand-mark">
            <Sparkles size={17} />
          </div>

          <div className="db-studio-brand-copy">
            <div className="db-studio-eyebrow">
              DIGITALBOOST COMMERCE OS
            </div>

            <div className="db-studio-title-row">
              <span>Store Builder</span>
              <span className="db-studio-badge">
                STUDIO
              </span>
            </div>
          </div>

        </div>

        <div className="db-studio-project">

          <div className="db-studio-project-dot" />

          <div>
            <div className="db-studio-project-name">
              Mi tienda
            </div>

            <div className="db-studio-project-status">
              Guardado automáticamente
            </div>
          </div>

          <ChevronDown size={14} />

        </div>

        <div className="db-studio-header-actions">

          <button
            type="button"
            className="db-studio-header-button"
            onClick={() => setPreview(true)}
          >
            <Eye size={16} />
            Vista previa
          </button>

          <button
            type="button"
            className="db-studio-ai-button"
          >
            <WandSparkles size={16} />
            AI Studio
          </button>

          <button
            type="button"
            className="db-studio-publish-button"
          >
            <Rocket size={16} />
            Publicar
          </button>

        </div>

      </header>

      {/* ======================================================
          MAIN WORKSPACE
          ====================================================== */}

      <div className="db-studio-workspace">

        {/* ====================================================
            LEFT TOOL RAIL
            ==================================================== */}

        <aside
          className={
            "db-studio-left " +
            (!leftOpen ? "db-studio-left-collapsed" : "")
          }
        >

          <div className="db-studio-panel-heading">
            <div>
              <div className="db-studio-panel-kicker">
                CREAR
              </div>

              <div className="db-studio-panel-title">
                Elementos
              </div>
            </div>

            <button
              type="button"
              className="db-studio-icon-button"
              onClick={() => setLeftOpen(false)}
            >
              <Layers3 size={16} />
            </button>
          </div>

          <div className="db-studio-tool-search">
            <MousePointer2 size={15} />
            <span>Buscar elementos...</span>
          </div>

          <div className="db-studio-tool-category">
            Estructura
          </div>

          <button className="db-studio-tool-card">
            <div className="db-tool-icon db-tool-icon-violet">
              <LayoutTemplate size={17} />
            </div>

            <div>
              <strong>Sección</strong>
              <span>Contenedor flexible</span>
            </div>
          </button>

          <button className="db-studio-tool-card">
            <div className="db-tool-icon db-tool-icon-cyan">
              <Layers3 size={17} />
            </div>

            <div>
              <strong>Contenedor</strong>
              <span>Organizar contenido</span>
            </div>
          </button>

          <div className="db-studio-tool-category">
            Contenido
          </div>

          <button className="db-studio-tool-card">
            <div className="db-tool-icon db-tool-icon-pink">
              <TypeIcon />
            </div>

            <div>
              <strong>Texto</strong>
              <span>Títulos y contenido</span>
            </div>
          </button>

          <button className="db-studio-tool-card">
            <div className="db-tool-icon db-tool-icon-blue">
              <ImageIcon />
            </div>

            <div>
              <strong>Imagen</strong>
              <span>Fotos y gráficos</span>
            </div>
          </button>

          <button className="db-studio-tool-card">
            <div className="db-tool-icon db-tool-icon-violet">
              <Zap size={17} />
            </div>

            <div>
              <strong>Botón</strong>
              <span>Acciones y enlaces</span>
            </div>
          </button>

          <div className="db-studio-tool-category">
            Commerce OS
          </div>

          <button className="db-studio-commerce-card">
            <div className="db-commerce-orb">
              <Globe2 size={17} />
            </div>

            <div>
              <strong>Productos</strong>
              <span>Contenido conectado al comercio</span>
            </div>
          </button>

          <button className="db-studio-commerce-card">
            <div className="db-commerce-orb">
              <Palette size={17} />
            </div>

            <div>
              <strong>Colecciones</strong>
              <span>Vitrinas dinámicas</span>
            </div>
          </button>

        </aside>

        {/* ====================================================
            CANVAS
            ==================================================== */}

        <main className="db-studio-canvas-area">

          <div className="db-studio-canvas-toolbar">

            <div className="db-canvas-toolbar-group">

              <button
                type="button"
                className="db-canvas-tool active"
              >
                <MousePointer2 size={15} />
              </button>

              <button
                type="button"
                className="db-canvas-tool"
              >
                <Undo2 size={15} />
              </button>

              <button
                type="button"
                className="db-canvas-tool"
              >
                <Redo2 size={15} />
              </button>

            </div>

            <div className="db-canvas-device-selector">

              <button
                type="button"
                className={device === "desktop" ? "active" : ""}
                onClick={() => setDevice("desktop")}
              >
                <Monitor size={15} />
                <span>Desktop</span>
              </button>

              <button
                type="button"
                className={device === "tablet" ? "active" : ""}
                onClick={() => setDevice("tablet")}
              >
                <Tablet size={15} />
                <span>Tablet</span>
              </button>

              <button
                type="button"
                className={device === "mobile" ? "active" : ""}
                onClick={() => setDevice("mobile")}
              >
                <Smartphone size={15} />
                <span>Mobile</span>
              </button>

            </div>

            <div className="db-canvas-toolbar-group">

              <button
                type="button"
                className="db-canvas-tool"
              >
                <Settings2 size={15} />
              </button>

            </div>

          </div>

          <div className="db-studio-canvas-stage">

            <div className="db-studio-stage-label">
              <span>CANVAS</span>
              <span className="db-stage-live">
                LIVE
              </span>
            </div>

            <div
              className={
                "db-studio-site-frame db-device-" + device
              }
            >

              <div className="db-studio-site-frame-glow" />

              <div className="db-studio-real-editor">
                <WebsiteBuilderV1 />
              </div>

            </div>

          </div>

        </main>

        {/* ====================================================
            RIGHT INSPECTOR
            ==================================================== */}

        <aside
          className={
            "db-studio-right " +
            (!rightOpen ? "db-studio-right-collapsed" : "")
          }
        >

          <div className="db-studio-panel-heading">

            <div>
              <div className="db-studio-panel-kicker">
                EDITAR
              </div>

              <div className="db-studio-panel-title">
                Inspector
              </div>
            </div>

            <button
              type="button"
              className="db-studio-icon-button"
              onClick={() => setRightOpen(false)}
            >
              <PanelRight size={16} />
            </button>

          </div>

          <div className="db-inspector-selected">

            <div className="db-selected-icon">
              <LayoutTemplate size={17} />
            </div>

            <div>
              <div className="db-selected-label">
                Elemento seleccionado
              </div>

              <div className="db-selected-name">
                Página principal
              </div>
            </div>

          </div>

          <InspectorGroup
            title="Diseño"
            items={[
              ["Ancho", "1200 px"],
              ["Altura", "Auto"],
              ["Alineación", "Centro"],
            ]}
          />

          <InspectorGroup
            title="Espaciado"
            items={[
              ["Margen", "24 px"],
              ["Padding", "48 px"],
              ["Gap", "16 px"],
            ]}
          />

          <InspectorGroup
            title="Apariencia"
            items={[
              ["Fondo", "Gradient"],
              ["Borde", "Sutil"],
              ["Radio", "24 px"],
            ]}
          />

          <InspectorGroup
            title="Interacción"
            items={[
              ["Hover", "Activado"],
              ["Animación", "Suave"],
            ]}
          />

          <div className="db-inspector-ai">

            <div className="db-inspector-ai-icon">
              <WandSparkles size={17} />
            </div>

            <div>
              <strong>AI Design Assistant</strong>
              <span>
                Pedile a DigitalBoost que mejore este elemento.
              </span>
            </div>

          </div>

        </aside>

      </div>

      {/* ======================================================
          BOTTOM STATUS BAR
          ====================================================== */}

      <footer className="db-studio-statusbar">

        <div className="db-status-left">
          <span className="db-status-dot" />
          <span>Commerce OS conectado</span>
          <span className="db-status-separator" />
          <span>Store Builder Studio</span>
        </div>

        <div className="db-status-center">
          <span>Zoom 100%</span>
        </div>

        <div className="db-status-right">
          <span>Autosave</span>
          <span className="db-status-check">✓</span>
        </div>

      </footer>

      {/* ======================================================
          PREVIEW
          ====================================================== */}

      {preview && (
        <div className="db-studio-preview">

          <div className="db-preview-topbar">

            <div className="db-preview-brand">
              DIGITALBOOST
              <span>PREVIEW</span>
            </div>

            <button
              type="button"
              className="db-preview-close"
              onClick={() => setPreview(false)}
            >
              Cerrar
            </button>

          </div>

          <div className="db-preview-content">
            <div className="db-preview-card">
              <Play size={28} />
              <h2>Vista previa de tu sitio</h2>
              <p>
                El sitio se visualizará aquí mientras lo construís.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

function InspectorGroup({
  title,
  items,
}: {
  title: string;
  items: string[][];
}) {
  return (
    <div className="db-inspector-group">

      <div className="db-inspector-group-title">
        {title}
      </div>

      {items.map(([label, value]) => (
        <div className="db-inspector-row" key={label}>
          <span>{label}</span>
          <button type="button">
            {value}
          </button>
        </div>
      ))}

    </div>
  );
}

function TypeIcon() {
  return (
    <span style={{ fontWeight: 800, fontSize: 15 }}>
      T
    </span>
  );
}

function ImageIcon() {
  return (
    <span style={{ fontWeight: 800, fontSize: 13 }}>
      IMG
    </span>
  );
}
'''

SHELL.write_text(shell_code, encoding="utf-8")
print("✓ StoreBuilderStudioShell.tsx creado")

# ------------------------------------------------------------
# CSS
# ------------------------------------------------------------

css = r'''
/* ============================================================
   DIGITALBOOST COMMERCE OS
   STORE BUILDER STUDIO
   ART DIRECTION
   ============================================================ */

.db-store-studio {
  --violet: #9b5cff;
  --violet-bright: #b87aff;
  --cyan: #25e7ff;
  --blue: #5d8dff;
  --pink: #ff4fd8;

  --bg: #04030a;
  --surface: rgba(12, 8, 27, .90);
  --surface-2: rgba(18, 11, 38, .94);

  --line: rgba(255,255,255,.08);
  --line-violet: rgba(155,92,255,.25);
  --line-cyan: rgba(37,231,255,.25);

  --text: #faf9ff;
  --muted: #928ba8;

  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 780px;
  overflow: hidden;
  color: var(--text);

  background:
    radial-gradient(circle at 15% -10%, rgba(155,92,255,.18), transparent 30%),
    radial-gradient(circle at 92% 5%, rgba(37,231,255,.13), transparent 26%),
    radial-gradient(circle at 55% 110%, rgba(255,79,216,.09), transparent 28%),
    #04030a;
}

/* ambient lights */

.db-studio-ambient {
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  filter: blur(90px);
  opacity: .45;
  z-index: 0;
}

.db-studio-ambient-violet {
  width: 420px;
  height: 420px;
  left: -220px;
  top: 160px;
  background: rgba(155,92,255,.15);
}

.db-studio-ambient-cyan {
  width: 380px;
  height: 380px;
  right: -180px;
  top: 300px;
  background: rgba(37,231,255,.12);
}

.db-studio-ambient-pink {
  width: 320px;
  height: 320px;
  left: 50%;
  bottom: -220px;
  background: rgba(255,79,216,.09);
}

/* ============================================================
   TOP BAR
   ============================================================ */

.db-studio-topbar {
  position: relative;
  z-index: 10;

  height: 68px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 18px;

  background:
    linear-gradient(
      180deg,
      rgba(13,8,30,.97),
      rgba(7,5,17,.94)
    );

  border-bottom: 1px solid rgba(155,92,255,.18);

  box-shadow:
    0 12px 45px rgba(0,0,0,.28);
}

.db-studio-brand,
.db-studio-project,
.db-studio-header-actions {
  display: flex;
  align-items: center;
}

.db-studio-brand {
  gap: 10px;
}

.db-studio-back,
.db-studio-icon-button,
.db-studio-header-button,
.db-studio-tool-card,
.db-studio-commerce-card,
.db-canvas-tool,
.db-canvas-device-selector button,
.db-preview-close {
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.db-studio-back {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;

  color: #918ba2;
  border-radius: 10px;

  transition: .2s;
}

.db-studio-back:hover {
  color: white;
  background: rgba(255,255,255,.05);
  border-color: var(--line);
}

.db-studio-brand-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;

  border-radius: 11px;

  color: white;

  background:
    linear-gradient(
      135deg,
      #8e4dff,
      #b34fff 45%,
      #25e7ff
    );

  box-shadow:
    0 0 28px rgba(155,92,255,.30);
}

.db-studio-brand-copy {
  min-width: 150px;
}

.db-studio-eyebrow {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .18em;
  color: #887f9d;
}

.db-studio-title-row {
  display: flex;
  align-items: center;
  gap: 7px;

  margin-top: 2px;

  font-size: 14px;
  font-weight: 750;
}

.db-studio-badge {
  padding: 2px 6px;
  border-radius: 5px;

  font-size: 7px;
  letter-spacing: .12em;

  color: #d8c7ff;

  background: rgba(155,92,255,.13);
  border: 1px solid rgba(155,92,255,.25);
}

.db-studio-project {
  gap: 9px;
  padding: 7px 12px;

  border: 1px solid rgba(255,255,255,.07);
  border-radius: 11px;

  background: rgba(255,255,255,.025);
}

.db-studio-project-dot,
.db-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;

  background: #53f5bd;

  box-shadow:
    0 0 12px rgba(83,245,189,.7);
}

.db-studio-project-name {
  font-size: 11px;
  font-weight: 700;
}

.db-studio-project-status {
  margin-top: 1px;
  font-size: 9px;
  color: #777087;
}

.db-studio-header-actions {
  gap: 7px;
}

.db-studio-header-button,
.db-studio-ai-button,
.db-studio-publish-button {
  display: flex;
  align-items: center;
  gap: 7px;

  height: 34px;
  padding: 0 12px;

  border-radius: 9px;

  font-size: 10px;
  font-weight: 700;

  transition: .2s;
}

.db-studio-header-button {
  border-color: rgba(255,255,255,.08);
  background: rgba(255,255,255,.025);
  color: #b4aec2;
}

.db-studio-header-button:hover {
  border-color: rgba(37,231,255,.28);
  color: white;
}

.db-studio-ai-button {
  border-color: rgba(155,92,255,.22);
  background: rgba(155,92,255,.09);
  color: #c8aaff;
}

.db-studio-ai-button:hover {
  box-shadow: 0 0 25px rgba(155,92,255,.16);
}

.db-studio-publish-button {
  border-color: rgba(37,231,255,.28);
  background:
    linear-gradient(
      135deg,
      rgba(155,92,255,.85),
      rgba(83,70,255,.85),
      rgba(37,231,255,.85)
    );
  color: white;

  box-shadow:
    0 7px 22px rgba(82,70,255,.18);
}

/* ============================================================
   WORKSPACE
   ============================================================ */

.db-studio-workspace {
  position: relative;
  z-index: 2;

  display: grid;
  grid-template-columns: 238px minmax(0,1fr) 270px;

  min-height: 0;
  flex: 1;
}

/* ============================================================
   PANELS
   ============================================================ */

.db-studio-left,
.db-studio-right {
  min-width: 0;
  overflow-y: auto;

  background:
    linear-gradient(
      180deg,
      rgba(12,8,26,.96),
      rgba(7,5,16,.94)
    );
}

.db-studio-left {
  border-right: 1px solid rgba(155,92,255,.14);
  padding: 18px 13px;
}

.db-studio-right {
  border-left: 1px solid rgba(155,92,255,.14);
  padding: 18px 13px;
}

.db-studio-panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 15px;
}

.db-studio-panel-kicker {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .17em;
  color: #786f8b;
}

.db-studio-panel-title {
  margin-top: 3px;

  font-size: 15px;
  font-weight: 800;
}

.db-studio-icon-button {
  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  border-radius: 9px;

  color: #827b90;
  background: rgba(255,255,255,.025);
  border-color: rgba(255,255,255,.06);

  transition: .2s;
}

.db-studio-icon-button:hover {
  color: white;
  border-color: rgba(37,231,255,.25);
}

/* search */

.db-studio-tool-search {
  display: flex;
  align-items: center;
  gap: 8px;

  height: 34px;
  padding: 0 10px;

  border-radius: 9px;

  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.06);

  color: #6e687b;
  font-size: 9px;

  margin-bottom: 18px;
}

/* categories */

.db-studio-tool-category {
  margin: 16px 3px 8px;

  font-size: 8px;
  font-weight: 800;
  letter-spacing: .14em;

  color: #6d667b;
}

/* tools */

.db-studio-tool-card,
.db-studio-commerce-card {
  width: 100%;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 9px 8px;

  margin-bottom: 5px;

  border-radius: 10px;

  text-align: left;

  transition:
    background .18s ease,
    border-color .18s ease,
    transform .18s ease;
}

.db-studio-tool-card:hover,
.db-studio-commerce-card:hover {
  transform: translateX(2px);

  background:
    linear-gradient(
      90deg,
      rgba(155,92,255,.09),
      rgba(37,231,255,.035)
    );

  border-color: rgba(155,92,255,.18);
}

.db-studio-tool-card strong,
.db-studio-commerce-card strong {
  display: block;

  font-size: 10px;
  color: #ece9f5;
}

.db-studio-tool-card span,
.db-studio-commerce-card span {
  display: block;

  margin-top: 2px;

  font-size: 8px;
  line-height: 1.35;

  color: #716b7c;
}

.db-tool-icon,
.db-commerce-orb {
  width: 31px;
  height: 31px;

  flex-shrink: 0;

  display: grid;
  place-items: center;

  border-radius: 9px;
}

.db-tool-icon-violet {
  color: #b883ff;
  background: rgba(155,92,255,.13);
  border: 1px solid rgba(155,92,255,.18);
}

.db-tool-icon-cyan {
  color: #5cecff;
  background: rgba(37,231,255,.09);
  border: 1px solid rgba(37,231,255,.16);
}

.db-tool-icon-pink {
  color: #ff7be1;
  background: rgba(255,79,216,.09);
  border: 1px solid rgba(255,79,216,.16);
}

.db-tool-icon-blue {
  color: #75a5ff;
  background: rgba(93,141,255,.09);
  border: 1px solid rgba(93,141,255,.16);
}

.db-commerce-orb {
  color: #7ff5ff;

  background:
    radial-gradient(
      circle at 30% 25%,
      rgba(37,231,255,.20),
      rgba(155,92,255,.09)
    );

  border: 1px solid rgba(37,231,255,.16);
}

/* ============================================================
   CANVAS
   ============================================================ */

.db-studio-canvas-area {
  min-width: 0;
  min-height: 0;

  display: flex;
  flex-direction: column;

  background:
    radial-gradient(
      circle at center,
      rgba(155,92,255,.055),
      transparent 48%
    ),
    #05040c;
}

.db-studio-canvas-toolbar {
  height: 48px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 13px;

  border-bottom: 1px solid rgba(255,255,255,.055);

  background: rgba(8,6,17,.82);
  backdrop-filter: blur(18px);
}

.db-canvas-toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.db-canvas-tool {
  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  border-radius: 8px;

  color: #716a7d;
}

.db-canvas-tool:hover,
.db-canvas-tool.active {
  color: #f5f1ff;

  background: rgba(155,92,255,.11);
  border-color: rgba(155,92,255,.18);
}

.db-canvas-device-selector {
  display: flex;
  align-items: center;
  gap: 3px;

  padding: 3px;

  border-radius: 9px;

  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.06);
}

.db-canvas-device-selector button {
  display: flex;
  align-items: center;
  gap: 5px;

  height: 27px;
  padding: 0 9px;

  border-radius: 6px;

  color: #706a7b;
  font-size: 8px;
  font-weight: 700;
}

.db-canvas-device-selector button.active {
  color: white;

  background:
    linear-gradient(
      135deg,
      rgba(155,92,255,.22),
      rgba(37,231,255,.09)
    );

  box-shadow:
    inset 0 0 0 1px rgba(155,92,255,.20);
}

/* stage */

.db-studio-canvas-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  padding: 40px 35px 55px;

  background:
    radial-gradient(
      circle at 50% 10%,
      rgba(155,92,255,.09),
      transparent 35%
    ),
    repeating-linear-gradient(
      45deg,
      rgba(255,255,255,.012) 0,
      rgba(255,255,255,.012) 1px,
      transparent 1px,
      transparent 14px
    );
}

.db-studio-stage-label {
  position: absolute;
  top: 13px;
  left: 16px;

  display: flex;
  align-items: center;
  gap: 7px;

  font-size: 7px;
  font-weight: 800;
  letter-spacing: .15em;

  color: #645e70;
}

.db-stage-live {
  padding: 3px 5px;

  color: #57efc1;

  border: 1px solid rgba(83,245,189,.15);
  border-radius: 4px;

  background: rgba(83,245,189,.04);
}

.db-studio-site-frame {
  position: relative;

  width: min(100%, 1120px);
  min-height: 650px;

  overflow: hidden;

  background: #0b0913;

  border: 1px solid rgba(155,92,255,.20);
  border-radius: 13px;

  box-shadow:
    0 35px 90px rgba(0,0,0,.50),
    0 0 0 1px rgba(255,255,255,.025),
    0 0 70px rgba(155,92,255,.07);

  transition:
    width .35s cubic-bezier(.2,.8,.2,1);
}

.db-device-tablet {
  width: min(760px, 100%);
}

.db-device-mobile {
  width: min(390px, 100%);
}

.db-studio-site-frame-glow {
  position: absolute;
  left: 15%;
  right: 15%;
  top: -80px;
  height: 120px;

  background:
    radial-gradient(
      ellipse,
      rgba(155,92,255,.24),
      transparent 70%
    );

  filter: blur(25px);
  pointer-events: none;
}

.db-studio-real-editor {
  position: relative;
  z-index: 2;

  min-height: 650px;
}

/* ============================================================
   INSPECTOR
   ============================================================ */

.db-inspector-selected {
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 11px;

  margin-bottom: 17px;

  border-radius: 11px;

  background:
    linear-gradient(
      135deg,
      rgba(155,92,255,.10),
      rgba(37,231,255,.035)
    );

  border: 1px solid rgba(155,92,255,.18);
}

.db-selected-icon {
  width: 31px;
  height: 31px;

  display: grid;
  place-items: center;

  border-radius: 9px;

  color: #c69bff;
  background: rgba(155,92,255,.13);
}

.db-selected-label {
  font-size: 7px;
  color: #756e82;
}

.db-selected-name {
  margin-top: 2px;

  font-size: 10px;
  font-weight: 750;
}

.db-inspector-group {
  margin-top: 17px;
}

.db-inspector-group-title {
  margin-bottom: 7px;

  font-size: 8px;
  font-weight: 800;
  letter-spacing: .11em;

  color: #81798f;
}

.db-inspector-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 31px;

  border-bottom: 1px solid rgba(255,255,255,.035);

  font-size: 9px;
  color: #817b8e;
}

.db-inspector-row button {
  min-width: 82px;

  padding: 5px 7px;

  text-align: right;

  color: #d8d3e2;

  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 6px;

  font-size: 8px;
}

.db-inspector-ai {
  display: flex;
  gap: 9px;

  margin-top: 22px;
  padding: 11px;

  border-radius: 11px;

  background:
    linear-gradient(
      135deg,
      rgba(155,92,255,.10),
      rgba(255,79,216,.045)
    );

  border: 1px solid rgba(155,92,255,.18);
}

.db-inspector-ai-icon {
  width: 29px;
  height: 29px;

  display: grid;
  place-items: center;

  flex-shrink: 0;

  border-radius: 8px;

  color: #e0b8ff;
  background: rgba(155,92,255,.14);
}

.db-inspector-ai strong {
  display: block;

  font-size: 9px;
}

.db-inspector-ai span {
  display: block;

  margin-top: 3px;

  font-size: 8px;
  line-height: 1.45;

  color: #7c7489;
}

/* ============================================================
   STATUS
   ============================================================ */

.db-studio-statusbar {
  position: relative;
  z-index: 10;

  height: 27px;
  flex-shrink: 0;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  padding: 0 13px;

  background: rgba(8,5,17,.97);
  border-top: 1px solid rgba(255,255,255,.055);

  font-size: 7px;
  color: #686173;
}

.db-status-left,
.db-status-right {
  display: flex;
  align-items: center;
  gap: 7px;
}

.db-status-right {
  justify-content: flex-end;
}

.db-status-separator {
  width: 1px;
  height: 10px;
  background: rgba(255,255,255,.08);
}

.db-status-check {
  color: #53f5bd;
}

/* ============================================================
   PREVIEW
   ============================================================ */

.db-studio-preview {
  position: absolute;
  inset: 0;

  z-index: 100;

  display: flex;
  flex-direction: column;

  background: #05030b;
}

.db-preview-topbar {
  height: 58px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 18px;

  border-bottom: 1px solid rgba(155,92,255,.18);
  background: rgba(9,5,19,.96);
}

.db-preview-brand {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .12em;
}

.db-preview-brand span {
  margin-left: 8px;

  font-size: 7px;
  color: #9b5cff;
}

.db-preview-close {
  padding: 7px 11px;

  border-radius: 8px;

  color: #bfb8ca;

  background: rgba(255,255,255,.04);
  border-color: rgba(255,255,255,.07);

  font-size: 9px;
}

.db-preview-content {
  flex: 1;

  display: grid;
  place-items: center;

  background:
    radial-gradient(
      circle,
      rgba(155,92,255,.10),
      transparent 40%
    );
}

.db-preview-card {
  text-align: center;
  color: #9b91a8;
}

.db-preview-card svg {
  margin: 0 auto 15px;
  color: #9b5cff;
}

.db-preview-card h2 {
  color: white;
  font-size: 18px;
}

.db-preview-card p {
  margin-top: 7px;
  font-size: 11px;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */

@media (max-width: 1100px) {
  .db-studio-workspace {
    grid-template-columns: 205px minmax(0,1fr) 235px;
  }

  .db-studio-project {
    display: none;
  }
}

@media (max-width: 820px) {
  .db-studio-workspace {
    grid-template-columns: 1fr;
  }

  .db-studio-left,
  .db-studio-right {
    display: none;
  }

  .db-studio-header-button {
    display: none;
  }

  .db-studio-stage {
    padding: 25px 12px;
  }

  .db-studio-statusbar {
    grid-template-columns: 1fr auto;
  }

  .db-status-center {
    display: none;
  }
}
'''

CSS.write_text(css, encoding="utf-8")
print("✓ Sistema artístico Studio creado")

# ------------------------------------------------------------
# CONECTAR CSS
# ------------------------------------------------------------

source = WORKSPACE.read_text(encoding="utf-8")

if "store-builder-studio-shell.css" not in source:
    # El shell importa el CSS. No tocamos CSS del workspace.
    print("✓ CSS encapsulado dentro de StoreBuilderStudioShell")

# ------------------------------------------------------------
# CONECTAR SHELL AL WORKSPACE
# ------------------------------------------------------------

if "StoreBuilderStudioShell" not in source:

    # Añadir import después de imports existentes.
    import_lines = list(
        __import__("re").finditer(
            r'^import\s+.*?;\s*$',
            source,
            flags=__import__("re").MULTILINE
        )
    )

    import_line = (
        '\nimport StoreBuilderStudioShell from "./StoreBuilderStudioShell";'
    )

    if import_lines:
        pos = import_lines[-1].end()
        source = source[:pos] + import_line + source[pos:]
    else:
        source = (
            'import StoreBuilderStudioShell from "./StoreBuilderStudioShell";\n'
            + source
        )

    print("✓ StoreBuilderStudioShell importado")

else:
    print("✓ StoreBuilderStudioShell ya estaba conectado")

# ------------------------------------------------------------
# REEMPLAZAR SOLO EL RENDER DEL WEBSITE BUILDER
# ------------------------------------------------------------

import re

patterns = [
    r'case\s+"website-builder"\s*:\s*return\s*\(\s*<WebsiteBuilderV1[\s\S]*?</WebsiteBuilderV1>\s*\)\s*;',
    r'case\s+"website-builder"\s*:\s*return\s*\(\s*<WebsiteBuilderV1[\s\S]*?/>\s*\)\s*;',
]

replaced = False

for pattern in patterns:
    match = re.search(pattern, source)

    if match:
        replacement = '''case "website-builder":
        return (
          <StoreBuilderStudioShell
            onBack={() => setSection("dashboard")}
          />
        );'''

        source = source[:match.start()] + replacement + source[match.end():]
        replaced = True
        print("✓ Ruta website-builder conectada al nuevo Studio")
        break

if not replaced:

    # Buscar una ruta simple aunque tenga distinto formato.
    simple = re.search(
        r'case\s+"website-builder"\s*:\s*[\s\S]*?(?=\n\s*case\s+"|\n\s*default\s*:)',
        source
    )

    if simple:
        replacement = '''case "website-builder":
        return (
          <StoreBuilderStudioShell
            onBack={() => setSection("dashboard")}
          />
        );

      '''

        source = (
            source[:simple.start()]
            + replacement
            + source[simple.end():]
        )

        replaced = True
        print("✓ Ruta website-builder reconstruida")

if not replaced:
    print("⚠️ No encontré la ruta website-builder automáticamente.")
    print("No se tocará el workspace.")
    shutil.copy2(backup, WORKSPACE)
    raise SystemExit(1)

# ------------------------------------------------------------
# ESCRIBIR WORKSPACE
# ------------------------------------------------------------

WORKSPACE.write_text(source, encoding="utf-8")
print("✓ StoreBuilderWorkspace actualizado")

# ------------------------------------------------------------
# BUILD
# ------------------------------------------------------------

print()
print("=" * 70)
print("BUILD DE VERIFICACIÓN")
print("=" * 70)

result = subprocess.run(
    ["npm", "run", "build"],
    cwd=ROOT,
    text=True,
    capture_output=True,
    timeout=180
)

print(result.stdout)

if result.returncode != 0:
    print(result.stderr)
    print()
    print("❌ BUILD FALLÓ")
    print("Restaurando workspace...")
    shutil.copy2(backup, WORKSPACE)
    print("✓ Workspace restaurado")
    raise SystemExit(result.returncode)

print("✅ BUILD CORRECTO")

print()
print("=" * 70)
print("STORE BUILDER STUDIO INSTALADO")
print("=" * 70)
print("✓ Commerce OS como plataforma raíz")
print("✓ Store Builder como herramienta integrada")
print("✓ Nueva Application Shell")
print("✓ Topbar profesional")
print("✓ Tool panel")
print("✓ Canvas central")
print("✓ Inspector")
print("✓ Device switcher")
print("✓ Preview")
print("✓ AI Studio visual")
print("✓ Electric Violet")
print("✓ Neon Cyan")
print("✓ Magenta accent")
print("✓ Ambient lighting")
print("✓ Glass surfaces")
print("✓ Commerce OS integration layer")
print()
print(f"Backup: {backup.name}")
print()
print("Ejecutá:")
print("npm run dev")
print()
print("Luego:")
print("Commerce OS → Store Builder → Website Builder")
