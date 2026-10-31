import "./commerce-performance.css";
import { commercePeriod } from "./commerce/commercePeriod";
import { useOsRange } from "./DigitalBoostOsRangeData";
import { useCommerceLive } from "./commerce/useCommerceLive";
import "./commerce-os-core.css";
import { ArrowRight, BarChart3, Bot, FileText, Package, Pencil, ShoppingBag, Store, Users, Filter } from "lucide-react";

type CommerceOSOverviewProps = {
  onNavigate?: (section: string) => void;
  onPulse?: () => void;
  products?: any[];
  orders?: any[];
  customers?: any[];
  tenantId?: string;
};

function money(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
const asset = (name: string) => `${import.meta.env.BASE_URL}commerce/arcade-pop/${name}.png`;

export default function CommerceOSOverview({ onNavigate, tenantId = "local-tenant" }: CommerceOSOverviewProps) {
  // Preserve the live ledger as the only source of commercial data.
  const range = useOsRange();
  const { snap, binding } = useCommerceLive(tenantId);
  const period = commercePeriod(snap, range);
  const viewOrders = period.orders;
  const viewProducts = snap.products;
  const viewCustomers = period.customers;
  const sales = period.sales;
  const hasOrders = viewOrders.length > 0;
  const hasCustomers = viewCustomers.length > 0;
  const ticket = period.paidCount > 0 && sales !== null ? sales / period.paidCount : null;
  // Conversion and a performance time series are not supplied by this source.
  const metrics = [
    { label: "Ventas", value: sales === null ? "Sin datos" : money(sales), detail: sales === null ? "Ledger vacío." : "Ledger local.", art: "sales", icon: BarChart3, go: "analytics" },
    { label: "Pedidos", value: hasOrders ? String(viewOrders.length) : "Sin datos", detail: hasOrders ? "Datos locales." : "Sin pedidos.", art: "orders", icon: Package, go: "orders" },
    { label: "Clientes", value: hasCustomers ? String(viewCustomers.length) : "Sin datos", detail: hasCustomers ? "Con pedidos en el período." : "Sin clientes con pedidos.", art: "customers", icon: Users, go: "customers" },
    { label: "Conversión", value: "Sin datos", detail: "Sin base.", art: "conversion", icon: Filter, go: "analytics" },
  ];
  const feed = hasOrders ? viewOrders.slice(0, 4) : [];

  return (
    <div data-commerce-os="true" data-commerce-os-core="true" className="commerce-overview">
      <section className="commerce-hero" aria-labelledby="commerce-title">
        <div className="commerce-hero-copy">
          <h1 id="commerce-title">Tu comercio<br /><span>en movimiento.</span></h1>
          <p>Operá, diseñá y publicá desde un solo lugar.</p>
          <div className="commerce-actions">
            <button type="button" className="commerce-button commerce-button-primary" onClick={() => onNavigate?.("website-builder")}><Store size={20} aria-hidden="true" /> Abrir Store Builder <ArrowRight size={18} aria-hidden="true" /></button>
            <button type="button" className="commerce-button" onClick={() => onNavigate?.("marketplace")}><ShoppingBag size={20} aria-hidden="true" /> Abrir Marketplace</button>
            <button type="button" className="commerce-button" onClick={() => onNavigate?.("orders")}><FileText size={20} aria-hidden="true" /> Ver pedidos <ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </div>
        <img className="commerce-hero-art" src={asset("hero")} width="1536" height="1024" alt="" aria-hidden="true" fetchPriority="high" decoding="async" />
      </section>

      <section className="commerce-publication commerce-panel" aria-label="Estado de la tienda">
        <div>
          <p className="commerce-store-state"><span className={binding?.published ? "commerce-dot is-published" : "commerce-dot"} aria-hidden="true" />{binding?.published ? "Publicación previa registrada · no verificada" : binding ? "Borrador local registrado" : "Store · sin publicación verificada"}</p>
          <h2>Experiencia lista para evolucionar</h2>
        </div>
        <button type="button" className="commerce-button" onClick={() => onNavigate?.("website-builder")}><Pencil size={20} aria-hidden="true" /> Editar en el studio <ArrowRight size={18} aria-hidden="true" /></button>
      </section>

      <section className="commerce-metrics" aria-label="Resumen comercial">
        {metrics.map((m) => (
          <button key={m.label} type="button" className={`commerce-metric commerce-metric-${m.art}`} onClick={() => onNavigate?.(m.go)}>
            <div className="commerce-metric-copy">
              <div className="commerce-metric-heading"><m.icon size={23} strokeWidth={2.3} aria-hidden="true" /></div>
              {m.value !== "Sin datos" && <p className="commerce-metric-value">{m.value}</p>}
              <h2 style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 700, letterSpacing: ".08em", marginTop: 8 }}>{m.label}</h2>
              <p className="commerce-metric-detail">{m.detail}</p>
              <span className="commerce-metric-link"><span>Ver {m.label === "Ventas" || m.label === "Conversión" ? "analytics" : m.label.toLowerCase()}</span><span className="commerce-card-arrow" aria-hidden="true"><ArrowRight size={18} /></span></span>
            </div>
            <img src={asset(m.art)} width="1254" height="1254" alt="" aria-hidden="true" loading="lazy" decoding="async" />
          </button>
        ))}
      </section>

      <section className="commerce-performance commerce-panel" aria-labelledby="commerce-performance-title">
        <div className="commerce-panel-heading">
          <h2 id="commerce-performance-title"><BarChart3 size={25} aria-hidden="true" /> Rendimiento</h2>
          <button type="button" className="commerce-button" onClick={() => onNavigate?.("analytics")}><BarChart3 size={20} aria-hidden="true" /> Analytics <ArrowRight size={18} aria-hidden="true" /></button>
        </div>
        <dl className="commerce-performance-stats commerce-performance-summary">
          {metrics.map((m) => (
            <div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>
          ))}
        </dl>
        <dl className="commerce-performance-stats commerce-performance-secondary">
          <div><dt>Ticket promedio</dt><dd>{ticket === null ? "Sin datos" : money(ticket)}</dd></div>
          <div><dt>Productos</dt><dd>{viewProducts.length ? String(viewProducts.length) : "Sin datos"}</dd></div>
        </dl>
        <p className="commerce-period-note">Últimos {period.days} días · registro local · clientes con pedidos en el período.</p>
        {period.paidCount > 0 ? (
          <figure className="commerce-period-chart">
            <figcaption>Ventas de pedidos pagados por fecha de creación (UTC)</figcaption>
            <div className="commerce-period-bars" role="img" aria-label={`Ventas del período: ${money(sales ?? 0)}`}>
              {period.series.map((point) => <div key={point.date} title={`${point.date}: ${money(point.amount)}`} style={{ height: `${Math.max(0, point.amount) / Math.max(1, ...period.series.map(p => p.amount)) * 100}%` }} />)}
            </div>
            <details><summary>Ver valores por día</summary><dl>{period.series.map(point => <div key={point.date}><dt>{point.date}</dt><dd>{money(point.amount)}</dd></div>)}</dl></details>
          </figure>
        ) : <div className="commerce-empty-series"><BarChart3 size={30} aria-hidden="true" /><p>Sin ventas pagadas en este período.</p></div>}
        <p className="commerce-period-note">Conversión pendiente: falta una fuente de sesiones y compras vinculadas.</p>
      </section>

      <div className="commerce-bottom-grid">
        <section className="commerce-pulse" aria-labelledby="commerce-pulse-title">
          <div className="commerce-pulse-copy">
            <p className="commerce-eyebrow"><Bot size={24} aria-hidden="true" /> Pulse Bot</p>
            <h2 id="commerce-pulse-title">Cola operativa de Commerce OS</h2>
            <p>Consultá la cola y los pedidos de tu tienda.</p>
          </div>
          <img className="commerce-pulse-art" src={asset("pulse")} width="1254" height="1254" alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <div className="commerce-actions">
            <button type="button" className="commerce-button commerce-button-primary" onClick={() => onNavigate?.("pulse-bot")}><Bot size={20} aria-hidden="true" /> Abrir cola Pulse Bot <ArrowRight size={18} aria-hidden="true" /></button>
            <button type="button" className="commerce-button" onClick={() => onNavigate?.("orders")}><FileText size={20} aria-hidden="true" /> Ver pedidos del ledger</button>
          </div>
        </section>

        <section className="commerce-activity commerce-panel" aria-labelledby="commerce-activity-title">
          <div className="commerce-panel-heading">
            <h2 id="commerce-activity-title"><FileText size={24} aria-hidden="true" /> Actividad reciente</h2>
            <button type="button" className="commerce-button" onClick={() => onNavigate?.("orders")}>Ver pedidos <ArrowRight size={18} aria-hidden="true" /></button>
          </div>
          {feed.length === 0 ? (
            <div className="commerce-empty-activity"><FileText size={44} aria-hidden="true" /><p>Sin pedidos locales.</p><small>No se muestran datos de demostración.</small></div>
          ) : (
            <div className="commerce-feed">
              {feed.map((o: any) => (
                <button key={o.id} type="button" onClick={() => onNavigate?.("orders")} className="commerce-feed-row">
                  <span><strong>#{o.id}</strong><small>{o.customerId || o.customer || "sin cliente"} · {o.paymentState || o.status || o.state || ""}</small></span>
                  <span className="commerce-feed-amount">{money(Number(o.total?.amount ?? o.total) || 0)}</span><ArrowRight size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
      <footer className="commerce-footer"><span className="commerce-wordmark">Origin<span>X</span><small>Foundation</small></span><span>Commerce OS · Arcade Pop</span></footer>
    </div>
  );
}
