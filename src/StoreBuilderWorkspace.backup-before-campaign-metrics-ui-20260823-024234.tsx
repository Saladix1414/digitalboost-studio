import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import ProductInventoryPro from "./ProductInventoryPro";

type StoreSection =
  | "dashboard"
  | "products"
  | "inventory"
  | "orders"
  | "customers"
  | "collections"
  | "marketing"
  | "analytics"
  | "payments"
  | "campaigns"
  | "settings";

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: "Activo" | "Borrador";
  category: string;
};

type Order = {
  id: string;
  customer: string;
  total: number;
  status: string;
  items: number;
  date: string;
};

type Customer = {
  id: number;
  name: string;
  email: string;
  orders: number;
  spent: number;
  lastPurchase: string;
};

const productsSeed: Product[] = [
  {
    id: 1,
    name: "DigitalBoost Hoodie",
    sku: "DB-HOOD-001",
    price: 59.99,
    stock: 42,
    status: "Activo",
    category: "Ropa",
  },
  {
    id: 2,
    name: "Creator Pro Pack",
    sku: "DB-CREATOR-002",
    price: 129,
    stock: 18,
    status: "Activo",
    category: "Digital",
  },
  {
    id: 3,
    name: "Neon Developer Cap",
    sku: "DB-CAP-003",
    price: 34.9,
    stock: 7,
    status: "Activo",
    category: "Ropa",
  },
  {
    id: 4,
    name: "AI Business Template",
    sku: "DB-AI-004",
    price: 79,
    stock: 0,
    status: "Borrador",
    category: "Digital",
  },
];

const ordersSeed: Order[] = [
  {
    id: "#DB-1048",
    customer: "Martín González",
    total: 189.98,
    status: "Pagado",
    items: 3,
    date: "Hoy, 10:42",
  },
  {
    id: "#DB-1047",
    customer: "Sofía Rodríguez",
    total: 59.99,
    status: "En preparación",
    items: 1,
    date: "Hoy, 09:31",
  },
  {
    id: "#DB-1046",
    customer: "Lucas Fernández",
    total: 129,
    status: "Enviado",
    items: 1,
    date: "Ayer, 18:20",
  },
  {
    id: "#DB-1045",
    customer: "Camila Torres",
    total: 94.89,
    status: "Entregado",
    items: 2,
    date: "Ayer, 15:08",
  },
];

const customersSeed: Customer[] = ordersSeed.map((order, index) => ({
  id: index + 1,
  name: order.customer,
  email:
    order.customer
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .replace(/\\s+/g, ".") + "@cliente.digitalboost",
  orders: 1,
  spent: order.total,
  lastPurchase: order.date,
}));

const navItems: {
  id: StoreSection;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
  { id: "products", label: "Productos", icon: Package },
  { id: "inventory", label: "Inventario", icon: Boxes },
  { id: "orders", label: "Pedidos", icon: ClipboardList },
  { id: "campaigns", label: "Campañas", icon: Megaphone },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "collections", label: "Colecciones", icon: ShoppingBag },
  { id: "marketing", label: "Marketing", icon: Zap },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "payments", label: "Pagos", icon: CircleDollarSign },
];

export default function StoreBuilderWorkspace({
  onBack,
}: {
  onBack: () => void;
}) {
  const [section, setSection] = useState<StoreSection>(() => {
    try {
      const saved = localStorage.getItem("digitalboost_store_section");

      const validSections: StoreSection[] = [
        "dashboard",
        "products",
        "inventory",
        "orders",
        "customers",
        "collections",
        "marketing",
        "analytics",
        "payments",
        "campaigns",
        "settings",
      ];

      if (saved && validSections.includes(saved as StoreSection)) {
        return saved as StoreSection;
      }

      return "dashboard";
    } catch {
      return "dashboard";
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "digitalboost_store_section",
      section
    );
  }, [section]);
  const [products, setProducts] = useState(productsSeed);
  const [orders, setOrders] = useState(ordersSeed);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [aiOrderId, setAiOrderId] = useState<string | null>(null);
  const [customers] = useState(customersSeed);
  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState<
    "all" | "high-value" | "repeat" | "inactive"
  >("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [aiCustomerId, setAiCustomerId] = useState<number | null>(null);
  const [productFilter, setProductFilter] = useState<"all" | "active" | "draft" | "low">("all");
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>("");
  const [aiAction, setAiAction] = useState<string>("");
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [campaignCreated, setCampaignCreated] = useState(false);
  const [campaignName, setCampaignName] = useState("Recuperá tu carrito ⚡");
  const [campaignAudience, setCampaignAudience] = useState(
    "Clientes que abandonaron el checkout durante las últimas 48 horas"
  );
  const [campaignDiscount, setCampaignDiscount] = useState("10");

  type Campaign = {
    id: number;
    name: string;
    audience: string;
    discount: number;
    status: "Activa" | "Pausada";
    source: string;
    sequence: string[];
    reach: number;
    recoveredCarts: number;
    conversions: number;
    revenue: number;
  };

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem("digitalboost_campaigns");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [campaignToDelete, setCampaignToDelete] =
    useState<Campaign | null>(null);

  useEffect(() => {
    localStorage.setItem(
      "digitalboost_campaigns",
      JSON.stringify(campaigns)
    );
  }, [campaigns]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    price: "49",
    stock: "25",
    category: "Digital",
    status: "Borrador" as "Activo" | "Borrador",
  });

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);

      const matchesFilter =
        productFilter === "all" ||
        (productFilter === "active" && product.status === "Activo") ||
        (productFilter === "draft" && product.status === "Borrador") ||
        (productFilter === "low" && product.stock < 10);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, productFilter]);

  const resetProductForm = () => {
    setProductForm({
      name: "",
      sku: "",
      price: "49",
      stock: "25",
      category: "Digital",
      status: "Borrador",
    });
  };

  const openNewProduct = () => {
    resetProductForm();
    setEditingProduct(null);
    setShowAddProduct(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      status: product.status,
    });
    setShowAddProduct(true);
  };

  const saveProduct = () => {
    const name = productForm.name.trim();

    if (!name) {
      alert("⚠️ El producto necesita un nombre.");
      return;
    }

    const price = Number(productForm.price);
    const stock = Number(productForm.stock);

    if (!Number.isFinite(price) || price < 0) {
      alert("⚠️ Introducí un precio válido.");
      return;
    }

    if (!Number.isFinite(stock) || stock < 0) {
      alert("⚠️ Introducí un stock válido.");
      return;
    }

    const sku =
      productForm.sku.trim() ||
      `DB-${Date.now().toString().slice(-6)}`;

    if (editingProduct) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                name,
                sku,
                price,
                stock,
                category: productForm.category,
                status: productForm.status,
              }
            : product
        )
      );
    } else {
      setProducts((current) => [
        ...current,
        {
          id: Date.now(),
          name,
          sku,
          price,
          stock,
          category: productForm.category,
          status: productForm.status,
        },
      ]);
    }

    setShowAddProduct(false);
    setEditingProduct(null);
    resetProductForm();
    setSection("products");
  };

  const runAIAction = (prompt: string) => {
    setAiAction(prompt);
    setAiLoading(true);
    setAiResult("");

    window.setTimeout(() => {
      let result = "";

      if (prompt === "Analiza este cliente" && aiCustomerId !== null) {
        const customer = customers.find(
          (item) => item.id === aiCustomerId
        );

        if (!customer) {
          result =
            "👤 Análisis de cliente\\n\\n" +
            "No se pudo encontrar la información de este cliente.";
        } else {
          const customerOrders = orders.filter(
            (order) => order.customer === customer.name
          );

          const averageOrder =
            customerOrders.length > 0
              ? customer.spent / customerOrders.length
              : 0;

          const currency = new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
          });

          const status = customer.lastPurchase.startsWith("Hoy")
            ? "Activo"
            : "Histórico";

          result =
            "👤 Análisis de cliente\n\n" +
            `Cliente: ${customer.name}\n` +
            `💰 Gasto acumulado: ${currency.format(customer.spent)}\n` +
            `🛒 Pedidos: ${customer.orders}\n` +
            `📈 Ticket promedio: ${currency.format(averageOrder)}\n` +
            `📅 Última compra: ${customer.lastPurchase}\n` +
            `🟢 Estado: ${status}\n\n` +
            (customer.orders > 1
              ? "💡 Oportunidad: este cliente ya volvió a comprar, lo que indica un buen potencial de fidelización.\n\n" +
                "🎯 Próxima acción: ofrecer un producto complementario o una promoción personalizada para incentivar la próxima compra."
              : customer.spent >= 100
              ? "💡 Oportunidad: es un cliente de alto valor con potencial para realizar una nueva compra.\n\n" +
                "🎯 Próxima acción: ofrecer un producto complementario o una promoción exclusiva basada en su compra."
              : "💡 Oportunidad: esta fue una primera compra y todavía hay margen para convertir al cliente en recurrente.\n\n" +
                "🎯 Próxima acción: preparar una oferta de seguimiento que incentive una segunda compra.");
        }
      } else if (prompt === "Analiza este pedido" && aiOrderId !== null) {
        const order = orders.find((item) => item.id === aiOrderId);

        if (!order) {
          result =
            "🧾 Análisis de pedido\n\n" +
            "No se pudo encontrar la información de este pedido.";
        } else {
          const currency = new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
          });

          const customer = customers.find(
            (item) => item.name === order.customer
          );

          const customerHistory = customer
            ? `Cliente: ${customer.name}\n` +
              `💰 Gasto acumulado: ${currency.format(customer.spent)}\n` +
              `🛒 Pedidos del cliente: ${customer.orders}`
            : `Cliente: ${order.customer}`;

          result =
            "🧾 Análisis del pedido\n\n" +
            `Pedido: ${order.id}\n` +
            `${customerHistory}\n` +
            `📦 Productos: ${order.items}\n` +
            `💰 Total: ${currency.format(Number(order.total || 0))}\n` +
            `📅 Fecha: ${order.date}\n` +
            `📌 Estado: ${order.status}\n\n` +
            (order.status === "Pagado"
              ? `💡 Oportunidad: el pedido está pagado y corresponde a ${order.items} producto${order.items === 1 ? "" : "s"}. Es un buen momento para asegurar una preparación y entrega sin inconvenientes.\n\n` +
                "🎯 Próxima acción: preparar el pedido y mantener el seguimiento hasta que pase a despacho."
              : order.status === "En preparación"
                ? `💡 Oportunidad: el pedido está siendo preparado y el cliente ya completó el pago.\n\n` +
                  "🎯 Próxima acción: completar la preparación y actualizar el estado cuando el pedido sea despachado."
                : order.status === "Enviado"
                  ? `💡 Oportunidad: el pedido ya fue despachado y ahora la prioridad es asegurar una entrega exitosa.\n\n` +
                    "🎯 Próxima acción: hacer seguimiento del envío y preparar una comunicación posterior a la entrega."
                  : `💡 Oportunidad: el pedido ya fue entregado. Este es un buen momento para transformar una compra completada en una próxima oportunidad comercial.\n\n` +
                    "🎯 Próxima acción: agradecer la compra y ofrecer un producto complementario relacionado con el pedido.");
        }
      } else if (prompt === "Analiza mis ventas") {
        const totalSales = orders.reduce(
          (sum, order) => sum + Number(order.total || 0),
          0
        );

        const orderCount = orders.length;

        const averageOrder =
          orderCount > 0 ? totalSales / orderCount : 0;

        const bestOrder = orders.reduce(
          (best, order) =>
            Number(order.total || 0) > Number(best?.total || 0)
              ? order
              : best,
          orders[0]
        );

        const currency = new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 2,
        });

        result =
          "📊 Análisis de ventas\n\n" +
          `💰 Ventas registradas: ${currency.format(totalSales)}\n` +
          `🛒 Pedidos: ${orderCount}\n` +
          `📈 Ticket promedio: ${currency.format(averageOrder)}\n\n` +
          (bestOrder
            ? `🏆 Pedido de mayor valor: ${bestOrder.id} — ${currency.format(Number(bestOrder.total || 0))}\n\n`
            : "") +
          "💡 Oportunidad: los pedidos de mayor valor pueden indicar qué clientes y productos tienen mayor potencial comercial.\n\n" +
          "🎯 Próxima acción: priorizar los clientes de mayor valor y crear campañas específicas para aumentar la recompra y el ticket promedio.";
      } else if (prompt === "¿Qué productos necesitan reposición?") {
        const lowStock = products
          .filter((product) => Number(product.stock) < 10)
          .sort((a, b) => Number(a.stock) - Number(b.stock));

        if (lowStock.length === 0) {
          result =
            "📦 Análisis de inventario\n\n" +
            "No hay productos con stock bajo en este momento.\n\n" +
            "🟢 Situación: el inventario se encuentra dentro de un nivel saludable.\n\n" +
            "🎯 Próxima acción: mantener el seguimiento de stock y revisar periódicamente los productos con mayor rotación.";
        } else {
          const critical = lowStock.filter(
            (product) => Number(product.stock) <= 2
          );
          const attention = lowStock.filter(
            (product) => Number(product.stock) >= 3
          );

          const inventoryLines = lowStock
            .map((product) => {
              const stock = Number(product.stock);
              const priority =
                stock <= 2
                  ? "🔴 Crítico"
                  : "🟠 Stock bajo";

              return `• ${product.name} · SKU ${product.sku}: ${stock} unidades · ${priority}`;
            })
            .join("\n");

          result =
            "📦 Análisis de inventario\n\n" +
            `${lowStock.length} ${lowStock.length === 1 ? "producto necesita" : "productos necesitan"} atención.\n\n` +
            inventoryLines +
            "\n\n" +
            `🔴 Críticos: ${critical.length} · 🟠 Stock bajo: ${attention.length}\n\n` +
            (critical.length > 0
              ? "⚡ Prioridad: reponer primero los productos en nivel crítico para evitar quiebres de stock.\n\n"
              : "⚡ Prioridad: programar la reposición de los productos con menor stock antes de que lleguen a un nivel crítico.\n\n") +
            "🎯 Próxima acción: revisar la rotación de estos productos y definir una cantidad de reposición adecuada.";
        }
      } else if (prompt === "Crea una campaña para recuperar carritos") {
        result =
          "🛒 Campaña de recuperación propuesta\n\n" +
          "Nombre: Recuperá tu carrito ⚡\n\n" +
          "Segmento: clientes que abandonaron el checkout durante las últimas 48 horas.\n\n" +
          "Incentivo recomendado: 10% de descuento durante 24 horas.\n\n" +
          "📈 Objetivo estimado: recuperar parte de las ventas perdidas sin aplicar descuentos a toda la base de clientes.";
      } else if (prompt === "¿Cómo puedo aumentar mi conversión?") {
        result =
          "🚀 Plan para aumentar conversión\n\n" +
          "1. Mejorar las imágenes de los productos principales.\\n" +
          "2. Mostrar beneficios y garantías directamente junto al precio.\\n" +
          "3. Agregar prueba social y reseñas.\\n" +
          "4. Recuperar carritos abandonados automáticamente.\\n" +
          "5. Crear una oferta específica para visitantes recurrentes.\n\n" +
          "🎯 Prioridad recomendada: optimizar primero la página del producto con mayor tráfico.";
      } else {
        result =
          "🤖 Analicé la solicitud y preparé una recomendación para tu tienda.";
      }

      setAiResult(result);
      setAiLoading(false);

      if (prompt === "Crea una campaña para recuperar carritos") {
        setShowCampaignBuilder(true);
        setCampaignCreated(false);
      }
    }, 900);
  };

  const deleteProduct = (product: Product) => {
    const confirmed = window.confirm(
      `¿Eliminar "${product.name}" del catálogo?`
    );

    if (!confirmed) return;

    setProducts((current) =>
      current.filter((item) => item.id !== product.id)
    );
  };


  const renderDashboard = () => (
    <div className="space-y-6">
      <PageTitle
        title="Resumen de tu tienda"
        subtitle="Todo lo importante de tu negocio en un solo lugar."
        action={
          <button
            onClick={() => setShowAI(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 px-4 py-2.5 text-sm font-bold shadow-lg"
          >
            <Sparkles size={16} />
            AI Store Operator
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Ventas" value="$12.480" change="+21.4%" />
        <Metric title="Pedidos" value="148" change="+14.2%" />
        <Metric title="Clientes" value="428" change="+12.8%" />
        <Metric title="Conversión" value="4.82%" change="+0.7%" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Ventas recientes">
          <div className="h-64">
            <div className="flex h-full items-end gap-3 px-2 pb-4">
              {[42, 55, 38, 72, 61, 84, 70, 94, 78, 108, 92, 118].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-violet-700/30 to-cyan-400"
                    style={{ height: `${height / 1.2}%` }}
                  />
                )
              )}
            </div>
          </div>
        </Panel>

        <Panel title="AI Store Operator">
          <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">
            <div className="flex gap-3">
              <div className="rounded-lg bg-violet-500/20 p-2 text-violet-300">
                <Sparkles size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Detecté una oportunidad
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Tu Hoodie tiene mucho tráfico pero su conversión cayó un
                  12%. Puedo preparar una campaña promocional.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setAiCustomerId(customer.id);
                setAiAction("");
                setAiResult("");
                setShowAI(true);
              }}
              className="mt-4 w-full rounded-lg border border-violet-400/30 px-3 py-2 text-xs font-semibold hover:bg-violet-500/10"
            >
              Analizar oportunidad
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <Insight
              title="Stock bajo"
              text="3 productos necesitan reposición."
            />
            <Insight
              title="Carritos abandonados"
              text="12 clientes podrían recuperarse."
            />
            <Insight
              title="Producto destacado"
              text="Creator Pro Pack creció 28%."
            />
          </div>
        </Panel>
      </div>

      <Panel title="Pedidos recientes">
        <OrderTable orders={orders.slice(0, 4)} />
      </Panel>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">

      <PageTitle
        title="Productos"
        subtitle="Administra catálogo, precios, estados e inventario desde un solo lugar."
        action={
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 px-4 py-2.5 text-sm font-bold"
          >
            <Plus size={16} />
            Añadir producto
          </button>
        }
      />

      <ProductInventoryPro
        products={products.map((product) => ({
          ...product,
          comparePrice: product.price,
          lowStock: 10,
          description: "",
        }))}
        onChange={(updated) => {
          setProducts(
            updated.map((product) => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              price: product.price,
              stock: product.stock,
              status: product.status,
              category: product.category,
            }))
          );
        }}
      />

    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <PageTitle
        title="Inventario"
        subtitle="Controla stock, disponibilidad y reposición."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Unidades disponibles" value="1.284" />
        <Metric title="Stock bajo" value="3" />
        <Metric title="Agotados" value="1" />
      </div>

      <Panel title="Estado del inventario">
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg border border-white/[.07] bg-[#070d18] p-4"
            >
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {product.sku}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">{product.stock} unidades</div>
                <div className="text-xs text-slate-500">
                  {product.stock < 10 ? "Requiere atención" : "Disponible"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );

  const advanceOrderStatus = (orderId: string) => {
    const statusFlow = [
      "Pagado",
      "En preparación",
      "Enviado",
      "Entregado",
    ];

    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== orderId) {
          return order;
        }

        const currentIndex = statusFlow.indexOf(order.status);

        if (currentIndex < 0 || currentIndex >= statusFlow.length - 1) {
          return order;
        }

        return {
          ...order,
          status: statusFlow[currentIndex + 1],
        };
      })
    );
  };

  const renderOrderProfile = () => {
    const order = orders.find((item) => item.id === selectedOrderId);

    if (!order) {
      setSelectedOrderId(null);
      return null;
    }

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedOrderId(null)}
          className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a Pedidos
        </button>

        <PageTitle
          title={order.id}
          subtitle="Detalle y seguimiento del pedido."
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Metric
            title="Cliente"
            value={order.customer}
          />
          <Metric
            title="Total"
            value={`$${order.total.toFixed(2)}`}
          />
          <Metric
            title="Productos"
            value={String(order.items)}
          />
          <Metric
            title="Estado"
            value={order.status}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Información del pedido">
            <div className="space-y-4 p-5">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Pedido
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-200">
                  {order.id}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Cliente
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  {order.customer}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Fecha
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {order.date}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Estado
                </p>
                <span className="mt-1 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 text-[11px] text-emerald-300">
                  {order.status}
                </span>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Total
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-300">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Seguimiento">
            <div className="p-5">
              <div className="space-y-4">
                {[
                  "Pagado",
                  "En preparación",
                  "Enviado",
                  "Entregado",
                ].map((step, index) => {
                  const steps = [
                    "Pagado",
                    "En preparación",
                    "Enviado",
                    "Entregado",
                  ];

                  const currentIndex = steps.indexOf(order.status);
                  const isCompleted =
                    currentIndex >= 0 && index <= currentIndex;
                  const isCurrent = order.status === step;

                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                          isCompleted
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : "border-white/10 bg-white/[.02] text-slate-600"
                        }`}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-sm ${
                            isCurrent
                              ? "font-semibold text-white"
                              : isCompleted
                                ? "text-slate-300"
                                : "text-slate-600"
                          }`}
                        >
                          {step}
                        </p>

                        {isCurrent && (
                          <p className="mt-0.5 text-[11px] text-violet-300">
                            Estado actual
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {order.status !== "Entregado" && (
                <button
                  onClick={() => advanceOrderStatus(order.id)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/5 px-4 py-2.5 text-xs font-medium text-violet-200 transition hover:bg-violet-500/10"
                >
                  {order.status === "Pagado"
                    ? "Pasar a En preparación"
                    : order.status === "En preparación"
                      ? "Marcar como Enviado"
                      : "Marcar como Entregado"}
                  <ChevronRight size={14} />
                </button>
              )}

              <div className="mt-5 rounded-xl border border-white/[.07] bg-[#030711] p-4">
                <p className="text-sm font-medium text-slate-200">
                  {order.items} producto{order.items === 1 ? "" : "s"} en este pedido
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Este pedido está asociado a {order.customer}. Desde aquí
                  podrás consultar su estado y las próximas acciones del AI
                  Store Operator.
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="AI Store Operator">
            <div className="p-5">
              <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-violet-500/15 p-2 text-violet-300">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Análisis del pedido
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Analizá este pedido con AI Store Operator.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-6 text-slate-400">
                  El AI Operator podrá analizar el valor, cliente, productos,
                  estado y fecha del pedido para detectar oportunidades y
                  recomendar acciones.
                </p>

                <button
                  onClick={() => {
                    setAiOrderId(order.id);
                    setAiCustomerId(null);
                    setAiResult("");
                    setAiAction("");
                    setShowAI(true);
                  }}
                  className="mt-4 flex items-center gap-2 rounded-lg border border-violet-400/30 px-4 py-2 text-xs text-violet-200 transition hover:bg-violet-500/10"
                >
                  <Sparkles size={14} />
                  Analizar con AI Operator
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    if (selectedOrderId !== null) {
      return renderOrderProfile();
    }

    return (
      <div className="space-y-6">
        <PageTitle
          title="Pedidos"
          subtitle="Gestiona pagos, preparación, envíos y devoluciones."
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Metric title="Todos" value="148" />
          <Metric title="Pagados" value="121" />
          <Metric title="Preparando" value="14" />
          <Metric title="Enviados" value="13" />
        </div>

        <Panel>
          <OrderTable
            orders={orders}
            onSelectOrder={(order) => setSelectedOrderId(order.id)}
          />
        </Panel>
      </div>
    );
  };

  const renderCustomers = () => {
    if (selectedCustomerId !== null) {
      return renderCustomerProfile();
    }

    const normalizedSearch = customerSearch.trim().toLowerCase();

    const filteredCustomers = customers.filter((customer) => {
      const matchesSearch =
        !normalizedSearch ||
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.email.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        customerFilter === "all" ||
        (customerFilter === "high-value" && customer.spent >= 100) ||
        (customerFilter === "repeat" && customer.orders > 1) ||
        (customerFilter === "inactive" && !customer.lastPurchase.startsWith("Hoy"));

      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6">
        <PageTitle
          title="Clientes"
          subtitle="Compradores y actividad de tu tienda."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Metric
            title="Clientes"
            value={String(customers.length)}
          />
          <Metric
            title="Pedidos"
            value={String(orders.length)}
          />
          <Metric
            title="Facturación"
            value={`$${customers
              .reduce((total, customer) => total + customer.spent, 0)
              .toFixed(2)}`}
          />
        </div>

        <Panel title="Clientes registrados">
          <div className="border-b border-white/[.07] p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder="Buscar cliente..."
                className="w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/40"
              />

              <select
                value={customerFilter}
                onChange={(event) =>
                  setCustomerFilter(
                    event.target.value as
                      | "all"
                      | "high-value"
                      | "repeat"
                      | "inactive"
                  )
                }
                className="rounded-lg border border-white/10 bg-[#030711] px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-violet-400/40"
              >
                <option value="all">Todos</option>
                <option value="high-value">Alto valor</option>
                <option value="repeat">Recurrentes</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ["all", "Todos"],
                ["high-value", "Alto valor"],
                ["repeat", "Recurrentes"],
                ["inactive", "Inactivos"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setCustomerFilter(
                      value as
                        | "all"
                        | "high-value"
                        | "repeat"
                        | "inactive"
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    customerFilter === value
                      ? "bg-violet-500/20 text-violet-200"
                      : "border border-white/10 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No encontramos clientes con esos criterios.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[.07] text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Cliente</th>
                    <th className="px-5 py-3">Pedidos</th>
                    <th className="px-5 py-3">Gastado</th>
                    <th className="px-5 py-3">Última compra</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className="cursor-pointer border-b border-white/[.05] transition hover:bg-white/[.025] last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-200">
                          {customer.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {customer.email}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {customer.orders}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-emerald-300">
                        ${customer.spent.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-400">
                        {customer.lastPurchase}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-white/[.07] px-5 py-3 text-xs text-slate-500">
            Mostrando {filteredCustomers.length} de {customers.length} clientes
          </div>
        </Panel>
      </div>
    );
  };

  const renderCustomerProfile = () => {
    const customer = customers.find(
      (item) => item.id === selectedCustomerId
    );

    if (!customer) {
      setSelectedCustomerId(null);
      return null;
    }

    const customerOrders = orders.filter(
      (order) => order.customer === customer.name
    );

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCustomerId(null)}
          className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a Clientes
        </button>

        <PageTitle
          title={customer.name}
          subtitle="Perfil y actividad del cliente."
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Metric
            title="Pedidos"
            value={String(customer.orders)}
          />
          <Metric
            title="Gastado"
            value={`$${customer.spent.toFixed(2)}`}
          />
          <Metric
            title="Última compra"
            value={customer.lastPurchase}
          />
          <Metric
            title="Estado"
            value={
              customer.lastPurchase.startsWith("Hoy")
                ? "Activo"
                : "Histórico"
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="Datos del cliente">
            <div className="space-y-4 p-5">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Nombre
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  {customer.name}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 break-all text-sm text-slate-300">
                  {customer.email}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Actividad">
            <div className="p-5">
              {customerOrders.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Todavía no hay pedidos asociados.
                </p>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-white/[.07] bg-[#030711] p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {order.id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.date} · {order.items} producto
                          {order.items === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-300">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          <Panel title="AI Store Operator">
            <div className="p-5">
              <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-violet-500/15 p-2 text-violet-300">
                    <Sparkles size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Análisis del cliente
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Preparado para automatizaciones futuras.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-6 text-slate-400">
                  El AI Operator podrá analizar el historial de este cliente,
                  detectar oportunidades de recompra y recomendar campañas
                  personalizadas.
                </p>

                <button
                  onClick={() => {
                    setAiCustomerId(customer.id);
                    setAiAction("Analiza este cliente");
                    setAiResult("");
                    setShowAI(true);
                  }}
                  className="mt-4 flex items-center gap-2 rounded-lg border border-violet-400/30 px-4 py-2 text-xs text-violet-200 transition hover:bg-violet-500/10"
                >
                  <Sparkles size={14} />
                  Analizar con AI Operator
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    );
  };

  const renderGeneric = () => {
    const current = navItems.find((item) => item.id === section);

    return (
      <div className="space-y-6">
        <PageTitle
          title={current?.label || "Store Builder"}
          subtitle="Módulo preparado para gestión avanzada."
        />

        <Panel>
          <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5 text-violet-300">
              {current && React.createElement(current.icon, { size: 32 })}
            </div>

            <h3 className="mt-5 text-xl font-semibold">
              {current?.label}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Este módulo forma parte del entorno completo de DigitalBoost
              Store y será conectado con datos, automatizaciones y AI Store
              Operator.
            </p>

            <button
              onClick={() => setShowAI(true)}
              className="mt-6 flex items-center gap-2 rounded-lg border border-violet-400/30 px-5 py-2.5 text-sm hover:bg-violet-500/10"
            >
              <Sparkles size={15} />
              Preguntar al AI Store Operator
            </button>
          </div>
        </Panel>
      </div>
    );
  };

  const toggleCampaignStatus = (campaignId: number) => {
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              status: campaign.status === "Activa" ? "Pausada" : "Activa",
            }
          : campaign
      )
    );
  };

  const deleteCampaign = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
  };

  const confirmDeleteCampaign = () => {
    if (!campaignToDelete) return;

    setCampaigns((current) =>
      current.filter((item) => item.id !== campaignToDelete.id)
    );

    setCampaignToDelete(null);
  };

  const renderCampaigns = () => (
    <div className="space-y-6">
      {campaignToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#070b14] p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-500/10 p-2.5 text-red-300">
                <Trash2 size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  Eliminar campaña
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  ¿Querés eliminar{" "}
                  <span className="font-medium text-slate-200">
                    "{campaignToDelete.name}"
                  </span>
                  ?
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCampaignToDelete(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Cancelar
              </button>

              <button
                onClick={confirmDeleteCampaign}
                className="rounded-lg bg-red-500/90 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-400"
              >
                Eliminar campaña
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <p className="text-lg font-semibold">Campañas</p>
        <p className="mt-1 text-sm text-slate-500">
          Campañas creadas por el AI Store Operator.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <Panel title="Campañas activas">
          <div className="p-6 text-center">
            <Megaphone size={28} className="mx-auto text-slate-500" />
            <p className="mt-3 text-sm text-slate-300">
              Todavía no hay campañas creadas.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Creá una campaña desde el AI Store Operator.
            </p>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Panel key={campaign.id} title={campaign.name}>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      campaign.status === "Activa"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    {campaign.status}
                  </span>

                  <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] text-violet-300">
                    {campaign.source}
                  </span>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => toggleCampaignStatus(campaign.id)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-slate-300 transition hover:bg-white/5"
                    >
                      {campaign.status === "Activa" ? "Pausar" : "Activar"}
                    </button>

                    <button
                      onClick={() => deleteCampaign(campaign)}
                      className="rounded-lg border border-red-400/20 px-3 py-1.5 text-[11px] text-red-300 transition hover:bg-red-500/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-xs text-slate-400 md:grid-cols-2">
                  <div>
                    <p className="text-[11px] text-slate-500">Audiencia</p>
                    <p className="mt-1 text-slate-300">{campaign.audience}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-500">Descuento</p>
                    <p className="mt-1 text-slate-300">{campaign.discount}%</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-white/10 bg-[#030711] p-3">
                  <p className="text-[11px] font-medium text-slate-300">
                    Secuencia automática
                  </p>

                  <div className="mt-2 space-y-1.5 text-[11px] text-slate-500">
                    {campaign.sequence.map((step) => (
                      <p key={step}>⏱️ {step}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case "dashboard":
        return renderDashboard();
      case "products":
        return renderProducts();
      case "inventory":
        return renderInventory();
      case "orders":
        return renderOrders();
      case "customers":
        return renderCustomers();
      case "campaigns":
        return renderCampaigns();
      default:
        return renderGeneric();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#02050d] text-white">
      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-white/[.07] bg-[#030711] transition-transform lg:relative lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-white/[.07] px-5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-black"
          >
            <div className="rounded-lg bg-gradient-to-br from-violet-600 to-cyan-400 p-2">
              <Store size={18} />
            </div>

            <div>
              DIGITAL<span className="text-cyan-400">BOOST</span>
              <div className="text-[9px] font-medium tracking-widest text-slate-500">
                STORE
              </div>
            </div>
          </button>

          <button
            onClick={() => setMobileMenu(false)}
            className="lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 py-5">
          <button
            onClick={() => setSection("dashboard")}
            className="mb-4 flex w-full items-center justify-between rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-cyan-400/10 p-2">
                <ShoppingBag size={16} className="text-cyan-300" />
              </div>

              <div>
                <div className="text-xs font-semibold">Mi tienda</div>
                <div className="text-[10px] text-emerald-400">
                  ● Online
                </div>
              </div>
            </div>

            <ChevronRight size={14} className="text-slate-500" />
          </button>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSection(item.id);
                    setMobileMenu(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    section === item.id
                      ? "bg-violet-500/10 text-white"
                      : "text-slate-400 hover:bg-white/[.03] hover:text-white"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto border-t border-white/[.07] p-3">
          <button
            onClick={() => setSection("settings")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-white/[.03] hover:text-white"
          >
            <Settings size={17} />
            Configuración
          </button>

          <button
            onClick={onBack}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-white/[.03] hover:text-white"
          >
            <ArrowLeft size={17} />
            Volver a DigitalBoost
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[.07] bg-[#02050d]/95 px-4 backdrop-blur-xl lg:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/[.05] lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="text-sm font-semibold">
                {navItems.find((item) => item.id === section)?.label ||
                  "Configuración"}
              </div>

              <div className="text-[10px] text-slate-500">
                DigitalBoost Store
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAI(true)}
              className="hidden items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-500/5 px-3 py-2 text-xs text-violet-300 sm:flex"
            >
              <Sparkles size={14} />
              AI Operator
            </button>

            <button className="rounded-lg p-2 text-slate-400 hover:bg-white/[.05]">
              <Bell size={18} />
            </button>

            <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold sm:flex">
              DB
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] p-4 md:p-7">
            {renderSection()}
          </div>
        </div>
      </main>

      {showAI && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-violet-400/20 bg-[#070d18] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[.07] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/10 p-2 text-violet-300">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    AI Store Operator
                    {aiCustomerId !== null && " · Cliente"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tu asistente inteligente de ecommerce
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAI(false);
                  setAiCustomerId(null);
                  setAiAction("");
                  setAiResult("");
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              {[
                ...(aiCustomerId !== null
                  ? ["Analiza este cliente"]
                  : []),
                ...(aiOrderId !== null
                  ? ["Analiza este pedido"]
                  : []),
                "Analiza mis ventas",
                "¿Qué productos necesitan reposición?",
                "Crea una campaña para recuperar carritos",
                "¿Cómo puedo aumentar mi conversión?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => runAIAction(prompt)}
                  disabled={aiLoading}
                  className="flex w-full items-center justify-between rounded-lg border border-white/[.07] bg-[#030711] p-3 text-left text-sm transition hover:border-violet-400/30 disabled:cursor-wait disabled:opacity-60"
                >
                  <span>{prompt}</span>
                  <ChevronRight size={15} className="text-slate-500" />
                </button>
              ))}
            </div>

            {(aiLoading || aiResult) && (
              <div className="border-t border-white/[.07] p-5">
                <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-lg bg-violet-500/15 p-2 text-violet-300">
                      <Sparkles size={16} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {aiLoading
                          ? "Analizando los datos..."
                          : "Inteligencia operativa"}
                      </p>

                      {aiAction && !aiLoading && (
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {aiAction}
                        </p>
                      )}
                    </div>
                  </div>

                  {aiLoading ? (
                    <div className="space-y-2">
                      <div className="h-2 animate-pulse rounded bg-white/10" />
                      <div className="h-2 w-5/6 animate-pulse rounded bg-white/10" />
                      <div className="h-2 w-4/6 animate-pulse rounded bg-white/10" />
                    </div>
                  ) : (
                    <div className="whitespace-pre-line text-xs leading-6 text-slate-300">
                      {aiResult.replace(/\\\\n/g, "\n")}
                    </div>
                  )}

                  {!aiLoading && aiResult && (
                    <button
                      onClick={() => {
                        setAiResult("");
                        setAiAction("");
                      }}
                      className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/5"
                    >
                      Nueva consulta
                    </button>
                  )}
                </div>
              </div>
            )}

            {showCampaignBuilder && (
              <div className="border-t border-white/[.07] p-5">
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white">
                      Crear campaña de recuperación
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Configurá la campaña preparada por el AI Store Operator.
                    </p>
                  </div>

                  {campaignCreated ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-4">
                        <p className="text-sm font-semibold text-emerald-300">
                          ✓ Campaña creada correctamente
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          "{campaignName}" quedó creada como campaña activa.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setCampaignCreated(false);
                          setShowCampaignBuilder(false);
                        }}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/5"
                      >
                        Cerrar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-[11px] text-slate-500">
                          Nombre de campaña
                        </label>
                        <input
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2 text-xs text-white outline-none focus:border-violet-400/40"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] text-slate-500">
                          Audiencia
                        </label>
                        <input
                          value={campaignAudience}
                          onChange={(e) => setCampaignAudience(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2 text-xs text-white outline-none focus:border-violet-400/40"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] text-slate-500">
                          Descuento final (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={campaignDiscount}
                          onChange={(e) => setCampaignDiscount(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2 text-xs text-white outline-none focus:border-violet-400/40"
                        />
                      </div>

                      <div className="rounded-lg border border-white/10 bg-[#030711] p-3">
                        <p className="text-[11px] font-medium text-slate-300">
                          Secuencia automática
                        </p>
                        <div className="mt-2 space-y-1.5 text-[11px] text-slate-500">
                          <p>⏱️ 1 hora — Recordatorio del carrito</p>
                          <p>⏱️ 24 horas — Segundo mensaje</p>
                          <p>⏱️ 48 horas — Incentivo del {campaignDiscount}%</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!campaignName.trim()) {
                            alert("⚠️ La campaña necesita un nombre.");
                            return;
                          }

                          const newCampaign = {
                            id: Date.now(),
                            name: campaignName.trim(),
                            audience: campaignAudience.trim(),
                            discount: Number(campaignDiscount) || 0,
                            status: "Activa" as const,
                            source: "AI Store Operator",
                            sequence: [
                              "1 hora — Recordatorio del carrito",
                              "24 horas — Segundo mensaje",
                              `48 horas — Incentivo del ${Number(campaignDiscount) || 0}%`,
                            ],
                            reach: 0,
                            recoveredCarts: 0,
                            conversions: 0,
                            revenue: 0,
                          };

                          setCampaigns((current) => [...current, newCampaign]);
                          setCampaignCreated(true);
                        }}
                        className="w-full rounded-lg bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400"
                      >
                        Crear campaña
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-white/[.07] p-5">
              <div className="rounded-lg border border-white/10 bg-[#030711] p-3 text-xs leading-5 text-slate-500">
                El AI Store Operator analiza ventas, inventario, clientes y
                campañas y convierte los datos en acciones concretas para tu
                tienda.
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#070d18] shadow-2xl">

            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#070d18] p-5">
              <div>
                <h3 className="font-semibold">
                  {editingProduct ? "Editar producto" : "Añadir producto"}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Configurá la información principal del producto.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                  resetProductForm();
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">

              <div>
                <label className="text-xs text-slate-500">
                  Nombre del producto
                </label>

                <input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Ej. DigitalBoost Hoodie"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">
                    SKU
                  </label>

                  <input
                    value={productForm.sku}
                    onChange={(e) =>
                      setProductForm((f) => ({
                        ...f,
                        sku: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Se genera automáticamente"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Categoría
                  </label>

                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm((f) => ({
                        ...f,
                        category: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2.5 text-sm outline-none"
                  >
                    <option>Digital</option>
                    <option>Ropa</option>
                    <option>Accesorios</option>
                    <option>Software</option>
                    <option>Servicios</option>
                    <option>Sin categoría</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-500">
                    Precio
                  </label>

                  <input
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((f) => ({
                        ...f,
                        price: e.target.value,
                      }))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Stock
                  </label>

                  <input
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm((f) => ({
                        ...f,
                        stock: e.target.value,
                      }))
                    }
                    type="number"
                    min="0"
                    step="1"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  Estado del producto
                </label>

                <div className="mt-2 grid grid-cols-2 gap-3">
                  {(["Activo", "Borrador"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setProductForm((f) => ({
                          ...f,
                          status,
                        }))
                      }
                      className={`rounded-lg border px-4 py-3 text-sm ${
                        productForm.status === status
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                          : "border-white/10 text-slate-400"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-violet-400/10 bg-violet-500/5 p-3 text-xs leading-5 text-slate-400">
                💡 Después conectaremos este producto con variantes,
                imágenes, inventario, pedidos, analytics y AI Store Operator.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-sm text-slate-300"
                >
                  Cancelar
                </button>

                <button
                  onClick={saveProduct}
                  className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 py-3 text-sm font-bold"
                >
                  {editingProduct ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {action}
    </div>
  );
}

function Metric({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[.07] bg-[#030914] p-5">
      <div className="text-xs text-slate-500">{title}</div>

      <div className="mt-2 text-2xl font-semibold">{value}</div>

      {change && (
        <div className="mt-2 text-xs text-emerald-400">
          {change} vs. período anterior
        </div>
      )}
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/[.07] bg-[#030914] p-5">
      {title && (
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
        </div>
      )}

      {children}
    </section>
  );
}

function Insight({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-white/[.06] bg-[#070d18] p-3">
      <div className="text-xs font-semibold">{title}</div>
      <div className="mt-1 text-xs text-slate-500">{text}</div>
    </div>
  );
}

function OrderTable({
  orders,
  onSelectOrder,
}: {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs text-slate-500">
          <tr>
            <th className="pb-3">Pedido</th>
            <th className="pb-3">Cliente</th>
            <th className="pb-3">Total</th>
            <th className="pb-3">Estado</th>
            <th className="pb-3">Fecha</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onSelectOrder?.(order)}
              className="cursor-pointer border-b border-white/[.06] transition hover:bg-white/[.02]"
            >
              <td className="py-4 font-medium">{order.id}</td>
              <td>
                <div>{order.customer}</div>
                <div className="text-xs text-slate-500">
                  {order.items} producto(s)
                </div>
              </td>
              <td>${order.total.toFixed(2)}</td>
              <td>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 text-[10px] text-emerald-300">
                  {order.status}
                </span>
              </td>
              <td className="text-xs text-slate-500">{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
