import { useEffect, useMemo, useState } from "react";
import { HiOutlineExclamation, HiOutlinePencil, HiOutlineX } from "react-icons/hi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import SearchInput from "../../components/admin/SearchInput";
import Skeleton from "../../components/admin/Skeleton";
import EmptyState from "../../components/admin/EmptyState";
import Button from "../../components/ui/Button";
import { stockStatus, type InventoryItem, type StockStatus } from "../../data/inventory";
import { suppliers } from "../../data/suppliers";
import { useSalonData } from "../../hooks/useSalonData";
import { useToast } from "../../hooks/useToast";

const CATEGORIES = ["All", "Hair", "Skin", "Nails", "Spa", "Tools"];

const statusStyles: Record<StockStatus, string> = {
  "In Stock": "bg-forest/10 text-forest",
  "Low Stock": "bg-gold/15 text-gold",
  "Out of Stock": "bg-red-100 text-red-600",
};

export default function AdminInventoryPage() {
  const { inventory, adjustStock } = useSalonData();
  const { showToast } = useToast();

  // Genuinely simulated slow-network state to demonstrate the skeleton pattern.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [delta, setDelta] = useState(0);

  const filtered = useMemo(
    () =>
      inventory.filter((i) => {
        const matchesCategory = category === "All" || i.category === category;
        const q = query.trim().toLowerCase();
        const matchesQuery = q === "" || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
      }),
    [inventory, query, category]
  );

  const lowStockCount = inventory.filter((i) => stockStatus(i) !== "In Stock").length;

  function supplierName(id: string) {
    return suppliers.find((s) => s.id === id)?.name ?? "—";
  }

  function openAdjust(item: InventoryItem) {
    setAdjustingItem(item);
    setDelta(0);
  }

  function saveAdjustment() {
    if (!adjustingItem || delta === 0) {
      setAdjustingItem(null);
      return;
    }
    adjustStock(adjustingItem.id, delta);
    showToast(
      `${adjustingItem.name} ${delta > 0 ? "restocked by" : "reduced by"} ${Math.abs(delta)} ${adjustingItem.unit}${
        Math.abs(delta) === 1 ? "" : "s"
      }.`,
      "success"
    );
    setAdjustingItem(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Inventory" subtitle={`${inventory.length} items tracked`} />

      {!loading && lowStockCount > 0 && (
        <div className="flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold rounded-xl px-4 py-3 text-sm">
          <HiOutlineExclamation size={18} className="shrink-0" />
          {lowStockCount} item{lowStockCount === 1 ? "" : "s"} at or below reorder threshold.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Scan or type SKU / product name…"
          className="w-full sm:w-80"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === c
                  ? "bg-forest text-sand-light border-forest"
                  : "border-blush text-ink/60 hover:border-forest/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-sand-light rounded-2xl border border-blush/60 overflow-hidden">
        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={HiOutlineExclamation}
            title="No items match your search"
            subtitle="Try a different name, SKU, or category."
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink/50 border-b border-blush/60 font-mono text-xs uppercase tracking-wide">
                  <th className="py-4 px-6 font-normal">Item</th>
                  <th className="py-4 px-6 font-normal">SKU</th>
                  <th className="py-4 px-6 font-normal">Supplier</th>
                  <th className="py-4 px-6 font-normal">Stock</th>
                  <th className="py-4 px-6 font-normal">Status</th>
                  <th className="py-4 px-6 font-normal" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-blush/30 last:border-0 hover:bg-sand/40">
                    <td className="py-3.5 px-6 font-medium text-ink">{item.name}</td>
                    <td className="py-3.5 px-6 text-ink/60 font-mono text-xs">{item.sku}</td>
                    <td className="py-3.5 px-6 text-ink/70">{supplierName(item.supplierId)}</td>
                    <td className="py-3.5 px-6 text-ink/70">
                      {item.quantity} {item.unit}
                      {item.quantity === 1 ? "" : "s"}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[stockStatus(item)]}`}>
                        {stockStatus(item)}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => openAdjust(item)}
                        className="inline-flex items-center gap-1 text-xs text-forest font-medium hover:underline"
                      >
                        <HiOutlinePencil size={13} /> Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supplier manager */}
      <div>
        <h2 className="font-display text-xl text-ink mb-4">Suppliers</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-sand-light rounded-xl border border-blush/60 p-4">
              <p className="font-medium text-ink text-sm">{s.name}</p>
              <p className="text-xs text-ink/50 mt-1">{s.contactPerson}</p>
              <p className="text-xs text-ink/50 font-mono">{s.phone}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {s.categories.map((c) => (
                  <span key={c} className="text-[11px] bg-sand text-ink/60 rounded-full px-2 py-0.5">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock adjustment modal */}
      {adjustingItem && (
        <div
          className="fixed inset-0 z-[90] bg-ink/40 flex items-center justify-center px-4"
          onClick={() => setAdjustingItem(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg text-ink">Adjust stock</p>
                <p className="text-sm text-ink/50">{adjustingItem.name}</p>
              </div>
              <button onClick={() => setAdjustingItem(null)} className="text-ink/40 hover:text-ink">
                <HiOutlineX size={18} />
              </button>
            </div>

            <p className="text-sm text-ink/60">
              Currently {adjustingItem.quantity} {adjustingItem.unit}
              {adjustingItem.quantity === 1 ? "" : "s"} in stock.
            </p>

            <div>
              <label className="text-sm text-ink/70">Adjustment</label>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setDelta((d) => d - 1)}
                  className="w-9 h-9 rounded-full border border-blush flex items-center justify-center text-ink/60 hover:border-forest"
                >
                  −
                </button>
                <input
                  type="number"
                  value={delta}
                  onChange={(e) => setDelta(Number(e.target.value) || 0)}
                  className="w-full text-center rounded-lg border border-blush px-3 py-2 text-sm outline-none focus:border-forest"
                />
                <button
                  onClick={() => setDelta((d) => d + 1)}
                  className="w-9 h-9 rounded-full border border-blush flex items-center justify-center text-ink/60 hover:border-forest"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-ink/40 mt-1.5">
                New total: {Math.max(0, adjustingItem.quantity + delta)} {adjustingItem.unit}
                {Math.max(0, adjustingItem.quantity + delta) === 1 ? "" : "s"}
              </p>
            </div>

            <Button onClick={saveAdjustment} className="w-full">
              Save adjustment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
