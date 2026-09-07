import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  GripVertical,
  Image as ImageIcon,
  Layers3,
  Monitor,
  Palette,
  Plus,
  Rocket,
  Save,
  Settings2,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tablet,
  Type,
  Wand2,
} from "lucide-react";
import "./store-builder-final-studio.css";

type Props = {
  onBack?: () => void;
};

type Device = "desktop" | "tablet" | "mobile";

type Block = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
};

const initialBlocks: Block[] = [
  {
    id: "hero",
    type: "hero",
    title: "Hero principal",
    subtitle: "Presentación + CTA",
    icon: Sparkles,
  },
  {
    id: "features",
    type: "features",
    title: "Beneficios",
    subtitle: "Tres razones para comprar",
    icon: Layers3,
  },
  {
    id: "products",
    type: "products",
    title: "Productos",
    subtitle: "Colección destacada",
    icon: ShoppingBag,
  },
  {
    id: "text",
    type: "text",
    title: "Texto",
    subtitle: "Contenido editorial",
    icon: Type,
  },
];

const pages = [
  "Inicio",
  "Productos",
  "Colecciones",
  "Nosotros",
  "Contacto",
];

const blockCatalog = [
  ["hero", "Hero", Sparkles],
  ["features", "Features", Layers3],
  ["products", "Products", ShoppingBag],
  ["text", "Text", Type],
  ["media", "Media", ImageIcon],
  ["cta", "CTA", Rocket],
] as const;

export default function StoreBuilderFinalStudio({ onBack }: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const [activePage, setActivePage] = useState("Inicio");
  const [selectedId, setSelectedId] = useState("hero");
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [mobilePanel, setMobilePanel] = useState<"left" | "right" | null>(
    null,
  );

  const selected = useMemo(
    () =>
      blocks.find((block) => block.id === selectedId) ??
      blocks[0] ??
      null,
    [blocks, selectedId],
  );

  const addBlock = (type: string, label: string, Icon: React.ElementType) => {
    const id = `${type}-${Date.now()}`;

    const newBlock: Block = {
      id,
      type,
      title: label,
      subtitle: "Bloque editable",
      icon: Icon,
    };

    setBlocks((current) => [...current, newBlock]);
    setSelectedId(id);
    setSaved(false);
  };

  const removeSelected = () => {
    if (!selected) return;

    const next = blocks.filter((block) => block.id !== selected.id);

    setBlocks(next);
    setSelectedId(next[0]?.id ?? "");
    setSaved(false);
  };

  if (preview) {
    return (
      <div className="db-final-studio db-final-preview">
        <div className="db-final-preview-top">
          <div>
            <div className="db-final-eyebrow">
              DIGITALBOOST
            </div>

            <div className="db-final-preview-title">
              Vista previa de tu tienda
            </div>
          </div>

          <button
            type="button"
            className="db-final-btn db-final-btn-primary"
            onClick={() => setPreview(false)}
          >
            <ArrowLeft size={15} />
            Volver al editor
          </button>
        </div>

        <div className="db-final-preview-area">
          <div className="db-store-preview">
            <div className="db-preview-gradient" />

            <nav className="db-preview-nav">
              <div className="db-preview-logo">
                DIGITAL<span>BOOST</span>
              </div>

              <div className="db-preview-links">
                <span>Inicio</span>
                <span>Productos</span>
                <span>Colecciones</span>
                <span>Contacto</span>
              </div>

              <div className="db-preview-cart">
                3
              </div>
            </nav>

            <section className="db-preview-hero">
              <div className="db-preview-pill">
                <Sparkles size={14} />
                EXPERIENCIA DIGITAL
              </div>

              <h1>
                Una tienda que
                <br />
                <span>se siente propia.</span>
              </h1>

              <p>
                Diseñá una experiencia moderna, rápida y preparada
                para convertir visitantes en clientes.
              </p>

              <div className="db-preview-actions">
                <button type="button" className="db-preview-primary">
                  Explorar colección
                  <ChevronRight size={16} />
                </button>

                <button type="button" className="db-preview-secondary">
                  Conocer la marca
                </button>
              </div>
            </section>

            <section className="db-preview-features">
              <div>
                <strong>Envíos rápidos</strong>
                <span>Procesos simples y claros</span>
              </div>

              <div>
                <strong>Compra segura</strong>
                <span>Checkout optimizado</span>
              </div>

              <div>
                <strong>Soporte humano</strong>
                <span>Atención cuando la necesites</span>
              </div>
            </section>

            <section className="db-preview-products">
              {["Aurora Pack", "Studio Chair", "Nova Lamp"].map(
                (name, index) => (
                  <article key={name}>
                    <div
                      className={`db-product-art db-product-art-${index + 1}`}
                    />

                    <div className="db-product-meta">
                      <span>{name}</span>
                      <strong>$ 49.900</strong>
                    </div>
                  </article>
                ),
              )}
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="db-final-studio">
      <header className="db-final-topbar">
        <div className="db-final-brand-area">
          <button
            type="button"
            className="db-final-icon-btn"
            onClick={onBack}
            title="Volver a Commerce OS"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="db-final-brand-mark">
            <div className="db-final-brand-orb">
              <Sparkles size={16} />
            </div>

            <div>
              <div className="db-final-brand-name">
                STORE BUILDER
              </div>

              <div className="db-final-brand-path">
                COMMERCE OS / VISUAL STUDIO
              </div>
            </div>
          </div>

          <div className="db-final-live">
            <span />
            LIVE
          </div>
        </div>

        <div className="db-final-device-switch">
          <button
            type="button"
            className={device === "desktop" ? "active" : ""}
            onClick={() => setDevice("desktop")}
            title="Desktop"
          >
            <Monitor size={15} />
          </button>

          <button
            type="button"
            className={device === "tablet" ? "active" : ""}
            onClick={() => setDevice("tablet")}
            title="Tablet"
          >
            <Tablet size={15} />
          </button>

          <button
            type="button"
            className={device === "mobile" ? "active" : ""}
            onClick={() => setDevice("mobile")}
            title="Mobile"
          >
            <Smartphone size={15} />
          </button>
        </div>

        <div className="db-final-actions">
          <button
            type="button"
            className="db-final-btn"
            onClick={() => setPreview(true)}
          >
            <Eye size={14} />
            Preview
          </button>

          <button
            type="button"
            className="db-final-btn"
            onClick={() => setSaved(true)}
          >
            <Save size={14} />
            {saved ? "Guardado" : "Guardar"}
          </button>

          <button
            type="button"
            className="db-final-btn db-final-btn-publish"
          >
            <Rocket size={14} />
            Publicar
          </button>
        </div>
      </header>

      <div className="db-final-mobile-tabs">
        <button
          type="button"
          onClick={() =>
            setMobilePanel(
              mobilePanel === "left" ? null : "left",
            )
          }
        >
          <Layers3 size={15} />
          Bloques
        </button>

        <button
          type="button"
          onClick={() =>
            setMobilePanel(
              mobilePanel === "right" ? null : "right",
            )
          }
        >
          <Settings2 size={15} />
          Inspector
        </button>
      </div>

      <div className="db-final-layout">
        <aside
          className={`db-final-sidebar db-final-left ${
            mobilePanel === "left" ? "mobile-open" : ""
          }`}
        >
          <div className="db-final-panel-title">
            <div>
              <span>EDITOR</span>
              <strong>Bloques</strong>
            </div>
            <Plus size={16} />
          </div>

          <div className="db-final-blocks">
            {blockCatalog.map(([type, label, Icon]) => (
              <button
                key={type}
                type="button"
                className="db-final-add-block"
                onClick={() =>
                  addBlock(type, label, Icon)
                }
              >
                <span className="db-final-add-icon">
                  <Icon size={15} />
                </span>

                <span>
                  <strong>{label}</strong>
                  <small>Agregar al canvas</small>
                </span>

                <Plus size={14} />
              </button>
            ))}
          </div>

          <div className="db-final-divider" />

          <div className="db-final-section-label">
            PÁGINAS
          </div>

          <div className="db-final-pages">
            {pages.map((page) => (
              <button
                type="button"
                key={page}
                className={page === activePage ? "active" : ""}
                onClick={() => setActivePage(page)}
              >
                <span className="db-page-dot" />
                {page}
              </button>
            ))}
          </div>

          <div className="db-final-sidebar-footer">
            <span>
              <span className="db-status-dot" />
              {saved
                ? "Todos los cambios guardados"
                : "Cambios sin guardar"}
            </span>
          </div>
        </aside>

        <main className="db-final-canvas-area">
          <div className="db-final-canvas-head">
            <div>
              <span>
                TIENDA / {activePage.toUpperCase()}
              </span>
              <strong>Vista de edición</strong>
            </div>

            <div className="db-final-canvas-head-actions">
              <button type="button">
                <Wand2 size={14} />
                IA
              </button>

              <button type="button">
                <Palette size={14} />
                Tema
              </button>
            </div>
          </div>

          <div className="db-final-canvas-wrap">
            <div
              className={`db-final-device db-final-device-${device}`}
            >
              <div className="db-site-toolbar">
                <span>digitalboost.store</span>
                <span>100%</span>
              </div>

              <div className="db-site-frame">
                <div className="db-site-header">
                  <div className="db-site-logo">
                    DIGITAL<span>BOOST</span>
                  </div>

                  <div className="db-site-nav">
                    <span>Inicio</span>
                    <span>Productos</span>
                    <span>Nosotros</span>
                    <span>Contacto</span>
                  </div>

                  <button
                    type="button"
                    className="db-site-cart"
                  >
                    <ShoppingBag size={16} />
                    <i>2</i>
                  </button>
                </div>

                {blocks.filter(function (block) { return !(block && block.hidden); }).map((block) => {
                  const Icon = block.icon;

                  return (
                    <section
                      key={block.id}
                      className={`db-editor-block ${
                        selectedId === block.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedId(block.id)
                      }
                    >
                      <div className="db-selection-badge">
                        <Icon size={12} />
                        {block.title}
                      </div>

                      {block.type === "hero" && (
                        <div className="db-editor-hero">
                          <div>
                            <div className="db-mini-pill">
                              NUEVA COLECCIÓN
                            </div>

                            <h1>
                              Diseñá algo
                              <br />
                              <span>
                                extraordinario.
                              </span>
                            </h1>

                            <p>
                              Una experiencia de compra
                              limpia, potente y
                              completamente tuya.
                            </p>

                            <div className="db-hero-btns">
                              <button type="button">
                                Comprar ahora
                                <ChevronRight size={15} />
                              </button>

                              <button
                                type="button"
                                className="ghost"
                              >
                                Ver colección
                              </button>
                            </div>
                          </div>

                          <div className="db-hero-visual">
                            <div className="db-orbit db-orbit-a" />
                            <div className="db-orbit db-orbit-b" />

                            <div className="db-hero-card">
                              <ShoppingBag size={28} />
                              <strong>NEW</strong>
                              <span>STUDIO DROP</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === "features" && (
                        <div className="db-feature-row">
                          <div>
                            <strong>Envíos simples</strong>
                            <span>
                              Todo claro desde el primer click.
                            </span>
                          </div>

                          <div>
                            <strong>Checkout seguro</strong>
                            <span>
                              Menos fricción, más conversión.
                            </span>
                          </div>

                          <div>
                            <strong>Soporte humano</strong>
                            <span>
                              Tu marca siempre acompaña.
                            </span>
                          </div>
                        </div>
                      )}

                      {block.type === "products" && (
                        <div className="db-products-grid">
                          {[1, 2, 3].map((item) => (
                            <div
                              className="db-product-card"
                              key={item}
                            >
                              <div
                                className={`db-product-image image-${item}`}
                              />

                              <span>
                                Producto destacado
                              </span>

                              <strong>
                                $ 49.900
                              </strong>
                            </div>
                          ))}
                        </div>
                      )}

                      {block.type === "text" && (
                        <div className="db-text-block">
                          <span>
                            HISTORIA DE MARCA
                          </span>

                          <h2>
                            Tu tienda también cuenta una
                            historia.
                          </h2>

                          <p>
                            Creá contenido que refuerce
                            tu identidad y acompañe
                            cada etapa de la experiencia.
                          </p>
                        </div>
                      )}

                      {block.type === "media" && (
                        <div className="db-media-placeholder">
                          <ImageIcon size={22} />
                          <span>
                            Arrastrá una imagen o video aquí
                          </span>
                        </div>
                      )}

                      {block.type === "cta" && (
                        <div className="db-cta-block">
                          <div>
                            <span>LISTO PARA CRECER</span>
                            <strong>
                              Convertí visitas en clientes.
                            </strong>
                          </div>

                          <button type="button">
                            Comenzar
                            <ChevronRight size={15} />
                          </button>
                        </div>
                      )}

                      {selectedId === block.id && (
                        <div className="db-block-controls">
                          <button
                            type="button"
                            title="Mover"
                          >
                            <GripVertical size={14} />
                          </button>

                          <button
                            type="button"
                            title="Quitar"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeSelected();
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="db-final-statusbar">
            <span>
              <span className="db-status-dot" />
              Edición en vivo
            </span>

            <span>
              {blocks.length} bloques · {activePage}
            </span>
          </div>
        </main>

        <aside
          className={`db-final-sidebar db-final-right ${
            mobilePanel === "right" ? "mobile-open" : ""
          }`}
        >
          <div className="db-final-panel-title">
            <div>
              <span>PROPIEDADES</span>
              <strong>Inspector</strong>
            </div>
            <Settings2 size={16} />
          </div>

          <div className="db-inspector-card">
            <div className="db-inspector-icon">
              <Settings2 size={15} />
            </div>

            <div>
              <strong>
                {selected?.title ?? "Bloque"}
              </strong>

              <span>Seleccionado</span>
            </div>
          </div>

          <InspectorField
            label="Título"
            value={selected?.title ?? "Bloque"}
          />

          <InspectorField
            label="Descripción"
            value={
              selected?.subtitle ??
              "Contenido editable"
            }
            multiline
          />

          <div className="db-inspector-group">
            <div className="db-inspector-label">
              ESTILO
            </div>

            <div className="db-color-row">
              <span>Paleta DigitalBoost</span>
              <i className="violet" />
              <i className="blue" />
              <i className="cyan" />
              <i className="green" />
            </div>
          </div>

          <div className="db-inspector-group">
            <div className="db-range">
              <span>Padding</span>
              <strong>64 px</strong>
            </div>

            <input
              type="range"
              min="16"
              max="96"
              defaultValue="64"
            />
          </div>

          <button
            type="button"
            className="db-ai-button"
          >
            <Wand2 size={15} />

            <span>
              <strong>Mejorar con IA</strong>
              <small>
                Optimizar este bloque
              </small>
            </span>

            <ChevronRight size={15} />
          </button>
        </aside>
      </div>
    </div>
  );
}

function InspectorField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <label className="db-inspector-field">
      <span>{label}</span>

      {multiline ? (
        <textarea
          defaultValue={value}
          rows={3}
        />
      ) : (
        <input defaultValue={value} />
      )}
    </label>
  );
}
