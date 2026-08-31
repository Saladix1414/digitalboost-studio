export type BlockType = "hero" | "features" | "products" | "text" | "cta" | "media";

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
      title: "Por qué Nimbus",
      body: "Envíos simples · Checkout seguro · Soporte humano",
      cta: "",
    },
    products: {
      title: "Destacados",
      body: "Campera Nimbus · Tote Cyan · Hoodie Violet",
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
