import "./store-builder-direct-final.css";
import React, { useEffect, useState } from "react";

const __DIGITALBOOST_RUNTIME_MARKER__ = "DIGITALBOOST_STORE_BUILDER_DIRECT_FINAL_2026";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
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


type Props = {
  onBack?: () => void;
};

type Device = "desktop" | "tablet" | "mobile";

const palette = [
  { name: "Violeta", className: "dbf-color-violet" },
  { name: "Azul", className: "dbf-color-blue" },
  { name: "Cian", className: "dbf-color-cyan" },
  { name: "Verde", className: "dbf-color-green" },
];

const pages = [
  "Inicio",
  "Productos",
  "Colecciones",
  "Nosotros",
  "Contacto",
];

const tools = [
  ["Hero", Sparkles],
  ["Section", Layers3],
  ["Text", Type],
  ["Products", ShoppingBag],
  ["Media", ImageIcon],
  ["CTA", Rocket],
] as const;

export default function StoreBuilderDirectFinal({
  onBack,
}: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const [page, setPage] = useState("Inicio");
  useEffect(function () {
    try { (window as any).__dbSetPage = setPage; } catch {}
    function onPage(ev) {
      const name = ev && ev.detail;
      if (typeof name === 'string' && name) setPage(name);
    }
    window.addEventListener('db-page', onPage);
    return function () { window.removeEventListener('db-page', onPage); };
  }, []);

  const [preview, setPreview] = useState(false);
  const [selected, setSelected] = useState("hero");
  const [blocks, setBlocks] = useState([
    "hero",
    "features",
    "products",
    "story",
  ]);

  function addBlock(type: string) {
    const id = `${type}-${Date.now()}`;
    setBlocks((current) => [...current, id]);
    setSelected(id);
  }

  function removeBlock(id: string) {
    setBlocks((current) => {
      const next = current.filter((item) => item !== id);
      setSelected(next[0] || "");
      return next;
    });
  }

  if (preview) {
    return (
      <div className="dbf-shell dbf-preview-shell" data-db-store-builder-final="true">
        <div className="dbf-preview-header">
          <div>
            <span className="dbf-kicker">DIGITALBOOST</span>
            <h2>Vista previa de la tienda</h2>
          </div>

          <button
            type="button"
            className="dbf-button dbf-button-violet"
            onClick={() => setPreview(false)}
          >
            <ArrowLeft size={15} />
            Volver al editor
          </button>
        </div>

        <div className="dbf-preview-stage">
          <div className="dbf-store-preview">
            <div className="dbf-preview-accent" />

            <header className="dbf-preview-nav">
              <div className="dbf-preview-logo">
                DIGITAL<span>BOOST</span>
              </div>

              <nav>
                <span>Inicio</span>
                <span>Productos</span>
                <span>Colecciones</span>
                <span>Contacto</span>
              </nav>

              <button type="button" className="dbf-preview-bag">
                <ShoppingBag size={15} />
              </button>
            </header>

            <section className="dbf-preview-hero">
              <div className="dbf-preview-pill">
                <Sparkles size={13} />
                NUEVA EXPERIENCIA DIGITAL
              </div>

              <h1>
                Tu tienda.
                <br />
                <span>Tu identidad.</span>
              </h1>

              <p>
                Una experiencia moderna diseñada para presentar
                tu marca y convertir visitas en clientes.
              </p>

              <div className="dbf-preview-cta-row">
                <button type="button">
                  Explorar colección
                  <ChevronRight size={15} />
                </button>

                <button type="button" className="secondary">
                  Conocer la marca
                </button>
              </div>
            </section>

            <section className="dbf-preview-features">
              <div>
                <strong>Envíos rápidos</strong>
                <span>Información clara y sencilla</span>
              </div>

              <div>
                <strong>Compra segura</strong>
                <span>Checkout preparado para convertir</span>
              </div>

              <div>
                <strong>Soporte humano</strong>
                <span>Una marca que acompaña</span>
              </div>
            </section>

            <section className="dbf-preview-products">
              {[1, 2, 3].map((item) => (
                <article key={item}>
                  <div className={`dbf-product-art art-${item}`} />
                  <span>Producto destacado</span>
                  <strong>$ 49.900</strong>
                </article>
              ))}
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dbf-shell" data-db-store-builder-final="true">
      <header className="dbf-topbar">
        <div className="dbf-brand-zone">
          <button
            type="button"
            className="dbf-icon-button"
            onClick={onBack}
            title="Volver a Commerce OS"
          >
            <ArrowLeft size={17} />
          </button>

          <div className="dbf-brand">
            <div className="dbf-brand-icon">
              <Sparkles size={16} />
            </div>

            <div>
              <strong>STORE BUILDER</strong>
              <span>COMMERCE OS / VISUAL STUDIO</span>
            </div>
          </div>

          <div className="dbf-live">
            <span />
            LIVE
          </div>
        </div>

        <div className="dbf-device-switch">
          <button
            type="button"
            className={device === "desktop" ? "active" : ""}
            onClick={() => setDevice("desktop")}
          >
            <Monitor size={14} />
          </button>

          <button
            type="button"
            className={device === "tablet" ? "active" : ""}
            onClick={() => setDevice("tablet")}
          >
            <Tablet size={14} />
          </button>

          <button
            type="button"
            className={device === "mobile" ? "active" : ""}
            onClick={() => setDevice("mobile")}
          >
            <Smartphone size={14} />
          </button>
        </div>

        <div className="dbf-actions">
          <button
            type="button"
            className="dbf-button"
            onClick={() => setPreview(true)}
          >
            <Eye size={14} />
            Preview
          </button>

          <button
            type="button"
            className="dbf-button dbf-save"
          >
            <Save size={14} />
            Guardar
          </button>

          <button
            type="button"
            className="dbf-button dbf-publish"
          >
            <Rocket size={14} />
            Publicar
          </button>
        </div>
      </header>

      <div className="dbf-layout">
        <aside className="dbf-sidebar dbf-left">
          <div className="dbf-panel-heading">
            <div>
              <span>EDITOR</span>
              <strong>Bloques</strong>
            </div>
            <Plus size={16} />
          </div>

          <div className="dbf-tools">
            {tools.map(([label, Icon]) => (
              <button
                key={label}
                type="button"
                onClick={() => addBlock(label.toLowerCase())}
              >
                <span>
                  <Icon size={15} />
                </span>

                <div>
                  <strong>{label}</strong>
                  <small>Agregar al canvas</small>
                </div>

                <Plus size={13} />
              </button>
            ))}
          </div>

          <div className="dbf-separator" />

          <div className="dbf-side-label">PÁGINAS</div>

          <div className="dbf-pages">
            {pages.map((item) => (
              <button
                type="button"
                key={item}
                className={page === item ? "active" : ""}
                onClick={() => setPage(item)}
              >
                <span />
                {item}
              </button>
            ))}
          </div>

          <div className="dbf-side-bottom">
            <span />
            Todos los cambios guardados
          </div>
        </aside>

        <main className="dbf-canvas">
          <div className="dbf-canvas-top">
            <div>
              <span>
                TIENDA / {page.toUpperCase()}
              </span>

              <strong>Constructor visual</strong>
            </div>

            <div className="dbf-canvas-tools">
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

          <div className="dbf-canvas-area">
            <div
              className={`dbf-device dbf-device-${device}`}
            >
              <div className="dbf-browser-bar">
                <span>digitalboost.store</span>
                <span>PREVIEW</span>
              </div>

              <div className="dbf-site">
                <header className="dbf-site-header">
                  <div className="dbf-site-logo">
                    DIGITAL<span>BOOST</span>
                  </div>

                  <nav>
                    <span>Inicio</span>
                    <span>Productos</span>
                    <span>Nosotros</span>
                    <span>Contacto</span>
                  </nav>

                  <button type="button">
                    <ShoppingBag size={15} />
                    <i>2</i>
                  </button>
                </header>

                {blocks.map((block, index) => {
                  const isSelected = selected === block;
                  const key = `${block}-${index}`;

                  return (
                    <section
                      key={key}
                      className={`dbf-block ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => setSelected(block)}
                    >
                      {isSelected && (
                        <div className="dbf-selection">
                          <Sparkles size={11} />
                          Editando bloque
                        </div>
                      )}

                      {index === 0 && (
                        <div className="dbf-main-hero">
                          <div className="dbf-main-hero-copy">
                            <div className="dbf-small-pill">
                              NUEVA COLECCIÓN
                            </div>

                            <h1>
                              Creá algo
                              <br />
                              <span>extraordinario.</span>
                            </h1>

                            <p>
                              Diseñá una tienda con la identidad de
                              tu marca y una experiencia pensada
                              para vender.
                            </p>

                            <div className="dbf-main-buttons">
                              <button type="button">
                                Comprar ahora
                                <ChevronRight size={15} />
                              </button>

                              <button
                                type="button"
                                className="secondary"
                              >
                                Ver colección
                              </button>
                            </div>
                          </div>

                          <div className="dbf-hero-object">
                            <div className="orb orb-1" />
                            <div className="orb orb-2" />

                            <div className="hero-card">
                              <ShoppingBag size={27} />
                              <strong>DROP 01</strong>
                              <span>STUDIO EDITION</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {index === 1 && (
                        <div className="dbf-feature-strip">
                          <div>
                            <strong>Envíos simples</strong>
                            <span>
                              Todo claro desde el primer click.
                            </span>
                          </div>

                          <div>
                            <strong>Checkout seguro</strong>
                            <span>
                              Menos fricción y más conversión.
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

                      {index === 2 && (
                        <div className="dbf-products">
                          <div className="dbf-products-heading">
                            <div>
                              <span>COLECCIÓN</span>
                              <strong>Destacados</strong>
                            </div>

                            <span>Ver todos →</span>
                          </div>

                          <div className="dbf-product-grid">
                            {[1, 2, 3].map((item) => (
                              <article key={item}>
                                <div
                                  className={`dbf-card-image card-${item}`}
                                />
                                <span>Producto destacado</span>
                                <strong>$ 49.900</strong>
                              </article>
                            ))}
                          </div>
                        </div>
                      )}

                      {index >= 3 && (
                        <div className="dbf-story">
                          <span>HISTORIA DE MARCA</span>

                          <h2>
                            Una tienda también puede
                            contar quién sos.
                          </h2>

                          <p>
                            Usá contenido, imágenes y mensajes
                            para convertir tu identidad en una
                            experiencia digital memorable.
                          </p>
                        </div>
                      )}

                      <div className="dbf-block-actions">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeBlock(block);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="dbf-statusbar">
            <span>
              <span className="dot" />
              Edición en vivo
            </span>

            <span>
              {blocks.length} bloques · {page}
            </span>
          </div>
        </main>

        <aside className="dbf-sidebar dbf-right">
          <div className="dbf-panel-heading">
            <div>
              <span>PROPIEDADES</span>
              <strong>Inspector</strong>
            </div>
            <Settings2 size={16} />
          </div>

          <div className="dbf-inspector-selected">
            <div>
              <Sparkles size={15} />
            </div>

            <section>
              <strong>Bloque seleccionado</strong>
              <span>{selected || "Ninguno"}</span>
            </section>
          </div>

          <label className="dbf-field">
            <span>TÍTULO</span>
            <input
              defaultValue={
                selected === "hero"
                  ? "Creá algo extraordinario."
                  : "Nuevo bloque"
              }
            />
          </label>

          <label className="dbf-field">
            <span>DESCRIPCIÓN</span>
            <textarea
              rows={4}
              defaultValue="Diseñá una experiencia moderna para tu tienda."
            />
          </label>

          <div className="dbf-inspector-section">
            <span>PALETA DIGITALBOOST</span>

            <div className="dbf-palette">
              {palette.map((item) => (
                <i
                  key={item.name}
                  className={item.className}
                  title={item.name}
                />
              ))}
            </div>
          </div>

          <div className="dbf-inspector-section">
            <div className="dbf-slider-label">
              <span>Espaciado</span>
              <strong>64 px</strong>
            </div>

            <input
              className="dbf-range"
              type="range"
              min="16"
              max="96"
              defaultValue="64"
            />
          </div>

          <button
            type="button"
            className="dbf-ai"
          >
            <Wand2 size={15} />

            <div>
              <strong>Mejorar con IA</strong>
              <span>Optimizar el bloque seleccionado</span>
            </div>

            <ChevronRight size={14} />
          </button>
        </aside>
      </div>
    </div>
  );
}
