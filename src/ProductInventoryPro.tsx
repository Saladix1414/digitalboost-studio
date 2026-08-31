import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Boxes,
  Check,
  Edit3,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  comparePrice: number;
  stock: number;
  lowStock: number;
  category: string;
  description: string;
  status: "Activo" | "Borrador";
};

type Props = {
  products: Product[];
  onChange: (products: Product[]) => void;
};

export default function ProductInventoryPro({
  products,
  onChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [editing, setEditing] = useState<Product | null>(null);
  const [inventoryProduct, setInventoryProduct] =
    useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      if (filter === "Activos") {
        return matchesSearch && p.status === "Activo";
      }

      if (filter === "Borradores") {
        return matchesSearch && p.status === "Borrador";
      }

      if (filter === "Stock bajo") {
        return matchesSearch && p.stock > 0 && p.stock <= p.lowStock;
      }

      if (filter === "Agotados") {
        return matchesSearch && p.stock === 0;
      }

      return matchesSearch;
    });
  }, [products, query, filter]);

  const updateProduct = (updated: Product) => {
    onChange(
      products.map((product) =>
        product.id === updated.id ? updated : product
      )
    );

    setEditing(null);
  };

  const deleteProduct = (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;

    onChange(products.filter((product) => product.id !== id));
  };

  const adjustStock = (product: Product, amount: number) => {
    const updated = {
      ...product,
      stock: Math.max(0, product.stock + amount),
    };

    onChange(
      products.map((item) =>
        item.id === product.id ? updated : item
      )
    );

    setInventoryProduct(updated);
  };

  return (
    <div className="space-y-6">

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Productos"
          value={products.length}
          icon={<Package size={18} />}
        />

        <Stat
          label="Activos"
          value={products.filter((p) => p.status === "Activo").length}
          icon={<Check size={18} />}
        />

        <Stat
          label="Stock bajo"
          value={
            products.filter(
              (p) => p.stock > 0 && p.stock <= p.lowStock
            ).length
          }
          icon={<AlertTriangle size={18} />}
        />

        <Stat
          label="Agotados"
          value={products.filter((p) => p.stock === 0).length}
          icon={<Boxes size={18} />}
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#030914]">

        <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row">

          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nombre, SKU o categoría..."
              className="w-full rounded-lg border border-white/10 bg-[#070d18] py-2.5 pl-9 pr-4 text-sm outline-none focus:border-cyan-400/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Todos",
              "Activos",
              "Borradores",
              "Stock bajo",
              "Agotados",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-lg px-3 py-2 text-xs ${
                  filter === item
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "border border-white/10 text-slate-400"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">

            <thead className="border-b border-white/10 text-xs text-slate-500">
              <tr>
                <th className="p-4">Producto</th>
                <th>SKU</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((product) => {

                const low =
                  product.stock > 0 &&
                  product.stock <= product.lowStock;

                const empty = product.stock === 0;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-white/[.06] hover:bg-white/[.02]"
                  >

                    <td className="p-4">
                      <div className="font-medium">
                        {product.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {product.category}
                      </div>
                    </td>

                    <td className="text-xs text-slate-400">
                      {product.sku}
                    </td>

                    <td>
                      <div>${product.price.toFixed(2)}</div>

                      {product.comparePrice > product.price && (
                        <div className="text-xs text-slate-600 line-through">
                          ${product.comparePrice.toFixed(2)}
                        </div>
                      )}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          setInventoryProduct(product)
                        }
                        className="text-left"
                      >
                        <div
                          className={
                            empty
                              ? "font-semibold text-red-400"
                              : low
                              ? "font-semibold text-amber-400"
                              : "font-semibold text-emerald-400"
                          }
                        >
                          {product.stock}
                        </div>

                        <div className="text-[10px] text-slate-500">
                          {empty
                            ? "Agotado"
                            : low
                            ? "Stock bajo"
                            : "Disponible"}
                        </div>
                      </button>
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          updateProduct({
                            ...product,
                            status:
                              product.status === "Activo"
                                ? "Borrador"
                                : "Activo",
                          })
                        }
                        className="rounded-full border border-white/10 px-2 py-1 text-[10px]"
                      >
                        {product.status}
                      </button>
                    </td>

                    <td>
                      <div className="flex justify-end gap-2 pr-4">

                        <button
                          title="Editar"
                          onClick={() => setEditing(product)}
                          className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-cyan-300"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          title="Inventario"
                          onClick={() =>
                            setInventoryProduct(product)
                          }
                          className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-cyan-300"
                        >
                          <Boxes size={15} />
                        </button>

                        <button
                          title="Eliminar"
                          onClick={() => deleteProduct(product.id)}
                          className="rounded-lg border border-red-400/10 p-2 text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

      {editing && (
        <ProductEditor
          product={editing}
          onClose={() => setEditing(null)}
          onSave={updateProduct}
        />
      )}

      {inventoryProduct && (
        <InventoryModal
          product={inventoryProduct}
          onClose={() => setInventoryProduct(null)}
          onAdjust={adjustStock}
        />
      )}

    </div>
  );
}

function ProductEditor({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const [form, setForm] = useState(product);

  const field = (
    key: keyof Product,
    label: string,
    type = "text"
  ) => (
    <div>
      <label className="text-xs text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={String(form[key])}
        onChange={(e) =>
          setForm({
            ...form,
            [key]:
              type === "number"
                ? Number(e.target.value)
                : e.target.value,
          })
        }
        className="mt-2 w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
      />
    </div>
  );

  return (
    <Modal title="Editar producto" onClose={onClose}>

      <div className="grid gap-4 md:grid-cols-2">

        {field("name", "Nombre")}
        {field("sku", "SKU")}

        {field("price", "Precio", "number")}
        {field("comparePrice", "Precio comparativo", "number")}

        {field("stock", "Stock", "number")}
        {field("lowStock", "Alerta de stock bajo", "number")}

        {field("category", "Categoría")}

      </div>

      <div className="mt-4">
        <label className="text-xs text-slate-500">
          Descripción
        </label>

        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          rows={4}
          className="mt-2 w-full rounded-lg border border-white/10 bg-[#030711] px-3 py-2.5 text-sm outline-none focus:border-cyan-400/50"
        />
      </div>

      <button
        onClick={() => onSave(form)}
        className="mt-5 w-full rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 py-3 text-sm font-bold"
      >
        Guardar cambios
      </button>

    </Modal>
  );
}

function InventoryModal({
  product,
  onClose,
  onAdjust,
}: {
  product: Product;
  onClose: () => void;
  onAdjust: (product: Product, amount: number) => void;
}) {
  return (
    <Modal title={`Inventario · ${product.name}`} onClose={onClose}>

      <div className="rounded-xl border border-white/10 bg-[#030711] p-5 text-center">

        <div className="text-xs text-slate-500">
          STOCK ACTUAL
        </div>

        <div className="mt-2 text-4xl font-bold">
          {product.stock}
        </div>

        <div className="mt-1 text-xs text-slate-500">
          unidades disponibles
        </div>

      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">

        <button
          onClick={() => onAdjust(product, 1)}
          className="flex items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 py-3 text-sm text-emerald-300"
        >
          <ArrowUp size={16} />
          Añadir 1
        </button>

        <button
          onClick={() => onAdjust(product, -1)}
          className="flex items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 py-3 text-sm text-red-300"
        >
          <ArrowDown size={16} />
          Quitar 1
        </button>

      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">

        <button
          onClick={() => onAdjust(product, 10)}
          className="rounded-lg border border-white/10 py-2 text-xs text-slate-300"
        >
          +10 unidades
        </button>

        <button
          onClick={() => onAdjust(product, -10)}
          className="rounded-lg border border-white/10 py-2 text-xs text-slate-300"
        >
          -10 unidades
        </button>

      </div>

      {product.stock <= product.lowStock && (
        <div className="mt-4 flex gap-3 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-300">
          <AlertTriangle size={16} />
          Este producto necesita reposición.
        </div>
      )}

    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#070d18] shadow-2xl">

        <div className="flex items-center justify-between border-b border-white/10 p-5">

          <h3 className="font-semibold">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>

        </div>

        <div className="p-5">
          {children}
        </div>

      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#030914] p-4">

      <div className="flex items-center justify-between">

        <div className="text-xs text-slate-500">
          {label}
        </div>

        <div className="text-cyan-400">
          {icon}
        </div>

      </div>

      <div className="mt-2 text-2xl font-bold">
        {value}
      </div>

    </div>
  );
}
