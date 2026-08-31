import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
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

const navItems: {
  id: StoreSection;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
  { id: "products", label: "Productos", icon: Package },
  { id: "inventory", label: "Inventario", icon: Boxes },
  { id: "orders", label: "Pedidos", icon: ClipboardList },
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
  const [section, setSection] = useState<StoreSection>("dashboard");
  const [products, setProducts] = useState(productsSeed);
  const [orders] = useState(ordersSeed);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState<"all" | "active" | "draft" | "low">("all");
  const [showAI, setShowAI] = useState(false);
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
              onClick={() => setShowAI(true)}
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

  const renderOrders = () => (
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
        <OrderTable orders={orders} />
      </Panel>
    </div>
  );

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
                  <h3 className="font-semibold">AI Store Operator</h3>
                  <p className="text-xs text-slate-500">
                    Tu asistente inteligente de ecommerce
                  </p>
                </div>
              </div>

              <button onClick={() => setShowAI(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              {[
                "Analiza mis ventas",
                "¿Qué productos necesitan reposición?",
                "Crea una campaña para recuperar carritos",
                "¿Cómo puedo aumentar mi conversión?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => runAIAction(prompt)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/[.07] bg-[#030711] p-3 text-left text-sm hover:border-violet-400/30"
                >
                  {prompt}
                  <ChevronRight size={15} className="text-slate-500" />
                </button>
              ))}
            </div>

            <div className="border-t border-white/[.07] p-5">
              <div className="rounded-lg border border-white/10 bg-[#030711] p-3 text-xs text-slate-500">
                La IA podrá analizar ventas, inventario, clientes y campañas.
                Las acciones críticas requerirán confirmación.
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

function OrderTable({ orders }: { orders: Order[] }) {
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
              className="border-b border-white/[.06] hover:bg-white/[.02]"
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
