
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
