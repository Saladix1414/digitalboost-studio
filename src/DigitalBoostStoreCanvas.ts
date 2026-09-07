
export type BlockType = "hero" | "features" | "products" | "text" | "cta" | "media";
export type CanvasBlock = { id: string; type: BlockType; title: string; body: string; cta: string };
export const BLOCK_META: Record<BlockType, { label: string; hint: string }> = {
  hero: { label: "Hero", hint: "Titular + CTA" },
  features: { label: "Section", hint: "Tres pilares" },
  products: { label: "Productos", hint: "Grilla" },
  text: { label: "Text", hint: "Historia" },
  cta: { label: "CTA", hint: "Conversion" },
  media: { label: "Media", hint: "Lookbook" },
};
export function newId() { return "b-" + Math.random().toString(36).slice(2, 9); }
export function defaultBlock(type: BlockType): CanvasBlock {
  const map: Record<BlockType, Omit<CanvasBlock, "id" | "type">> = {
    hero: { title: "La pieza que se explica sola.", body: "Una promesa. Un boton. La coleccion de temporada, sin ruido.", cta: "Entrar" },
    features: { title: "Por que Nimbus", body: "Envios en 48h · Checkout en un paso · Atencion humana", cta: "" },
    products: { title: "Destacados", body: "Campera Nimbus · Tote Cyan · Hoodie Violet", cta: "Ver drop" },
    text: { title: "Una tienda tambien puede contar quien sos.", body: "Menos plantilla, mas voz. Tres bloques bien dichos valen mas que doce genericos.", cta: "" },
    cta: { title: "El drop no espera.", body: "Publica Inicio cuando el hero cierre en tres segundos.", cta: "Publicar tienda" },
    media: { title: "Drop Studio 09", body: "Lookbook en movimiento", cta: "" },
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
  } catch { return seedHome(); }
}
export function saveCanvas(blocks: CanvasBlock[]) {
  try { localStorage.setItem(KEY, JSON.stringify(blocks)); } catch {}
}

export function seedPage(page: string): CanvasBlock[] {
  if (page === "Inicio") return seedHome();
  if (page === "Productos") return [
    { id: newId(), type: "hero", title: "Catalogo Nimbus.", body: "Toda la coleccion en un solo lugar.", cta: "Filtrar" },
    { id: newId(), type: "products", title: "Todos los productos", body: "Campera Nimbus · Tote Cyan · Hoodie Violet", cta: "Ver detalle" }
  ];
  if (page === "Colecciones") return [
    { id: newId(), type: "hero", title: "Colecciones.", body: "Drops y lineas de temporada.", cta: "Explorar" },
    { id: newId(), type: "features", title: "Lineas", body: "Studio · City · Night", cta: "" }
  ];
  if (page === "Nosotros") return [
    { id: newId(), type: "text", title: "Hecho para vender con identidad.", body: "Nimbus es una marca de estudio. Disenamos piezas que se leen bien en una tienda.", cta: "" }
  ];
  return [
    { id: newId(), type: "cta", title: "Escribinos.", body: "Atencion humana, no tickets infinitos.", cta: "Contactar" }
  ];
}
export function loadCanvasPage(page: string): CanvasBlock[] {
  if (typeof localStorage === "undefined") return seedPage(page);
  try {
    const raw = localStorage.getItem(KEY + ":" + page);
    if (!raw) return seedPage(page);
    const parsed = JSON.parse(raw) as CanvasBlock[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedPage(page);
    return parsed;
  } catch { return seedPage(page); }
}
export function saveCanvasPage(page: string, blocks: CanvasBlock[]) {
  try { localStorage.setItem(KEY + ":" + page, JSON.stringify(blocks)); } catch {}
}
