import './store-builder-vibrant-global.css';
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
  Palette,
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
  Globe2,
} from "lucide-react";
import ProductInventoryPro from "./ProductInventoryPro";
import CommerceOSOverview from "./CommerceOSOverview";
import DigitalBoostShortcuts from "./DigitalBoostShortcuts.tsx";
import DigitalBoostNotifications from "./DigitalBoostNotifications.tsx";
import DigitalBoostConsole from "./DigitalBoostConsole.tsx";
import DigitalBoostAutomations from "./DigitalBoostAutomations";
import DigitalBoostIntegrations from "./DigitalBoostIntegrations.tsx";
import DigitalBoostOperator from "./DigitalBoostOperator";
import DigitalBoostHealth from "./DigitalBoostHealth.tsx";
import DigitalBoostCommandCenter from "./DigitalBoostCommandCenter";
import DigitalBoostStoreStudio from "./DigitalBoostStoreStudio";

import StoreBuilderEnvironment from "./StoreBuilderEnvironment";
import WebsiteBuilderV1 from "./WebsiteBuilderV1";
import StoreBuilderFinalStudio from "./StoreBuilderFinalStudio";
import StoreBuilderDirectFinal from "./StoreBuilderDirectFinal";
import "./store-builder-visual-v2.css";
import "./store-builder-jewel-v2.css";
// import "./digitalboost-store-builder-white-authoritative.css";
import "./commerce-os-navy-lock.css";
import "./digitalboost-os.css";
import "./digitalboost-qa.css";
type StoreSection =
  | "dashboard"
  | "products"
  | "inventory"
  | "orders"
  | "customers"
  | "themes"
  | "marketing"
  | "analytics"
  | "seo"
  | "payments"
  | "campaigns"
  | "settings" | "website-builder";

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

const navGroups: {
  id: string;
  label: string;
  items: {
    id: StoreSection;
    label: string;
    icon: React.ElementType;
  }[];
}[] = [
  {
    id: "store",
    label: "Tienda",
    items: [
      { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
      {
        id: "website-builder",
        label: "Store Builder",
        icon: Globe2,
      },

      { id: "products", label: "Productos", icon: Package },
      { id: "inventory", label: "Inventario", icon: Boxes },
      { id: "orders", label: "Pedidos", icon: ClipboardList },
      { id: "customers", label: "Clientes", icon: Users },
    ],
  },
  {
    id: "design",
    label: "Diseño",
    items: [
      { id: "themes", label: "Biblioteca de temas", icon: Palette },
    ],
  },
  {
    id: "growth",
    label: "Crecimiento",
    items: [
      { id: "marketing", label: "Marketing", icon: Zap },
      { id: "campaigns", label: "Campañas", icon: Megaphone },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      {
        id: "seo",
        label: "SEO Manager",
        icon: Search,
        badge: "VIP",
      },
    ],
  },
  {
    id: "finance",
    label: "Finanzas",
    items: [
      { id: "payments", label: "Pagos", icon: CircleDollarSign },
    ],
  },
  {
    id: "management",
    label: "Gestión",
    items: [
      { id: "settings", label: "Configuración", icon: Settings },
    ],
  },
];

export default function StoreBuilderWorkspace({
  onBack,
}: {
  onBack: () => void;
}) {

  // ----------------------------------------------------------
  // DIGITALBOOST COMMERCE OS — BOOT SEQUENCE
  // ----------------------------------------------------------

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    store: true,
    design: true,
    growth: true,
    finance: false,
    management: false,
  });

  const [section, setSection] = useState<StoreSection>(() => {
    try {
      const saved = localStorage.getItem("digitalboost_store_section");

      const validSections: StoreSection[] = [
        "dashboard",
        "products",
        "inventory",
        "orders",
        "customers",
        "themes",
        "marketing",
        "analytics",
        "payments",
        "campaigns",
        "settings",
      ];

      // Recuperación segura:
      // si la última sección guardada provoca un error al recargar,
      // comenzamos nuevamente desde Inicio sin borrar los datos del Store.
      if (saved === "analytics") {
        return "dashboard";
      }

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

  const customers = useMemo<Customer[]>(() => {
    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const existing = customerMap.get(order.customer);

      if (existing) {
        existing.orders += 1;
        existing.spent += order.total;
        existing.lastPurchase = order.date;
        return;
      }

      const email =
        order.customer
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\\u0300-\\u036f]/g, "")
          .replace(/\\s+/g, ".") + "@cliente.digitalboost";

      customerMap.set(order.customer, {
        id: customerMap.size + 1,
        name: order.customer,
        email,
        orders: 1,
        spent: order.total,
        lastPurchase: order.date,
      });
    });

    return Array.from(customerMap.values());
  }, [orders]);

  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState<
    "all" | "high-value" | "repeat" | "inactive"
  >("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [aiCustomerId, setAiCustomerId] = useState<number | null>(null);
  const [productFilter, setProductFilter] = useState<"all" | "active" | "draft" | "low">("all");
  const [showAI, setShowAI] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [showAutomations, setShowAutomations] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>("");
  const [aiAction, setAiAction] = useState<string>("");
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [showManualCampaignBuilder, setShowManualCampaignBuilder] = useState(false);
  const [campaignCreated, setCampaignCreated] = useState(false);
  const [campaignName, setCampaignName] = useState("Recuperá tu carrito ⚡");
  const [campaignAudience, setCampaignAudience] = useState(
    "Clientes que abandonaron el checkout durante las últimas 48 horas"
  );
  const [campaignSegment, setCampaignSegment] = useState("abandoned");
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
  const [campaignToView, setCampaignToView] =
    useState<Campaign | null>(null);

  useEffect(() => {
    localStorage.setItem(
      "digitalboost_campaigns",
      JSON.stringify(campaigns)
    );
  }, [campaigns]);

  useEffect(() => {
    if (campaigns.length > 0 && orders.length > 0) {
      setCampaigns((currentCampaigns) => [...currentCampaigns]);
    }
  }, [orders]);

  const getCustomerCampaignSegment = (customer: Customer) => {
    if (customer.orders > 1) {
      return "repeat";
    }

    if (customer.spent >= 100) {
      return "high-value";
    }

    if (customer.lastPurchase.startsWith("Hoy")) {
      return "new";
    }

    return "inactive";
  };

  const getCampaignAudience = (segment: string) => {
    switch (segment) {
      case "abandoned":
        return "Clientes que abandonaron el checkout durante las últimas 48 horas";

      case "new":
        return "Clientes nuevos que todavía no realizaron una segunda compra";

      case "repeat":
        return "Clientes recurrentes con más de una compra";

      case "high-value":
        return "Clientes de alto valor con compras superiores al promedio";

      case "inactive":
        return "Clientes inactivos que no compraron recientemente";

      case "buyers":
        return "Clientes que realizaron al menos una compra";

      case "custom":
        return campaignAudience;

      default:
        return campaignAudience;
    }
  };

  const getCampaignReach = (segment: string) => {
    const totalCustomers = customers.length;

    switch (segment) {
      case "abandoned":
        return Math.max(1, orders.length);

      case "new":
        return customers.filter((customer) => customer.orders <= 1).length;

      case "repeat":
        return customers.filter((customer) => customer.orders > 1).length;

      case "high-value": {
        if (customers.length === 0) return 0;

        const averageSpent =
          customers.reduce((sum, customer) => sum + customer.spent, 0) /
          customers.length;

        return customers.filter(
          (customer) => customer.spent > averageSpent
        ).length;
      }

      case "inactive":
        return customers.filter((customer) =>
          /ayer|hace|semana|mes/i.test(customer.lastPurchase)
        ).length;

      case "buyers":
        return customers.filter((customer) => customer.orders > 0).length;

      case "custom":
        return totalCustomers;

      default:
        return totalCustomers;
    }
  };

  const createCampaignForCustomer = (customer: Customer) => {
    const segment = getCustomerCampaignSegment(customer);
    const audience = getCampaignAudience(segment);

    const segmentNames: Record<string, string> = {
      abandoned: "Carritos abandonados",
      new: "Clientes nuevos",
      repeat: "Clientes recurrentes",
      "high-value": "Clientes de alto valor",
      inactive: "Clientes inactivos",
    };

    const campaignName =
      `${segmentNames[segment] ?? "Clientes"} — ${customer.name}`;

    const created = createCampaign(
      campaignName,
      `${audience}. Cliente seleccionado: ${customer.name}`,
      segment === "high-value" ? 15 : 10,
      "Cliente / AI Customer Operator"
    );

    if (created) {
      setAiCustomerId(null);
      setSelectedCustomerId(null);
      setSection("campaigns");
    }
  };

  const syncCampaignMetrics = () => {
    if (!campaigns.length) return;

    setCampaigns((currentCampaigns) => {
      let changed = false;

      const nextCampaigns = currentCampaigns.map((campaign) => {
        const audience = String(campaign.audience || "").toLowerCase();

        let targetCustomers = customers;

        if (audience.includes("clientes recurrentes")) {
          targetCustomers = customers.filter((customer) => customer.orders > 1);
        } else if (audience.includes("clientes nuevos")) {
          targetCustomers = customers.filter((customer) => customer.orders <= 1);
        } else if (audience.includes("clientes de alto valor")) {
          const averageSpent =
            customers.length > 0
              ? customers.reduce((sum, customer) => sum + customer.spent, 0) /
                customers.length
              : 0;

          targetCustomers = customers.filter(
            (customer) => customer.spent > averageSpent
          );
        } else if (audience.includes("clientes inactivos")) {
          targetCustomers = customers.filter((customer) =>
            /ayer|hace|semana|mes/i.test(customer.lastPurchase)
          );
        } else if (audience.includes("clientes que compraron")) {
          targetCustomers = customers.filter((customer) => customer.orders > 0);
        }

        /*
         * Una campaña creada desde un cliente concreto contiene:
         * "Cliente seleccionado: NOMBRE".
         * En ese caso sincronizamos solamente ese cliente.
         */
        const selectedCustomerMatch = campaign.audience.match(
          /cliente seleccionado:\s*(.+)$/i
        );

        if (selectedCustomerMatch) {
          const selectedName = selectedCustomerMatch[1].trim().toLowerCase();

          targetCustomers = customers.filter(
            (customer) => customer.name.toLowerCase() === selectedName
          );
        }

        const targetNames = new Set(
          targetCustomers.map((customer) => customer.name)
        );

        const attributedOrders = orders.filter((order) => {
          if (!targetNames.has(order.customer)) {
            return false;
          }

          /*
           * Una campaña recién creada no tiene todavía una marca de
           * atribución en el pedido. Por seguridad, consideramos como
           * conversiones los pedidos actuales de los clientes objetivo.
           *
           * Esto mantiene las métricas conectadas a los datos reales
           * del Store y evita inventar pedidos o carritos.
           */
          return true;
        });

        const conversions = attributedOrders.length;

        const revenue = attributedOrders.reduce(
          (sum, order) => sum + Number(order.total || 0),
          0
        );

        const recoveredCarts = audience.includes("carritos abandonados")
          ? attributedOrders.filter((order) =>
              [
                "Pagado",
                "En preparación",
                "Enviado",
                "Entregado",
              ].includes(order.status)
            ).length
          : 0;

        const reach = Math.max(
          Number(campaign.reach || 0),
          targetCustomers.length
        );

        if (
          Number(campaign.reach || 0) !== reach ||
          Number(campaign.recoveredCarts || 0) !== recoveredCarts ||
          Number(campaign.conversions || 0) !== conversions ||
          Number(campaign.revenue || 0) !== revenue
        ) {
          changed = true;

          return {
            ...campaign,
            reach,
            recoveredCarts,
            conversions,
            revenue,
          };
        }

        return campaign;
      });

      return changed ? nextCampaigns : currentCampaigns;
    });
  };

  useEffect(() => {
    syncCampaignMetrics();
  }, [orders, customers.length]);

  const createCampaign = (
    name: string,
    audience: string,
    discount: number,
    source: string
  ) => {
    if (!name.trim()) {
      alert("⚠️ La campaña necesita un nombre.");
      return false;
    }

    const finalDiscount = Number(discount) || 0;
    const resolvedAudience = getCampaignAudience(campaignSegment);
    const calculatedReach = getCampaignReach(campaignSegment);

    const newCampaign: Campaign = {
      id: Date.now(),
      name: name.trim(),
      audience: resolvedAudience.trim(),
      discount: finalDiscount,
      status: "Activa",
      source,
      sequence: [
        "1 hora — Recordatorio del carrito",
        "24 horas — Segundo mensaje",
        `48 horas — Incentivo del ${finalDiscount}%`,
      ],
      reach: calculatedReach,
      recoveredCarts: 0,
      conversions: 0,
      revenue: 0,
    };

    const campaignWithMetrics: Campaign = {
      ...newCampaign,
      reach: calculatedReach,
      recoveredCarts: 0,
      conversions: 0,
      revenue: 0,
    };

    setCampaigns((current) => [...current, campaignWithMetrics]);
    return true;
  };

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

  const deleteCampaign = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
  };

  const confirmDeleteCampaign = () => {
    if (!campaignToDelete) return;

    const campaignId = campaignToDelete.id;

    setCampaigns((currentCampaigns) =>
      currentCampaigns.filter((campaign) => campaign.id !== campaignId)
    );

    setCampaignToDelete(null);

    if (campaignToView?.id === campaignId) {
      setCampaignToView(null);
    }
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

  const renderDashboard = () => {
    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalProducts = products.length;

    const lowStockProducts = products.filter(
      (product) => product.stock < 10
    );

    const outOfStockProducts = products.filter(
      (product) => product.stock <= 0
    );

    const pendingOrders = orders.filter(
      (order) =>
        order.status === "Pagado" ||
        order.status === "En preparación"
    );

    const shippedOrders = orders.filter(
      (order) => order.status === "Enviado"
    );

    const deliveredOrders = orders.filter(
      (order) => order.status === "Entregado"
    );

    const averageOrderValue =
      totalOrders > 0 ? totalSales / totalOrders : 0;

    const highestValueProduct =
      products.length > 0
        ? [...products].sort((a, b) => b.price - a.price)[0]
        : null;

    const activeProducts = products.filter(
      (product) => product.status === "Activo"
    );

    const draftProducts = products.filter(
      (product) => product.status === "Borrador"
    );

    const money = new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });

    const goTo = (target: StoreSection) => {
      setSection(target);
    };

    const MetricCard = ({
      title,
      value,
      subtitle,
      icon: Icon,
      accent,
      target,
    }: {
      title: string;
      value: string;
      subtitle: string;
      icon: React.ElementType;
      accent: string;
      target: StoreSection;
    }) => (
      <button
        type="button"
        onClick={() => goTo(target)}
        className="group relative overflow-hidden rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5 text-left transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-[#E8F5FF]"
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
          >
            <Icon size={18} />
          </div>

          <ChevronRight
            size={16}
            className="text-[#475569] transition group-hover:translate-x-1 group-hover:text-violet-300"
          />
        </div>

        <p className="mt-5 text-[11px] font-medium uppercase tracking-wider text-[#475569]">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-white">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-[#475569]">
          {subtitle}
        </p>
      </button>
    );

    return (
      <StoreBuilderEnvironment>

      <StoreBuilderEnvironment>

      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                <Sparkles size={17} />
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                Centro de Inteligencia
              </p>
            </div>

            <p className="mt-2 text-2xl font-bold tracking-tight text-white">
              Tu tienda, de un vistazo.
            </p>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#475569]">
              Datos operativos, señales de rendimiento y accesos rápidos
              para tomar decisiones desde un solo lugar.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-500/5 px-3 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium text-emerald-300">
              Datos sincronizados
            </span>
          </div>
        </div>

        {/* MÉTRICAS PRINCIPALES */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Ventas"
            value={money.format(totalSales)}
            subtitle={`${totalOrders} pedido${totalOrders === 1 ? "" : "s"} registrados`}
            icon={CircleDollarSign}
            accent="bg-emerald-500/10 text-emerald-300"
            target="orders"
          />

          <MetricCard
            title="Pedidos"
            value={totalOrders.toLocaleString("es-AR")}
            subtitle={`${pendingOrders.length} pendiente${pendingOrders.length === 1 ? "" : "s"} de preparación`}
            icon={ClipboardList}
            accent="bg-cyan-500/15 text-cyan-300"
            target="orders"
          />

          <MetricCard
            title="Clientes"
            value={totalCustomers.toLocaleString("es-AR")}
            subtitle="Clientes registrados en tu tienda"
            icon={Users}
            accent="bg-violet-500/20 text-violet-300"
            target="customers"
          />

          <MetricCard
            title="Catálogo"
            value={totalProducts.toLocaleString("es-AR")}
            subtitle={`${activeProducts.length} activos · ${draftProducts.length} borradores`}
            icon={Package}
            accent="bg-amber-500/10 text-amber-300"
            target="products"
          />
        </div>

        {/* BLOQUE CENTRAL */}
        <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">

          {/* ACTIVIDAD */}
          <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Actividad de la tienda
                </p>

                <p className="mt-1 text-xs text-[#475569]">
                  Resumen del estado actual de tus operaciones.
                </p>
              </div>

              <button
                type="button"
                onClick={() => goTo("analytics")}
                className="rounded-lg border border-violet-400/20 px-3 py-1.5 text-[10px] font-medium text-violet-300 transition hover:bg-violet-500/20"
              >
                Ver Analytics
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              <button
                type="button"
                onClick={() => goTo("orders")}
                className="rounded-xl border border-[#D6E2EE] bg-[#0B1B30] p-4 text-left transition hover:border-[#00B7FF]/30"
              >
                <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                  Ticket promedio
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {money.format(averageOrderValue)}
                </p>

                <p className="mt-1 text-[10px] text-[#475569]">
                  Por pedido
                </p>
              </button>

              <button
                type="button"
                onClick={() => goTo("orders")}
                className="rounded-xl border border-[#D6E2EE] bg-[#0B1B30] p-4 text-left transition hover:border-violet-400/20"
              >
                <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                  Entregados
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {deliveredOrders.length}
                </p>

                <p className="mt-1 text-[10px] text-[#475569]">
                  Pedidos completados
                </p>
              </button>

              <button
                type="button"
                onClick={() => goTo("orders")}
                className="rounded-xl border border-[#D6E2EE] bg-[#0B1B30] p-4 text-left transition hover:border-amber-400/20"
              >
                <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                  Enviados
                </p>

                <p className="mt-2 text-xl font-bold text-white">
                  {shippedOrders.length}
                </p>

                <p className="mt-1 text-[10px] text-[#475569]">
                  En tránsito
                </p>
              </button>

            </div>

            <div className="mt-4 rounded-xl border border-[#D6E2EE] bg-[#0B1B30] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#475569]">
                    Flujo de pedidos
                  </p>

                  <p className="mt-1 text-[10px] text-[#475569]">
                    Estado actual de los pedidos registrados.
                  </p>
                </div>

                <ClipboardList size={17} className="text-cyan-300" />
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">

                {[
                  ["Pagados", orders.filter((o) => o.status === "Pagado").length],
                  ["Preparación", orders.filter((o) => o.status === "En preparación").length],
                  ["Enviados", shippedOrders.length],
                  ["Entregados", deliveredOrders.length],
                ].map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => goTo("orders")}
                    className="rounded-lg border border-[#D6E2EE] bg-[#0B1B30] p-3 text-left transition hover:border-cyan-300/25"
                  >
                    <p className="text-[9px] uppercase tracking-wider text-[#475569]">
                      {label}
                    </p>

                    <p className="mt-1 text-lg font-bold text-white">
                      {value}
                    </p>
                  </button>
                ))}

              </div>
            </div>
          </div>

          {/* ALERTAS */}
          <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                <Zap size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Señales de tu tienda
                </p>

                <p className="text-[10px] text-[#475569]">
                  Elementos que merecen atención.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">

              <button
                type="button"
                onClick={() => goTo("inventory")}
                className="group flex w-full items-center gap-3 rounded-xl border border-red-400/10 bg-red-500/5 p-3 text-left transition hover:border-red-400/25"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-300">
                  <Boxes size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#334155]">
                    Stock crítico
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#475569]">
                    {lowStockProducts.length} producto
                    {lowStockProducts.length === 1 ? "" : "s"} requiere
                    atención.
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="text-[#475569] group-hover:text-red-300"
                />
              </button>

              <button
                type="button"
                onClick={() => goTo("inventory")}
                className="group flex w-full items-center gap-3 rounded-xl border border-orange-400/10 bg-orange-500/5 p-3 text-left transition hover:border-orange-400/25"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-300">
                  <Package size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#334155]">
                    Sin stock
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#475569]">
                    {outOfStockProducts.length} producto
                    {outOfStockProducts.length === 1 ? "" : "s"} sin unidades.
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="text-[#475569] group-hover:text-orange-300"
                />
              </button>

              <button
                type="button"
                onClick={() => goTo("orders")}
                className="group flex w-full items-center gap-3 rounded-xl border border-cyan-400/10 bg-cyan-500/15 p-3 text-left transition hover:border-cyan-400/25"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
                  <ClipboardList size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#334155]">
                    Pedidos pendientes
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#475569]">
                    {pendingOrders.length} pendiente
                    {pendingOrders.length === 1 ? "" : "s"} de preparación.
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="text-[#475569] group-hover:text-cyan-300"
                />
              </button>

            </div>
          </div>
        </div>

        {/* INTELIGENCIA DE PRODUCTOS */}
        <div className="grid gap-4 lg:grid-cols-3">

          <button
            type="button"
            onClick={() => goTo("products")}
            className="group rounded-2xl border border-violet-400/15 bg-violet-500/20 p-5 text-left transition hover:border-violet-400/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                <Package size={17} />
              </div>

              <ChevronRight
                size={15}
                className="text-[#475569] transition group-hover:translate-x-1 group-hover:text-violet-300"
              />
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-wider text-[#475569]">
              Referencia de catálogo
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {highestValueProduct
                ? highestValueProduct.name
                : "Sin productos"}
            </p>

            <p className="mt-1 text-xs text-[#475569]">
              {highestValueProduct
                ? `${money.format(highestValueProduct.price)} · ${highestValueProduct.category}`
                : "Agregá productos para comenzar."}
            </p>

            <p className="mt-4 text-[10px] text-violet-300">
              Ver catálogo →
            </p>
          </button>

          <button
            type="button"
            onClick={() => goTo("inventory")}
            className="group rounded-2xl border border-cyan-400/15 bg-cyan-500/15 p-5 text-left transition hover:border-[#00B7FF]/45"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                <Boxes size={17} />
              </div>

              <ChevronRight
                size={15}
                className="text-[#475569] transition group-hover:translate-x-1 group-hover:text-cyan-300"
              />
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-wider text-[#475569]">
              Salud del inventario
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {lowStockProducts.length === 0
                ? "Inventario saludable"
                : `${lowStockProducts.length} producto${lowStockProducts.length === 1 ? "" : "s"} para revisar`}
            </p>

            <p className="mt-1 text-xs text-[#475569]">
              {outOfStockProducts.length > 0
                ? `${outOfStockProducts.length} sin stock actualmente.`
                : "No hay productos agotados."}
            </p>

            <p className="mt-4 text-[10px] text-cyan-300">
              Revisar inventario →
            </p>
          </button>

          <button
            type="button"
            onClick={() => goTo("analytics")}
            className="group rounded-2xl border border-emerald-400/15 bg-emerald-500/5 p-5 text-left transition hover:border-emerald-400/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <BarChart3 size={17} />
              </div>

              <ChevronRight
                size={15}
                className="text-[#475569] transition group-hover:translate-x-1 group-hover:text-emerald-300"
              />
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-wider text-[#475569]">
              Oportunidad
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              Analizar rendimiento
            </p>

            <p className="mt-1 text-xs leading-5 text-[#475569]">
              Profundizá en ventas, pedidos y rendimiento desde Analytics.
            </p>

            <p className="mt-4 text-[10px] text-emerald-300">
              Abrir análisis →
            </p>
          </button>

        </div>

        {/* ÚLTIMOS PEDIDOS */}
        <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">
                Actividad reciente
              </p>

              <p className="mt-1 text-xs text-[#475569]">
                Últimos pedidos registrados en la tienda.
              </p>
            </div>

            <button
              type="button"
              onClick={() => goTo("orders")}
              className="rounded-lg border border-[#00B7FF]/30 px-3 py-1.5 text-[10px] text-[#475569] transition hover:bg-cyan-300/10 hover:text-white"
            >
              Ver todos
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {orders.slice(0, 4).map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => goTo("orders")}
                className="group flex w-full items-center gap-3 rounded-xl border border-[#D6E2EE] bg-[#0B1B30] p-3 text-left transition hover:border-cyan-300/25"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                  <ClipboardList size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#334155]">
                    {order.id} · {order.customer}
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#475569]">
                    {order.status} · {order.date}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold text-white">
                    {money.format(order.total)}
                  </p>

                  <ChevronRight
                    size={13}
                    className="ml-auto mt-1 text-[#475569] transition group-hover:translate-x-1 group-hover:text-violet-300"
                  />
                </div>
              </button>
            ))}

            {orders.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#00B7FF]/30 p-6 text-center">
                <p className="text-xs text-[#475569]">
                  Todavía no hay pedidos registrados.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    
      </StoreBuilderEnvironment>

      </StoreBuilderEnvironment>
);
  };



  const renderProducts = () => (
    <div className="space-y-6">

      <PageTitle
        title="Productos"
        subtitle="Administra catálogo, precios, estados e inventario desde un solo lugar."
        action={
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-300 px-4 py-2.5 text-sm font-bold"
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
              className="flex items-center justify-between rounded-lg border border-[#D6E2EE] bg-[#0B1B30] p-4"
            >
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="mt-1 text-xs text-[#475569]">
                  {product.sku}
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">{product.stock} unidades</div>
                <div className="text-xs text-[#475569]">
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
          className="flex items-center gap-2 text-sm text-[#475569] transition hover:text-white"
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
                <p className="text-[11px] uppercase tracking-wide text-[#475569]">
                  Pedido
                </p>
                <p className="mt-1 text-sm font-semibold text-[#334155]">
                  {order.id}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#475569]">
                  Cliente
                </p>
                <p className="mt-1 text-sm text-[#334155]">
                  {order.customer}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#475569]">
                  Fecha
                </p>
                <p className="mt-1 text-sm text-[#475569]">
                  {order.date}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#475569]">
                  Estado
                </p>
                <span className="mt-1 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 text-[11px] text-emerald-300">
                  {order.status}
                </span>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#475569]">
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
                            : "border-[#00B7FF]/30 bg-[#0B1B30]/[.02] text-[#475569]"
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
                                ? "text-[#475569]"
                                : "text-[#475569]"
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
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/20 px-4 py-2.5 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20"
                >
                  {order.status === "Pagado"
                    ? "Pasar a En preparación"
                    : order.status === "En preparación"
                      ? "Marcar como Enviado"
                      : "Marcar como Entregado"}
                  <ChevronRight size={14} />
                </button>
              )}

              <div className="mt-5 rounded-xl border border-[#D6E2EE] bg-[#0B1B30] p-4">
                <p className="text-sm font-medium text-[#334155]">
                  {order.items} producto{order.items === 1 ? "" : "s"} en este pedido
                </p>
                <p className="mt-2 text-xs leading-5 text-[#475569]">
                  Este pedido está asociado a {order.customer}. Desde aquí
                  podrás consultar su estado y las próximas acciones del AI
                  Store Operator.
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="AI Store Operator">
            <div className="p-5">
              <div className="rounded-xl border border-violet-400/20 bg-violet-500/20 p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-violet-500/20 p-2 text-violet-300">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#334155]">
                      Análisis del pedido
                    </p>
                    <p className="mt-1 text-xs text-[#475569]">
                      Analizá este pedido con AI Store Operator.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-6 text-[#475569]">
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
                  className="mt-4 flex items-center gap-2 rounded-lg border border-violet-400/30 px-4 py-2 text-xs text-violet-200 transition hover:bg-violet-500/20"
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

        {(() => {
          const totalOrders = orders.length;
          const paidOrders = orders.filter(
            (order) => order.status === "Pagado"
          ).length;
          const preparingOrders = orders.filter(
            (order) => order.status === "En preparación"
          ).length;
          const shippedOrders = orders.filter(
            (order) => order.status === "Enviado"
          ).length;

          return (
            <div className="grid gap-4 md:grid-cols-4">
              <Metric
                title="Todos"
                value={totalOrders.toLocaleString("es-AR")}
              />
              <Metric
                title="Pagados"
                value={paidOrders.toLocaleString("es-AR")}
              />
              <Metric
                title="Preparando"
                value={preparingOrders.toLocaleString("es-AR")}
              />
              <Metric
                title="Enviados"
                value={shippedOrders.toLocaleString("es-AR")}
              />
            </div>
          );
        })()}

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
          <div className="border-b border-[#1D4260] p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder="Buscar cliente..."
                className="w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#475569] focus:border-violet-400/40"
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
                className="rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-sm text-[#475569] outline-none focus:border-violet-400/40"
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
                      : "border border-[#00B7FF]/30 text-[#475569] hover:text-[#475569]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#475569]">
              No encontramos clientes con esos criterios.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#1D4260] text-[11px] uppercase tracking-wide text-[#475569]">
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
                      className="cursor-pointer border-b border-[#D6E2EE] transition hover:bg-[#0B1B30]/[.025] last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#334155]">
                          {customer.name}
                        </div>
                        <div className="mt-1 text-xs text-[#475569]">
                          {customer.email}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#475569]">
                        {customer.orders}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-emerald-300">
                        ${customer.spent.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-xs text-[#475569]">
                        {customer.lastPurchase}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-[#1D4260] px-5 py-3 text-xs text-[#475569]">
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

    const averageOrder =
      customerOrders.length > 0
        ? customer.spent / customerOrders.length
        : 0;

    const paidOrders = customerOrders.filter(
      (order) => order.status === "Pagado"
    ).length;

    const deliveredOrders = customerOrders.filter(
      (order) => order.status === "Entregado"
    ).length;

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCustomerId(null)}
          className="flex items-center gap-2 text-sm text-[#475569] transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a Clientes
        </button>

        <PageTitle
          title={customer.name}
          subtitle={customer.email}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            title="Pedidos"
            value={String(customerOrders.length)}
          />

          <Metric
            title="Gastado"
            value={`$${customer.spent.toFixed(2)}`}
          />

          <Metric
            title="Ticket promedio"
            value={`$${averageOrder.toFixed(2)}`}
          />

          <Metric
            title="Última compra"
            value={customer.lastPurchase}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Actividad del cliente">
            <div className="grid grid-cols-2 gap-3 p-5">
              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Pedidos pagados
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-300">
                  {paidOrders}
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Pedidos entregados
                </p>
                <p className="mt-1 text-lg font-semibold text-cyan-300">
                  {deliveredOrders}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="AI Customer Operator">
            <div className="p-5">
              <p className="text-sm text-[#475569]">
                Analizá el comportamiento de este cliente y obtené
                recomendaciones para aumentar su recurrencia y valor.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setAiCustomerId(customer.id)}
                  className="flex items-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400"
                >
                  <Sparkles size={15} />
                  Analizar con AI Operator
                </button>

                <button
                  onClick={() => createCampaignForCustomer(customer)}
                  className="flex items-center gap-2 rounded-lg border border-[#00B7FF]/30 px-4 py-2.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/15"
                >
                  <Megaphone size={15} />
                  Crear campaña
                </button>
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Historial de pedidos">
          {customerOrders.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#475569]">
              Este cliente todavía no tiene pedidos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#1D4260] text-[11px] uppercase tracking-wide text-[#475569]">
                    <th className="px-5 py-3">Pedido</th>
                    <th className="px-5 py-3">Fecha</th>
                    <th className="px-5 py-3">Productos</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {customerOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="cursor-pointer border-b border-[#D6E2EE] transition hover:bg-[#0B1B30]/[.025] last:border-0"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-[#334155]">
                        {order.id}
                      </td>

                      <td className="px-5 py-4 text-xs text-[#475569]">
                        {order.date}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#475569]">
                        {order.items}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] ${
                            order.status === "Entregado"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : order.status === "Enviado"
                                ? "bg-cyan-500/15 text-cyan-300"
                                : order.status === "En preparación"
                                  ? "bg-amber-500/10 text-amber-300"
                                  : "bg-violet-500/20 text-violet-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-emerald-300">
                        ${order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {aiCustomerId === customer.id && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-violet-400/20 bg-[#0B1B30] p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    🤖 AI Customer Operator
                  </p>
                  <p className="mt-1 text-xs text-[#475569]">
                    Análisis de {customer.name}
                  </p>
                </div>

                <button
                  onClick={() => setAiCustomerId(null)}
                  className="rounded-lg border border-[#00B7FF]/30 px-2.5 py-1.5 text-xs text-[#475569] transition hover:bg-cyan-300/10 hover:text-white"
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                  <p className="text-[11px] font-medium text-[#475569]">
                    Perfil detectado
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#475569]">
                    {customer.orders > 1
                      ? "Cliente recurrente con historial de compras. Conviene priorizar fidelización y ofertas personalizadas."
                      : "Cliente con una compra registrada. Conviene incentivar una segunda compra mediante seguimiento y una oferta relevante."}
                  </p>
                </div>

                <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                  <p className="text-[11px] font-medium text-[#475569]">
                    Recomendación
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#475569]">
                    Ticket promedio: ${averageOrder.toFixed(2)}. Podés crear
                    una campaña segmentada para aumentar la recurrencia y
                    ofrecer productos complementarios.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCampaigns = () => (
    <div className="space-y-6">
      {campaignToView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  📊 Rendimiento de campaña
                </p>
                <p className="mt-1 text-xs text-[#475569]">
                  {campaignToView.name}
                </p>
              </div>

              <button
                onClick={() => setCampaignToView(null)}
                className="rounded-lg border border-[#00B7FF]/30 px-2.5 py-1.5 text-xs text-[#475569] transition hover:bg-cyan-300/10 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">Alcance</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {(campaignToView.reach ?? 0).toLocaleString("es-AR")}
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Carritos recuperados
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {(campaignToView.recoveredCarts ?? 0).toLocaleString("es-AR")}
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">Conversiones</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {(campaignToView.conversions ?? 0).toLocaleString("es-AR")}
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Ventas generadas
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-300">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    minimumFractionDigits: 2,
                  }).format(campaignToView.revenue ?? 0)}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Tasa de conversión
                </p>
                <p className="mt-1 text-lg font-semibold text-cyan-300">
                  {campaignToView.reach > 0
                    ? ((campaignToView.conversions / campaignToView.reach) * 100).toFixed(2)
                    : "0.00"}%
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Venta promedio
                </p>
                <p className="mt-1 text-lg font-semibold text-violet-300">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    minimumFractionDigits: 2,
                  }).format(
                    campaignToView.conversions > 0
                      ? campaignToView.revenue / campaignToView.conversions
                      : 0
                  )}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-[#475569]">
                  Estado
                </p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] ${
                    campaignToView.status === "Activa"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {campaignToView.status}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-[10px] text-[#475569]">Audiencia</p>
                <p className="mt-1 text-xs leading-5 text-[#475569]">
                  {campaignToView.audience}
                </p>
              </div>

              <div className="mt-3">
                <p className="text-[10px] text-[#475569]">Descuento</p>
                <p className="mt-1 text-xs text-[#475569]">
                  {campaignToView.discount}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {campaignToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-500/10 p-2.5 text-red-300">
                <Trash2 size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  Eliminar campaña
                </p>
                <p className="mt-2 text-xs leading-5 text-[#475569]">
                  ¿Querés eliminar{" "}
                  <span className="font-medium text-[#334155]">
                    "{campaignToDelete.name}"
                  </span>
                  ?
                </p>
                <p className="mt-1 text-[11px] text-[#475569]">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCampaignToDelete(null)}
                className="rounded-lg border border-[#00B7FF]/30 px-4 py-2 text-xs text-[#475569] transition hover:bg-cyan-300/10 hover:text-white"
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-semibold">Campañas</p>
          <p className="mt-1 text-sm text-[#475569]">
            Campañas creadas por el AI Store Operator o manualmente.
          </p>
        </div>

        <button
          onClick={() =>
            setShowManualCampaignBuilder((current) => !current)
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400"
        >
          <Plus size={15} />
          {showManualCampaignBuilder ? "Cerrar formulario" : "Crear campaña"}
        </button>
      </div>

      {showManualCampaignBuilder && (
        <Panel title="Crear campaña">
          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1 block text-[11px] text-[#475569]">
                Nombre de campaña
              </label>
              <input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Ej: Oferta especial de primavera"
                className="w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400/40"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-[#475569]">
                Segmento de audiencia
              </label>

              <select
                value={campaignSegment}
                onChange={(e) => {
                  const value = e.target.value;
                  setCampaignSegment(value);

                  if (value !== "custom") {
                    setCampaignAudience(getCampaignAudience(value));
                  }
                }}
                className="w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400/40"
              >
                <option value="abandoned">
                  🛒 Carritos abandonados
                </option>
                <option value="new">
                  👤 Clientes nuevos
                </option>
                <option value="repeat">
                  🔄 Clientes recurrentes
                </option>
                <option value="high-value">
                  💎 Clientes de alto valor
                </option>
                <option value="inactive">
                  😴 Clientes inactivos
                </option>
                <option value="buyers">
                  📦 Clientes que compraron
                </option>
                <option value="custom">
                  🎯 Audiencia personalizada
                </option>
              </select>

              <p className="mt-1.5 text-[10px] text-[#475569]">
                Elegí a quién querés dirigir la campaña.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-[#475569]">
                Audiencia
              </label>

              <input
                value={campaignAudience}
                onChange={(e) => {
                  setCampaignAudience(e.target.value);
                  setCampaignSegment("custom");
                }}
                placeholder="Ej: Clientes que compraron durante los últimos 30 días"
                className="w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400/40"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] text-[#475569]">
                Descuento (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={campaignDiscount}
                onChange={(e) => setCampaignDiscount(e.target.value)}
                className="w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-xs text-white outline-none focus:border-violet-400/40"
              />
            </div>

            <div className="rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] p-3">
              <p className="text-[11px] font-medium text-[#475569]">
                Secuencia automática
              </p>

              <div className="mt-2 space-y-1.5 text-[11px] text-[#475569]">
                <p>⏱️ 1 hora — Recordatorio de campaña</p>
                <p>⏱️ 24 horas — Segundo mensaje</p>
                <p>
                  ⏱️ 48 horas — Incentivo del {Number(campaignDiscount) || 0}%
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const created = createCampaign(
                    campaignName,
                    campaignAudience,
                    Number(campaignDiscount),
                    "Creación manual"
                  );

                  if (created) {
                    setShowManualCampaignBuilder(false);
                    setCampaignName("");
                    setCampaignAudience("");
                    setCampaignSegment("abandoned");
                    setCampaignDiscount("10");
                  }
                }}
                className="flex-1 rounded-lg bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400"
              >
                Crear campaña
              </button>

              <button
                onClick={() => setShowManualCampaignBuilder(false)}
                className="rounded-lg border border-[#00B7FF]/30 px-4 py-2.5 text-xs text-[#475569] transition hover:bg-cyan-300/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Panel>
      )}

      {campaigns.length === 0 ? (
        <Panel title="Campañas activas">
          <div className="p-6 text-center">
            <Megaphone size={28} className="mx-auto text-[#475569]" />
            <p className="mt-3 text-sm text-[#475569]">
              Todavía no hay campañas creadas.
            </p>
            <p className="mt-1 text-xs text-[#475569]">
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

                  <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] text-violet-300">
                    {campaign.source}
                  </span>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => toggleCampaignStatus(campaign.id)}
                      className="rounded-lg border border-[#00B7FF]/30 px-3 py-1.5 text-[11px] text-[#475569] transition hover:bg-cyan-300/10"
                    >
                      {campaign.status === "Activa" ? "Pausar" : "Activar"}
                    </button>

                    <button
                      onClick={() => setCampaignToView(campaign)}
                      className="rounded-lg border border-[#00B7FF]/30 px-3 py-1.5 text-[11px] text-cyan-300 transition hover:bg-cyan-500/15"
                    >
                      📊 Ver rendimiento
                    </button>

                    <button
                      onClick={() => deleteCampaign(campaign)}
                      className="rounded-lg border border-red-400/20 px-3 py-1.5 text-[11px] text-red-300 transition hover:bg-red-500/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-xs text-[#475569] md:grid-cols-2">
                  <div>
                    <p className="text-[11px] text-[#475569]">Audiencia</p>
                    <p className="mt-1 text-[#475569]">{campaign.audience}</p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#475569]">Descuento</p>
                    <p className="mt-1 text-[#475569]">{campaign.discount}%</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                  <div className="rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] p-3">
                    <p className="text-[10px] text-[#475569]">Alcance</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {(campaign.reach ?? 0).toLocaleString("es-AR")}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] p-3">
                    <p className="text-[10px] text-[#475569]">Carritos recuperados</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {(campaign.recoveredCarts ?? 0).toLocaleString("es-AR")}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] p-3">
                    <p className="text-[10px] text-[#475569]">Conversiones</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {(campaign.conversions ?? 0).toLocaleString("es-AR")}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] p-3">
                    <p className="text-[10px] text-[#475569]">Ventas generadas</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        minimumFractionDigits: 2,
                      }).format(campaign.revenue ?? 0)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] p-3">
                  <p className="text-[11px] font-medium text-[#475569]">
                    Secuencia automática
                  </p>

                  <div className="mt-2 space-y-1.5 text-[11px] text-[#475569]">
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

  const renderAnalytics = () => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (Number(order.total) || 0),
      0
    );

    const totalOrders = orders.length;
    const totalCustomers = customers.length;

    const averageOrderValue =
      totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const paidOrders = orders.filter(
      (order) => order.status === "Pagado"
    ).length;

    const preparingOrders = orders.filter(
      (order) => order.status === "En preparación"
    ).length;

    const shippedOrders = orders.filter(
      (order) => order.status === "Enviado"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "Entregado"
    ).length;

    const campaignRevenue = campaigns.reduce(
      (sum, campaign) => sum + (Number(campaign.revenue) || 0),
      0
    );

    const campaignConversions = campaigns.reduce(
      (sum, campaign) => sum + (Number(campaign.conversions) || 0),
      0
    );

    const campaignReach = campaigns.reduce(
      (sum, campaign) => sum + (Number(campaign.reach) || 0),
      0
    );

    const campaignConversionRate =
      campaignReach > 0
        ? (campaignConversions / campaignReach) * 100
        : 0;

    const storeConversionRate =
      totalCustomers > 0
        ? (deliveredOrders / totalCustomers) * 100
        : 0;

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }).format(value);

    return (
      <div className="space-y-6">
        <PageTitle
          title="Analytics"
          subtitle="Visión general del rendimiento de tu tienda."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            title="Facturación"
            value={formatCurrency(totalRevenue)}
          />

          <Metric
            title="Pedidos"
            value={String(totalOrders)}
          />

          <Metric
            title="Clientes"
            value={String(totalCustomers)}
          />

          <Metric
            title="Ticket promedio"
            value={formatCurrency(averageOrderValue)}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Estado de pedidos">
            <div className="grid grid-cols-2 gap-3 p-5">
              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Pagados
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {paidOrders}
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Preparando
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {preparingOrders}
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Enviados
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {shippedOrders}
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Entregados
                </p>
                <p className="mt-1 text-xl font-semibold text-emerald-300">
                  {deliveredOrders}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Marketing y campañas">
            <div className="grid grid-cols-2 gap-3 p-5">
              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Campañas
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {campaigns.length}
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Alcance
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {campaignReach.toLocaleString("es-AR")}
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Conversiones
                </p>
                <p className="mt-1 text-xl font-semibold text-cyan-300">
                  {campaignConversions.toLocaleString("es-AR")}
                </p>
              </div>

              <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
                <p className="text-[10px] text-[#475569]">
                  Revenue de campañas
                </p>
                <p className="mt-1 text-xl font-semibold text-emerald-300">
                  {formatCurrency(campaignRevenue)}
                </p>
              </div>
            </div>

            <div className="border-t border-[#1D4260] px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#475569]">
                  Conversión de campañas
                </span>

                <span className="text-sm font-semibold text-cyan-300">
                  {campaignConversionRate.toFixed(2)}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-cyan-300/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300 transition-all"
                  style={{
                    width: `${Math.min(
                      campaignConversionRate,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </Panel>
        </div>

        <Panel title="Rendimiento de campañas">
          {campaigns.length === 0 ? (
            <div className="p-8 text-center">
              <BarChart3
                size={30}
                className="mx-auto text-[#475569]"
              />

              <p className="mt-3 text-sm text-[#475569]">
                Todavía no hay campañas para analizar.
              </p>

              <p className="mt-1 text-xs text-[#475569]">
                Creá una campaña desde Campañas o desde el perfil
                de un cliente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#1D4260] text-[10px] uppercase tracking-wide text-[#475569]">
                    <th className="px-5 py-3">Campaña</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Alcance</th>
                    <th className="px-5 py-3">Conversiones</th>
                    <th className="px-5 py-3">Conversión</th>
                    <th className="px-5 py-3">Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {campaigns.map((campaign) => {
                    const conversionRate =
                      campaign.reach > 0
                        ? (campaign.conversions /
                            campaign.reach) *
                          100
                        : 0;

                    return (
                      <tr
                        key={campaign.id}
                        className="border-b border-[#D6E2EE] last:border-0"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[#334155]">
                            {campaign.name}
                          </p>

                          <p className="mt-1 text-[10px] text-[#475569]">
                            {campaign.source}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] ${
                              campaign.status === "Activa"
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-amber-500/10 text-amber-300"
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs text-[#475569]">
                          {(campaign.reach ?? 0).toLocaleString(
                            "es-AR"
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs text-cyan-300">
                          {(campaign.conversions ?? 0).toLocaleString(
                            "es-AR"
                          )}
                        </td>

                        <td className="px-5 py-4 text-xs text-violet-300">
                          {conversionRate.toFixed(2)}%
                        </td>

                        <td className="px-5 py-4 text-xs font-medium text-emerald-300">
                          {formatCurrency(
                            campaign.revenue ?? 0
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Resumen del negocio">
          <div className="grid gap-3 p-5 md:grid-cols-3">
            <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
              <p className="text-[10px] text-[#475569]">
                Tasa de entrega
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {storeConversionRate.toFixed(2)}%
              </p>

              <p className="mt-1 text-[10px] text-[#475569]">
                Pedidos entregados sobre clientes registrados.
              </p>
            </div>

            <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
              <p className="text-[10px] text-[#475569]">
                Revenue de campañas
              </p>

              <p className="mt-1 text-lg font-semibold text-emerald-300">
                {formatCurrency(campaignRevenue)}
              </p>

              <p className="mt-1 text-[10px] text-[#475569]">
                Ventas atribuidas al sistema de campañas.
              </p>
            </div>

            <div className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4">
              <p className="text-[10px] text-[#475569]">
                Estado del Store
              </p>

              <p className="mt-1 text-lg font-semibold text-cyan-300">
                {totalOrders > 0 ? "Operativo" : "Sin pedidos"}
              </p>

              <p className="mt-1 text-[10px] text-[#475569]">
                Datos calculados a partir del estado actual.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    );
  };

  const renderSection = () => {
    switch (section) {
      case "website-builder":
        return (
          <DigitalBoostStoreStudio
            onBack={() => setSection("dashboard")}
          />
        );

      case "dashboard":
        return (
          <CommerceOSOverview
            products={products}
            orders={orders}
            customers={customers}
            onNavigate={(target) => setSection(target as StoreSection)}
          />
        );

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

      case "analytics":
        return renderAnalytics();

      case "themes":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-lg font-semibold text-white">
                Temas
              </p>
              <p className="mt-1 text-sm text-[#475569]">
                Organizá tus productos en categorías y vitrinas para tu tienda.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "Productos destacados",
                  description:
                    "Los productos que querés mostrar primero.",
                  icon: "⭐",
                },
                {
                  name: "Novedades",
                  description:
                    "Productos nuevos incorporados a tu catálogo.",
                  icon: "✨",
                },
                {
                  name: "Ofertas",
                  description:
                    "Productos con descuentos y promociones.",
                  icon: "🔥",
                },
              ].map((collection) => (
                <div
                  key={collection.name}
                  className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5 transition hover:border-violet-400/30 hover:bg-[#E8F5FF]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-xl">
                      {collection.icon}
                    </div>

                    <button
                      type="button"
                      className="rounded-lg border border-[#00B7FF]/30 px-2.5 py-1.5 text-[10px] text-[#475569] transition hover:bg-cyan-300/10 hover:text-white"
                    >
                      Administrar
                    </button>
                  </div>

                  <p className="mt-4 text-sm font-semibold text-white">
                    {collection.name}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#475569]">
                    {collection.description}
                  </p>

                  <div className="mt-5 rounded-xl border border-[#D6E2EE] bg-[#0B1B30] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                      Próximamente
                    </p>
                    <p className="mt-1 text-xs text-[#475569]">
                      Los productos y colecciones de tu tienda podrán utilizarse dentro de cualquier tema.
                      inventario y Website Builder.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/20 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-xl">
                  🎨
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Biblioteca de temas
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#475569]">
                    Los productos y colecciones de tu Store Builder serán
                    utilizados por el futuro Website Builder para construir
                    tiendas con distintos temas visuales.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  ["Minimal Commerce", "Moderno y limpio"],
                  ["Neon Tech", "Tecnología y productos chinos"],
                  ["Luxury Store", "Premium y elegante"],
                ].map(([name, description]) => (
                  <div
                    key={name}
                    className="rounded-xl border border-[#00B7FF]/30 bg-[#0B1B30] p-4"
                  >
                    <div className="h-24 rounded-lg border border-[#00B7FF]/30 bg-gradient-to-br from-violet-500/10 via-cyan-500/5 to-transparent" />

                    <p className="mt-3 text-xs font-semibold text-[#334155]">
                      {name}
                    </p>

                    <p className="mt-1 text-[10px] text-[#475569]">
                      {description}
                    </p>

                    <button
                      type="button"
                      className="mt-3 w-full rounded-lg border border-violet-400/20 px-3 py-2 text-[10px] text-violet-300 transition hover:bg-violet-500/20"
                    >
                      Vista previa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "payments":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-lg font-semibold text-white">Pagos</p>
              <p className="mt-1 text-sm text-[#475569]">
                Configuración y seguimiento de los pagos de tu tienda.
              </p>
            </div>

            <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-6">
              <p className="text-sm font-semibold text-white">
                Centro de pagos
              </p>
              <p className="mt-2 text-xs leading-5 text-[#475569]">
                La gestión avanzada de métodos de pago se incorporará al
                sistema de configuración de la tienda.
              </p>
            </div>
          </div>
        );

      case "marketing":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-lg font-semibold text-white">Marketing</p>
              <p className="mt-1 text-sm text-[#475569]">
                Herramientas para promocionar y hacer crecer tu tienda.
              </p>
            </div>

            <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-6">
              <p className="text-sm font-semibold text-white">
                Centro de Marketing
              </p>
              <p className="mt-2 text-xs leading-5 text-[#475569]">
                Las campañas automáticas y métricas ya funcionan desde la
                sección Campañas.
              </p>
            </div>
          </div>
        );


      case "seo":
        return (
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">
                    SEO Manager
                  </p>
                  <p className="mt-1 text-sm text-[#475569]">
                    Centro de inteligencia SEO para tu tienda y tu Website Builder.
                  </p>
                </div>

                <span className="rounded-full border border-amber-400/20 bg-amber-400/5 px-2.5 py-1 text-[10px] font-semibold text-amber-300">
                  VIP
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-violet-400/20 bg-violet-500/20 p-5">
                <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                  SEO Score
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  82<span className="text-sm text-[#475569]">/100</span>
                </p>
                <p className="mt-1 text-[11px] text-emerald-300">
                  Buen estado general
                </p>
              </div>

              <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5">
                <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                  Correctos
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-300">
                  14
                </p>
                <p className="mt-1 text-[11px] text-[#475569]">
                  Optimizaciones activas
                </p>
              </div>

              <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5">
                <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                  Oportunidades
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-300">
                  6
                </p>
                <p className="mt-1 text-[11px] text-[#475569]">
                  Mejoras recomendadas
                </p>
              </div>

              <div className="rounded-2xl border border-red-400/15 bg-red-500/5 p-5">
                <p className="text-[10px] uppercase tracking-wider text-[#475569]">
                  Atención
                </p>
                <p className="mt-2 text-3xl font-bold text-red-300">
                  3
                </p>
                <p className="mt-1 text-[11px] text-[#475569]">
                  Problemas prioritarios
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
              <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Oportunidades SEO
                    </p>
                    <p className="mt-1 text-xs text-[#475569]">
                      DigitalBoost analiza tu comercio y prioriza las acciones.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg border border-violet-400/20 px-3 py-2 text-[10px] text-violet-300 transition hover:bg-violet-500/20"
                  >
                    Auditar tienda
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    [
                      "🔴",
                      "Productos",
                      "3 productos tienen títulos poco optimizados.",
                      "Optimizar",
                    ],
                    [
                      "🟡",
                      "Página principal",
                      "La descripción SEO puede mejorar su relevancia.",
                      "Revisar",
                    ],
                    [
                      "🟡",
                      "Colecciones",
                      "Hay colecciones sin contenido descriptivo.",
                      "Mejorar",
                    ],
                    [
                      "🟢",
                      "Indexación",
                      "La estructura básica de indexación está preparada.",
                      "Ver",
                    ],
                  ].map(([icon, title, description, action]) => (
                    <div
                      key={title}
                      className="flex flex-col gap-3 rounded-xl border border-[#D6E2EE] bg-[#0B1B30] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="text-sm">{icon}</span>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#334155]">
                            {title}
                          </p>
                          <p className="mt-1 text-[11px] leading-5 text-[#475569]">
                            {description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="shrink-0 rounded-lg border border-[#00B7FF]/30 px-3 py-2 text-[10px] text-[#475569] transition hover:bg-cyan-300/10 hover:text-white"
                      >
                        {action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-violet-400/20 bg-violet-500/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      AI SEO
                    </p>
                    <p className="mt-1 text-[11px] text-[#475569]">
                      Inteligencia SEO de DigitalBoost.
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-xs leading-6 text-[#475569]">
                  La IA podrá analizar productos, colecciones, páginas,
                  temas y contenido para detectar oportunidades y proponer
                  optimizaciones.
                </p>

                <div className="mt-5 space-y-2">
                  {[
                    "Optimizar títulos y descripciones",
                    "Detectar oportunidades de contenido",
                    "Mejorar estructura interna",
                    "Analizar páginas del Website Builder",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-[#D6E2EE] bg-[#0B1B30] px-3 py-2.5 text-[11px] text-[#475569]"
                    >
                      ✓ {item}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-[11px] font-semibold text-white transition hover:opacity-90"
                >
                  Analizar con AI
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/15 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                  <BarChart3 size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    SEO conectado a Commerce OS
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#475569]">
                    SEO Manager utilizará la información real de tu tienda
                    para trabajar junto con Productos, Theme Library,
                    Website Builder, Analytics y AI Store Operator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <p className="text-lg font-semibold text-white">
                Configuración
              </p>
              <p className="mt-1 text-sm text-[#475569]">
                Configurá los aspectos generales de tu tienda.
              </p>
            </div>

            <div className="rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] p-6">
              <p className="text-sm font-semibold text-white">
                Configuración de la tienda
              </p>
              <p className="mt-2 text-xs leading-5 text-[#475569]">
                El Website Builder, dominio personalizado, temas y publicación
                de la tienda se integrarán progresivamente en este entorno.
              </p>
            </div>
          </div>
        );

      default:
        return renderDashboard();
    }
  };

  return (
    <div data-store-builder-vibrant="true" data-store-builder="true" className={`flex h-screen overflow-hidden ${section === "website-builder" ? "bg-[#070d18] text-[#F7FAFF]" : "bg-[#0A1020] text-white"}`}>
      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/10 lg:hidden"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[#D6E2EE] bg-[#0B1B30] transition-transform lg:relative lg:translate-x-0 ${
          mobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-[#1D4260] px-5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-black"
          >
            <div className="rounded-lg bg-gradient-to-br from-violet-500 to-cyan-300 p-2">
              <Store size={18} />
            </div>

            <div>
              DIGITAL<span className="text-cyan-400">BOOST</span>
              <div className="text-[9px] font-medium tracking-widest text-[#475569]">
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
            className="mb-4 flex w-full items-center justify-between rounded-lg border border-[#00B7FF]/30 bg-cyan-400/5 px-3 py-3 text-left"
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

            <ChevronRight size={14} className="text-[#475569]" />
          </button>

          <div className="space-y-1">
            <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-5">
            {navGroups.map((group) => {
              const isOpen = openGroups[group.id];

              return (
                <div key={group.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((current) => ({
                        ...current,
                        [group.id]: !current[group.id],
                      }))
                    }
                    className="mb-2 flex w-full items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#475569] transition hover:text-[#475569]"
                  >
                    <span>{group.label}</span>

                    <ChevronRight
                      size={13}
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`space-y-1 overflow-hidden transition-all duration-200 ${
                      isOpen
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = section === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSection(item.id);
                            setMobileMenu(false);
                          }}
                          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                            active
                              ? "border border-violet-400/20 bg-violet-500/20 text-white shadow-[0_0_24px_rgba(139,92,246,0.08)]"
                              : "border border-transparent text-[#475569] hover:border-[#D6E2EE] hover:bg-[#0A0E16] hover:text-[#334155]"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                              active
                                ? "bg-violet-500/20 text-violet-300"
                                : "bg-[#0B1B30]/[.025] text-[#475569] group-hover:bg-[#0A0E16] group-hover:text-[#475569]"
                            }`}
                          >
                            <Icon size={15} />
                          </span>

                          <span className="min-w-0 flex-1 truncate font-medium">
                            {item.label}
                          </span>

                          {active && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>
          </div>
        </div>

        <div className="mt-auto border-t border-[#1D4260] p-3">
          <button
            onClick={() => setSection("settings")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#475569] hover:bg-[#0A0E16] hover:text-white"
          >
            <Settings size={17} />
            Configuración
          </button>

          <button
            onClick={onBack}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#475569] hover:bg-[#0A0E16] hover:text-white"
          >
            <ArrowLeft size={17} />
            Volver a DigitalBoost
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#1D4260] bg-[#050913]/95 px-4 backdrop-blur-xl lg:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="rounded-lg p-2 text-[#475569] hover:bg-[#0A0E16] lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <div className="text-sm font-semibold">
                {navGroups.flatMap((group) => group.items).find((item) => item.id === section)?.label ||
                  "Configuración"}
              </div>

              <div className="text-[10px] text-[#475569]">
                DigitalBoost Commerce OS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAI(true)}
              className="hidden items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-500/20 px-3 py-2 text-xs text-violet-300 sm:flex"
            >
              <Sparkles size={14} />
              AI Operator
            </button>

            <button className="rounded-lg p-2 text-[#475569] hover:bg-[#0A0E16]">
              <span onClick={function () { setShowNotes(true); }}><span onClick={() => setShowNotes(true)}><Bell size={18} /></span></span>
            </button>

            <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-300 text-xs font-bold sm:flex">
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

      {<DigitalBoostCommandCenter onNavigate={setSection} onOpenAI={() => setShowAI(true)} onOpenHealth={() => setShowHealth(true)} onOpenIntegrations={() => setShowIntegrations(true)} onOpenAutomations={() => setShowAutomations(true)} onOpenConsole={() => setShowConsole(true)} onOpenNotes={() => setShowNotes(true)} onOpenShortcuts={() => setShowShortcuts(true)} />}
      {showShortcuts && (<DigitalBoostShortcuts onClose={() => setShowShortcuts(false)} />)}
      {showNotes && (<DigitalBoostNotifications onClose={() => setShowNotes(false)} />)}
      {showConsole && (<DigitalBoostConsole onClose={() => setShowConsole(false)} />)}
      {showAutomations && (<DigitalBoostAutomations onClose={() => setShowAutomations(false)} />)}
      {showIntegrations && (<DigitalBoostIntegrations onClose={() => setShowIntegrations(false)} />)}
      {showHealth && (<DigitalBoostHealth onClose={() => setShowHealth(false)} onFix={(id) => { setShowHealth(false); setSection(id as any); }} />)}
      {showAI && (<DigitalBoostOperator onClose={() => { setShowAI(false); }} onNavigate={(id) => { setShowAI(false); setSection(id); }} />)}
      {false && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-violet-400/20 bg-[#0B1B30] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1D4260] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-500/20 p-2 text-violet-300">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    AI Store Operator
                    {aiCustomerId !== null && " · Cliente"}
                  </h3>
                  <p className="text-xs text-[#475569]">
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
                  className="flex w-full items-center justify-between rounded-lg border border-[#D6E2EE] bg-[#0B1B30] p-3 text-left text-sm transition hover:border-violet-400/30 disabled:cursor-wait disabled:opacity-60"
                >
                  <span>{prompt}</span>
                  <ChevronRight size={15} className="text-[#475569]" />
                </button>
              ))}
            </div>

            {(aiLoading || aiResult) && (
              <div className="border-t border-[#1D4260] p-5">
                <div className="rounded-xl border border-violet-400/20 bg-violet-500/20 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-lg bg-violet-500/20 p-2 text-violet-300">
                      <Sparkles size={16} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {aiLoading
                          ? "Analizando los datos..."
                          : "Inteligencia operativa"}
                      </p>

                      {aiAction && !aiLoading && (
                        <p className="mt-0.5 text-[11px] text-[#475569]">
                          {aiAction}
                        </p>
                      )}
                    </div>
                  </div>

                  {aiLoading ? (
                    <div className="space-y-2">
                      <div className="h-2 animate-pulse rounded bg-cyan-300/15" />
                      <div className="h-2 w-5/6 animate-pulse rounded bg-cyan-300/15" />
                      <div className="h-2 w-4/6 animate-pulse rounded bg-cyan-300/15" />
                    </div>
                  ) : (
                    <div className="whitespace-pre-line text-xs leading-6 text-[#475569]">
                      {aiResult.replace(/\\\\n/g, "\n")}
                    </div>
                  )}

                  {!aiLoading && aiResult && (
                    <button
                      onClick={() => {
                        setAiResult("");
                        setAiAction("");
                      }}
                      className="mt-4 rounded-lg border border-[#00B7FF]/30 px-3 py-2 text-xs text-[#475569] hover:bg-cyan-300/10"
                    >
                      Nueva consulta
                    </button>
                  )}
                </div>
              </div>
            )}

            {showCampaignBuilder && (
              <div className="border-t border-[#1D4260] p-5">
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white">
                      Crear campaña de recuperación
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#475569]">
                      Configurá la campaña preparada por el AI Store Operator.
                    </p>
                  </div>

                  {campaignCreated ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-4">
                        <p className="text-sm font-semibold text-emerald-300">
                          ✓ Campaña creada correctamente
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#475569]">
                          "{campaignName}" quedó creada como campaña activa.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setCampaignCreated(false);
                          setShowCampaignBuilder(false);
                        }}
                        className="rounded-lg border border-[#00B7FF]/30 px-3 py-2 text-xs text-[#475569] hover:bg-cyan-300/10"
                      >
                        Cerrar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-[11px] text-[#475569]">
                          Nombre de campaña
                        </label>
                        <input
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          className="w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2 text-xs text-white outline-none focus:border-violet-400/40"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] text-[#475569]">
                          Audiencia
                        </label>
                        <input
                          value={campaignAudience}
                          onChange={(e) => setCampaignAudience(e.target.value)}
                          className="w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2 text-xs text-white outline-none focus:border-violet-400/40"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] text-[#475569]">
                          Descuento final (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={campaignDiscount}
                          onChange={(e) => setCampaignDiscount(e.target.value)}
                          className="w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2 text-xs text-white outline-none focus:border-violet-400/40"
                        />
                      </div>

                      <div className="rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] p-3">
                        <p className="text-[11px] font-medium text-[#475569]">
                          Secuencia automática
                        </p>
                        <div className="mt-2 space-y-1.5 text-[11px] text-[#475569]">
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

                          const created = createCampaign(
                            campaignName,
                            campaignAudience,
                            Number(campaignDiscount),
                            "AI Store Operator"
                          );

                          if (created) {
                            setCampaignCreated(true);
                          }
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

            <div className="border-t border-[#1D4260] p-5">
              <div className="rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] p-3 text-xs leading-5 text-[#475569]">
                El AI Store Operator analiza ventas, inventario, clientes y
                campañas y convierte los datos en acciones concretas para tu
                tienda.
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#00B7FF]/30 bg-[#0B1B30] shadow-2xl">

            <div className="sticky top-0 flex items-center justify-between border-b border-[#00B7FF]/30 bg-[#0B1B30] p-5">
              <div>
                <h3 className="font-semibold">
                  {editingProduct ? "Editar producto" : "Añadir producto"}
                </h3>

                <p className="mt-1 text-xs text-[#475569]">
                  Configurá la información principal del producto.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                  resetProductForm();
                }}
                className="rounded-lg p-2 text-[#475569] hover:bg-cyan-300/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">

              <div>
                <label className="text-xs text-[#475569]">
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
                  className="mt-2 w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs text-[#475569]">
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
                    className="mt-2 w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#475569]">
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
                    className="mt-2 w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-sm outline-none"
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
                  <label className="text-xs text-[#475569]">
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
                    className="mt-2 w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#475569]">
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
                    className="mt-2 w-full rounded-lg border border-[#00B7FF]/30 bg-[#0B1B30] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#475569]">
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
                          : "border-[#00B7FF]/30 text-[#475569]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-violet-400/10 bg-violet-500/20 p-3 text-xs leading-5 text-[#475569]">
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
                  className="flex-1 rounded-lg border border-[#00B7FF]/30 px-4 py-3 text-sm text-[#475569]"
                >
                  Cancelar
                </button>

                <button
                  onClick={saveProduct}
                  className="flex-1 rounded-lg bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-300 py-3 text-sm font-bold"
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
        <p className="mt-1 text-sm text-[#475569]">{subtitle}</p>
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
    <div className="rounded-xl border border-[#1D4260] bg-[#0B1B30] p-5">
      <div className="text-xs text-[#475569]">{title}</div>

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
    <section className="rounded-xl border border-[#1D4260] bg-[#0B1B30] p-5">
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
    <div className="rounded-lg border border-[#D6E2EE] bg-[#0B1B30] p-3">
      <div className="text-xs font-semibold">{title}</div>
      <div className="mt-1 text-xs text-[#475569]">{text}</div>
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
        <thead className="border-b border-[#00B7FF]/30 text-xs text-[#475569]">
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
              className="cursor-pointer border-b border-[#D6E2EE] transition hover:bg-[#0B1B30]/[.02]"
            >
              <td className="py-4 font-medium">{order.id}</td>
              <td>
                <div>{order.customer}</div>
                <div className="text-xs text-[#475569]">
                  {order.items} producto(s)
                </div>
              </td>
              <td>${order.total.toFixed(2)}</td>
              <td>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 text-[10px] text-emerald-300">
                  {order.status}
                </span>
              </td>
              <td className="text-xs text-[#475569]">{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
