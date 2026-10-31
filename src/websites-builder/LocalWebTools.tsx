import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Download, X } from "lucide-react";
import { getWebsiteHomePage, type WebCanvasBlockSeed, type WebsiteProject } from "../WebsitesBuilderModel";
import { createSvgIconMarkup, createWebsiteExport, createWebsitePageHtml, createWebsiteProjectPreviewHtml, getContrastRatio, LOCAL_WEBSITE_ICONS, type LocalWebsiteTool } from "./LocalWebToolsModel";

type Props = {
  tool: LocalWebsiteTool;
  project: WebsiteProject | null;
  pageId: string;
  blocks: WebCanvasBlockSeed[];
  onSeoChange: (patch: { title?: string; description?: string; indexable?: boolean }) => void;
  onInsertMedia: (asset: { dataUrl: string; kind: "image" | "svg"; alt: string }) => void;
  onFaviconChange: (dataUrl: string) => void;
  onApplyContrast: (foreground: string, background: string) => void;
  onClose: () => void;
};

const TOOL_TITLE: Record<LocalWebsiteTool, string> = {
  "image-optimizer": "Image Optimizer",
  "svg-icons": "SVG & Icons",
  favicon: "Favicon Studio",
  "color-contrast": "Color Contrast",
  "seo-preview": "SEO Preview",
  export: "Export project",
};

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("No se pudo preparar el recurso local."));
    reader.onerror = () => reject(new Error("No se pudo leer el recurso local."));
    reader.readAsDataURL(blob);
  });
}

function ImageUtility({ favicon = false, onInsertMedia, onFaviconChange }: { favicon?: boolean; onInsertMedia: Props["onInsertMedia"]; onFaviconChange: Props["onFaviconChange"] }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [resultFormat, setResultFormat] = useState(favicon ? "png" : "webp");
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [message, setMessage] = useState("");
  const [quality, setQuality] = useState(82);
  const [busy, setBusy] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState("");
  useEffect(() => () => { if (result) URL.revokeObjectURL(result); }, [result]);

  async function process() {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const bitmap = await createImageBitmap(file);
      const max = favicon ? 64 : 1920;
      const scale = favicon
        ? Math.min(max / bitmap.width, max / bitmap.height)
        : Math.min(1, max / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Este navegador no pudo preparar el canvas.");
      if (favicon) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const mime = favicon ? "image/png" : "image/webp";
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("No se pudo generar el archivo.")), mime, quality / 100));
      const outputType = blob.type === "image/webp" ? "webp" : "png";
      const dataUrl = await blobToDataUrl(blob);
      if (dataUrl.length > 1_800_000) throw new Error("El recurso optimizado supera 1,8 MB. Reducí la calidad o el tamaño antes de agregarlo al proyecto.");
      const previous = result;
      const next = URL.createObjectURL(blob);
      setResult(next);
      setResultDataUrl(dataUrl);
      setResultFormat(outputType);
      if (previous) URL.revokeObjectURL(previous);
      setMessage(`${canvas.width} × ${canvas.height}px · ${formatBytes(file.size)} → ${formatBytes(blob.size)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo procesar la imagen.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="db-tool-content">
    <p>El procesamiento ocurre en este navegador. Tu imagen no se sube a ningún servidor.</p>
    <label className="db-tool-label">Imagen<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event: ChangeEvent<HTMLInputElement>) => { setFile(event.target.files?.[0] ?? null); setResult(""); setResultDataUrl(""); setMessage(""); }} /></label>
    {!favicon && <label className="db-tool-label">Calidad WebP · {quality}%<input type="range" min="45" max="95" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label>}
    {file && <button className="db-tool-primary" type="button" disabled={busy} onClick={process}>{busy ? "Procesando…" : favicon ? "Crear favicon PNG 64px" : "Optimizar a WebP"}</button>}
    {message && <div className="db-tool-message" role="status">{message}</div>}
    {result && <a className="db-tool-download" href={result} download={favicon ? "favicon-64.png" : `imagen-optimizada.${resultFormat}`}><Download size={15}/> Descargar {favicon ? "PNG" : resultFormat.toUpperCase()}</a>}
    {resultDataUrl && (favicon
      ? <button className="db-tool-primary" type="button" onClick={() => { onFaviconChange(resultDataUrl); setAppliedMessage("Favicon guardado en el proyecto local."); }}>Usar como favicon del sitio</button>
      : <button className="db-tool-primary" type="button" onClick={() => { onInsertMedia({ dataUrl: resultDataUrl, kind: "image", alt: file?.name.replace(/\.[^.]+$/, "") || "Imagen optimizada" }); setAppliedMessage("Imagen agregada al canvas."); }}>Agregar imagen al canvas</button>)}
    {appliedMessage && <div className="db-tool-message" role="status">{appliedMessage}</div>}
    {result && <img className="db-tool-image-result" src={result} alt="Vista previa del resultado" />}
  </div>;
}

function formatBytes(value: number) {
  return value < 1024 * 1024 ? `${(value / 1024).toFixed(1)} KB` : `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export default function LocalWebTools({ tool, project, pageId, blocks, onSeoChange, onInsertMedia, onFaviconChange, onApplyContrast, onClose }: Props) {
  const [foreground, setForeground] = useState(project?.designTokens.foreground ?? "#17375b");
  const [background, setBackground] = useState(project?.designTokens.background ?? "#ffffff");
  const [iconId, setIconId] = useState<string>(LOCAL_WEBSITE_ICONS[0].id);
  const [iconColor, setIconColor] = useState("#1689e8");
  const [notice, setNotice] = useState("");
  const page = project?.pages.find((entry) => entry.id === pageId)
    ?? (project ? getWebsiteHomePage(project) : null);
  const ratio = useMemo(() => {
    try { return getContrastRatio(foreground, background); } catch { return 0; }
  }, [foreground, background]);
  const svg = useMemo(() => createSvgIconMarkup(iconId, iconColor), [iconId, iconColor]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function exportProject() {
    const payload = createWebsiteExport(project, blocks);
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), "digitalboost-website-project.json");
    setNotice("Exportación JSON generada en este dispositivo.");
  }

  function exportPageHtml() {
    if (!project) return;
    try {
      const output = createWebsitePageHtml(project, pageId, blocks);
      downloadBlob(new Blob([output.html], { type: "text/html;charset=utf-8" }), output.filename);
      setNotice("HTML de la página actual generado localmente.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo generar el HTML.");
    }
  }

  function exportMultipagePreview() {
    if (!project) return;
    try {
      const output = createWebsiteProjectPreviewHtml(project);
      downloadBlob(new Blob([output.html], { type: "text/html;charset=utf-8" }), output.filename);
      setNotice("Vista local multipágina generada. El archivo no se publica ni requiere servidor.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo generar la vista multipágina.");
    }
  }

  async function copySvg() {
    try {
      await navigator.clipboard.writeText(svg);
      setNotice("SVG copiado al portapapeles.");
    } catch {
      downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${iconId}.svg`);
      setNotice("El navegador no permitió copiar; descargué el SVG.");
    }
  }

  return <div className="db-tool-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="db-tool-dialog" role="dialog" aria-modal="true" aria-labelledby="db-tool-title">
      <header className="db-tool-dialog-header"><div><span>SKY WORKSHOP · LOCAL</span><h2 id="db-tool-title">{TOOL_TITLE[tool]}</h2></div><button type="button" className="db-tool-close" aria-label="Cerrar herramienta" onClick={onClose}><X size={18}/></button></header>
      {tool === "image-optimizer" && <ImageUtility onInsertMedia={onInsertMedia} onFaviconChange={onFaviconChange}/>}
      {tool === "favicon" && <ImageUtility favicon onInsertMedia={onInsertMedia} onFaviconChange={onFaviconChange}/>}
      {tool === "color-contrast" && <div className="db-tool-content">
        <p>Comprobá el contraste y aplicá el par accesible al fondo y texto del proyecto. Se conservan los colores de botones e imágenes.</p>
        <div className="db-tool-colors"><label className="db-tool-label">Texto<input type="color" value={foreground} onChange={(event) => setForeground(event.target.value)}/></label><label className="db-tool-label">Fondo<input type="color" value={background} onChange={(event) => setBackground(event.target.value)}/></label></div>
        <div className="db-contrast-sample" style={{ color: foreground, backgroundColor: background }}>Texto de muestra · Aa</div>
        <div className="db-tool-message" role="status"><strong>{ratio.toFixed(2)}:1</strong> · {ratio >= 7 ? "AAA · texto normal" : ratio >= 4.5 ? "AA · texto normal" : ratio >= 3 ? "AA · texto grande" : "No alcanza AA"}</div>
        <button type="button" className="db-tool-primary" disabled={!project || ratio < 4.5} onClick={() => onApplyContrast(foreground, background)}>Aplicar a estilos y secciones de texto</button>
        {ratio < 4.5 && <small>Para aplicar el par, alcanzá al menos 4,5:1 (WCAG AA).</small>}
      </div>}
      {tool === "svg-icons" && <div className="db-tool-content">
        <p>Elegí un ícono vectorial, personalizá el color y copiá o descargá el SVG.</p>
        <label className="db-tool-label">Ícono<select value={iconId} onChange={(event) => setIconId(event.target.value)}>{LOCAL_WEBSITE_ICONS.map((icon) => <option key={icon.id} value={icon.id}>{icon.label}</option>)}</select></label>
        <label className="db-tool-label">Color<input type="color" value={iconColor} onChange={(event) => setIconColor(event.target.value)}/></label>
        <div className="db-svg-preview" dangerouslySetInnerHTML={{ __html: svg }}/>
        <div className="db-tool-actions"><button type="button" className="db-tool-primary" onClick={copySvg}>Copiar SVG</button><button type="button" className="db-tool-secondary" onClick={() => downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${iconId}.svg`)}>Descargar .svg</button><button type="button" className="db-tool-primary" onClick={() => { const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`; onInsertMedia({ dataUrl, kind: "svg", alt: LOCAL_WEBSITE_ICONS.find((icon) => icon.id === iconId)?.label || "Ícono SVG" }); setNotice("SVG agregado al canvas."); }}>Agregar SVG al canvas</button></div>
        <label className="db-tool-label">Código SVG<textarea readOnly rows={4} value={svg}/></label>
      </div>}
      {tool === "seo-preview" && <div className="db-tool-content">
        {page ? <>
          <p>SEO de la página seleccionada. Los cambios se guardan localmente.</p>
          <label className="db-tool-label">Título · {page.seo.title.length}/60<input maxLength={60} value={page.seo.title} onChange={(event) => onSeoChange({ title: event.target.value })}/></label>
          <label className="db-tool-label">Descripción · {page.seo.description.length}/160<textarea maxLength={160} rows={3} value={page.seo.description} onChange={(event) => onSeoChange({ description: event.target.value })}/></label>
          <label className="db-tool-check"><input type="checkbox" checked={page.seo.indexable} onChange={(event) => onSeoChange({ indexable: event.target.checked })}/> Permitir indexación en la configuración del proyecto</label>
          <div className="db-seo-preview"><small>VISTA PREVIA DE BÚSQUEDA · {page.name}</small><strong>{page.seo.title || "Título de la página"}</strong><span>digitalboost.local › {page.slug}</span><p>{page.seo.description || "Agregá una descripción para previsualizar el resultado."}</p></div>
        </> : <div className="db-tool-message">Creá o aplicá un proyecto para preparar la vista previa SEO.</div>}
      </div>}
      {tool === "export" && <div className="db-tool-content">
        <p>Descargá una vista HTML navegable con todas las páginas, una página individual o el JSON del proyecto. Todo se genera en este dispositivo.</p>
        <div className="db-tool-export-summary"><span>Páginas <strong>{project?.pages.length ?? 0}</strong></span><span>Secciones <strong>{blocks.length}</strong></span><span>Formato <strong>JSON</strong></span></div>
        <div className="db-tool-actions">
          <button type="button" className="db-tool-primary" disabled={!project || !project.pages.length} onClick={exportMultipagePreview}><Download size={15}/> Descargar sitio multipágina</button>
          <button type="button" className="db-tool-primary" disabled={!project || !page} onClick={exportPageHtml}><Download size={15}/> Descargar HTML de esta página</button>
          <button type="button" className="db-tool-secondary" onClick={exportProject}><Download size={15}/> Descargar proyecto JSON</button>
        </div>
        {notice && <div className="db-tool-message" role="status">{notice}</div>}
      </div>}
      {(tool === "svg-icons" && notice) && <div className="db-tool-message" role="status">{notice}</div>}
    </section>
  </div>;
}
